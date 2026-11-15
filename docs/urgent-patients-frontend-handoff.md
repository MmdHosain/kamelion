# Urgent patients frontend integration guide

Kamelion Healthcare Platform · Frontend handoff · 31 October 2026

## Purpose and current status

Use `GET /api/admin/patients/urgent/` to build the admin list of patients whose latest assessment is urgent and whose emergency referral code is still valid. The backend owns urgency, code generation, expiry, and renewal. The frontend displays the returned queue and opens the existing patient dossier and chat history.

The endpoint and expiry logic are implemented in the repository. Deployment availability has not been verified. The database migration `chat_gateway.0005_emergency_code_issued_at` must be applied before using this version. The separate urgent-patient screen and its API wrapper have not yet been connected in the frontend.

This guide describes implemented behavior. The integration notes and QA checklist describe the frontend work still to do. All example data below is illustrative.

## How the urgent flow works

1. An authenticated patient sends a chat message to `POST /api/chat/message`.
2. The backend sends it to the AI service and validates the response.
3. If the AI returns `triage.level = "urgent"`, the backend saves the urgent assessment and staff summary, then issues a unique code such as `URG-AB2CD3` if this session has no valid code.
4. The patient receives the AI reply and emergency code. The existing chat widget displays a red card with the code, a copy button, and a button to call the clinic.
5. The patient appears in the admin urgent queue if their latest assessment is urgent and the corresponding code is unexpired.
6. The code expires exactly seven days after issuance. The patient is then excluded from subsequent queue responses.
7. After expiry, another successful urgent assessment issues a new code with a new seven-day lifetime. The patient appears again if that assessment is their latest.

An urgent classification does not automatically book an appointment, send an SMS, notify staff, or contact emergency services. The urgent chat response has `booking_offer: false`.

## Code lifetime and queue membership

| Situation | Backend behavior | Active urgent queue |
| --- | --- | --- |
| First successful urgent assessment in a chat session | Issue a code valid for seven days | Included if this is the latest assessment |
| Another urgent assessment before expiry in the same session | Keep the same code and original expiry | Included |
| Code reaches its expiry timestamp | Retain the record; do not downgrade urgency or renew automatically | Excluded |
| Successful urgent assessment after expiry | Replace the expired code and append a new issuance message | Included with the new code if latest |
| AI service fails or returns a rejected downgrade | Use fallback; do not renew the code | Included only if the latest urgent session still has a valid code |
| Code issuance or renewal fails | Preserve the AI reply; retry the action on a later successful urgent turn | Excluded if no valid code exists |
| A newer assessment in another chat is nonurgent | Keep the older chat in history | Excluded even if the older urgent code is still valid |
| Multiple urgent chat sessions exist | Select the latest assessed session first | One row per patient |

Expiry is `issued_at + 168 hours`, not the end of the seventh calendar day. A code is expired when `expires_at <= current server time`. Existing codes use their original issuance date, so deployment does not grant them another week.

Code reuse and renewal are tracked per chat session. A different chat session can receive its own code. For the queue, the backend first selects each patient's latest session with a non-null triage using `updated_at DESC, id DESC`, then checks urgency and code validity. A new chat that has not received a triage result does not replace an earlier assessment. An expired or missing code in the latest assessed chat does not cause the backend to fall back to an older valid code.

Expired codes and their issuance messages remain in history. Expiry does not mean the patient's clinical status has been resolved. Absence from the active queue is not proof that a patient is nonurgent.

## Endpoint map

Use the API host configured for the environment. These are full HTTP paths; keep trailing slashes exactly as shown.

| Method and endpoint | Purpose | Access |
| --- | --- | --- |
| `GET /api/admin/patients/urgent/` | Paginated active urgent queue with expiry metadata | Admin |
| `GET /api/admin/patients/{patient_id}/` | Open the patient's clinical dossier | Admin |
| `GET /api/admin/patients/{patient_id}/triage_level/` | Latest triage and staff summary | Admin |
| `GET /api/admin/patients/{patient_id}/chats/` | Paginated conversation history with full stored messages | Admin |
| `GET /api/admin/patients/{patient_id}/chats/?level=urgent` | Urgent conversations for one patient, including historical sessions | Admin |
| `GET /api/admin/patients/?search={name_or_phone}` | General patient list and name or phone search | Admin |
| `POST /api/chat/message` | Send a patient message and receive the triage reply | Authenticated |

Protected requests use:

```http
Authorization: Bearer <access_token>
Accept: application/json
```

Admin endpoints require `is_staff = true`. The patient-facing chat uses `IsAuthenticated`; it does not impose an additional patient-only role check. Use the existing `apiClient` for authentication and token refresh.

## Active urgent queue endpoint

```http
GET /api/admin/patients/urgent/?page=1&page_size=10
```

| Query parameter | Behavior |
| --- | --- |
| `page` | Page number; default 1 |
| `page_size` | Results per page; default 10, capped at 100 |

