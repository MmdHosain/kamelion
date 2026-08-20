# API Endpoints Reference

> This is a complete list of every route actually wired into `config/urls.py` (directly or via an included app `urls.py`), what each one expects as input, what it returns, and what it does internally. Global defaults: unless a view explicitly overrides them, DRF's default authentication is **JWT** (`Authorization: Bearer <token>`) and the default permission is **`IsAuthenticated`**.

---

## Auth — `apps/users` (mounted at `/api/`)

### `POST /api/auth/request-otp`
**Auth:** None (explicitly open)
**Request body:**
```json
{ "phone_number": "string, max 15 chars" }
```
**Response:** `200 OK`
```json
{ "message": "OTP sent" }
```
**What it does:** Generates a 6-digit numeric code, invalidates any previous unused OTP for that phone number, and stores the new one (`OTPRequest`) with a 5-minute expiry. **Delivery is not implemented** — the code is only printed to the server console (no SMS provider is wired up), so in this environment the code has to be read from logs, not received on a phone.

### `POST /api/auth/verify-otp`
**Auth:** None (explicitly open)
**Request body:**
```json
{ "phone_number": "string, max 15 chars", "code": "string, max 6 chars" }
```
**Response:** `200 OK`
```json
{ "access": "<JWT access token>", "refresh": "<JWT refresh token>" }
```
**Error response:** `400 Bad Request` — `{ "error": "<reason>" }` if the code is wrong, expired, or already used.
**What it does:** Validates the code against the latest unused, non-expired `OTPRequest` for that phone number, marks it used, and **gets-or-creates** the `User` for that phone number (so a first-time verification implicitly registers a new patient). Issues a JWT pair on success. This is how ordinary patients log in — there is no separate "register" endpoint.

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

**What it does:** A traditional password login path, distinct from the OTP flow, intended for staff/admin users (who are the only users with a real, usable password — see `create_superuser`). Uses Django's standard `authenticate()` against `phone_number` as the username field. On success it issues a JWT pair, same token mechanism as the patient OTP flow, so the resulting access token is used the same way (`Authorization: Bearer <token>`) against admin-only endpoints below.

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
3. Subtracts any times already taken by a `scheduled` `Appointment` on that date.

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
  "status": "scheduled",
  "reason": "string",
  "created_at": "...",
  "updated_at": "..."
}
```
**Error response:** `400 Bad Request` — `{ "detail": "Selected time slot is not available." }`
**What it does:** Re-derives available slots for the requested date (same logic as `GET /slots/`) inside a database transaction, and if the requested time is among them, creates the `Appointment` for `request.user`. Wrapped in `@transaction.atomic`, and further protected at the database layer by a `UniqueConstraint` on `(appointment_date, appointment_time)` for `status="scheduled"`, so a race between two simultaneous bookings for the same slot cannot both succeed.

### `GET /api/appointments/my/`
**Auth:** JWT required (`IsAuthenticated`)
**Request body:** None
**Response:** `200 OK` — array of the current user's appointments (same shape as above), ordered by `-appointment_date`. **Not paginated.**
**What it does:** Returns every appointment (any status) belonging to `request.user`.

### `POST /api/appointments/<int:pk>/cancel/`
**Auth:** JWT required (`IsAuthenticated`)
**URL param:** `pk` — the appointment's ID
**Request body:** None
**Response:** `200 OK` — `{ "status": "cancelled" }`
**Error responses:**
- `404 Not Found` — `{ "detail": "Appointment not found" }` if no appointment with that ID belongs to the requesting user (this also hides appointments belonging to other users — they get a 404, not a 403).
- `400 Bad Request` — `{ "detail": "<reason>" }` if the appointment isn't currently `scheduled` (e.g., already cancelled or already visited).

**What it does:** Looks up the appointment scoped to `request.user`, then flips its status to `cancelled_user` (only if it was `scheduled`).

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
| `page`, `page_size` | int | No | Pagination (`page_size` max 100, default 10) |

**Response:** `200 OK` — a paginated DRF response (`count`, `next`, `previous`, `results`), each result in the `AppointmentSerializer` shape shown earlier (including `full_name`/`phone_number` of the booking patient).
**What it does:** Lists **every** appointment in the system (not scoped to one user), ordered newest-first by default. If `search` is supplied, it's split into whitespace-separated terms and each term must match (case-insensitively, `icontains`) the patient's `full_name` or `phone_number`; results are then re-ranked so exact matches and fuller matches surface first (via an annotated `rank`, ordered `-rank, -id`). Uses `select_related("user")` to avoid N+1 queries when serializing `full_name`/`phone_number`.

---

## Not implemented

These exist as installed Django apps but currently expose no models, views, or URLs, and are not included in `config/urls.py`:
- **`apps.chat_gateway`** — intended, per `settings.py`'s `FASTAPI_BASE_URL`/`FASTAPI_TIMEOUT` config and the `httpx` dependency, to proxy to a separate FastAPI service. No such call exists in code yet.
- **`apps.common`** — empty placeholder app, no functionality.

---

## Quick reference table

| Method | Path | Auth | Body / Params | Purpose |
|---|---|---|---|---|
| POST | `/api/auth/request-otp` | None | `phone_number` | Request a login OTP |
| POST | `/api/auth/verify-otp` | None | `phone_number`, `code` | Verify OTP → JWT pair (patient) |
| POST | `/api/auth/admin/login` | None | `phone_number`, `password` | Password login → JWT pair (admin) |
| GET | `/api/appointments/slots/` | None | `?date=` | List free slots for a date |
| POST | `/api/appointments/book/` | JWT | `date`, `time`, `reason?` | Book an appointment |
| GET | `/api/appointments/my/` | JWT | — | List own appointments |
| POST | `/api/appointments/<id>/cancel/` | JWT | — | Cancel own appointment |
| GET/POST | `/api/admin/slots/` | JWT (admin) | `DoctorAvailability` fields | List / create weekly schedules |
| GET/PUT/PATCH/DELETE | `/api/admin/slots/<id>/` | JWT (admin) | `DoctorAvailability` fields | Retrieve / update / delete a schedule |
| PUT | `/api/admin/slots/bulk/` | JWT (admin) | `{ schedules: [...] }` | Replace-all weekly schedules ⚠️ *currently unreachable — see note above* |
| GET/POST | `/api/admin/exceptions/` | JWT (admin) | `AvailabilityException` fields | List / create closed-date ranges |
| GET/PUT/PATCH/DELETE | `/api/admin/exceptions/<id>/` | JWT (admin) | `AvailabilityException` fields | Retrieve / update / delete an exception |
| PUT | `/api/admin/exceptions/bulk/` | JWT (admin) | `{ exceptions: [...] }` | Replace-all closed dates ⚠️ *currently unreachable — see note above* |
| GET | `/api/admin/appointments/` | JWT (admin) | `?search=`, `?page=`, `?page_size=` | Paginated, searchable list of all appointments |
