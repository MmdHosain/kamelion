"""Public SEO paths and metadata, independent of request host/user state."""
import re
from urllib.parse import unquote, urljoin, urlsplit

from django.conf import settings
from django.utils.encoding import iri_to_uri

from .models import Article

SITE_TITLE = "کلینیک تخصصی پستان دکتر نگار معشوری"
SITE_DESCRIPTION = (
    "ارائه خدمات تخصصی جراحی پستان، انکوپلاستی، غربالگری و درمان بیماری‌های پستان "
    "توسط دکتر نگار معشوری."
)

PUBLIC_PAGES = (
    {"location": "/", "priority": 1.0, "changefreq": "daily"},
    {"location": "/about", "priority": 0.9, "changefreq": "monthly"},
    {"location": "/services/therapeutic", "priority": 0.9, "changefreq": "monthly"},
    {"location": "/services/aesthetic", "priority": 0.9, "changefreq": "monthly"},
    {"location": "/faq", "priority": 0.8, "changefreq": "weekly"},
    {"location": "/resources", "priority": 0.8, "changefreq": "daily"},
    {"location": "/videos", "priority": 0.7, "changefreq": "weekly"},
)
PUBLIC_PATHS = frozenset(page["location"] for page in PUBLIC_PAGES)
PAGE_ALIASES = {"/video": "/videos", "/services": "/services/therapeutic"}
ARTICLE_PATH = re.compile(r"^/(?:resources|articles)/([^/]+)/?$")


def public_url(path):
    return iri_to_uri(settings.SITE_DOMAIN + path)


def preview_context(raw_path):
    """Return public metadata, or None. Never read chat, auth or patient data."""
    raw_path = raw_path.strip() or "/"
    if any(ord(char) < 32 for char in raw_path):
        return None
    try:
        parts = urlsplit(raw_path)
    except ValueError:
        return None
    if parts.scheme or parts.netloc or not parts.path.startswith("/"):
        return None
    path = unquote(parts.path)
    path = PAGE_ALIASES.get(path, path)
    context = {
        "site_title": SITE_TITLE,
        "title": SITE_TITLE,
        "heading": SITE_TITLE,
        "description": SITE_DESCRIPTION,
        "image_url": public_url("/pink-ribbon.svg"),
        "canonical_url": public_url(path),
        "type": "website",
        "twitter_card": "summary",
    }
    if path in PUBLIC_PATHS:
        return context

    match = ARTICLE_PATH.fullmatch(path)
    if not match:
        return None
    # Always check current publication before reading cached HTML. This also works
    # across Gunicorn workers and for QuerySet.update() without save signals.
    article = Article.objects.filter(
        slug=match.group(1), status=Article.PUBLISHED
    ).only("id", "title", "slug", "excerpt", "cover_image").first()
    if article is None:
        return None
    context.update(
        title=f"{article.title} | {SITE_TITLE}",
        heading=article.title,
        description=article.excerpt or SITE_DESCRIPTION,
        canonical_url=public_url(f"/resources/{article.slug}"),
        type="article",
        twitter_card="summary_large_image",
    )
    if article.cover_image:
        # Relative storage URLs use the configured public origin, not Host or
        # X-Forwarded-Proto supplied by the request. Absolute storage URLs survive.
        context["image_url"] = iri_to_uri(
            urljoin(settings.SITE_DOMAIN + "/", article.cover_image.url)
        )
    return context