There is no search, date filter, or alternate sorting on this endpoint. Results are ordered by the selected session's `updated_at` descending, then its internal session ID descending. Staff accounts, ownerless sessions, missing codes, and expired codes are excluded.

### Success response

```json
{
  "count": 1,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 42,
      "full_name": "Example Patient",
      "phone_number": "09120000000",
      "chat_id": 7,
      "session_id": "widget-session-1",
      "triage_level": "urgent",
      "triage_summary": "Example staff-only clinical summary.",
      "assessed_at": "2026-10-31T10:00:00Z",
      "emergency_code": "URG-AB2CD3",
      "emergency_code_issued_at": "2026-10-31T10:00:00Z",
      "emergency_code_expires_at": "2026-11-07T10:00:00Z",
      "emergency_code_is_expired": false
    }
  ]
}
```

| Field | Type and meaning |
| --- | --- |
| `count` | Number of matching patients across all pages |
| `next`, `previous` | Pagination URLs, or `null` |
| `results` | Array of patient queue rows |
| `id` | Patient ID; use this for dossier, triage, and chat-history requests |
| `full_name` | Patient name; empty string if absent |
| `phone_number` | Patient contact number as a string |
| `chat_id` | Internal numeric chat session ID; different from patient ID |
| `session_id` | String session key used by the chat widget |
| `triage_level` | Always `"urgent"` in this queue |
| `triage_summary` | Staff-only summary; may be `null` for legacy records |
| `assessed_at` | Selected chat's `updated_at`, matching the existing latest-triage rule |
| `emergency_code` | Current code as a string |
| `emergency_code_issued_at` | Timestamp for the current code's issuance |
| `emergency_code_expires_at` | Issuance plus exactly seven days |
| `emergency_code_is_expired` | Always `false` for rows included in this response |

Queue membership is evaluated using one server timestamp for the request. A displayed row can expire after the response arrives. Parse timestamps with their timezone offsets; examples use UTC `Z`, but any valid returned offset must be respected. Formatting dates for Persian display must not change the underlying instant.

### Empty response

```json
{"count": 0, "next": null, "previous": null, "results": []}
```

An empty successful response is different from a failed request. Keep loading, empty, access-denied, and network/server error states separate. User-facing copy and the refresh interval have not been specified by this backend change.

## Patient details and historical review

### Open a dossier

```http
GET /api/admin/patients/42/
```

Use the queue row's `id`, not `chat_id`. This existing endpoint returns patient identity fields, appointment history, and clinical notes for the existing dossier UI.

### Fetch the latest triage

```http
GET /api/admin/patients/42/triage_level/
```

```json
{
  "id": 7,
  "session_id": "widget-session-1",
  "triage_level": "urgent",
  "triage_summary": "Example staff-only clinical summary.",
  "emergency_code": "URG-AB2CD3",
  "created_at": "2026-10-31T09:50:00Z",
  "updated_at": "2026-10-31T10:00:00Z"
}
```

In this response, `id` is the chat session ID. All seven fields are `null` if no triaged session exists. This endpoint does not return code issue or expiry metadata. Its `emergency_code` may be expired: code presence here does not establish active queue membership. Session `created_at` and `updated_at` are not substitutes for the current code's issue time, especially after renewal.

### Fetch conversations

```http
GET /api/admin/patients/42/chats/?page=1&page_size=10
GET /api/admin/patients/42/chats/?level=urgent&page=1&page_size=10
```

These return `{count, next, previous, results}`, with the same 10-item default and 100-item maximum. Each row contains the triage fields above plus `message_count`, `last_message_at`, and `messages`. Messages contain `id`, `role`, `kind`, `content`, and `created_at`. Roles are `user`, `assistant`, or `backend`; backend kinds include `fallback` and `emergency_code`.

Sessions are newest activity first. Each session includes its complete stored conversation, ordered oldest message first, with no separate message pagination. Urgent filtering selects urgent sessions; it does not filter code expiry. Old code issuance messages remain visible after renewal. Keep staff summaries and these admin responses inside the admin interface.

### General patient list

`GET /api/admin/patients/` returns an unpaginated array with each patient's latest `triage_level` and supports name or phone search. It does not support an urgent-only query filter and does not expose expiry metadata. Use the new queue endpoint for the active urgent screen rather than filtering the general list in the browser.

## Patient chat contract

```http
POST /api/chat/message
Content-Type: application/json
```

```json
{"message": "Example patient symptom message", "session_id": "widget-session-1"}
```

The message is required, trimmed, and 1–4000 characters. The session ID is required, nonblank, and at most 100 characters. The backend constructs history and patient context; the browser does not send those fields or decide the triage level.

Example successful urgent response:

```json
{
  "reply": "Example AI reply for the patient.",
  "triage_level": "urgent",
  "booking_offer": false,
  "emergency_code": "URG-AB2CD3",
  "fallback": false
}
```

