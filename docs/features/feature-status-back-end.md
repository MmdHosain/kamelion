# Feature Implementation Status

> Reflects the current state of the `backend_core` codebase as of this review. Status is based on what is actually implemented and wired up (models, endpoints, business logic), not on planned or intended work.
>
> **Updated:** this revision reflects the reworked two-step OTP/registration login, the admin-password branch at login, national ID moving onto `User`, the appointment pending/approval workflow, admin editing of patient info, and the review/comment moderation flow.

## Status Legend

| Status | Meaning |
|---|---|
| ✅ Completed | Fully implemented and reachable through the API (or admin panel), including validation/error handling. |
| 🟡 Partially Implemented | Core logic exists and is usable, but a meaningful part of the feature is missing, stubbed, or manual. |
| 🔵 In Progress | Some scaffolding exists (app, config, or dependency), but no functional behavior yet. |
| ❌ Not Implemented | No code exists for this feature beyond, at most, an empty stub. |

## Feature Summary

| # | Feature | Status |
|---|---|---|
| 1 | Patient login (OTP-based, two-step registration) | 🟡 Partially Implemented |
| 2 | Admin/staff login (password-based) | ✅ Completed |
| 2b | Admin-vs-patient branch at login | ✅ Completed |
| 3 | Patient profile management | ❌ Not Implemented |
| 3b | National ID collection (on `User`) | ✅ Completed |
| 4 | Doctor availability management (admin) | ✅ Completed |
| 5 | Clinic closure / exception management (admin) | ✅ Completed |
| 6 | Available slots lookup (patient) | ✅ Completed |
| 7 | Appointment booking (patient) | ✅ Completed |
| 7b | Appointment pending / admin approval workflow | ✅ Completed |
| 8 | View own appointments (patient) | ✅ Completed |
| 9 | Appointment cancellation (patient) | ✅ Completed |
| 10 | Appointment list & search (admin) | ✅ Completed |
| 11 | Django admin panel access | ✅ Completed |
| 12 | Chat gateway / FastAPI integration | 🔵 In Progress |
| 13 | Shared/common utilities (`common` app) | ❌ Not Implemented |
| 14 | SMS delivery of OTP codes | ❌ Not Implemented |
| 15 | Role-based access control beyond admin/patient | ❌ Not Implemented |
| 16 | Patient/admin patient-info editing | ✅ Completed |
| 17 | Review / comment submission & moderation | ✅ Completed |

## Feature Details

### 1. Patient login (OTP-based, two-step registration) — 🟡 Partially Implemented
**Reworked this cycle.** Login is now a clean two-step flow:
1. `POST /api/auth/verify-otp` validates the code and consumes it immediately regardless of outcome. If the phone number already has an account, this alone logs the patient in with a JWT pair.
2. If it's the first time that phone number has been seen, no account is created and no tokens are issued — instead a short-lived `signup_token` is returned. The client then calls `POST /api/auth/complete-registration` with that token plus `full_name` and `national_id` to actually create the account and receive tokens. The token (not the OTP) is what proves the phone was verified, so the registration step doesn't need the code resent.

**Gap (unchanged from before):** the OTP code is still only written to server logs — there is no SMS (or other channel) integration to actually deliver it to the patient, so the login flow cannot be used end-to-end outside of a development environment with log access.

### 2. Admin/staff login (password-based) — ✅ Completed
Unchanged in mechanism: password-based login for staff users, checked against Django's standard `authenticate()`, with explicit checks for `is_staff` and `is_active` before issuing a JWT pair.

A latent bug was fixed this cycle: `UserManager.create_user()` accepted a `password` argument but always discarded it (always calling `set_unusable_password()`). It had no observable effect previously because the only caller (`create_superuser`) set the password separately afterward, but it would have silently broken any staff account created by passing a password directly into `create_user()`. It now honors a passed-in password; patient accounts created without one are unaffected.

### 2b. Admin-vs-patient branch at login — ✅ Completed *(new)*
`POST /api/auth/request-otp` now checks whether the submitted phone number belongs to a staff user before doing anything else. If so, no OTP is generated or stored — the response tells the client to show a password screen instead (`POST /api/auth/admin/login`). Non-admin numbers go through the OTP flow exactly as before.

### 3. Patient profile management — ❌ Not Implemented
Unchanged. A `PatientProfile` model exists (date of birth, address) and a helper function to fetch-or-create one, but there is no API endpoint to create, view, or update it directly by the patient. It's still only surfaced read-only via the admin dossier endpoint. (`national_id` was removed from this model this cycle — see below.)

### 3b. National ID collection (on `User`) — ✅ Completed *(new)*
`national_id` was moved off `PatientProfile` and onto `User` itself, and is **intentionally not unique** (multiple accounts may share the same ID by design — e.g. guardians booking for dependents). It's collected once, during first-time registration (`complete-registration`, see Feature 1), and can subsequently be viewed and edited by an admin (see Feature 16).

### 4. Doctor availability management (admin) — ✅ Completed
Unchanged. Admins can create, list, retrieve, update, and delete weekly recurring availability schedules (days of week, time window, visit duration, gap between visits), including a bulk save/replace endpoint. Validation prevents overlapping days between schedules and invalid time ranges.

