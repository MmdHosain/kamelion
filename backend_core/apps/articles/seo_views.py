"""Public sitemap, robots and social preview responses; no patient access."""
import hashlib
import json

from django.conf import settings
from django.contrib.sitemaps.views import sitemap
from django.core.cache import cache
from django.http import HttpResponse
from django.shortcuts import render
from django.template.loader import render_to_string
from django.views.decorators.http import require_safe

from .seo_content import preview_context
from .sitemaps import ArticleSitemap, StaticViewSitemap

PREVIEW_CACHE_SECONDS = 15 * 60
SITEMAPS = {"articles": ArticleSitemap, "static": StaticViewSitemap}


@require_safe
def public_sitemap(request):
    return sitemap(request, sitemaps=SITEMAPS)


@require_safe
def robots_view(request):
    return render(
        request, "robots.txt", {"site_domain": settings.SITE_DOMAIN},
        content_type="text/plain; charset=utf-8",
    )


@require_safe
def bot_preview_view(request):
    # Nginx forwards the original URI in a header to avoid putting unescaped
    # Unicode, '&', '?' or user query strings into a second query parameter.
    path = request.headers.get("X-SEO-Path", request.GET.get("path", ""))
    context = preview_context(path)
    if context is None:
        response = HttpResponse(
            "صفحه مورد نظر در کلینیک یافت نشد.", status=404,
            content_type="text/plain; charset=utf-8",
        )
        response["X-Robots-Tag"] = "noindex, nofollow"
        response["Cache-Control"] = "no-store"
        return response

    # Version the cache by the actual metadata, not worker-local invalidation
    # signals. Changed metadata can never reuse an older rendered document.
    digest = hashlib.sha256(
        json.dumps(context, sort_keys=True, ensure_ascii=False).encode("utf-8")
    ).hexdigest()
    key = f"seo-preview:v1:{digest}"
    html = cache.get(key)
    if html is None:
        html = render_to_string("seo/bot_preview.html", context)
        cache.set(key, html, PREVIEW_CACHE_SECONDS)
    response = HttpResponse(html, content_type="text/html; charset=utf-8")
    # Do not let HTTP caches bypass the publication check on the next request.
    response["Cache-Control"] = "no-cache"
    return response
