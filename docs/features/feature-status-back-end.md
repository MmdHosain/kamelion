# Feature Implementation Status

> Reflects the current state of the `backend_core` codebase as of this review. Status is based on what is actually implemented and wired up (models, endpoints, business logic), not on planned or intended work.

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
| 1 | Patient login (OTP-based) | 🟡 Partially Implemented |
| 2 | Admin/staff login (password-based) | ✅ Completed |
| 3 | Patient profile management | ❌ Not Implemented |
| 4 | Doctor availability management (admin) | ✅ Completed |
| 5 | Clinic closure / exception management (admin) | ✅ Completed |
| 6 | Available slots lookup (patient) | ✅ Completed |
| 7 | Appointment booking (patient) | ✅ Completed |
| 8 | View own appointments (patient) | ✅ Completed |
| 9 | Appointment cancellation (patient) | ✅ Completed |
| 10 | Appointment list & search (admin) | ✅ Completed |
| 11 | Django admin panel access | ✅ Completed |
| 12 | Chat gateway / FastAPI integration | 🔵 In Progress |
| 13 | Shared/common utilities (`common` app) | ❌ Not Implemented |
| 14 | SMS delivery of OTP codes | ❌ Not Implemented |
| 15 | Role-based access control beyond admin/patient | ❌ Not Implemented |

## Feature Details

### 1. Patient login (OTP-based) — 🟡 Partially Implemented
One-time-password login for patients using their phone number: request an OTP, then verify it to receive a JWT access/refresh pair. Invalidates prior unused codes and enforces a 5-minute expiry. **Gap:** the OTP code is currently only written to server logs — there is no SMS (or other channel) integration to actually deliver it to the patient, so the login flow cannot be used end-to-end outside of a development environment with log access.

### 2. Admin/staff login (password-based) — ✅ Completed
Password-based login for staff users, checked against Django's standard `authenticate()`, with explicit checks for `is_staff` and `is_active` before issuing a JWT pair.

### 3. Patient profile management — ❌ Not Implemented
A `PatientProfile` model exists (national ID, date of birth, address) and a helper function to fetch-or-create one, but there is no API endpoint to create, view, or update a patient's profile. The model and helper are currently unused by any route.

### 4. Doctor availability management (admin) — ✅ Completed
Admins can create, list, retrieve, update, and delete weekly recurring availability schedules (days of week, time window, visit duration, gap between visits), including a bulk save/replace endpoint. Validation prevents overlapping days between schedules and invalid time ranges.

### 5. Clinic closure / exception management (admin) — ✅ Completed
Admins can create, list, retrieve, update, and delete date ranges when the clinic is closed, including a bulk save/replace endpoint. Enforced both in application validation and a database constraint (`end_date >= start_date`).

### 6. Available slots lookup (patient) — ✅ Completed
Public endpoint that computes free appointment slots for a given date, taking into account active availability rules, clinic closures, and already-booked slots.

### 7. Appointment booking (patient) — ✅ Completed
Authenticated patients can book an available slot. Prevents double-booking both at the application level (checks against currently available slots) and the database level (partial unique constraint on date/time for scheduled appointments), inside an atomic transaction.

### 8. View own appointments (patient) — ✅ Completed
Authenticated patients can list their own appointments, ordered by date.

### 9. Appointment cancellation (patient) — ✅ Completed
Authenticated patients can cancel one of their own scheduled appointments; already-cancelled or completed appointments cannot be re-cancelled.

### 10. Appointment list & search (admin) — ✅ Completed
Admins can list all appointments with pagination and free-text search across patient name/phone number, with exact matches ranked above partial matches.

### 11. Django admin panel access — ✅ Completed
`DoctorAvailability`, `AvailabilityException`, and `Appointment` are registered with Django's built-in admin site, giving staff a separate browsing/editing interface outside the DRF API. (`users` models are not registered in Django admin.)

### 12. Chat gateway / FastAPI integration — 🔵 In Progress
Settings for a separate FastAPI service (`FASTAPI_BASE_URL`, `FASTAPI_TIMEOUT`) exist, an HTTP client dependency (`httpx`) is installed, and an app named `chat_gateway` is registered — but the app contains no models, views, serializers, or routes beyond Django's default generated stubs, and nothing in the codebase currently calls out to the FastAPI service. This looks like early scaffolding for a future feature.

### 13. Shared/common utilities (`common` app) — ❌ Not Implemented
An app named `common` is registered but contains no models, views, or shared logic beyond default generated stubs.

### 14. SMS delivery of OTP codes — ❌ Not Implemented
There is a `# TODO: integrate SMS provider here` in the OTP service; no SMS provider is integrated anywhere in the codebase (see also Feature 1).

### 15. Role-based access control beyond admin/patient — ❌ Not Implemented
Authorization is limited to Django's built-in `is_staff` flag (via DRF's `IsAdminUser`) versus any authenticated user (`IsAuthenticated`). There are no custom roles, groups, object-level permissions, or scopes.

## Notes for Reviewers

- This document should be reviewed by another team member to confirm the statuses above match current expectations before being treated as authoritative.
- Statuses will drift as the codebase changes; re-verify against the code rather than assuming this file stays current indefinitely.
