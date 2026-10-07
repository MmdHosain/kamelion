# API Endpoints Reference

> This is a complete list of every route actually wired into `config/urls.py` (directly or via an included app `urls.py`), what each one expects as input, what it returns, and what it does internally. Global defaults: unless a view explicitly overrides them, DRF's default authentication is **JWT** (`Authorization: Bearer <token>`) and the default permission is **`IsAuthenticated`**.
>
> **Updated:** this revision reflects the pending-appointment approval flow, the reworked two-step OTP/registration login flow, the admin-vs-patient branch at login, admin editing of patient info, the review/comment endpoints (previously undocumented), and the **new articles CMS** (`apps/articles`).

---

## Auth — `apps/users` (mounted at `/api/`)

### `POST /api/auth/request-otp`
**Auth:** None (explicitly open)
**Request body:**
```json
{ "phone_number": "string, max 15 chars" }
```
**Response:** `200 OK` — one of two shapes, depending on whether the phone number belongs to a staff/admin account:

Admin phone number:
```json
{ "is_admin": true, "message": "Enter your password" }
```
Anyone else:
```json
{ "is_admin": false, "message": "OTP sent" }
```
**What it does:** First checks whether the submitted phone number belongs to a user with `is_staff=True`.
- **If admin:** no OTP is generated or stored at all — the frontend is expected to route to a password screen and call `POST /api/auth/admin/login` instead.
- **If not admin:** behaves as before — generates a 6-digit numeric code, invalidates any previous unused OTP for that phone number, and stores the new one (`OTPRequest`) with a 5-minute expiry. **Delivery is still not implemented** — the code is only printed to the server console (no SMS provider is wired up), so in this environment the code has to be read from logs, not received on a phone.

### `POST /api/auth/verify-otp`
**Auth:** None (explicitly open)
**Request body:**
```json
{ "phone_number": "string, max 15 chars", "code": "string, max 6 chars" }
```
**Response:** `200 OK` — one of two shapes:

Phone number already has an account (returning user) — logged straight in:
```json
{
  "access": "<JWT access token>",
  "refresh": "<JWT refresh token>",
  "user": {
    "id": 1,
    "phone_number": "string",
    "full_name": "string",
    "national_id": "string or null",
    "role": "patient"
  }
}
```
First time seeing this phone number — no tokens issued yet:
```json
{ "registration_required": true, "signup_token": "<opaque string>" }
```
**Error response:** `400 Bad Request` — `{ "error": "<reason>" }` if the code is wrong, expired, or already used.

**What it does:** This is now a self-contained "confirm the code" step, decoupled from account creation. It validates the code against the latest unused, non-expired `OTPRequest` for that phone number and **marks it used immediately** — phone ownership is considered proven at that point regardless of what happens next. It then checks whether a `User` already exists for that phone number:
- **Exists:** logs them in and issues a JWT pair (same as before).
- **Doesn't exist:** does **not** create a user and does **not** issue tokens. Instead it creates a short-lived (`PhoneVerification`) record and returns its `signup_token`, which the client must pass to `POST /api/auth/complete-registration` along with `full_name` and `national_id` to finish creating the account.

⚠️ **Breaking change from the previous version:** this endpoint used to get-or-create the user directly and always return a JWT pair. It no longer implicitly registers new patients — see `complete-registration` below.

### `POST /api/auth/complete-registration` — *new*
**Auth:** None (explicitly open)
**Request body:**
```json
{ "signup_token": "string, from verify-otp", "full_name": "string, max 100 chars", "national_id": "string, max 20 chars" }
```
**Response:** `200 OK` — same login shape as a successful `verify-otp` for a returning user:
```json
{
  "access": "<JWT access token>",
  "refresh": "<JWT refresh token>",
  "user": {
    "id": 1,
    "phone_number": "string",
    "full_name": "string",
    "national_id": "string",
    "role": "patient"
  }
}
```
**Error response:** `400 Bad Request` — `{ "error": "<reason>" }` — invalid/expired/already-used `signup_token`, or missing `full_name`/`national_id`.
**What it does:** Second step of first-time login only. Looks up the `PhoneVerification` record by `signup_token` (must be unused and not expired — 10-minute window), and if valid, creates the `User` with the given `full_name` and `national_id`, marks the token used, and issues a JWT pair. The OTP code itself is not needed here — the token is the proof of phone ownership carried over from `verify-otp`.

