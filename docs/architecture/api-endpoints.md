# API Endpoints Reference

> This is a complete list of every route actually wired into `config/urls.py` (directly or via an included app `urls.py`), what each one expects as input, what it returns, and what it does internally. Global defaults: unless a view explicitly overrides them, DRF's default authentication is **JWT** (`Authorization: Bearer <token>`) and the default permission is **`IsAuthenticated`**.
>
> **Updated:** this revision reflects the pending-appointment approval flow, the reworked two-step OTP/registration login flow with Date of Birth (`date_of_birth`), the admin-vs-patient branch at login, admin editing of patient info, the review/comment endpoints (previously undocumented), the **new articles CMS** (`apps/articles`), and the **disapproval reason** added to the reservation-disapprove flow (`disapproval_reason` field, required `reason` on `/disapprove/`, sent to the patient in the rejection SMS).

Related documents: [backend architecture](backend.md), [backend feature status](../features/feature-status-back-end.md), [articles API](api-endpoints-articles.md), [chat and triage API](api-endpoints-chat.md).

## Shared conventions

- Paths below include `/api/`. Preserve trailing slashes exactly: auth, chat, theme, and stats routes have no trailing slash.
- **Public** means authentication and permissions are explicitly open; supplied JWTs are ignored. **JWT** means `IsAuthenticated`. **Admin** means JWT plus `IsAdminUser` (`is_staff=True`). Views described as patient-facing use `IsAuthenticated`, which does not exclude staff.
- Protected routes use `Authorization: Bearer <access token>`. Access lifetime is 7 days; refresh lifetime is 30 days. Refresh tokens are not rotated. Patient login returns `access`/`refresh`; admin login and refresh return `accessToken`/`refreshToken`.
- Bodies are JSON unless an upload specifies multipart. Dates are Gregorian `YYYY-MM-DD`; times are normally `HH:MM:SS`. SMS dates are separately formatted in Jalali.
- Serializer failures normally return `400` with field errors (or `non_field_errors`). Handled business failures use `detail` or `error` as specified below. Protected routes reject absent/invalid/expired access tokens with `401`, and authenticated non-staff callers of admin routes with `403`.
- Paginated lists return `{count, next, previous, results}`. Appointments and admin chat lists default to 10 items, maximum `page_size=100`; articles default to 10, maximum 50. Other lists below are unpaginated.
- DRF also supplies `OPTIONS` and `HEAD` where supported. The scheduling `DefaultRouter` supplies format-suffix variants and `GET /api/admin/` (API discovery for slots/exceptions). That discovery view uses DRF's default `IsAuthenticated`, rather than `IsAdminUser`; the linked resources require staff access. `/admin/` is Django's session-authenticated admin UI.

## Auth — `apps.users`

Source: `apps/users/{urls,views,serializers,services}.py`.

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
    "date_of_birth": "date or null",
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
- **Doesn't exist:** does **not** create a user and does **not** issue tokens. Instead it creates a short-lived (`PhoneVerification`) record and returns its `signup_token`, which the client must pass to `POST /api/auth/complete-registration` along with `full_name`, `national_id`, and `date_of_birth` to finish creating the account.

`request-otp` checks `is_staff` first. Staff numbers receive `{"is_admin":true,"message":"Enter your password"}` without generating an OTP. Other numbers receive `{"is_admin":false,"message":"OTP sent"}` after a 6-digit OTP is stored, expiring in 5 minutes; previous unused OTPs are invalidated.

