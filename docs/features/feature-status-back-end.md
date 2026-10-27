# Backend Feature Implementation Status

> **Verified against repository source:** 2026-10-17, baseline commit `8b0eca0`.
> Status reflects code, routing, and business logic present in `backend_core`.
> It does not certify a deployment, live provider delivery, or passing regression tests.

[API reference](../architecture/api-endpoints.md) · [Backend architecture](../architecture/backend.md) · [Articles API](../architecture/api-endpoints-articles.md) · [Chat/triage API](../architecture/api-endpoints-chat.md)

## Status legend

| Status | Meaning |
|---|---|
| ✅ Implemented | Functional code and a reachable API/admin surface exist for the described scope; deployment/configuration may still be required. |
| 🟡 Partial | A usable implementation exists, with a specific missing capability documented below. |
| ❌ Not implemented | No wired implementation exists for the described capability. |

Existing feature IDs are retained because frontend documents refer to them. Newly inventoried capabilities have additional IDs; this is not a changelog of features built during this documentation update.

## Feature summary

| ID | Feature | Status | API / implementation evidence |
|---|---|---|---|
| 1 | Patient OTP login and two-step registration | ✅ Implemented | `auth/request-otp`, `auth/verify-otp`, `auth/complete-registration`; `users/services.py` |
| 2 | Admin/staff password login | ✅ Implemented | `POST /api/auth/admin/login`; `users/views.py` |
| 2b | Admin/password versus patient/OTP login branch | ✅ Implemented | Staff check before issuing OTP |
| 3 | Patient profile self-service | 🟡 Partial | `GET /api/auth/me` exists; no self-edit endpoint |
| 3b | National ID and signup demographics on User | ✅ Implemented | `User.national_id`, `sex`, `date_of_birth`; registration serializer |
| 4 | Admin weekly availability management | ✅ Implemented | `/api/admin/slots/`, detail CRUD and bulk replacement |
| 5 | Admin clinic-closure management | ✅ Implemented | `/api/admin/exceptions/`, detail CRUD and bulk replacement |
| 6 | Public daily slots and monthly unavailable dates | ✅ Implemented | `GET /api/appointments/slots/?date=` or `?month=` |
| 7 | Patient appointment requests | ✅ Implemented | `POST /api/appointments/book/`; starts pending |
| 7b | Pending approval/rejection workflow | ✅ Implemented | Dedicated approve/disapprove endpoints, required rejection reason |
| 8 | Patient appointment history | ✅ Implemented | `GET /api/appointments/my/` |
| 9 | Patient cancellation | ✅ Implemented | `POST /api/appointments/<id>/cancel/` |
| 10 | Admin appointment list/search/filter/detail management | ✅ Implemented | Date/status/search filters, pagination, retrieve/update/delete |
| 11 | Django admin panel | ✅ Implemented | Registrations across all six domain apps |
| 12 | AI chat gateway, stored triage, and actions | ✅ Implemented | `/api/chat/message`; sessions, messages, AI client, booking offers/codes |
| 13 | Shared/common backend capabilities | ✅ Implemented | Theme/video/statistics APIs and shared PanelChi client |
| 14 | SMS OTP delivery | ✅ Implemented | PanelChi adapter; real sends require `SMS_PROVIDER=panelchi` and credentials/pattern |
| 15 | Custom business roles beyond staff/authenticated user | ❌ Not implemented | Uses stock Django flags and DRF permissions |
| 16 | Admin patient dossiers, edits, and clinical notes | ✅ Implemented | `/api/admin/patients/`, detail and notes routes |
| 17 | Public reviews and admin moderation | ✅ Implemented | Public submission/list, admin approval/rejection/delete, approval alias |
| 18 | Medical articles and categories CMS | ✅ Implemented | Public read APIs, admin CRUD/status/media/category endpoints |
| 19 | Current-user lookup, token refresh, logout | ✅ Implemented | `/api/auth/me`, `/api/auth/refresh`, `/api/auth/logout` |
| 20 | Admin manual/walk-in appointment booking | ✅ Implemented | POST collection or `/api/admin/appointments/create/`; starts scheduled |
| 21 | Public recurring weekly-hour summary | ✅ Implemented | `GET /api/appointments/schedule/` |
| 22 | Appointment decision SMS notices | ✅ Implemented | Approval/rejection patterns; rejection includes reason |
| 23 | Admin patient chat history and latest triage | ✅ Implemented | Patient `/chats/` and `/triage_level/`; triage field on patient list |
| 23b | Admin AI testing playground & memory reset | ✅ Implemented | POST /api/admin/chat/test/message/, POST /api/admin/chat/test/reset/; inspector diagnostics |
| 24 | Persistent theme settings | ✅ Implemented | Public theme GET and admin PUT |
| 25 | Video gallery and admin create/delete | ✅ Implemented | Public list, admin create/delete; no update route |
| 26 | Admin dashboard analytics | 🟡 Partial | `GET /api/admin/stats`; emergency-code count hardcoded zero |
| 27 | Public sitemap, robots.txt and social-link previews | ✅ Implemented | Public SEO endpoints and Nginx social-agent dispatch |