### 5. Clinic closure / exception management (admin) — ✅ Completed
Unchanged. Admins can create, list, retrieve, update, and delete date ranges when the clinic is closed, including a bulk save/replace endpoint. Enforced both in application validation and a database constraint (`end_date >= start_date`).

### 6. Available slots lookup (patient) — ✅ Completed
Public endpoint that computes free appointment slots for a given date, taking into account active availability rules, clinic closures, and already-booked slots. **Changed this cycle:** a slot is now considered taken if it has an appointment in either `scheduled` **or `pending`** status — previously only `scheduled` blocked it, which would have let two people book the same pending slot.

### 7. Appointment booking (patient) — ✅ Completed
Authenticated patients can book an available slot. Prevents double-booking both at the application level (checks against currently available slots) and the database level (partial unique constraint on date/time, now for `scheduled` **or** `pending` status), inside an atomic transaction. **Changed this cycle:** a patient's own booking now starts as `pending` rather than `scheduled` — see Feature 7b. Bookings created by an admin on a patient's behalf (`POST /api/admin/appointments/create/`) are unaffected and still go straight to `scheduled`.

### 7b. Appointment pending / admin approval workflow — ✅ Completed *(new)*
Patient-initiated bookings start with `status: "pending"` and hold their slot immediately (nobody else can book it while it's pending). An admin reviews pending appointments (`GET /api/admin/appointments/?status=pending`) and either:
- Approves it (`POST /api/admin/appointments/<id>/approve/`) → moves to `scheduled`, or
- Disapproves it (`POST /api/admin/appointments/<id>/disapprove/`) → moves to `cancelled_admin`, freeing the slot.

Both actions are also available via Django's built-in admin (bulk "Approve selected"/"Disapprove selected" actions) in addition to the API. A patient may still cancel their own appointment while it's pending, not just once scheduled.

### 8. View own appointments (patient) — ✅ Completed
Unchanged. Authenticated patients can list their own appointments (any status), ordered by date.

### 9. Appointment cancellation (patient) — ✅ Completed
Authenticated patients can cancel one of their own appointments. **Changed this cycle:** this is now allowed while the appointment is `pending` **or** `scheduled` — previously only `scheduled` appointments could be cancelled.

### 10. Appointment list & search (admin) — ✅ Completed
Admins can list all appointments with pagination and free-text search across patient name/phone number, with exact matches ranked above partial matches. **Changed this cycle:** added an exact-match `?status=` filter (e.g. `?status=pending`) alongside the existing search.

### 11. Django admin panel access — ✅ Completed
`DoctorAvailability`, `AvailabilityException`, and `Appointment` are registered with Django's built-in admin site. **Changed this cycle:** the `Appointment` admin now has a status list filter and bulk approve/disapprove actions, matching the new pending-approval workflow. (`users` models are still not registered in Django admin.)

### 12. Chat gateway / FastAPI integration — 🔵 In Progress
Unchanged. Settings for a separate FastAPI service (`FASTAPI_BASE_URL`, `FASTAPI_TIMEOUT`) exist, an HTTP client dependency (`httpx`) is installed, and an app named `chat_gateway` is registered — but the app contains no models, views, serializers, or routes beyond Django's default generated stubs, and nothing in the codebase currently calls out to the FastAPI service. This looks like early scaffolding for a future feature.

### 13. Shared/common utilities (`common` app) — ❌ Not Implemented
Unchanged. An app named `common` is registered but contains no models, views, or shared logic beyond default generated stubs.

### 14. SMS delivery of OTP codes — ❌ Not Implemented
Unchanged. There is a `# TODO: integrate SMS provider here` in the OTP service; no SMS provider is integrated anywhere in the codebase (see also Feature 1).

### 15. Role-based access control beyond admin/patient — ❌ Not Implemented
Unchanged. Authorization is limited to Django's built-in `is_staff` flag (via DRF's `IsAdminUser`) versus any authenticated user (`IsAuthenticated`). There are no custom roles, groups, object-level permissions, or scopes.

### 16. Patient/admin patient-info editing — ✅ Completed *(new)*
Admins can edit a patient's `full_name` and/or `national_id` via `PUT`/`PATCH /api/admin/patients/<id>/`, reusing the existing patient-detail endpoint. Either field can be sent alone; the response is the same full dossier shape as the `GET` on that endpoint. There is still no endpoint for a *patient* to edit their own info — this is admin-only, consistent with Feature 3 remaining unimplemented on the patient side.

### 17. Review / comment submission & moderation — ✅ Completed *(newly documented — pre-existing, not built this cycle, but previously missing from this document)*
Public users (authenticated or not) can submit a review (`POST /api/reviews/`) with `text` and `rating` (1–5) required; it starts as `pending` and isn't visible on the public list (`GET /api/reviews/`) until an admin approves it (`PATCH /api/admin/reviews/<id>/` with `{"approved": true}`) or deletes it (`DELETE /api/admin/reviews/<id>/`). **Changed this cycle:** the `name` field is now optional — previously a review without a name was rejected.

## Notes for Reviewers

- This document should be reviewed by another team member to confirm the statuses above match current expectations before being treated as authoritative.
- Statuses will drift as the codebase changes; re-verify against the code rather than assuming this file stays current indefinitely.
- Feature 17 (reviews) was already implemented in the codebase prior to this revision but had been omitted from the previous version of this document entirely — flagging in case there are other gaps of the same kind (implemented-but-undocumented) elsewhere.