### `POST /api/auth/complete-registration` — *new*
**Auth:** None (explicitly open)
**Request body:**
```json
{
  "signup_token": "string, from verify-otp",
  "full_name": "string, max 100 chars",
  "national_id": "string, max 20 chars",
  "date_of_birth": "ISO date string (YYYY-MM-DD)"
}
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
    "date_of_birth": "date or null",
    "role": "patient"
  }
}
```
**Error response:** `400 Bad Request` — `{ "error": "<reason>" }` — invalid/expired/already-used `signup_token`, or missing `full_name`/`national_id`/`date_of_birth`.
**What it does:** Second step of first-time login only. Looks up the `PhoneVerification` record by `signup_token` (must be unused and not expired — 10-minute window), and if valid, creates the `User` with the given `full_name`, `national_id`, and `date_of_birth` (stored on patient profile, formatted as `YYYY-MM-DD`), marks the token used, and issues a JWT pair. The OTP code itself is not needed here — the token is the proof of phone ownership carried over from `verify-otp`.

```json
{
  "access": "<access token>",
  "refresh": "<refresh token>",
  "user": {
    "id": 1, "phone_number": "09120000000", "full_name": "Example Patient",
    "national_id": "1234567890", "sex": null, "date_of_birth": null, "role": "patient"
  }
}
```

The role is derived from `is_staff`. A phone number without an account receives `{"registration_required":true,"signup_token":"<opaque token>"}`; no account or JWT is created yet.

`complete-registration` requires that unused signup token (max 64, expires after 10 minutes), `full_name` (nonblank, max 100), and `national_id` (nonblank, max 20). National IDs are intentionally non-unique. Optional `sex` accepts `female`, `male`, null, or blank (blank is stored as null). Optional `date_of_birth` accepts a date or null; future dates are rejected, as are dates before `date(today.year - 120, today.month, min(today.day, 28))`. Success consumes the signup token and returns the login object above. Invalid/used/expired tokens produce `400 {"error":"..."}`; serializer errors use field keys.

### Admin login and session lifecycle

Admin login returns `{accessToken, refreshToken, user: {id, phone_number, full_name, role: "admin"}}`. Credential failure is `401 {"detail":"Invalid credentials"}`. A successfully authenticated non-staff user receives `403 {"detail":"User is not admin"}`. The view also checks inactivity (`403`, `User is inactive`), although Django's default authentication backend normally rejects inactive accounts before that branch.

`me` returns `{id, phone_number, full_name, national_id, sex, date_of_birth, is_staff, is_superuser, role}`; nullable model fields may be null. It is read-only.

`refresh` accepts the camelCase input key only; invalid/expired/blacklisted tokens return `401 {"detail":"..."}`. Success issues a new access token and echoes the same refresh token.

`logout` blacklists a supplied refresh token. Missing or already invalid refresh tokens still succeed. It does not revoke an already issued access token; that token remains usable until expiry.

## Patient-facing appointments — `apps.appointments`

Source: `apps/appointments/{urls,views,serializers,services}.py`.

| Method | Path | Access | Input | Success |
|---|---|---|---|---|
| GET | `/api/appointments/slots/` | Public | `?date=YYYY-MM-DD` or `?month=YYYY-MM` | `200` daily slots or unavailable dates |
| GET | `/api/appointments/schedule/` | Public | None | `200` `{spans: [...]}` |
| POST | `/api/appointments/book/` | JWT | Required `date`, `time`; optional blank `reason` | `201` appointment, `status=pending` |
| GET | `/api/appointments/my/` | JWT | None | `200` array of own appointments |
| POST | `/api/appointments/<id>/cancel/` | JWT | None | `200` `{"status":"cancelled"}` |

### Availability responses

Daily lookup returns `{"date":"2026-10-20","available_slots":["09:00:00","09:30:00"]}`. Monthly lookup returns `{"month":"2026-10","unavailable_dates":["2026-10-02"]}`: closed days, weekdays without active hours, or dates with no free generated slots. At least one selector is required; when both valid selectors are present, `date` wins. Both supplied selectors are still validated.

Slots are generated from the first active weekly rule matching the weekday. Each visit must fit before `end_time`; successive starts are separated by `visit_duration + time_gap` minutes. Inclusive closure ranges override weekly hours. Both `pending` and `scheduled` appointments occupy slots. The service does not filter out past dates or elapsed times.

