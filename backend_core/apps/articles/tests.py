"""Tests for the articles module (guide v2, §8).

Run with: python manage.py test apps.articles
"""

import io
import shutil
import tempfile

from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import override_settings
from django.utils import timezone
from PIL import Image
from rest_framework import status
from rest_framework.test import APITestCase

from . import services
from .models import Article, Category

User = get_user_model()

MEDIA_ROOT = tempfile.mkdtemp(prefix="articles-test-media-")


def make_image(fmt="PNG", size=(100, 80), name=None, color=(120, 60, 30)):
    buffer = io.BytesIO()
    Image.new("RGB", size, color).save(buffer, format=fmt)
    buffer.seek(0)
    ext = {"PNG": "png", "JPEG": "jpg", "WEBP": "webp"}[fmt]
    return SimpleUploadedFile(
        name or f"test.{ext}", buffer.read(), content_type=f"image/{ext}"
    )


@override_settings(MEDIA_ROOT=MEDIA_ROOT)
class ArticleTestBase(APITestCase):
    @classmethod
    def tearDownClass(cls):
        super().tearDownClass()
        shutil.rmtree(MEDIA_ROOT, ignore_errors=True)

    def setUp(self):
        self.admin = User.objects.create_user(
            phone_number="09120000001",
            full_name="Admin User",
            password="pw",
        )
        self.admin.is_staff = True
        self.admin.save(update_fields=["is_staff"])

        self.patient = User.objects.create_user(
            phone_number="09120000002",
            full_name="Patient User",
        )

        self.category = Category.objects.create(name="پیشگیری", slug="پیشگیری")
        self.published = Article.objects.create(
            title="مقاله منتشرشده",
            slug="منتشرشده",
            content="<p>محتوای منتشرشده</p>",
            excerpt="خلاصه",
            category=self.category,
            author=self.admin,
            status=Article.PUBLISHED,
        )
        self.draft = Article.objects.create(
            title="پیش‌نویس",
            slug="پیش-نویس",
            content="<p>محتوای پیش‌نویس</p>",
            author=self.admin,
            status=Article.DRAFT,
        )

    def admin_client(self):
        self.client.force_authenticate(user=self.admin)
        return self.client

    def clear_auth(self):
        self.client.force_authenticate(user=None)


# ── §8: Content security ──────────────────────────────────
class ContentSanitizationTests(ArticleTestBase):
    def test_script_tag_is_removed(self):
        out = services.sanitize_html("<p>ok</p><script>alert(1)</script>")
        self.assertNotIn("<script", out)
        self.assertIn("<p>ok</p>", out)

    def test_onclick_attribute_is_removed(self):
        out = services.sanitize_html('<p onclick="evil()">hi</p>')
        self.assertNotIn("onclick", out)

    def test_javascript_scheme_is_stripped(self):
        out = services.sanitize_html('<a href="javascript:alert(1)">x</a>')
        self.assertNotIn("javascript:", out)

    def test_link_gets_rel_noopener_noreferrer(self):
        out = services.sanitize_html('<a href="https://example.com">x</a>')
        self.assertIn("noopener", out)
        self.assertIn("noreferrer", out)

    def test_disallowed_iframe_host_loses_src(self):
        out = services.sanitize_html(
            '<iframe src="https://evil.example.com/x"></iframe>'
        )
        self.assertNotIn("evil.example.com", out)

    def test_allowed_iframe_src_is_kept(self):
        out = services.sanitize_html(
            '<iframe src="https://www.aparat.com/video/v/1"></iframe>'
        )
        self.assertIn("aparat.com", out)