### `POST /api/auth/admin/login`
**Auth:** None (explicitly open)
**Request body:**
```json
{ "phone_number": "string, max 15 chars", "password": "string" }
```
**Response:** `200 OK`
```json
{
  "accessToken": "<JWT access token>",
  "refreshToken": "<JWT refresh token>",
  "user": {
    "id": 1,
    "phone_number": "string",
    "full_name": "string",
    "role": "admin"
  }
}
```
**Error responses:**
- `401 Unauthorized` — `{ "detail": "Invalid credentials" }` if phone/password don't match.
- `403 Forbidden` — `{ "detail": "User is not admin" }` if the user authenticates but `is_staff` is `False`.
- `403 Forbidden` — `{ "detail": "User is inactive" }` if `is_active` is `False`.

**What it does:** Unchanged. A traditional password login path, distinct from the OTP flow, intended for staff/admin users. Uses Django's standard `authenticate()` against `phone_number` as the username field. On success it issues a JWT pair, same token mechanism as the patient login flow.

Note: a previously-latent bug in `UserManager.create_user()` was fixed — it accepted a `password` argument but always discarded it, silently creating an unusable-password account. It now actually sets the password when one is passed in (patients created without a password are unaffected — they still get an unusable password as before).

---

## Patient-Facing Appointments — `apps/appointments` (mounted at `/api/appointments/`)

### `GET /api/appointments/slots/`
**Auth:** None (explicitly open — `authentication_classes = []`, `permission_classes = []`)
**Query params:**
| Param | Type | Required |
|---|---|---|
| `date` | ISO date (`YYYY-MM-DD`) | Yes |

**Response:** `200 OK`
```json
{ "date": "2026-08-20", "available_slots": ["09:00:00", "09:30:00", "..."] }
```
**What it does:** Computes free appointment slots for the given date, on the fly:
1. Checks whether the date falls inside any `AvailabilityException` (clinic closed) — if so, returns an empty list.
2. Finds the `DoctorAvailability` rule whose `days_of_week` includes that date's weekday and which is `is_active=True`, then generates candidate slots by walking from `start_time` to `end_time` in steps of `visit_duration + time_gap`.
3. Subtracts any times already taken by an appointment on that date whose status is **`scheduled` OR `pending`** — a slot is considered unavailable as soon as it's requested, not only once an admin approves it. *(Previously this only excluded `scheduled` appointments.)*

No slots table is persisted — everything here is computed per request from the availability rules and existing bookings.

### `POST /api/appointments/book/`
**Auth:** JWT required (`IsAuthenticated`)
**Request body:**
```json
{ "date": "2026-08-20", "time": "09:00:00", "reason": "optional, blank allowed" }
```
**Response:** `201 Created` — the created `Appointment`:
```json
{
  "id": 12,
  "full_name": "string",
  "phone_number": "string",
  "appointment_date": "2026-08-20",
  "appointment_time": "09:00:00",
  "status": "pending",
  "reason": "string",
  "created_at": "...",
  "updated_at": "..."
}
```
**Error response:** `400 Bad Request` — `{ "detail": "Selected time slot is not available." }`
**What it does:** Re-derives available slots for the requested date (same logic as `GET /slots/`) inside a database transaction, and if the requested time is among them, creates the `Appointment` for `request.user`.

⚠️ **Changed:** a patient-created booking now starts with `status: "pending"` instead of `"scheduled"`. It still occupies the slot immediately (see the slots-lookup note above), but requires an admin to approve it (`POST /api/admin/appointments/<id>/approve/`) before it becomes `scheduled`. Still wrapped in `@transaction.atomic`, and still protected at the database layer by a `UniqueConstraint` on `(appointment_date, appointment_time)` — now for status **`scheduled` or `pending`** — so a race between two simultaneous bookings for the same slot cannot both succeed.