Allowed levels are `unknown`, `out_of_scope`, `low_priority`, `high_priority`, and `urgent`. Low/high priority offer normal booking. Actionable severity cannot decrease within the same session; an AI downgrade is rejected and produces fallback. A separate newer session can have a different level and determine the patient's latest assessment.

The chat response retains its existing five fields. It contains neither the staff summary nor code expiry metadata. `emergency_code` can be `null` if issuance failed. A handled AI error returns HTTP `200` with `fallback: true`, preserves the earlier triage, and may return the stored code even if it is expired. A fallback is not a new assessment or renewal.

The existing widget treats `urgent` alone as sufficient to render its code-issued card, so it can show that card without a code. When integrating this flow, distinguish urgent status from successful code issuance. Patient-facing expiry display cannot be implemented from the current chat response alone; do not call an admin-only endpoint with a patient token or infer expiry from chat timestamps.

## Errors and frontend handling

| Status | Where it applies | Meaning |
| --- | --- | --- |
| `400` | Chat message | Field validation failed |
| `401` | Protected endpoints | Missing, invalid, or expired authentication |
| `403` | Admin endpoints | Authenticated caller is not staff |
| `403` | Chat message | Session belongs to another patient |
| `404` | Dossier, triage, chats | Patient does not exist or the ID belongs to staff |
| `404` | Paginated lists | Requested page is outside the available range |
| `409` | Chat message | A newer message is being answered instead |
| Network error or `5xx` | Any endpoint | Request failed; do not present it as an empty queue |

Standard errors generally contain `detail`; chat validation errors use field keys. Exact translated UI copy is not defined here. Let the shared client handle its existing token-refresh flow before handling a final `401`. The urgent list has no live push connection or configured polling interval.

## Frontend service example

The existing `apiClient` already includes the API base path, normally `/api`. Its request path therefore starts with `/admin`, not `/api/admin`. Keep network calls in a dedicated API module and retain the pagination envelope.

The following is an integration example to add; it has not been installed into the frontend:

```js
// Example module at front-end/src/api/urgentPatientsService.js
import apiClient from '../lib/apiClient';

export const urgentPatientsService = {
  async list({ page = 1, pageSize = 10, signal } = {}) {
    const { data } = await apiClient.get('/admin/patients/urgent/', {
      params: { page, page_size: pageSize },
      signal,
    });
    return data; // { count, next, previous, results }
  },
};
```

Use `results` for rows and `count` for the total. Reuse `adminApi.getPatientDetail(row.id)`, `getPatientTriageLevel(row.id)`, and `getPatientChats(row.id, params)` for drill-down. A queue read never renews a code. A code replacement only follows a successful urgent chat assessment after expiry.

Use server-returned expiry dates for display. On a cached row reaching its expiry time, invalidate and refetch the queue; the server remains authoritative. Do not silently keep a stale row marked as valid. Preserve the exact code for copying, even if dates or other numeric values are localized. Do not infer a booked visit or promised appointment time from a code or stored system message.

## Integration QA checklist

- Admin access succeeds; patient tokens receive `403` and unauthenticated requests receive `401`.
- A patient with a latest urgent assessment and a valid code appears once.
- A newer nonurgent assessment excludes an older urgent case.
- An expired or missing latest code excludes the patient, even when an older code is valid.
- A code is excluded at the exact expiry timestamp and remains eligible immediately before it.
- Another urgent assessment before expiry preserves both the code and expiry.
- Another successful urgent assessment after expiry creates a new code and restores queue membership.
- AI failures and rejected downgrades do not renew expired codes.
- Dossier and history links use the patient ID; chat IDs are handled separately.
- Empty names, null legacy summaries, loading, empty results, and failed requests are handled distinctly.
- Pagination preserves the response envelope and supports the 10-item default and 100-item maximum.
- Expiry dates respect timezone offsets, and copy actions preserve the exact code.
- Historical codes are not treated as proof of current eligibility.

## Implementation references

Paths below are repository-relative so the handoff is portable between teammates.

- Detailed backend contract: `docs/architecture/api-endpoints-chat.md`.
- New queue view and serializer: `backend_core/apps/chat_gateway/urgent_patients.py`.
- Route registration: `backend_core/apps/chat_gateway/admin_urls.py`.
- Code issuance and renewal: `backend_core/apps/chat_gateway/actions.py`.
- Issue timestamp and derived expiry: `backend_core/apps/chat_gateway/models.py`.
- Existing-code backfill: `backend_core/apps/chat_gateway/migrations/0005_emergency_code_issued_at.py`.
- Existing frontend services: `front-end/src/api/admin.js`, `front-end/src/api/chatService.js`.
- Current patient chat card: `front-end/src/components/chat/ChatMessageItem.jsx`.

Verification from this implementation: 74 relevant backend tests passed using an isolated SQLite database, and the model and migration consistency check passed. This is not confirmation of deployment availability or live AI service behavior.