## Authentication and patient information

**1, 2, 2b — Login.** Staff numbers are directed to password login without generating OTPs. Other numbers receive a 6-digit OTP valid for 5 minutes. A valid verification consumes it: returning users get JWTs; new numbers get a one-use signup token valid for 10 minutes. Registration requires name and national ID, then creates the account and issues tokens. Invalid/expired OTPs are not successful verifications. Patient login returns `access`/`refresh`, whereas admin login returns `accessToken`/`refreshToken`.

**3 — Profile self-service (partial).** Patients can read their current identity/demographics using `auth/me`. There is no endpoint to edit their own profile. The old `PatientProfile` model was deleted by migration `users/0006`; birth dates were copied to `User`, and address is no longer returned in dossiers.

**3b — Signup identity/demographics.** National ID is on `User` and intentionally non-unique. Optional sex accepts female/male, blank, or null; optional birth date accepts null and is validated against future/implausibly old dates at registration. Admin profile updates currently accept only name and national ID, not sex/birth date.

**15 — Authorization scope.** APIs use `IsAuthenticated` and `IsAdminUser` (`is_staff`); patient-facing authenticated views do not additionally reject staff. The user inherits Django groups/permissions, but no custom role/scopes policy is wired. Object ownership checks exist for appointment cancellation and chat sessions.

**16 — Staff patient records.** Admins can search/list non-staff users with appointment/note counts, last appointment date, and latest triage. Dossiers contain user demographics, appointment history, and clinical notes. Admins can edit name/national ID and add a note with the current user as author. There is no note edit/delete endpoint. Notes use a model max length of 4000, but the create view writes directly without serializer length validation.

**19 — Session lifecycle.** `me` resolves the access token; refresh accepts `refreshToken` and reuses it rather than rotating it. Logout blacklists a supplied refresh token; absent/invalid refresh tokens still succeed. Existing access tokens remain valid until expiry (7 days by default; refresh lifetime 30 days).

## Availability and appointment operations

**4, 5 — Schedule administration.** Full CRUD and atomic replace-all bulk endpoints exist for recurring schedules and closures. Schedule serializers prevent invalid/duplicate/overlapping day selections, invalid time windows, and invalid durations/gaps. Bulk payloads delete unreferenced rows. Closure date ordering is checked by the database and additionally by the bulk serializer; individual CRUD does not have the same explicit serializer check.

**6 — Availability lookup.** Daily lookup computes free times from weekly rules minus inclusive closures and pending/scheduled bookings. Monthly lookup returns fully unavailable dates using the same sources. Both query modes are public; when both valid selectors are provided, date takes precedence. Past dates/elapsed slots are not filtered out by the service.

**7, 7b — Patient booking and decisions.** Patient requests start pending and hold the slot immediately. The service rechecks availability inside a transaction, with a database unique constraint protecting date/time across pending and scheduled states. Admin approval sets scheduled; rejection sets cancelled_admin, requires a reason, and releases the slot. Dedicated decisions accept only pending records. A direct detail update can make broader status changes; do not interpret it as enforcing only those transitions. Concurrent unique-constraint errors are not explicitly translated into the service's unavailable-slot `400` response.

**8, 9 — Patient history and cancellation.** Own appointments are returned across all statuses without pagination. Patients can cancel pending or scheduled appointments only; ownership is enforced and other-user IDs produce 404.

**10 — Admin appointment management.** Paginated listing supports term-based name/phone search, inclusive date range, and comma-separated status aliases/raw values (`approved` maps to scheduled, `disapproved` to cancelled_admin). Detail supports GET, partial PUT/PATCH, and DELETE. Direct rescheduling does not call the booking service's weekly-hour/closure check. Pending-to-rejected detail updates require a reason, and pending-to-decision changes trigger notices.

**20 — Manual booking.** Both `POST /api/admin/appointments/` and `/create/` identify/create the user by phone and reuse the slot-availability service. These bookings start scheduled. Existing nonblank names are retained.

**21 — Weekly hours.** The public schedule endpoint merges adjacent Sunday–Saturday days with identical hours, including unavailable-day spans. It summarizes recurring hours and excludes date-specific closures/bookings.

**22 — Decision notices.** Approval/rejection notices share the PanelChi transport. Pattern variables include name, time, Jalali date, and rejection reason. Provider failures are logged without undoing saved decisions. Console mode logs instead of sending. Django admin bulk approval uses the approval service; there is no bulk disapproval action without a reason.

## Chat, integrations, and shared services

**12 — AI chat/triage.** Authenticated chat persists owned sessions, messages, latest triage, and staff summaries. The AI client sends generated UUIDs, current message, bounded user/assistant history, prior triage, and known first name/age/sex. It validates replies, enforces nondecreasing actionable severity, retries handled retryable failures once, and supplies a stored fallback without replacing triage on failure. Session-row locks serialize AI calls and superseded messages receive 409. TLS verification remains enabled using the bundled/configured CA.

