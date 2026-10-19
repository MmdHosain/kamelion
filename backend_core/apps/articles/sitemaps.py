"""Sitemaps for canonical public pages and published articles only."""
from types import SimpleNamespace
from urllib.parse import urlsplit

from django.conf import settings
from django.contrib.sitemaps import Sitemap
from django.utils.encoding import iri_to_uri

from .models import Article
from .seo_content import PUBLIC_PAGES


class PublicOriginSitemap(Sitemap):
    def get_urls(self, page=1, site=None, protocol=None):
        # Django's default uses the incoming Host. SITE_DOMAIN is authoritative.
        origin = urlsplit(settings.SITE_DOMAIN)
        return super().get_urls(
            page=page,
            site=SimpleNamespace(domain=origin.netloc),
            protocol=origin.scheme,
        )


class ArticleSitemap(PublicOriginSitemap):
    changefreq = "weekly"
    priority = 0.8

    def items(self):
        return Article.objects.filter(status=Article.PUBLISHED).order_by(
            "-published_at", "-updated_at", "-id"
        )

    def lastmod(self, obj):
        return obj.updated_at or obj.published_at or obj.created_at

    def location(self, obj):
        return iri_to_uri(f"/resources/{obj.slug}")


class StaticViewSitemap(PublicOriginSitemap):
    def items(self):
        return PUBLIC_PAGES

    def location(self, item):
        return item["location"]

    def priority(self, item):
        return item["priority"]

    def changefreq(self, item):
        return item["changefreq"]