Weekly schedule returns consecutive spans in Sunday-to-Saturday order, merging adjacent days with identical hours (including closed days):

```json
{"spans":[
  {"days":["SUN","MON","TUE","WED"],"start_day":"SUN","end_day":"WED","available":true,"start_time":"09:00:00","end_time":"17:00:00"},
  {"days":["THU","FRI","SAT"],"start_day":"THU","end_day":"SAT","available":false,"start_time":null,"end_time":null}
]}
```

This is the recurring weekly pattern only; date exceptions and booked slots do not affect it.

### Appointment response and lifecycle

```json
{
  "id": 12, "full_name": "Example Patient", "phone_number": "09120000000",
  "appointment_date": "2026-10-20", "appointment_time": "09:00:00",
  "status": "pending", "reason": "", "disapproval_reason": "",
  "created_at": "2026-10-17T10:00:00Z", "updated_at": "2026-10-17T10:00:00Z"
}
```

`full_name` falls back to the phone number if missing. Statuses are `pending`, `scheduled`, `cancelled_user`, `cancelled_admin`, and `visited`.

Booking rechecks availability within an atomic transaction. An unavailable slot returns `400 {"detail":"Selected time slot is not available."}`. A conditional database unique constraint additionally prevents two pending/scheduled rows at the same date/time; concurrent constraint violations are not explicitly translated into this `400` response.

`my` returns all statuses, ordered by descending appointment date, without pagination. Cancellation is scoped to the requesting user: absent/other-user IDs return `404 {"detail":"Appointment not found"}`. Only pending/scheduled bookings can be cancelled, otherwise `400 {"detail":"Appointment cannot be cancelled."}`. Success changes the stored status to `cancelled_user`.

## Admin scheduling and appointments — `apps.appointments`

All routes in this section require **Admin** access. Source: `apps/appointments/{admin_urls,views_admin,serializers}.py`.

| Method | Path | Input / purpose | Success |
|---|---|---|---|
| GET / POST | `/api/admin/slots/` | List / create weekly schedules | `200` array / `201` schedule |
| GET / PUT / PATCH / DELETE | `/api/admin/slots/<id>/` | Retrieve / replace / partially update / delete schedule | `200` object / `204` on delete |
| PUT | `/api/admin/slots/bulk/` | `{schedules: [...]}` replaces the complete schedule set | `200` array |
| GET / POST | `/api/admin/exceptions/` | List / create closure ranges | `200` array / `201` exception |
| GET / PUT / PATCH / DELETE | `/api/admin/exceptions/<id>/` | Retrieve / replace / partially update / delete closure | `200` object / `204` on delete |
| PUT | `/api/admin/exceptions/bulk/` | `{exceptions: [...]}` replaces the complete closure set | `200` array |
| GET | `/api/admin/appointments/` | Filtered, searched, paginated appointment list | `200` page |
| POST | `/api/admin/appointments/` | Manual booking body below | `201` scheduled appointment |
| POST | `/api/admin/appointments/create/` | Alias for manual booking | `201` scheduled appointment |
| GET / PUT / PATCH / DELETE | `/api/admin/appointments/<id>/` | Retrieve / partially update / delete appointment | `200` appointment / `204` on delete |
| POST | `/api/admin/appointments/<id>/approve/` | Approve pending appointment; no body required | `200` appointment |
| POST | `/api/admin/appointments/<id>/disapprove/` | Required `{reason: "..."}` | `200` appointment |

### Weekly schedules and closures

A schedule has `{id, name, days_of_week, start_time, end_time, visit_duration, time_gap, is_active, created_at, updated_at}`. IDs/timestamps are read-only. `name` allows blank (max 255); valid days are `SUN` through `SAT`. `days_of_week` must be nonempty, valid, duplicate-free, and cannot overlap another schedule's days, even if that schedule is inactive. End must follow start, duration must be positive (model default 30), and gap nonnegative (default 0); `is_active` defaults true.

