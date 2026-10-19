# Medical Articles API Reference

> **Verified against repository source:** 2026-10-17, baseline `8b0eca0`.
> Current implementation in `backend_core/apps/articles/`; replaces the proposed
> contracts previously held in this file.

[API index and shared conventions](api-endpoints.md) · [Backend feature status](../features/feature-status-back-end.md)

## Routes

Public endpoints disable authentication (`AllowAny`, `authentication_classes=[]`), so a supplied expired token is ignored. Admin endpoints require JWT plus `IsAdminUser`.

| Method | Path | Access | Success / purpose |
|---|---|---|---|
| GET | `/api/articles/` | Public | `200` paginated published articles |
| GET | `/api/articles/categories/` | Public | `200` unpaginated categories |
| GET | `/api/articles/<slug>/` | Public | `200` published detail; increments views |
| GET / POST | `/api/admin/articles/` | Admin | `200` page / `201` created article |
| GET / PUT / PATCH / DELETE | `/api/admin/articles/<id>/` | Admin | `200` article / `204` on delete |
| PATCH | `/api/admin/articles/<id>/toggle-status/` | Admin | `200` `{id, status, published_at}` |
| POST | `/api/admin/articles/upload-image/` | Admin | `201` `{url, message}` |
| GET / POST | `/api/admin/articles/categories/` | Admin | `200` array / `201` category |
| DELETE | `/api/admin/articles/categories/<id>/` | Admin | `204` |

Article/category IDs are integers. Public detail uses `<str:slug>`, supporting Unicode/Persian slugs. Reserved category routing precedes the slug route. Missing records and unpublished public slugs return `404`; invalid writes normally return `400` field errors.

## Public lists and detail

`GET /api/articles/` accepts `category` (category slug), `search` (case-insensitive title/excerpt match), `page`, and `page_size` (default 10, max 50). Only published records are returned, ordered by `-published_at, -created_at`.

```json
{
  "count":1,"next":null,"previous":null,
  "results":[{
    "id":1,"title":"Example article","slug":"example-article","excerpt":"Summary.",
    "cover_image":null,"category":{"id":1,"name":"Education","slug":"education"},
    "author_name":"Example Author","reading_time_minutes":1,
    "created_at":"2026-10-17T10:00:00Z","published_at":"2026-10-17T10:01:00Z"
  }]
}
```

List items do **not** include `views_count`, `status`, or `content`. Category can be null, cover image is a URL or null, and missing author/name produces `author_name: ""`.

Detail contains `{id, title, slug, excerpt, content, cover_image, video_embed_url, category, author, reading_time_minutes, views_count, created_at, updated_at, published_at}`. `author` is `{id, full_name}` or null. It has no `author_name` or `medical_degree` field. Each successful detail GET atomically increments `views_count` and returns the incremented value; repeated refreshes count separately.

Public and admin category lists return `{id, name, slug, description}` items, ordered by name. There is no `articles_count` field or active-category filter.

## Admin writes and reads

Admin list accepts `status=draft|published`, `search` (title/excerpt), `page`, and `page_size` (default 10, max 50), ordered by descending creation time. Other status values are ignored. There is no implemented admin category/author filter.

Admin list, retrieve, create, and update all use the write serializer's response shape:

```json
{
  "id":1,"title":"Example article","slug":"example-article","excerpt":"Summary.",
  "content":"<p>Sanitized article text.</p>","cover_image":null,"video_embed_url":"",
  "category":1,"status":"draft","reading_time_minutes":1,"published_at":null
}
```

Here `category` is an integer ID or null, rather than the nested public object.

| Writable field | Contract |
|---|---|
| `title` | Required on create/PUT, nonblank, max 255 |
| `content` | Required on create/PUT, HTML sanitized on write |
| `slug` | Optional, max 280, Unicode allowed; generated uniquely from title on create if omitted; `categories` and `upload-image` are reserved |
| `excerpt` | Optional/blank, max 600 |
| `cover_image` | Optional/null multipart image upload; processed as below |
| `video_embed_url` | Optional/blank, max 500; plain URL or iframe snippet whose `src` is extracted |
| `category` | Optional existing category ID or null |
| `status` | `draft` (default) or `published` |

Create sets author to the current admin. Requests cannot set author through this serializer. `reading_time_minutes` and `published_at` are read-only; reading time is derived from sanitized content at 200 words/minute, rounded up with minimum 1. `published_at` is set on the first publication and retained after unpublishing/republishing. PATCH is partial; PUT follows standard serializer required-field rules.

`toggle-status` requires no body and flips draft/published, returning `{id, status, published_at}` (no `message` field). Missing IDs return `404 {"detail":"یافت نشد."}`.

Category create requires unique nonblank `name` (max 100) and unique Unicode `slug` (max 120); `description` is optional/blank. Category deletion leaves articles with null category. Deleting an author similarly retains articles with null author.

## Content and media processing

HTML is sanitized by **nh3** using the allowlist in `services.py`; scripts, event handlers, and unsafe URL schemes are removed, and links get `rel="noopener noreferrer"`. Iframe sources must be HTTPS on exactly `aparat.com`, `www.aparat.com`, `www.youtube.com`, or `www.youtube-nocookie.com`. The same host restriction applies to `video_embed_url`. Article image sources allow HTTP(S) or `/media/` paths.

Image uploads require `.jpg`, `.jpeg`, `.png`, or `.webp`, verified JPEG/PNG/WebP contents, at most `5 * 1024 * 1024` bytes and 40,000,000 pixels. Images are EXIF-rotation corrected, resized to max width 1600 preserving aspect ratio/transparency, and re-encoded to randomly named WebP at quality 82.

Inline upload accepts multipart `image` or `file`, returning an absolute `url` and the message `تصویر با موفقیت آپلود و بهینه‌سازی شد.`. A missing file returns `400 {"detail":"فایلی ارسال نشده است."}`; invalid files return `400 {"detail":"..."}`. Cover-image writes also require multipart when a file is included; JSON/form writes without files are supported.

Storage uses Django's configured storage under `articles/inline/` and `articles/covers/%Y/%m/`. `MEDIA_ROOT` is `backend_core/media`, `MEDIA_URL` is `/media/`, and Compose supplies a persistent media volume. Django serves media only when `DEBUG=True`; the checked-in Nginx `/media/` proxy alone does not make Django serve it with `DEBUG=False`.

## Scope and verification

Tags, revisions, medical-review workflows, redirects, SEO fields, thumbnails, UUID article IDs, and additional publication states in the earlier architecture proposal are **not implemented**. The current models are `Article` and `Category` only.

Sources: `apps/articles/{urls,admin_urls,models,serializers,views,views_admin,services,pagination}.py`, `config/{urls,settings}.py`, `docker-compose.yml`, and `front-end/nginx.conf`. Existing behavior tests are in `apps/articles/tests.py`; see the [feature status verification note](../features/feature-status-back-end.md#verification-and-maintenance) for this documentation revision's check scope.
