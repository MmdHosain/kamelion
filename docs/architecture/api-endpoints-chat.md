# Chat and Triage API Reference

> **Verified against repository source:** 2026-10-17, baseline `8b0eca0`.
> Implemented in `backend_core/apps/chat_gateway/`. This describes backend behavior;
> external AI availability and deployment credentials were not verified.

[API index and shared conventions](api-endpoints.md) · [Backend architecture](backend.md)

## Patient-facing message endpoint

### `POST /api/chat/message`

**Access:** JWT, `IsAuthenticated`. The permission class also permits authenticated staff; there is no additional patient-only role check. No trailing slash.

```json
{"message":"I have a question.","session_id":"widget-session-1"}
```

`message` is required, trimmed, and must contain 1–4000 characters. `session_id` is required, nonblank, max 100. Client-supplied patient context, history, and triage are not used; the backend builds these from its own records.

**Success:** `200 OK`:

```json
{
  "reply":"Plain-text assistant reply.",
  "triage_level":"low_priority",
  "booking_offer":true,
  "emergency_code":null,
  "fallback":false
}
```

- Levels: `unknown`, `out_of_scope`, `low_priority`, `high_priority`, `urgent`.
- `booking_offer` is true for low/high priority. This is an offer to enter the normal booking flow; it does not create an appointment.
- Urgent sessions receive a backend-generated code such as `URG-AB2CD3`; it is returned as `emergency_code`. The code can remain null if issuance failed. It is not a booked appointment or a confirmed date/time.
- Codes expire exactly seven days (168 hours) after issuance, including codes issued before this feature. A successful urgent assessment after expiry replaces the code; repeated assessments before expiry do not extend it. The chat response retains its existing fields; expiry metadata is exposed by the urgent-patient endpoint below.
- `triage_summary` is staff-only and is never included in this response.
- Handled AI-service failures return **200** with a fixed English/Persian reply, `fallback=true`, and the existing triage/action state. If no successful triage exists, the returned level is `unknown`.

**Errors:**

| Status | Shape / cause |
|---|---|
| `400` | Serializer field errors for invalid message/session input |
| `401` | Missing, invalid, or expired JWT |
| `403` | `{"detail":"This chat session belongs to another patient."}` |
| `409` | `{"detail":"A newer message in this session is being answered."}` |

The first request creates the session and attaches its owner. Reuse by a different user is forbidden. Legacy ownerless sessions are adopted by the first authenticated caller. The service stores each user message, then locks the session row to serialize AI calls; a superseded request is rejected with `409` after its message was stored.

## Admin patient chat records

Both endpoints require JWT plus `IsAdminUser`. Missing patient IDs and staff-user IDs return `404`. A patient here is a `User` with `is_staff=False`.

### `GET /api/admin/patients/<id>/chats/`

Returns **all** that patient's sessions, paginated (default 10; `page_size` maximum 100), newest activity first, with ID as the tie-breaker. Optional `?level=` filters by one of the five valid levels; unrecognized filter values are ignored.

Each result contains:

```json
{
  "id":1,"session_id":"widget-session-1",
  "triage_level":"urgent","triage_summary":"Staff summary.",
  "emergency_code":"URG-AB2CD3",
  "created_at":"2026-10-17T10:00:00Z","updated_at":"2026-10-17T10:01:00Z",
  "message_count":1,"last_message_at":"2026-10-17T10:00:00Z",
  "messages":[{"id":1,"role":"user","kind":"","content":"Question.","created_at":"2026-10-17T10:00:00Z"}]
}
```

The snippet illustrates field shapes, not a complete urgent conversation. Messages are ordered by creation time then ID and include the full stored conversation, with no per-session message pagination. Roles are `user`, `assistant`, or `backend`; backend kinds include `fallback` and `emergency_code` (ordinary messages have blank kind). `last_message_at` is null for an empty chat. Sessions with no successful triage have null level/summary.

### `GET /api/admin/patients/<id>/triage_level/`

Returns the most recently active session with a non-null triage, containing only `{id, session_id, triage_level, triage_summary, emergency_code, created_at, updated_at}`. It omits messages/counts. If there is no triaged session, **all seven fields are null**. `emergency_code` is populated only while the session's level is urgent and its action exists.

`GET /api/admin/patients/` also includes each patient's latest `triage_level`, using the same selection rule.

### `GET /api/admin/patients/urgent/`

**Added 2026-10-31. Access:** JWT plus `IsAdminUser`. Missing/invalid authentication
returns `401`; authenticated non-staff users receive `403`. This endpoint does not
send notifications or create appointments.

Returns one row per non-staff patient whose **latest triaged session** is `urgent`
and has an unexpired code. Latest follows the existing patient-list/triage endpoint
rule: order sessions with a non-null triage by `updated_at DESC, id DESC`, then
select one per patient **before** filtering urgency or code validity. A newer
nonurgent assessment or expired/missing latest code excludes the patient even if
an older session has a valid urgent code. An untriaged chat does not replace a
successful assessment. Ownerless/staff sessions are excluded.