An exception has `{id, start_date, end_date, reason}`; dates are required and reason may be blank (max 255). A database check requires `end_date >= start_date`. The bulk serializer also validates date ordering explicitly; the individual model serializer has no equivalent explicit date-order validator.

Bulk bodies contain **the entire desired set**, for example:

```json
{"schedules":[{"id":1,"name":"Morning","days_of_week":["MON"],"start_time":"09:00:00","end_time":"12:00:00","visit_duration":30,"time_gap":0,"is_active":true}]}
```

```json
{"exceptions":[{"start_date":"2026-12-24","end_date":"2026-12-26","reason":"Holiday"}]}
```

Matching IDs update rows; omitted/unknown IDs create rows; unreferenced existing rows are deleted. An empty list deletes all rows of that type. Each replace operation is atomic. Bulk schedule validation rejects overlapping days within the payload and requires a duration and valid time window for each item. Omitted bulk schedule `name`, `time_gap`, and `is_active` become `""`, `0`, and `true` respectively, including on updates.

### List filters and manual booking

| Query parameter | Behavior |
|---|---|
| `search` | Whitespace-separated terms must each match patient name or phone; exact/full matches rank first, then descending ID |
| `date_from`, `date_to` | Inclusive appointment-date range; either optional; reversed ranges return `400` |
| `status` | Comma-separated aliases `approved` → `scheduled`, `disapproved` → `cancelled_admin`, plus all raw statuses; case-insensitive; blank/`all` parts are ignored; unknown values return `400` |
| `page`, `page_size` | Default size 10, maximum 100; default ordering descending ID |

Both manual booking URLs require `{full_name, phone_number, date, time, reason?}`. Name (max 100) and phone (max 15) must be nonblank. The service gets/creates the user by phone, fills their name only if new/missing, and applies the same availability checks as patient booking. The appointment starts as `scheduled` and bypasses pending approval.

### Updating and deciding appointments

Both `PUT` and `PATCH` are partial for appointment detail. Writable fields are `appointment_date`, `appointment_time`, `status`, `reason`, and `disapproval_reason`; user identity and timestamps cannot be changed here. Direct edits do not call the booking service to recheck weekly hours or closures. This endpoint is not restricted to the dedicated action transitions.

Dedicated approve/disapprove endpoints accept **only pending** appointments. Approval sets `scheduled`; disapproval sets `cancelled_admin`, saves the reason, and frees the slot. Other states return `400 {"detail":"Only pending appointments can be approved."}` or `"Only pending appointments can be disapproved."`. Missing IDs return `404 {"detail":"Appointment not found"}`. Disapproval requires nonblank `reason` (max 500).

A detail update that changes pending → cancelled_admin requires nonblank `disapproval_reason`; omission returns `400` under that field. Pending → scheduled/cancelled_admin changes through detail updates also trigger the decision notice. The detail-update reason field has no serializer max length of 500; that limit belongs to the dedicated disapprove input.

Decision SMS uses PanelChi approval/rejection patterns, with `full_name`, `time` (`HH:MM`), Jalali `date`, and `reason` for rejection. Provider failures are logged without undoing the saved decision. Console mode only logs a notice. Django admin supplies a bulk **approve** action; there is no bulk disapprove action requesting reasons.

## Admin patient records — `apps.users`

All routes require **Admin** access and scope patients to `is_staff=False`. Source: `apps/users/{admin_urls,views_admin,serializers}.py`.

| Method | Path | Input / purpose | Success |
|---|---|---|---|
| GET | `/api/admin/patients/` | Optional `?search=` (name/phone) | `200` unpaginated patient array |
| GET | `/api/admin/patients/<id>/` | Full dossier | `200` dossier |
| PUT / PATCH | `/api/admin/patients/<id>/` | Optional `full_name`, `national_id` | `200` updated dossier |
| POST | `/api/admin/patients/<id>/notes/` | Nonblank `text` (or alias `note`) | `201` clinical note |

