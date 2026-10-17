# API Endpoints Reference

> **Verified against repository source:** 2026-10-17, baseline commit `8b0eca0`.
> Describes the routes wired into `backend_core/config/urls.py`, their views,
> serializers, and services. This is an implementation reference, not a proposed API.
> Source inspection and URL resolution do not establish that a deployed service is healthy.

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

| Method | Path | Access | Input | Success |
|---|---|---|---|---|
| POST | `/api/auth/request-otp` | Public | `phone_number` (required, max 15) | `200` admin-password signal or OTP signal |
| POST | `/api/auth/verify-otp` | Public | `phone_number` (max 15), `code` (max 6), both required | `200` login object or signup token |
| POST | `/api/auth/complete-registration` | Public | `signup_token`, `full_name`, `national_id`; optional `sex`, `date_of_birth` | `200` patient login object |
| POST | `/api/auth/admin/login` | Public | Required `phone_number` (max 15), `password` | `200` admin login object |
| GET | `/api/auth/me` | JWT | None | `200` current user |
| POST | `/api/auth/refresh` | Public | Required `refreshToken` | `200` `{accessToken, refreshToken}` |
| POST | `/api/auth/logout` | JWT | Optional `refreshToken` or `refresh` | `200` `{"message":"Logged out"}` |

### OTP and registration

`request-otp` checks `is_staff` first. Staff numbers receive `{"is_admin":true,"message":"Enter your password"}` without generating an OTP. Other numbers receive `{"is_admin":false,"message":"OTP sent"}` after a 6-digit OTP is stored, expiring in 5 minutes; previous unused OTPs are invalidated.

Delivery depends on `SMS_PROVIDER`: `console` (default) prints the code; `panelchi` sends the login pattern with variable `otp_code`. A provider failure deletes the newly created code and returns `502 {"error":"..."}`. Configuring real delivery requires the PanelChi token and login pattern.

`verify-otp` consumes a **valid** OTP. Invalid/used codes return `400 {"error":"Invalid OTP"}`; an expired matching unused code returns `400 {"error":"OTP expired"}`. Existing users receive:

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
| GET | `/api/settings/theme` | Public | Read persisted theme (default `pink`) | `200` `{theme}` |
| PUT | `/api/admin/settings/theme` | Admin | Required `theme`: `pink`, `lilac`, or `purple` | `200` `{theme}` |
| GET | `/api/videos/` | Public | Gallery, newest first | `200` unpaginated array |
| POST | `/api/admin/videos/` | Admin | Required `title`, `src`; optional `type` | `201` video |
| DELETE | `/api/admin/videos/<id>/` | Admin | Delete gallery entry | `204` |
| GET | `/api/admin/stats` | Admin | Dashboard metrics | `200` object below |

Video objects are `{id, title, src, type}`. Title max 255; src max 500; type is `video` (default) or `iframe`. `src` is stored as a string, not uploaded or host-validated here. Missing delete IDs return `404 {"detail":"Video not found"}`. No video update endpoint is wired.

Stats fields and their implemented calculations:

| Field | Meaning |
|---|---|
| `total_visits` | Count of `visited` appointments |
| `visits_growth` | Growth in appointments **created** this Gregorian month versus last; `N/A` if both zero, `+100%` if only previous is zero, otherwise signed percentage followed by `vs last month` |
| `online_bookings` | Count excluding both cancellation statuses; includes manual/admin bookings |
| `attendance_rate` | Rounded visited / (visited + cancelled) percentage; `N/A` if denominator zero |
| `triage_chats` | All `ChatSession` rows, including sessions without successful triage |
| `emergency_codes` | **Hardcoded `0`**, despite code issuance being implemented in chat |
| `satisfaction_rating`, `reviews_count` | Approved-review average formatted `x.x / 5.0` (0.0 when empty), and approved-review count |
| `monthly_trends` | Six `{month, value}` entries counting appointment dates by **Gregorian** month; labels use the Jalali month containing each Gregorian month start; current month ends today |
| `status_breakdown` | Two `{name, value}` percentages for visited vs scheduled only; Persian labels; excludes pending/cancelled; both zero when empty |

## Articles and AI chat route inventory

Detailed payloads, validation, and behavior are maintained in the linked references.

| Method | Path | Access | Contract |
|---|---|---|---|
| GET | `/api/articles/` | Public | [Published article list](api-endpoints-articles.md) |
| GET | `/api/articles/categories/` | Public | [Category list](api-endpoints-articles.md) |
| GET | `/api/articles/<slug>/` | Public | [Published detail and view count](api-endpoints-articles.md) |
| GET / POST | `/api/admin/articles/` | Admin | [Article list/create](api-endpoints-articles.md) |
| GET / PUT / PATCH / DELETE | `/api/admin/articles/<id>/` | Admin | [Article detail/update/delete](api-endpoints-articles.md) |
| PATCH | `/api/admin/articles/<id>/toggle-status/` | Admin | [Publication toggle](api-endpoints-articles.md) |
| POST | `/api/admin/articles/upload-image/` | Admin | [Multipart image upload](api-endpoints-articles.md) |
| GET / POST | `/api/admin/articles/categories/` | Admin | [Category list/create](api-endpoints-articles.md) |
| DELETE | `/api/admin/articles/categories/<id>/` | Admin | [Category deletion](api-endpoints-articles.md) |
| POST | `/api/chat/message` | JWT | [Message, reply, booking offer, emergency code](api-endpoints-chat.md) |
| GET | `/api/admin/patients/<id>/chats/` | Admin | [Paginated full chat histories](api-endpoints-chat.md) |
| GET | `/api/admin/patients/<id>/triage_level/` | Admin | [Latest triaged session](api-endpoints-chat.md) |

## Verification and maintenance

This revision was checked against URL configurations, resolved view methods, serializers, services, models, migrations, settings, and existing test definitions. Business behavior descriptions come from source inspection; no live SMS or AI request was made. For implementation availability and known gaps, use the [feature status](../features/feature-status-back-end.md).

When changing an endpoint, update its contract here or in the linked domain reference and update the corresponding feature entry. The older article architecture and implementation guides retain design proposals; their status notices identify the current implementation references.
