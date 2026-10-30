# Backend SEO implementation

Implemented on 2026-10-19 from the supplied backend SEO specification and the
clarifications recorded below. Related: [API reference](api-endpoints.md),
[architecture](backend.md), [feature status](../features/feature-status-back-end.md).

## Scope and agreed decisions

- Generate sitemaps for published articles and the seven canonical public pages.
- Omit category sitemap entries: the frontend does not consume category query
  parameters, and this implementation adds no React changes.
- Serve previews only for known public pages and published articles. Private,
  unknown, draft and deleted paths return 404 rather than generic clinic metadata.
- Refresh preview metadata immediately after edits/unpublishing, including across
  Gunicorn workers. Retain a 15-minute cache of rendered HTML, but never use it to
  bypass a current publication check.
- `cover_image_alt` and exporting triage topics remain future proposals. No model,
  migration, clinical-data export or existing JSON response changes are required.

The [original architecture proposal](backend-seo-specification.md) retains example
code; this document describes the implemented contract and supersedes its category,
generic-fallback, cache and Nginx samples.

## Configuration

`SITE_DOMAIN` is the public frontend origin (scheme and host, optionally port),
defaulting to `https://drnegarmashoori.ir`. Trailing slashes are stripped. Set it in the
root Compose `.env` or the backend process environment for another deployment.
Sitemaps, robots declarations and canonical URLs use this value, not request Host.
Relative cover-image storage URLs are resolved against it; absolute storage URLs
are retained. The specified default image is `/pink-ribbon.svg`.

`django.contrib.sitemaps` is enabled and `BASE_DIR/templates` is added to template
search paths. Rendering uses Django's existing local-memory cache by default;
there is no new cache service dependency.

## Public endpoints

| Method | Route | Behavior |
|---|---|---|
| GET / HEAD | `/sitemap.xml` | XML sitemap; published articles and canonical static URLs |
| GET / HEAD | `/robots.txt` | Plain-text crawl directives with the configured sitemap origin |
| GET / HEAD | `/api/seo/bot-preview/?path=/resources/<slug>` | Escaped HTML with canonical, Open Graph and Twitter metadata |

These are public Django views; missing/expired bearer tokens do not block them.
Other methods return 405. Sitemap article URLs use Unicode-safe percent encoding,
weekly frequency, priority 0.8, and `updated_at` as last modification. Static
priorities/frequencies follow the supplied spec. The seven static paths are `/`,
`/about`, `/services/therapeutic`, `/services/aesthetic`, `/faq`, `/resources`, `/videos`.
No private, draft, category-query or duplicate alias URLs enter the sitemap.

Preview `path` defaults to `/` when omitted/blank. Recognized aliases are
`/articles/<slug>` → `/resources/<slug>`, `/video` → `/videos`, and `/services` →
`/services/therapeutic`; trailing slashes on article paths are accepted. Static page
paths are exact. Original page query strings/fragments are excluded from canonical
metadata. External URLs, private routes and unknown paths return the specified
Persian not-found message with 404, `X-Robots-Tag: noindex, nofollow`, and
`Cache-Control: no-store`.

Article previews use the current title, excerpt (or clinic-description fallback),
cover (or ribbon fallback), `og:type=article`, and `summary_large_image`. Static
previews use clinic defaults, `og:type=website`, and `twitter:card=summary`. Preview
requests do not increment article view counts. All values are template-escaped;
article titles/excerpts cannot inject markup or attributes.

The view reads current public metadata before choosing the HTML cache key. That
key hashes all rendered metadata; changes automatically select a new key, even
for database updates that skip model save signals. Unpublished/deleted articles
cannot reach an old cache entry. Successful responses use `Cache-Control: no-cache`
so HTTP caches revalidate; this cannot purge a social platform's own stored card.

Robots excludes `/admin/`, `/api/admin/`, `/api/auth/`, `/api/users/`,
`/chat-session/`, `/api/chat/`, `/api/chat_gateway/`. These are crawl hints, not
access control. Patient/admin/chat endpoints retain their authentication checks;
SEO code never reads patient data or chat transcripts. See Google's
[robots guidance](https://developers.google.com/search/docs/crawling-indexing/robots/intro).

## Nginx dispatch

`front-end/nginx.conf` is included inside the Docker image's `http` context. A map
identifies the specified Telegram, WhatsApp, Twitter, Facebook, LinkedIn, Slack,
Discord and Baidu agents. Googlebot/Bingbot retain the SPA path. Bot page responses
vary on User-Agent; browsers keep the SPA, while existing JS/CSS/image files are
served directly to all agents.

Sitemap and robots requests proxy directly to Django. A named preview location
rewrites social page requests to `/api/seo/bot-preview/` and forwards their original
URI through `X-SEO-Path`, dropping the original query arguments from the rewritten
request. This header takes precedence over the direct API's `path` query parameter
and still passes through the same public-path checks. It prevents query/Unicode
corruption from embedding a raw request URI inside another query string. Proxy
directives are in valid location contexts, per the
[Nginx proxy module](https://nginx.org/en/docs/http/ngx_http_proxy_module.html).

Production article covers require working public media serving. The existing
`/media/` proxy points to Django, which serves uploads only with DEBUG enabled;
configure a production media server/storage separately. The fallback ribbon is
an SVG as specified; actual card-image support depends on the receiving platform.

## Verification

`apps/articles/test_seo.py` covers sitemap contents/origin/encoding, robots,
public/draft/private preview boundaries, escaping, aliases, images, cache freshness,
HEAD/methods, view counts and existing auth guards. The SEO, article, registration
and mocked chat suites passed together: **123 tests**, using an isolated in-memory
SQLite database with no live AI/SMS requests. PostgreSQL lock semantics were not
tested by that run.

Nginx 1.28.0 was compiled temporarily outside the repository because Docker was
not running and no Nginx binary was installed. The configuration passed `nginx -t`.
An isolated Nginx/Django integration run passed **48 HTTP checks** for browser,
Google/Bing and social-agent dispatch, Unicode paths, original query strings,
aliases, static files, sitemap/robots proxying, protected APIs, edits and
unpublishing. Local ports and temporary servers were closed after the run; this
was not a production deployment or Docker image test.

Example test command in a configured test environment:

```sh
python manage.py test apps.articles.test_seo apps.articles.tests apps.users.tests apps.chat_gateway.tests
```

Manual deployment checks: fetch `/sitemap.xml` and `/robots.txt`; request the same
public article URL with Mozilla, Googlebot and Telegram user agents; ensure only
the social request receives lightweight metadata and that its cover URL is public.