List items contain `{id, full_name, phone_number, last_appointment, appointment_count, notes_count, triage_level}`. `last_appointment` is the maximum appointment date across all statuses (can be future/null); list ordering is descending last appointment date. `triage_level` is from the most recently active chat having a non-null triage, or null.

Dossiers contain `{id, full_name, phone_number, national_id, sex, date_of_birth, appointments, notes}`. There is **no address field**: `PatientProfile` was removed in users migration `0006`, which copied dates of birth onto `User`. National ID, sex, and birth date may be null. Missing names serialize as `""`.

Nested appointments use `{id, date, time, status, reason}` (descending date/time), **not** the full appointment serializer; `disapproval_reason` is absent here. Notes use `{id, text, author_name, created_at}` (newest first); author name can be null.

Both update methods are partial. `full_name` allows blank, max 100; `national_id` allows blank/null, max 20, and blank clears it to null. Sex/birth date are returned but are not writable through this endpoint. Missing/staff patient IDs return `404 {"detail":"Patient not found"}`. Empty note text returns `400 {"detail":"Note text is required."}`. `PatientNote.text` declares max 4000 at model level, but the create view writes directly rather than validating with the serializer.

Chat history and latest triage are documented in [chat and triage API](api-endpoints-chat.md).

## Reviews — `apps.comments`

Source: `apps/comments/{review_urls,review_admin_urls,views,views_admin,serializers}.py`.

| Method | Path | Access | Input / purpose | Success |
|---|---|---|---|---|
| GET | `/api/reviews/` | Public | Approved reviews only | `200` array |
| POST | `/api/reviews/` | Public | Required `text`, `rating`; optional `name`, `email` | `201` pending review |
| GET | `/api/admin/reviews/` | Admin | All moderation states | `200` array |
| PATCH / DELETE | `/api/admin/reviews/<id>/` | Admin | Required `{approved: true/false}` for PATCH / delete | `200` review / `204` |
| PATCH / DELETE | `/api/admin/reviews/<id>/approval/` | Admin | Alias to the same moderation view, including DELETE | `200` review / `204` |

Public items contain `{id, name, email, text, rating, created_at, approved}`; admin items additionally include `updated_at`. Lists are newest first, unpaginated. Text is required/nonblank (max 2000); rating is a required integer 1–5; name is optional/blank (max 100); email is optional/blank and email-validated. New reviews are pending. Approval maps true → approved, false → rejected and records reviewer/time. Missing review IDs return `404 {"detail":"Review not found"}`.

`approved` is a derived boolean, not the stored status. Because the public view disables authentication, sending a bearer token does not associate the review with its user under the current configuration.

## Site settings, videos, and analytics — `apps.common`

Source: `apps/common/{urls,admin_urls,views,stats_views,serializers,models}.py`.

| Method | Path | Access | Input / purpose | Success |
|---|---|---|---|---|
| POST | `/api/auth/request-otp` | None | `phone_number` | Request a login OTP — or, for admin numbers, a signal to show the password screen instead |
| POST | `/api/auth/verify-otp` | None | `phone_number`, `code` | Verify OTP → JWT pair (returning patient) **or** `signup_token` (first-time) |
| POST | `/api/auth/complete-registration` | None | `signup_token`, `full_name`, `national_id`, `date_of_birth` | Finish first-time signup → JWT pair |
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
| PUT/PATCH | `/api/admin/appointments/<id>/` | JWT (admin) | any `Appointment` field; `disapproval_reason` required when setting `pending` → `cancelled_admin` | Update an appointment (e.g. status directly) |
| POST | `/api/admin/appointments/<id>/approve/` | JWT (admin) | — | Approve a pending appointment → `scheduled` |
| POST | `/api/admin/appointments/<id>/disapprove/` | JWT (admin) | `{ "reason": "..." }` (required) | Disapprove a pending appointment → `cancelled_admin`; saves the reason and sends it in the rejection SMS |
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