### `GET /api/appointments/my/`
**Auth:** JWT required (`IsAuthenticated`)
**Request body:** None
**Response:** `200 OK` — array of the current user's appointments (same shape as above, `status` may now be `pending`, `scheduled`, `cancelled_user`, `cancelled_admin`, or `visited`), ordered by `-appointment_date`. **Not paginated.**
**What it does:** Returns every appointment (any status) belonging to `request.user`.

### `POST /api/appointments/<int:pk>/cancel/`
**Auth:** JWT required (`IsAuthenticated`)
**URL param:** `pk` — the appointment's ID
**Request body:** None
**Response:** `200 OK` — `{ "status": "cancelled" }`
**Error responses:**
- `404 Not Found` — `{ "detail": "Appointment not found" }` if no appointment with that ID belongs to the requesting user (this also hides appointments belonging to other users — they get a 404, not a 403).
- `400 Bad Request` — `{ "detail": "<reason>" }` if the appointment isn't currently cancellable.

**What it does:** Looks up the appointment scoped to `request.user`, then flips its status to `cancelled_user`. ⚠️ **Changed:** this is now allowed while the appointment is either `scheduled` **or `pending`** — previously only `scheduled` appointments could be cancelled, so a patient can now back out of a booking that's still awaiting admin approval.

---

## Reviews / Comments — `apps/comments` (mounted at `/api/reviews/`) — *previously undocumented*

### `GET /api/reviews/`
**Auth:** None (explicitly open)
**Response:** `200 OK` — plain array (not DRF-paginated) of only **approved** reviews:
```json
[{ "id": 1, "name": "string", "email": "string", "text": "string", "rating": 5, "created_at": "...", "approved": true }]
```
**What it does:** Returns `Review` rows whose `status` is `approved`. `approved` in the response is a derived boolean (`True` only when `status == "approved"`), not a stored field.

