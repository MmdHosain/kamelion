# Chat and Triage API Reference

> **Verified against repository source:** 2026-10-17, baseline `8b0eca0` (Updated 2026-10-27 for Enhanced Admin AI Testing Lab, In/Out Inspector, Context Toggles, and Multi-Mode Reset).
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

## Admin AI Testing and Playground Endpoints

### `POST /api/admin/chat/test/message/`

**Access:** JWT, `IsAdminUser`.
Enables clinic staff to test triage models, inspect diagnostic metadata (`triage_summary`, `latency_ms`, `ai_session_id`, `history_count`), toggle context features (`include_history`, `include_patient`, `include_triage`), and inspect both the outbound payload to the AI service and the raw AI response.

```json
{
  "message": "علائم درد شدید و ترشح خونی ناگهانی دارم.",
  "session_id": "test_admin_1729000000_abc",
  "include_history": true,
  "include_patient": true,
  "include_triage": true,
  "simulated_patient": {
    "name": "مریم",
    "age": 45,
    "sex": "female"
  }
}
```

**Success:** `200 OK`:

```json
{
  "reply": "علائم ذکر شده وضعیت اورژانسی تلقی می‌شود...",
  "triage_level": "urgent",
  "triage_summary": "بیمار دارای علائم حاد ترشح خونی و درد شدید است.",
  "booking_offer": false,
  "emergency_code": "URG-XYZ123",
  "fallback": false,
  "session_id": "test_admin_1729000000_abc",
  "ai_session_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "history_count": 2,
  "latency_ms": 240,
  "outbound_payload": {
    "session_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "message": { "content": "...", "created_at": "..." },
    "history": [],
    "triage": null,
    "patient": { "name": "مریم", "age": 45, "sex": "female" }
  },
  "ai_response": {
    "reply": "...",
    "triage": { "level": "urgent", "summary": "..." }
  },
  "applied_toggles": {
    "include_history": true,
    "include_patient": true,
    "include_triage": true,
    "has_simulated_patient": true
  }
}
```

### `POST /api/admin/chat/test/reset/`

**Access:** JWT, `IsAdminUser`.
Supports 4 granular reset modes:
- `soft`: starts a new clean session on the client without deleting database records.
- `hard`: physically purges the active session, messages, and actions from the database.
- `triage`: resets `triage_level`, `triage_summary`, and emergency codes to null, preserving all conversation messages.
- `global_test`: purges all test sessions (`test_%`) and messages created by the admin.

```json
{
  "session_id": "test_admin_1729000000_abc",
  "mode": "hard"
}
```

**Success:** `200 OK`:

```json
{
  "detail": "حافظه نشست و سوابق پیام‌ها با موفقیت از دیتابیس پاک‌سازی شدند.",
  "session_id": "test_admin_1729000000_abc",
  "mode": "hard",
  "deleted_messages_count": 4,
  "success": true
}
```

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

## AI service boundary and stored actions

The backend sends `POST <AI_SERVICE_BASE_URL>/v1/chat` through `ai_client.py`, with a server-side bearer key and `X-Request-ID`. Its request body contains exactly:

- `session_id`: a backend-generated UUID, distinct from the widget's session key.
- `message`: `{content, created_at}` for the current message; timestamps are RFC 3339 UTC.
- `history`: at most 100 previous user/assistant messages, oldest first, excluding the current message and all backend-generated messages.
- `triage`: last successful `{level, summary}` or null.
- `patient`: known first name, computed age (0–120), and sex, or null; phone number and national ID are not added to this structured context. Message text/history themselves are forwarded.

Valid success bodies contain a nonempty `reply` and `triage` with an allowed level; actionable levels require a nonblank summary. Once low/high/urgent is reached, lower severity or a return to unknown/out-of-scope is rejected and uses the fallback. Successful replies update stored triage and summary on every turn.

The timeout defaults to 30 seconds. The client makes at most two attempts, separated by the configured delay (default 2 seconds), for transport failures and HTTP statuses other than 200/400/401. HTTP 400/401 and invalid success bodies are not retried. Fallback preserves previous triage and is stored as a backend message.

Actions run once per `(session, level)`, enforced by a database unique constraint: low/high record a booking offer; urgent records a unique `URG-` code and a backend message. Action failures are logged and retried on a later successful turn without failing that turn's reply.

Configuration: `AI_SERVICE_BASE_URL`, `AI_SERVICE_API_KEY`, `AI_SERVICE_CA_BUNDLE`, `AI_SERVICE_TIMEOUT`, `AI_SERVICE_RETRY_DELAY`, and `CLINIC_PHONE_NUMBER`. TLS verification remains enabled; the bundled private CA is the default trust bundle. Django system checks warn about missing service configuration, missing CA files, missing clinic number, and non-HTTPS production URLs. Source comments refer to an external `API.md` contract that is not present in this checkout.

## Verification sources

`apps/chat_gateway/{urls,admin_urls,views,views_admin,serializers,models,services,payload,ai_client,actions,constants,texts,checks}.py`; `apps/users/views_admin.py`; `config/settings.py`. Existing mocked contract/action/admin tests are in `apps/chat_gateway/tests.py`.