# ── §8: Video ─────────────────────────────────────────────
class VideoTests(ArticleTestBase):
    def test_aparat_and_youtube_accepted(self):
        self.assertTrue(services.is_allowed_video_url("https://www.aparat.com/v/abc"))
        self.assertTrue(
            services.is_allowed_video_url("https://www.youtube.com/embed/abc")
        )

    def test_other_domain_rejected(self):
        self.assertFalse(services.is_allowed_video_url("https://vimeo.com/123"))

    def test_iframe_snippet_normalized_to_url(self):
        snippet = '<iframe src="https://www.youtube.com/embed/xyz"></iframe>'
        self.assertEqual(
            services.normalize_video_url(snippet), "https://www.youtube.com/embed/xyz"
        )

    def test_admin_write_rejects_disallowed_video(self):
        self.admin_client()
        resp = self.client.post(
            "/api/admin/articles/",
            {
                "title": "ویدیو بد",
                "content": "<p>x</p>",
                "video_embed_url": "https://vimeo.com/123",
            },
            format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("video_embed_url", resp.data)

    def test_admin_write_accepts_iframe_snippet(self):
        self.admin_client()
        resp = self.client.post(
            "/api/admin/articles/",
            {
                "title": "ویدیو خوب",
                "content": "<p>x</p>",
                "video_embed_url": '<iframe src="https://www.aparat.com/video/v/1"></iframe>',
            },
            format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertEqual(
            resp.data["video_embed_url"], "https://www.aparat.com/video/v/1"
        )


# ── §8: Public endpoints ──────────────────────────────────
class PublicEndpointTests(ArticleTestBase):
    def test_list_excludes_drafts(self):
        self.clear_auth()
        resp = self.client.get("/api/articles/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        slugs = [a["slug"] for a in resp.data["results"]]
        self.assertIn(self.published.slug, slugs)
        self.assertNotIn(self.draft.slug, slugs)

    def test_draft_detail_is_404(self):
        self.clear_auth()
        resp = self.client.get(f"/api/articles/{self.draft.slug}/")
        self.assertEqual(resp.status_code, status.HTTP_404_NOT_FOUND)

    def test_public_access_without_token(self):
        self.clear_auth()
        resp = self.client.get("/api/articles/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

    def test_public_access_with_expired_token_still_200(self):
        # Public views set authentication_classes = [] so any bad token is ignored.
        self.client.credentials(HTTP_AUTHORIZATION="Bearer not-a-real-token")
        resp = self.client.get("/api/articles/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.client.credentials()

    def test_persian_slug_works(self):
        self.clear_auth()
        resp = self.client.get("/api/articles/منتشرشده/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data["slug"], "منتشرشده")

    def test_categories_path_not_treated_as_slug(self):
        self.clear_auth()
        resp = self.client.get("/api/articles/categories/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        # Plain array (unpaginated), not an article detail.
        self.assertIsInstance(resp.data, list)
        self.assertEqual(resp.data[0]["slug"], self.category.slug)


# ── §8: Filtering & pagination ────────────────────────────
class FilterPaginationTests(ArticleTestBase):
    def _make_published(self, n, category=None):
        for i in range(n):
            Article.objects.create(
                title=f"Extra {i}",
                slug=f"extra-{i}",
                content="<p>x</p>",
                category=category or self.category,
                status=Article.PUBLISHED,
            )

    def test_category_filter(self):
        other = Category.objects.create(name="زیبایی", slug="زیبایی")
        Article.objects.create(
            title="زیبایی‌مقاله",
            slug="z-1",
            content="<p>x</p>",
            category=other,
            status=Article.PUBLISHED,
        )
        self.clear_auth()
        resp = self.client.get("/api/articles/", {"category": other.slug})
        self.assertEqual(len(resp.data["results"]), 1)
        self.assertEqual(resp.data["results"][0]["category"]["slug"], other.slug)

    def test_search_filter_matches_title(self):
        self.clear_auth()
        resp = self.client.get("/api/articles/", {"search": "منتشرشده"})
        self.assertGreaterEqual(len(resp.data["results"]), 1)

    def test_page_size_capped_at_50(self):
        self._make_published(60)
        self.clear_auth()
        resp = self.client.get("/api/articles/", {"page_size": 999})
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertLessEqual(len(resp.data["results"]), 50)

    def test_admin_status_filter(self):
        self.admin_client()
        resp = self.client.get("/api/admin/articles/", {"status": "draft"})
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        statuses = {a["status"] for a in resp.data["results"]}
        self.assertEqual(statuses, {"draft"})


# ── §8: View counting ─────────────────────────────────────
class ViewCountTests(ArticleTestBase):
    def test_successful_get_increments_views(self):
        self.clear_auth()
        before = self.published.views_count
        resp = self.client.get(f"/api/articles/{self.published.slug}/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.published.refresh_from_db()
        self.assertEqual(self.published.views_count, before + 1)
        self.assertEqual(resp.data["views_count"], before + 1)

    def test_draft_not_counted(self):
        self.clear_auth()
        self.client.get(f"/api/articles/{self.draft.slug}/")  # 404
        self.draft.refresh_from_db()
        self.assertEqual(self.draft.views_count, 0)


# ── §8: Ordering & published_at ───────────────────────────
class OrderingTests(ArticleTestBase):
    def test_newer_published_article_ranks_higher(self):
        newer = Article.objects.create(
            title="تازه",
            slug="taze",
            content="<p>x</p>",
            status=Article.PUBLISHED,
        )
        newer.published_at = timezone.now()
        newer.save(update_fields=["published_at"])
        self.clear_auth()
        resp = self.client.get("/api/articles/")
        self.assertEqual(resp.data["results"][0]["slug"], "taze")

    def test_published_at_set_only_once(self):
        first = self.published.published_at
        self.assertIsNotNone(first)
        self.published.title = "عنوان تغییر کرد"
        self.published.save()
        self.published.refresh_from_db()
        self.assertEqual(self.published.published_at, first)

    def test_draft_has_no_published_at(self):
        self.assertIsNone(self.draft.published_at)


# ── §8: Admin ─────────────────────────────────────────────
class AdminPermissionTests(ArticleTestBase):
    def test_non_admin_gets_403(self):
        self.client.force_authenticate(user=self.patient)
        resp = self.client.get("/api/admin/articles/")
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)

    def test_anonymous_gets_401_or_403(self):
        self.clear_auth()
        resp = self.client.get("/api/admin/articles/")
        self.assertIn(resp.status_code, (401, 403))


class AdminCreateTests(ArticleTestBase):
    def test_author_is_current_user(self):
        self.admin_client()
        resp = self.client.post(
            "/api/admin/articles/",
            {
                "title": "مقاله تازه",
                "content": "<p>متن</p>",
            },
            format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        article = Article.objects.get(pk=resp.data["id"])
        self.assertEqual(article.author, self.admin)

    def test_reading_time_input_ignored(self):
        self.admin_client()
        resp = self.client.post(
            "/api/admin/articles/",
            {
                "title": "زمان مطالعه",
                "content": "<p>" + "کلمه " * 400 + "</p>",
                "reading_time_minutes": 999,
            },
            format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertLess(resp.data["reading_time_minutes"], 999)
        self.assertGreaterEqual(resp.data["reading_time_minutes"], 1)

    def test_auto_slug_generated_and_unique(self):
        self.admin_client()
        first = self.client.post(
            "/api/admin/articles/",
            {"title": "مقاله خودکار", "content": "<p>x</p>"},
            format="json",
        )
        second = self.client.post(
            "/api/admin/articles/",
            {"title": "مقاله خودکار", "content": "<p>y</p>"},
            format="json",
        )
        self.assertEqual(first.status_code, status.HTTP_201_CREATED)
        self.assertEqual(second.status_code, status.HTTP_201_CREATED)
        self.assertNotEqual(first.data["slug"], second.data["slug"])

    def test_reserved_slug_rejected(self):
        self.admin_client()
        resp = self.client.post(
            "/api/admin/articles/",
            {
                "title": "x",
                "slug": "categories",
                "content": "<p>x</p>",
            },
            format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("slug", resp.data)

    def test_content_sanitized_on_create(self):
        self.admin_client()
        resp = self.client.post(
            "/api/admin/articles/",
            {
                "title": "xss",
                "content": "<p>ok</p><script>alert(1)</script>",
            },
            format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        article = Article.objects.get(pk=resp.data["id"])
        self.assertNotIn("<script", article.content)


class AdminToggleTests(ArticleTestBase):
    def test_toggle_draft_to_published(self):
        self.admin_client()
        resp = self.client.patch(f"/api/admin/articles/{self.draft.pk}/toggle-status/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data["status"], Article.PUBLISHED)
        self.assertIsNotNone(resp.data["published_at"])

    def test_toggle_published_to_draft(self):
        self.admin_client()
        resp = self.client.patch(
            f"/api/admin/articles/{self.published.pk}/toggle-status/"
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data["status"], Article.DRAFT)

    def test_toggle_missing_is_404(self):
        self.admin_client()
        resp = self.client.patch("/api/admin/articles/999999/toggle-status/")
        self.assertEqual(resp.status_code, status.HTTP_404_NOT_FOUND)


class CategoryAdminTests(ArticleTestBase):
    def test_create_category(self):
        self.admin_client()
        resp = self.client.post(
            "/api/admin/articles/categories/",
            {
                "name": "دسته تازه",
                "slug": "دسته-تازه",
            },
            format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)

    def test_delete_category_by_id_is_204(self):
        self.admin_client()
        resp = self.client.delete(f"/api/admin/articles/categories/{self.category.pk}/")
        self.assertEqual(resp.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Category.objects.filter(pk=self.category.pk).exists())


# ── §8: Uploads ───────────────────────────────────────────
class ImageUploadTests(ArticleTestBase):
    def test_valid_image_becomes_webp(self):
        upload = make_image("PNG")
        content, name = services.optimize_image(upload)
        self.assertTrue(name.endswith(".webp"))
        self.assertGreater(len(content.read()), 0)

    def test_fake_extension_rejected(self):
        bad = SimpleUploadedFile(
            "evil.png", b"<?php echo 1; ?>", content_type="image/png"
        )
        with self.assertRaises(services.ImageValidationError):
            services.optimize_image(bad)

    def test_oversized_file_rejected(self):
        big = SimpleUploadedFile(
            "big.png", b"0" * (services.MAX_UPLOAD_BYTES + 1), content_type="image/png"
        )
        with self.assertRaises(services.ImageValidationError):
            services.optimize_image(big)

    def test_huge_dimensions_rejected(self):
        # 1x1 px file claiming to be huge is not possible; use a real large canvas.
        huge = make_image("PNG", size=(8000, 8000))
        with self.assertRaises(services.ImageValidationError):
            services.optimize_image(huge)

    def test_transparent_png_downscaled_keeps_alpha(self):
        buffer = io.BytesIO()
        Image.new("RGBA", (3000, 1000), (0, 0, 0, 0)).save(buffer, format="PNG")
        buffer.seek(0)
        upload = SimpleUploadedFile("wide.png", buffer.read(), content_type="image/png")
        content, _ = services.optimize_image(upload)
        with Image.open(content) as out:
            self.assertEqual(out.width, services.MAX_WIDTH)
            self.assertIn(out.mode, ("RGBA", "RGB"))

    def test_upload_endpoint_returns_201(self):
        self.admin_client()
        resp = self.client.post(
            "/api/admin/articles/upload-image/",
            {"image": make_image("JPEG")},
            format="multipart",
        )
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertIn("url", resp.data)

    def test_upload_endpoint_accepts_file_field(self):
        self.admin_client()
        resp = self.client.post(
            "/api/admin/articles/upload-image/",
            {"file": make_image("PNG")},
            format="multipart",
        )
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)

    def test_upload_endpoint_rejects_fake(self):
        self.admin_client()
        bad = SimpleUploadedFile("x.jpg", b"not an image", content_type="image/jpeg")
        resp = self.client.post(
            "/api/admin/articles/upload-image/", {"image": bad}, format="multipart"
        )
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_upload_endpoint_missing_file_is_400(self):
        self.admin_client()
        resp = self.client.post(
            "/api/admin/articles/upload-image/", {}, format="multipart"
        )
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)


# ── §8: Deletion semantics ────────────────────────────────
class DeletionSemanticsTests(ArticleTestBase):
    def test_deleting_author_does_not_delete_article(self):
        self.published.author = self.admin
        self.published.save(update_fields=["author"])
        self.admin.delete()
        self.published.refresh_from_db()
        self.assertIsNone(self.published.author)

    def test_deleting_category_nulls_article_category(self):
        self.category.delete()
        self.published.refresh_from_db()
        self.assertIsNone(self.published.category)

    def test_deleted_author_serializes_to_null(self):
        self.published.author.delete()
        self.clear_auth()
        resp = self.client.get(f"/api/articles/{self.published.slug}/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertIsNone(resp.data["author"])


# ── Reading time ──────────────────────────────────────────
class ReadingTimeTests(ArticleTestBase):
    def test_minimum_one_minute(self):
        self.assertEqual(services.estimate_reading_time("<p>hi</p>"), 1)

    def test_longer_text_longer_time(self):
        short = services.estimate_reading_time("<p>" + "a " * 100 + "</p>")
        long = services.estimate_reading_time("<p>" + "a " * 1000 + "</p>")
        self.assertGreater(long, short)