### `POST /api/reviews/`
**Auth:** None (explicitly open — logged-in users may also post; `user` is attached automatically if authenticated, but it's not required)
**Request body:**
```json
{ "name": "optional, may be blank", "email": "optional, may be blank", "text": "string, required, non-empty", "rating": "integer 1-5, required" }
```
**Response:** `201 Created` — the created review, same shape as above (`approved: false`, since new reviews start `pending`).
**Error response:** `400 Bad Request` — field validation errors (missing/blank `text`, `rating` outside 1–5).
**What it does:** Creates a new `Review` with `status="pending"`. It will not appear in the public `GET /api/reviews/` list until an admin approves it via `PATCH /api/admin/reviews/<id>/`.

⚠️ **Changed:** `name` is now optional — previously required and rejected if blank. A submission with no `name` at all, or an empty string, is now accepted.

---

## Admin — `apps/appointments` (mounted at `/api/admin/`)

All endpoints in this section require `IsAdminUser` (i.e., `request.user.is_staff` must be `True` — get a token via `POST /api/auth/admin/login`).

### Doctor availability — `AdminSlotViewSet` (full CRUD via `DefaultRouter`, base path `/api/admin/slots/`)

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/admin/slots/` | List all `DoctorAvailability` schedules |
| POST | `/api/admin/slots/` | Create a new schedule |
| GET | `/api/admin/slots/<id>/` | Retrieve one schedule |
| PUT / PATCH | `/api/admin/slots/<id>/` | Update a schedule |
| DELETE | `/api/admin/slots/<id>/` | Delete a schedule |

**Request/response body (`DoctorAvailabilitySerializer`):**
```json
{
  "id": 1,
  "name": "Morning clinic",
  "days_of_week": ["MON", "WED", "FRI"],
  "start_time": "09:00:00",
  "end_time": "13:00:00",
  "visit_duration": 30,
  "time_gap": 5,
  "is_active": true,
  "created_at": "...",
  "updated_at": "..."
}
```
**Validation applied (in the serializer):** `days_of_week` must be a non-empty list of valid day codes with no duplicates; `end_time` must be after `start_time`; `visit_duration` must be > 0; `time_gap` must be ≥ 0; and no day in `days_of_week` may already be claimed by another schedule (checked against all other `DoctorAvailability` rows).

### Availability exceptions (closed dates) — `AdminExceptionViewSet` (full CRUD via `DefaultRouter`, base path `/api/admin/exceptions/`)

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/admin/exceptions/` | List all closed-date ranges |
| POST | `/api/admin/exceptions/` | Create a new closed-date range |
| GET | `/api/admin/exceptions/<id>/` | Retrieve one |
| PUT / PATCH | `/api/admin/exceptions/<id>/` | Update one |
| DELETE | `/api/admin/exceptions/<id>/` | Delete one |

**Request/response body (`AvailabilityExceptionSerializer`, all model fields):**
```json
{ "id": 1, "start_date": "2026-12-24", "end_date": "2026-12-26", "reason": "Holiday" }
```
**Validation:** enforced at the database level via a `CheckConstraint` requiring `end_date >= start_date`.

### `PUT /api/admin/slots/bulk/`
**Request body:**
```json
{
  "schedules": [
    { "id": 1, "name": "Morning", "days_of_week": ["MON","TUE"], "start_time": "09:00:00", "end_time": "12:00:00", "visit_duration": 20, "time_gap": 0, "is_active": true },
    { "name": "New schedule (no id = create)", "days_of_week": ["FRI"], "start_time": "10:00:00", "end_time": "14:00:00", "visit_duration": 30 }
  ]
}
```
**Response:** `200 OK` — the full resulting list of `DoctorAvailability` objects, serialized.
**What it does:** A **replace-all** operation for the doctor's entire weekly schedule, run in one atomic transaction:
- Any item **with an `id`** matching an existing row updates that row in place.
- Any item **without a matching/valid `id`** creates a new row.
- Any existing row **not referenced** by an `id` in the submitted list is **deleted**.

Validation (via `DoctorAvailabilityBulkSerializer`) checks each schedule in the payload for valid/non-duplicate days, valid time ranges, and positive `visit_duration`, and also rejects the whole batch if two schedules *within the same request* claim overlapping days.
⚠️ Because unreferenced rows are deleted, submitting a partial list will silently remove schedules that aren't included.

### `PUT /api/admin/exceptions/bulk/`
**Request body:**
```json
{
  "exceptions": [
    { "id": 1, "start_date": "2026-12-24", "end_date": "2026-12-26", "reason": "Holiday" },
    { "start_date": "2027-01-01", "end_date": "2027-01-01", "reason": "New Year" }
  ]
}
```
**Response:** `200 OK` — the full resulting list of `AvailabilityException` objects.
**What it does:** Same replace-all pattern as the slots bulk endpoint — update items with a matching `id`, create items without one, delete existing rows not present in the payload — validated via `AvailabilityExceptionBulkSerializer` (requires `start_date`/`end_date` on every item, and `end_date >= start_date`).

### `GET /api/admin/appointments/`
**Query params:**
| Param | Type | Required | Purpose |
|---|---|---|---|
| `search` | string | No | Free-text filter across patient name/phone |
| `status` | string | No | *(new)* Filter by exact status — e.g. `?status=pending` to list only reservations awaiting approval |
| `page`, `page_size` | int | No | Pagination (`page_size` max 100, default 10) |

**Response:** `200 OK` — a paginated DRF response (`count`, `next`, `previous`, `results`), each result in the `AppointmentSerializer` shape shown earlier (including `full_name`/`phone_number` of the booking patient, and `status` which may now be `pending`).
**What it does:** Lists **every** appointment in the system (not scoped to one user), ordered newest-first by default. If `search` is supplied, it's split into whitespace-separated terms and each term must match (case-insensitively, `icontains`) the patient's `full_name` or `phone_number`; results are then re-ranked so exact matches and fuller matches surface first (via an annotated `rank`, ordered `-rank, -id`). If `status` is supplied, results are additionally filtered to that exact status value. Uses `select_related("user")` to avoid N+1 queries when serializing `full_name`/`phone_number`.

### `PUT` / `PATCH /api/admin/appointments/<id>/`
Unchanged — partial update of any appointment field, including `status` directly (e.g. `{"status": "scheduled"}` works too, as an alternative to the dedicated approve/disapprove endpoints below).

### `POST /api/admin/appointments/<id>/approve/` — *new*
**Response:** `200 OK` — the updated `Appointment` (now `status: "scheduled"`).
**Error response:** `400 Bad Request` — `{ "detail": "Only pending appointments can be approved." }` if the appointment isn't currently `pending`.
**What it does:** Moves a `pending` appointment to `scheduled`, confirming it.

### `POST /api/admin/appointments/<id>/disapprove/` — *new*
**Response:** `200 OK` — the updated `Appointment` (now `status: "cancelled_admin"`).
**Error response:** `400 Bad Request` — `{ "detail": "Only pending appointments can be disapproved." }` if the appointment isn't currently `pending`.
**What it does:** Moves a `pending` appointment to `cancelled_admin`, freeing its slot back up for other bookings.

### `POST /api/admin/appointments/create/`
Unchanged in request/response shape. Booking made this way (an admin entering a walk-in/phone booking on a patient's behalf) is created directly as `status: "scheduled"` — it does **not** go through the pending/approval step, since the admin creating it is already the approver.

---

## Admin — `apps/users` (mounted at `/api/admin/`)

All endpoints in this section require `IsAdminUser`.

### `GET /api/admin/patients/`
Unchanged. `?search=` filters by name/phone.

### `GET /api/admin/patients/<id>/`
**Response:** `200 OK`
```json
{
  "id": 2,
  "full_name": "string",
  "phone_number": "string",
  "national_id": "string or null",
  "date_of_birth": "date or null",
  "address": "string or null",
  "appointments": [ { "id": 1, "date": "...", "time": "...", "status": "...", "reason": "..." } ],
  "notes": [ { "id": 1, "text": "...", "author_name": "string or null", "created_at": "..." } ]
}
```
⚠️ Note: `national_id` now comes from the `User` model directly, not `PatientProfile` (see Feature Status doc) — the response shape is unchanged, only where the value is sourced from internally.

### `PUT` / `PATCH /api/admin/patients/<id>/` — *new*
**Request body:** either or both fields, all optional:
```json
{ "full_name": "string", "national_id": "string" }
```
**Response:** `200 OK` — same full dossier shape as `GET /api/admin/patients/<id>/`, reflecting the update.
**Error response:** `404 Not Found` — `{ "detail": "Patient not found" }`.
**What it does:** Lets an admin edit a patient's `full_name` and/or `national_id` directly. Either field can be sent alone; whichever is present gets updated. Sending an empty string for `national_id` clears it to `null` rather than being rejected (it's optional and intentionally non-unique).

### `POST /api/admin/patients/<id>/notes/`
Unchanged.

---

## Articles — `apps/articles` (public at `/api/articles/`, admin at `/api/admin/articles/`) — *new*

A medical-articles CMS. Articles are authored in HTML, which is sanitized server-side
(`nh3`) before storage; cover and inline images are validated and re-encoded to WebP
(`Pillow`). Public endpoints are explicitly open (`AllowAny`, `authentication_classes = []`),
so a missing or expired token never turns a public page into a `401`.

**Model notes**
- `Article.status` is `draft` (default) or `published`.
- `published_at` is set automatically the **first time** an article becomes `published`,
  and never overwritten afterwards. Public ordering is `-published_at, -created_at`.
- `reading_time_minutes` is **derived from `content`** (200 words/min, minimum 1); any value
  sent in the request body is ignored.
- `author` uses `SET_NULL` and `author` is nullable — deleting a user account does not delete
  their articles; the article then serializes with `author: null` / `author_name: ""`.
- `cover_image` is a multipart file upload; requests that send a file must use
  `multipart/form-data`.
- `video_embed_url` accepts a plain URL **or** a pasted `<iframe>` snippet (only the `src` is
  stored); only Aparat and YouTube hosts are allowed.

### `GET /api/articles/`
**Auth:** None (explicitly open)
**Query params (all optional):** `?category=<slug>`, `?search=` (matches `title` + `excerpt`), `?page=`, `?page_size=` (max 50)
**Response:** `200 OK` — DRF-paginated (`count`, `next`, `previous`, `results`):
```json
{ "results": [{ "id": 1, "title": "...", "slug": "...", "excerpt": "...", "cover_image": null, "category": {"id": 1, "name": "...", "slug": "..."}, "author_name": "...", "reading_time_minutes": 5, "created_at": "...", "published_at": "..." }] }
```
**What it does:** Returns only `published` articles, newest-published first.

### `GET /api/articles/<slug>/`
**Auth:** None (explicitly open)
**Response:** `200 OK` — the list shape plus `content`, `video_embed_url`, `author` (`{id, full_name}` or `null`), `views_count`, and `updated_at`.
**What it does:** Returns a single published article and increments `views_count` by 1 (each successful GET counts, including refreshes/bots — accepted at current scale). Draft slugs return `404`. `slug` is matched as a plain string (`<str:slug>`), so Persian/Unicode slugs work.

### `GET /api/articles/categories/`
**Auth:** None (explicitly open)
**Response:** `200 OK` — plain array (not paginated) of `{id, name, slug, description}`.

### `POST /api/admin/articles/` · `GET /api/admin/articles/`
**Auth:** JWT (`IsAdminUser`)
**List params (optional):** `?status=draft|published`, `?search=`, `?page=`, `?page_size=`
**Create body:** JSON or `multipart/form-data` — `title`, `content` (HTML; sanitized), `slug?` (auto-generated unique if omitted; reserved values `categories`/`upload-image` rejected), `excerpt?`, `cover_image?` (file), `video_embed_url?`, `category?` (id), `status?` (`draft`/`published`).
**Response:** `201 Created` — the written article. The author is always the **current user**.
**Error response:** `400 Bad Request` — disallowed video host, reserved/duplicate slug, invalid image (wrong extension, fake content, >5 MB, or oversized dimensions).

### `GET` / `PUT` / `PATCH` / `DELETE /api/admin/articles/<id>/`
**Auth:** JWT (`IsAdminUser`) — retrieve / update / delete by integer id. Same body rules as create.

### `PATCH /api/admin/articles/<id>/toggle-status/`
**Auth:** JWT (`IsAdminUser`)
**Response:** `200 OK` — `{"id": ..., "status": "draft"|"published", "published_at": ...}`. Flips between draft and published; the first flip to published stamps `published_at`.
**Error response:** `404 Not Found` if the id does not exist.

### `POST /api/admin/articles/upload-image/`
**Auth:** JWT (`IsAdminUser`)
**Body:** `multipart/form-data` — the file may be sent as either `image` or `file`.
**Response:** `201 Created` — `{"url": "<absolute url>", "message": "..."}`. The stored file is always WebP with a random name.
**Error response:** `400 Bad Request` — no file sent, or the upload fails image validation.

### Categories (admin)
| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/api/admin/articles/categories/` | JWT (admin) | List categories (unpaginated) |
| POST | `/api/admin/articles/categories/` | JWT (admin) | Create a category (`name`, `slug`, `description?`) |
| DELETE | `/api/admin/articles/categories/<id>/` | JWT (admin) | Delete a category (returns `204`; its articles become category-less) |

**Storage:** uploaded files live under `MEDIA_ROOT` and are served as static files at `MEDIA_URL` (`/media/`, DEBUG only via `config/urls.py`). In production `media/` must be a persistent volume or external storage served by the web server.

---

## Not implemented

These exist as installed Django apps but currently expose no models, views, or URLs, and are not included in `config/urls.py`:
- **`apps.chat_gateway`** — intended, per `settings.py`'s `FASTAPI_BASE_URL`/`FASTAPI_TIMEOUT` config and the `httpx` dependency, to proxy to a separate FastAPI service. No such call exists in code yet.
- **`apps.common`** — empty placeholder app, no functionality.

---

## Quick reference table

| Method | Path | Auth | Body / Params | Purpose |
|---|---|---|---|---|
| POST | `/api/auth/request-otp` | None | `phone_number` | Request a login OTP — or, for admin numbers, a signal to show the password screen instead |
| POST | `/api/auth/verify-otp` | None | `phone_number`, `code` | Verify OTP → JWT pair (returning patient) **or** `signup_token` (first-time) |
| POST | `/api/auth/complete-registration` | None | `signup_token`, `full_name`, `national_id` | Finish first-time signup → JWT pair |
| POST | `/api/auth/admin/login` | None | `phone_number`, `password` | Password login → JWT pair (admin) |
| GET | `/api/appointments/slots/` | None | `?date=` | List free slots for a date (excludes `pending` + `scheduled`) |
| POST | `/api/appointments/book/` | JWT | `date`, `time`, `reason?` | Book an appointment (starts as `pending`) |
| GET | `/api/appointments/my/` | JWT | — | List own appointments |
| POST | `/api/appointments/<id>/cancel/` | JWT | — | Cancel own appointment (while `pending` or `scheduled`) |
| GET | `/api/reviews/` | None | — | List approved reviews |
| POST | `/api/reviews/` | None | `name?`, `email?`, `text`, `rating` | Submit a review (starts `pending`) |
| GET/POST | `/api/admin/slots/` | JWT (admin) | `DoctorAvailability` fields | List / create weekly schedules |
| GET/PUT/PATCH/DELETE | `/api/admin/slots/<id>/` | JWT (admin) | `DoctorAvailability` fields | Retrieve / update / delete a schedule |
| PUT | `/api/admin/slots/bulk/` | JWT (admin) | `{ schedules: [...] }` | Replace-all weekly schedules |
| GET/POST | `/api/admin/exceptions/` | JWT (admin) | `AvailabilityException` fields | List / create closed-date ranges |
| GET/PUT/PATCH/DELETE | `/api/admin/exceptions/<id>/` | JWT (admin) | `AvailabilityException` fields | Retrieve / update / delete an exception |
| PUT | `/api/admin/exceptions/bulk/` | JWT (admin) | `{ exceptions: [...] }` | Replace-all closed dates |
| GET | `/api/admin/appointments/` | JWT (admin) | `?search=`, `?status=`, `?page=`, `?page_size=` | Paginated, searchable, status-filterable list of all appointments |
| PUT/PATCH | `/api/admin/appointments/<id>/` | JWT (admin) | any `Appointment` field | Update an appointment (e.g. status directly) |
| POST | `/api/admin/appointments/<id>/approve/` | JWT (admin) | — | Approve a pending appointment → `scheduled` |
| POST | `/api/admin/appointments/<id>/disapprove/` | JWT (admin) | — | Disapprove a pending appointment → `cancelled_admin` |
| POST | `/api/admin/appointments/create/` | JWT (admin) | `full_name`, `phone_number`, `date`, `time`, `reason?` | Walk-in booking, created directly as `scheduled` |
| GET | `/api/admin/patients/` | JWT (admin) | `?search=` | List patients |
| GET | `/api/admin/patients/<id>/` | JWT (admin) | — | Full patient dossier |
| PUT/PATCH | `/api/admin/patients/<id>/` | JWT (admin) | `full_name?`, `national_id?` | Edit a patient's name/national ID |
| POST | `/api/admin/patients/<id>/notes/` | JWT (admin) | `text` | Add a clinical note |
| GET | `/api/admin/reviews/` | JWT (admin) | — | List all reviews, including pending |
| PATCH | `/api/admin/reviews/<id>/` | JWT (admin) | `{"approved": true/false}` | Approve or reject a review |
| DELETE | `/api/admin/reviews/<id>/` | JWT (admin) | — | Delete a review |
| GET | `/api/articles/` | None | `?category=`, `?search=`, `?page=`, `?page_size=` | List published articles |
| GET | `/api/articles/<slug>/` | None | — | Article detail (+1 view); Unicode slugs supported |
| GET | `/api/articles/categories/` | None | — | List article categories (unpaginated) |
| GET/POST | `/api/admin/articles/` | JWT (admin) | `?status=`, `?search=` / article fields | List / create articles |
| GET/PUT/PATCH/DELETE | `/api/admin/articles/<id>/` | JWT (admin) | article fields | Retrieve / update / delete an article |
| PATCH | `/api/admin/articles/<id>/toggle-status/` | JWT (admin) | — | Toggle draft ↔ published |
| POST | `/api/admin/articles/upload-image/` | JWT (admin) | multipart `image` or `file` | Validate + optimize upload → WebP URL |
| GET/POST | `/api/admin/articles/categories/` | JWT (admin) | `name`, `slug`, `description?` | List / create categories |
| DELETE | `/api/admin/articles/categories/<id>/` | JWT (admin) | — | Delete a category (`204`) |