Results are ordered by latest assessment first (`session.updated_at DESC`, then
session ID descending). Pagination uses `page` and `page_size`, default 10,
maximum 100. No search or additional filtering is provided.

```json
{
  "count": 1,
  "next": null,
  "previous": null,
  "results": [{
    "id": 42,
    "full_name": "Patient name",
    "phone_number": "09120000000",
    "chat_id": 7,
    "session_id": "widget-session-1",
    "triage_level": "urgent",
    "triage_summary": "Staff-only clinical summary.",
    "assessed_at": "2026-10-31T10:00:00Z",
    "emergency_code": "URG-AB2CD3",
    "emergency_code_issued_at": "2026-10-31T10:00:00Z",
    "emergency_code_expires_at": "2026-11-07T10:00:00Z",
    "emergency_code_is_expired": false
  }]
}
```

`id` is the patient ID; `chat_id` is the internal session ID. Missing names return
`""`; the staff summary may be null for legacy records. Datetimes use DRF's
timezone-aware ISO representation. Expiry is evaluated against one request
timestamp: codes expiring **at or before** that timestamp are excluded. The flag
is consequently always false in this list. The empty response is
`{"count":0,"next":null,"previous":null,"results":[]}`.

Expiry does not delete records or downgrade triage. Existing chat-history and
latest-triage responses retain their original field sets and may still expose
expired codes for historical review; use this new endpoint for the active queue.
The frontend has not yet been wired to this separate queue or expiry display.

## AI service boundary and stored actions

The backend sends `POST <AI_SERVICE_BASE_URL>/v1/chat` through `ai_client.py`, with a server-side bearer key and `X-Request-ID`. Its request body contains exactly:

- `session_id`: a backend-generated UUID, distinct from the widget's session key.
- `message`: `{content, created_at}` for the current message; timestamps are RFC 3339 UTC.
- `history`: at most 100 previous user/assistant messages, oldest first, excluding the current message and all backend-generated messages.
- `triage`: last successful `{level, summary}` or null.
- `patient`: known first name, computed age (0–120), and sex, or null; phone number and national ID are not added to this structured context. Message text/history themselves are forwarded.

Valid success bodies contain a nonempty `reply` and `triage` with an allowed level; actionable levels require a nonblank summary. Once low/high/urgent is reached, lower severity or a return to unknown/out-of-scope is rejected and uses the fallback. Successful replies update stored triage and summary on every turn.

The timeout defaults to 30 seconds. The client makes at most two attempts, separated by the configured delay (default 2 seconds), for transport failures and HTTP statuses other than 200/400/401. HTTP 400/401 and invalid success bodies are not retried. Fallback preserves previous triage and is stored as a backend message.

One action row per `(session, level)` is enforced by a database unique constraint:
low/high record a booking offer once; urgent records a unique `URG-` code and a
backend message. The urgent row's `emergency_code_issued_at` is stored separately
from its original creation time; expiry is derived as issuance plus seven days.
Migration `chat_gateway.0005_emergency_code_issued_at` backfills existing code issue
dates from their original action `created_at`, so old codes do not receive a fresh
week on deployment. Booking actions retain null issue dates.

A successful urgent assessment at/after expiry updates that same action row with
a new code and issue date and appends another backend message. Earlier issuance
messages remain in history and remain excluded from outbound AI history. Valid
codes are never extended or replaced by repeat assessments. AI failures and
rejected downgrades do not renew codes. Renewal and its message are atomic; action
failures are logged and retried on a later successful urgent turn without failing
that turn's AI reply. Existing expired codes may remain in fallback responses.

Configuration: `AI_SERVICE_BASE_URL`, `AI_SERVICE_API_KEY`, `AI_SERVICE_CA_BUNDLE`, `AI_SERVICE_TIMEOUT`, `AI_SERVICE_RETRY_DELAY`, and `CLINIC_PHONE_NUMBER`. TLS verification remains enabled; the bundled private CA is the default trust bundle. Django system checks warn about missing service configuration, missing CA files, missing clinic number, and non-HTTPS production URLs. Source comments refer to an external `API.md` contract that is not present in this checkout.

## Verification sources

`apps/chat_gateway/{urls,admin_urls,views,views_admin,urgent_patients,serializers,models,services,payload,ai_client,actions,constants,texts,checks}.py`; `apps/users/views_admin.py`; `config/settings.py`. Mocked contract/action/admin tests are in `apps/chat_gateway/tests.py`; queue, expiry/renewal, and migration coverage is in `test_urgent_patients.py`, `test_emergency_expiry.py`, and `test_expiry_migration.py`.
