"""Public SEO contracts and regressions for publication/privacy boundaries."""
from html.parser import HTMLParser
from unittest.mock import patch
from urllib.parse import quote
from xml.etree import ElementTree

from django.core.cache import cache
from django.template.loader import render_to_string
from django.test import TestCase, override_settings

from .models import Article, Category

PREVIEW = "/api/seo/bot-preview/"
ORIGIN = "https://clinic.example:9443"
NS = {"s": "http://www.sitemaps.org/schemas/sitemap/0.9"}


class HeadParser(HTMLParser):
    def __init__(self, body):
        super().__init__()
        self.meta = {}
        self.canonical = None
        self.feed(body)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "meta":
            self.meta[attrs.get("property", attrs.get("name"))] = attrs.get("content")
        elif tag == "link" and attrs.get("rel") == "canonical":
            self.canonical = attrs["href"]


@override_settings(SITE_DOMAIN=ORIGIN)
class SEOTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.category = Category.objects.create(name="Education", slug="education")
        cls.article = Article.objects.create(
            title="Public article", slug="مقاله", excerpt="Public summary.",
            content="<p>Full article body.</p>", status=Article.PUBLISHED,
            category=cls.category,
        )
        cls.draft = Article.objects.create(
            title="Private draft", slug="private-draft", content="Draft body."
        )

    def setUp(self):
        cache.clear()

    def preview(self, path, **headers):
        return self.client.get(PREVIEW, {"path": path}, **headers)

    def head(self, response):
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response["Content-Type"].startswith("text/html"))
        return HeadParser(response.content.decode())

    def test_sitemap_only_contains_canonical_public_pages_and_published_articles(self):
        response = self.client.get("/sitemap.xml", HTTP_HOST="untrusted.test")
        self.assertEqual(response.status_code, 200)
        root = ElementTree.fromstring(response.content)
        self.assertEqual(root.tag, "{" + NS["s"] + "}urlset")
        urls = root.findall("s:url", NS)
        locations = {url.findtext("s:loc", namespaces=NS) for url in urls}
        self.assertEqual(locations, {
            ORIGIN + path for path in (
                "/", "/about", "/services/therapeutic", "/services/aesthetic",
                "/faq", "/resources", "/videos", "/resources/" + quote(self.article.slug),
            )
        })
        self.assertNotIn("?category=", response.content.decode())
        self.assertNotIn(self.draft.slug, response.content.decode())
        article_url = next(url for url in urls if url.findtext(
            "s:loc", namespaces=NS
        ).endswith(quote(self.article.slug)))
        self.assertEqual(article_url.findtext("s:priority", namespaces=NS), "0.8")
        self.assertEqual(article_url.findtext("s:changefreq", namespaces=NS), "weekly")
        self.assertEqual(article_url.findtext("s:lastmod", namespaces=NS),
                         self.article.updated_at.date().isoformat())

    def test_sitemap_rechecks_unpublishing_and_supports_no_articles(self):
        Article.objects.filter(pk=self.article.pk).update(status=Article.DRAFT)
        response = self.client.get("/sitemap.xml")
        root = ElementTree.fromstring(response.content)
        self.assertEqual(len(root.findall("s:url", NS)), 7)

    def test_robots_uses_site_domain_and_excludes_private_paths(self):
        response = self.client.get("/robots.txt", HTTP_HOST="untrusted.test")
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response["Content-Type"].startswith("text/plain"))
        for path in ("/admin/", "/api/admin/", "/api/auth/", "/api/users/",
                     "/chat-session/", "/api/chat/", "/api/chat_gateway/"):
            self.assertContains(response, f"Disallow: {path}")
        self.assertContains(response, f"Sitemap: {ORIGIN}/sitemap.xml")
        self.assertNotContains(response, "untrusted.test")

    def test_public_static_paths_and_aliases_have_canonical_metadata(self):
        for path, canonical in (
            ("/", "/"), ("/about", "/about"), ("/faq", "/faq"),
            ("/resources", "/resources"), ("/videos", "/videos"),
            ("/services/therapeutic", "/services/therapeutic"),
            ("/services/aesthetic", "/services/aesthetic"),
            ("/services", "/services/therapeutic"), ("/video", "/videos"),
        ):
            with self.subTest(path=path):
                head = self.head(self.preview(path))
                self.assertEqual(head.canonical, ORIGIN + canonical)
                self.assertEqual(head.meta["og:url"], head.canonical)
                self.assertEqual(head.meta["og:type"], "website")
                self.assertEqual(head.meta["og:image"], ORIGIN + "/pink-ribbon.svg")
                self.assertEqual(head.meta["twitter:card"], "summary")

    def test_article_aliases_and_encoded_slugs_share_metadata_without_view_count(self):
        for prefix in ("/resources/", "/articles/"):
            head = self.head(self.preview(prefix + quote(self.article.slug)))
            self.assertEqual(head.meta["og:title"], self.article.title)
            self.assertEqual(head.meta["og:description"], self.article.excerpt)
            self.assertEqual(head.meta["og:type"], "article")
            self.assertEqual(head.meta["twitter:card"], "summary_large_image")
            self.assertEqual(head.canonical, ORIGIN + "/resources/" + quote(self.article.slug))
        self.article.refresh_from_db()
        self.assertEqual(self.article.views_count, 0)

    def test_metadata_is_escaped_in_attributes_and_visible_content(self):
        title = '<script>alert("title")</script>'
        excerpt = '\"><img src=x onerror="alert(1)"> & summary'
        Article.objects.filter(pk=self.article.pk).update(title=title, excerpt=excerpt)
        response = self.preview("/resources/" + self.article.slug)
        head = self.head(response)
        self.assertEqual(head.meta["og:title"], title)
        self.assertEqual(head.meta["og:description"], excerpt)
        self.assertNotContains(response, "<script>")
        self.assertNotContains(response, "<img ")

    def test_cover_urls_use_public_origin_not_request_host_or_forwarded_scheme(self):
        Article.objects.filter(pk=self.article.pk).update(cover_image="articles/covers/cover.webp")
        head = self.head(self.preview(
            "/resources/" + self.article.slug, HTTP_HOST="untrusted.test",
            HTTP_X_FORWARDED_PROTO="http",
        ))
        self.assertEqual(head.meta["og:image"], ORIGIN + "/media/articles/covers/cover.webp")
        self.assertEqual(head.meta["twitter:image"], head.meta["og:image"])

    def test_empty_excerpt_uses_site_description(self):
        Article.objects.filter(pk=self.article.pk).update(excerpt="")
        head = self.head(self.preview("/resources/" + self.article.slug))
        self.assertTrue(head.meta["og:description"])

    def test_private_and_unknown_paths_are_not_rendered_or_queried(self):
        for path in ("/admin/", "/admin", "/api/admin/patients/1/", "/api/chat/message",
                     "/chat-session/secret", "/unknown", "https://untrusted.test/about",
                     "//untrusted.test/about", "/resources/a/b", "/resources//a"):
            with self.subTest(path=path), self.assertNumQueries(0):
                response = self.preview(path)
                self.assertEqual(response.status_code, 404)
                self.assertEqual(response["X-Robots-Tag"], "noindex, nofollow")
                self.assertEqual(response["Cache-Control"], "no-store")

    def test_draft_and_missing_articles_are_404(self):
        for slug in (self.draft.slug, "missing"):
            self.assertEqual(self.preview("/resources/" + slug).status_code, 404)

    def test_cached_preview_updates_without_save_signals_and_rejects_unpublished(self):
        path = "/resources/" + self.article.slug
        with patch("apps.articles.seo_views.render_to_string", wraps=render_to_string) as render:
            self.head(self.preview(path))
            self.head(self.preview(path))
            self.assertEqual(render.call_count, 1)
            Article.objects.filter(pk=self.article.pk).update(title="Edited immediately")
            self.assertEqual(self.head(self.preview(path)).meta["og:title"], "Edited immediately")
            self.assertEqual(render.call_count, 2)
            Article.objects.filter(pk=self.article.pk).update(status=Article.DRAFT)
            self.assertEqual(self.preview(path).status_code, 404)

    def test_cached_preview_rejects_deleted_or_renamed_article(self):
        path = "/resources/" + self.article.slug
        self.head(self.preview(path))
        Article.objects.filter(pk=self.article.pk).update(slug="new-slug")
        self.assertEqual(self.preview(path).status_code, 404)
        self.head(self.preview("/resources/new-slug"))
        self.article.delete()
        self.assertEqual(self.preview("/resources/new-slug").status_code, 404)

    def test_query_strings_are_not_reflected_and_internal_header_is_supported(self):
        response = self.client.get(PREVIEW, {"path": "/admin/"},
                                   HTTP_X_SEO_PATH="/resources?token=private&path=/admin/")
        head = self.head(response)
        self.assertEqual(head.canonical, ORIGIN + "/resources")
        self.assertNotContains(response, "private")

    def test_public_endpoints_ignore_expired_jwt_and_reject_posts(self):
        for path in ("/sitemap.xml", "/robots.txt", PREVIEW):
            self.assertEqual(self.client.get(path, HTTP_AUTHORIZATION="Bearer expired").status_code, 200)
            self.assertEqual(self.client.post(path).status_code, 405)
            self.assertEqual(self.client.head(path).content, b"")

    def test_existing_chat_and_admin_endpoints_still_require_authentication(self):
        self.assertEqual(self.client.post("/api/chat/message", {}, content_type="application/json").status_code, 401)
        self.assertEqual(self.client.get("/api/admin/articles/").status_code, 401)
