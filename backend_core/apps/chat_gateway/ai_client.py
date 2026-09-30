"""
HTTP client for the AI Service (API.md §3, §4, §7).

Only this module talks to the AI Service. It does no database work.
"""
import logging
import time
import uuid

import httpx
from django.conf import settings

from . import constants as c

logger = logging.getLogger(__name__)


class AIServiceError(Exception):
    """The call failed and the caller must use the fallback (§7.3)."""


def _post(payload: dict) -> httpx.Response:
    """One HTTP attempt. Every attempt gets its own X-Request-ID (§2.1)."""
    request_id = str(uuid.uuid4())
    url = f"{settings.AI_SERVICE_BASE_URL.rstrip('/')}/v1/chat"
    headers = {
        "Authorization": f"Bearer {settings.AI_SERVICE_API_KEY}",
        "Content-Type": "application/json",
        "X-Request-ID": request_id,
    }
    response = httpx.post(url, json=payload, headers=headers, timeout=settings.AI_SERVICE_TIMEOUT)
    response.request_id = response.headers.get("X-Request-ID", request_id)
    return response


def _error_detail(response: httpx.Response) -> str:
    """The `error` object from §7.1, for logs. Never includes the request body."""
    try:
        error = response.json().get("error", {})
        return f"{error.get('code')}: {error.get('message')}"
    except Exception:
        return "unparseable error body"


def _validate(data) -> dict:
    """Check a 200 body against §4.5 / §4.6. Raises AIServiceError if it is off-contract."""
    if not isinstance(data, dict):
        raise AIServiceError("response body is not an object")

    reply = data.get("reply")
    triage = data.get("triage")
    if not isinstance(reply, str) or not reply.strip():
        raise AIServiceError("`reply` is missing or empty")
    if not isinstance(triage, dict):
        raise AIServiceError("`triage` is missing")

    level = triage.get("level")
    summary = triage.get("summary")
    if level not in c.TRIAGE_LEVELS:
        raise AIServiceError(f"unknown triage level {level!r}")
    if summary is not None and not isinstance(summary, str):
        raise AIServiceError("`triage.summary` must be a string or null")
    if level in c.ACTIONABLE_LEVELS and not (summary and summary.strip()):
        raise AIServiceError(f"`triage.summary` is required for level {level!r}")

    # Unknown fields are ignored (§2): only these two keys are passed on.
    return {"reply": reply, "triage": {"level": level, "summary": summary}}


def call_chat(payload: dict) -> dict:
    """
    POST /v1/chat with the retry rules from §7.2.

    * timeout: settings.AI_SERVICE_TIMEOUT (30 s)
    * 500 / 503 / timeout / connection error: retry ONCE after 2 s. This is safe
      because the AI Service has no side effects (§1).
    * 400 / 401: never retried.

    Returns {"reply": str, "triage": {"level": str, "summary": str | None}}.
    Raises AIServiceError when the caller must show the fallback message.
    """
    last_problem = "no attempt made"

    for attempt in (1, 2):
        try:
            response = _post(payload)
        except (httpx.TimeoutException, httpx.TransportError) as exc:
            last_problem = f"{type(exc).__name__}"
            logger.warning("AI Service call failed (attempt %s): %s", attempt, last_problem)
        else:
            request_id = response.request_id

            if response.status_code == 200:
                try:
                    return _validate(response.json())
                except (ValueError, AIServiceError) as exc:
                    # A 200 that breaks the contract is a bug on the other side.
                    # Retrying would not fix it.
                    logger.error("AI Service returned an invalid 200 body (request_id=%s): %s", request_id, exc)
                    raise AIServiceError(str(exc))

            if response.status_code in (400, 401):
                logger.error(
                    "AI Service rejected the call with %s, not retrying (request_id=%s): %s",
                    response.status_code, request_id, _error_detail(response),
                )
                raise AIServiceError(f"HTTP {response.status_code}")

            last_problem = f"HTTP {response.status_code}"
            logger.warning(
                "AI Service call failed (attempt %s, request_id=%s): %s %s",
                attempt, request_id, last_problem, _error_detail(response),
            )

        if attempt == 1:
            time.sleep(settings.AI_SERVICE_RETRY_DELAY)

    raise AIServiceError(last_problem)