Low/high priority record a booking offer; urgent issues a unique `URG-` code. Actions run once per session/level, with retry after action failure on a later successful turn. The offer/code does not create an appointment. The structured patient context omits phone/national ID; patient message text is still forwarded. [Full contract and configuration](../architecture/api-endpoints-chat.md).

**13 — Common app.** `common` is implemented: it owns site settings, video records, aggregate dashboard views, and shared SMS transport. The earlier empty-app description is obsolete.

**14 — OTP SMS.** PanelChi pattern sending and Iranian number formatting are implemented. Default console mode deliberately sends no real SMS. Real delivery requires the provider switch, token, and approved login pattern. Failed sends delete the new OTP and return 502. Provider acceptance/live handset delivery was not tested in this review.

**23 — Staff chat review.** Admins can retrieve paginated sessions with complete message histories and triage summaries, filter by valid level, or fetch the latest triaged session separately. All fields are null when no triaged chat exists. Patient list summaries expose the same latest triage level. Histories include backend messages; those messages are excluded from outbound AI history.

**24, 25 — Theme and videos.** Theme choices are pink/lilac/purple, with pink fallback, public read, and admin write. Video entries have title/source/type, a public unpaginated list, and admin create/delete. Video source is a string here; there is no file-upload, host-validation, or video-update endpoint.

**26 — Analytics (partial).** Aggregates visits, appointment creation growth, noncancelled bookings, attendance, approved-review ratings, and session counts. Emergency-code total is still hardcoded zero even though code issuance is implemented. Trends group by Gregorian months with Jalali labels; status breakdown includes visited/scheduled only, excluding pending. The `online_bookings` count includes manual bookings. [Exact metric semantics](../architecture/api-endpoints.md#site-settings-videos-and-analytics--appscommon).

## Reviews, articles, and Django admin

**17 — Reviews.** Public submission requires nonblank text and a rating 1–5; name/email are optional. New reviews are pending; public listing includes approved reviews only. Admins list all, approve/reject, or delete, including the `/approval/` alias. The public view disables authentication, so a supplied JWT does not attach its user in the current configuration. Public responses include email as defined by the serializer.

**18 — Articles CMS.** Current models are `Article` and `Category`: HTML content, optional cover/video/category, nullable author, draft/published status, first-publication time, derived reading time, and view counts. Public reads filter published content; admin routes support CRUD, publication toggle, inline upload, and category management. nh3 sanitizes HTML; allowed Aparat/YouTube embeds and Pillow/WebP processing are enforced. Images have 5 MiB/40 MP limits and max output width 1600. Author/category deletion retains articles via SET_NULL. [Exact article fields and routes](../architecture/api-endpoints-articles.md).

Tags, revisions, medical review workflows, slug redirects, SEO fields, and UUID article IDs from the expanded proposal are not implemented. Runtime media serving is DEBUG-only in Django; Compose persistence and Nginx proxying do not by themselves serve uploaded files with DEBUG false.

**11 — Django admin.** Users/notes, schedules/closures/appointments, reviews, articles/categories, site settings/videos, and chat sessions are registered. Chat messages/actions appear as read-only inlines. Appointments expose status filtering and bulk approve; no bulk disapprove action is present.

## 27. Public SEO and social previews — ✅ Completed (2026-10-19)

Public `/sitemap.xml`, `/robots.txt` and `/api/seo/bot-preview/` are implemented.
Sitemaps include published articles and seven canonical static pages, with no
category URLs as agreed for this backend-only scope. Preview HTML is escaped and
restricted to public pages/published articles; private/unknown/draft paths return
404. Current publication and metadata are checked before reading the versioned
15-minute HTML cache, so edits/unpublishing/deletion take effect immediately across
workers. `SITE_DOMAIN` governs public URLs, and Nginx dispatches social agents while
preserving browser/Googlebot SPA routing and direct static-asset serving.

No frontend components, model fields, migrations or existing JSON contracts are
changed. Alt text and triage-topic export remain deferred. The SEO, articles,
registration and mocked chat suites passed together (123 tests, isolated SQLite;
no live AI/SMS calls). Nginx syntax and 48 HTTP checks through real local Nginx/Django
also passed. Production cover images require public media serving.
See the [implementation contract](../architecture/backend-seo-implementation.md)
for exact routes, cache behavior, tests and deployment requirements.

## Verification and maintenance

This revision was verified by inspecting current routes, resolved view methods, serializers, models, services, migrations, settings, admin registrations, and existing test definitions. Documentation route coverage and local links were checked. No application behavior was changed and no live SMS or AI call was made.

Existing substantive test definitions cover registration demographics (`users/tests.py`), article contracts/media/security (`articles/tests.py`), and mocked chat contracts/ownership/triage/actions/admin APIs (`chat_gateway/tests.py`). Appointment/common test modules are generated stubs. These definitions are evidence of available coverage, **not a report that the suites passed during this documentation-only update**.

Keep this inventory, the API contract, and backend architecture in sync when backend behavior changes. Frontend wiring/status is owned by the frontend documents and is not inferred from backend endpoint availability. Historical article guides are explicitly labeled; use the current implementation references for integration.
