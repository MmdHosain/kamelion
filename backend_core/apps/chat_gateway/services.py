import random
import logging

import httpx
from django.conf import settings

logger = logging.getLogger(__name__)

# Keywords (English + Persian) that route to the emergency branch of the
# local rule-based fallback. Mirrors the "clinical decision tree" the
# frontend's own FloatingChatWidget.jsx runs client-side (per
# frontend-api-evaluation.md section 3.9), so the backend's fallback stays
# consistent with what the frontend does when it can't reach the backend
# at all.
EMERGENCY_KEYWORDS = [
    "chest pain", "severe bleeding", "can't breathe", "cannot breathe",
    "unconscious", "severe pain",
    "خونریزی شدید", "درد شدید قفسه سینه", "تنگی نفس شدید", "بیهوش",
]

GENERIC_REPLY_EN = (
    "Based on what you've described, I'd recommend a clinical examination "
    "to get a proper assessment. Would you like to book an appointment?"
)
GENERIC_REPLY_FA = (
    "بر اساس علائم وارد شده، وضعیت شما نیازمند معاینه بالینی است. "
    "آیا مایلید وقت ملاقات رزرو کنید؟"
)
EMERGENCY_REPLY_EN = (
    "This sounds like it could be a medical emergency. Please contact "
    "emergency services or go to the nearest ER immediately."
)
EMERGENCY_REPLY_FA = (
    "این علائم می‌تواند نشان‌دهنده یک وضعیت اورژانسی باشد. لطفاً فوراً با "
    "اورژانس تماس بگیرید یا به نزدیک‌ترین مرکز درمانی مراجعه کنید."
)


def _is_farsi(text: str) -> bool:
    return any("\u0600" <= ch <= "\u06FF" for ch in text)


def _generate_emergency_code() -> str:
    return f"EMG-{random.randint(1000, 9999)}"


def _local_rule_based_triage(message: str) -> dict:
    """
    Local fallback triage - used when the external FastAPI LLM gateway
    (settings.FASTAPI_BASE_URL) is unreachable or not configured. Keeps
    the chat endpoint fully functional with zero external dependencies.
    """
    lowered = message.lower()
    is_emergency = any(kw.lower() in lowered for kw in EMERGENCY_KEYWORDS)
    farsi = _is_farsi(message)

    if is_emergency:
        reply = EMERGENCY_REPLY_FA if farsi else EMERGENCY_REPLY_EN
        return {
            "reply": reply,
            "is_emergency": True,
            "emergency_code": _generate_emergency_code(),
            "show_booking": False,
        }

    reply = GENERIC_REPLY_FA if farsi else GENERIC_REPLY_EN
    return {
        "reply": reply,
        "is_emergency": False,
        "emergency_code": None,
        "show_booking": True,
    }


def get_triage_reply(message: str, session_id: str, context: dict) -> dict:
    """
    Tries the external FastAPI triage/LLM gateway first (settings.FASTAPI_BASE_URL,
    already present in settings.py awaiting a real integration). Falls back to
    the local rule-based triage above on any failure, so this endpoint never
    hard-fails even if the external service is offline or unconfigured.
    """
    base_url = getattr(settings, "FASTAPI_BASE_URL", None)
    timeout = getattr(settings, "FASTAPI_TIMEOUT", 10)

    if base_url:
        try:
            resp = httpx.post(
                f"{base_url}/triage",
                json={"message": message, "session_id": session_id, "context": context},
                timeout=timeout,
            )
            resp.raise_for_status()
            data = resp.json()
            if "reply" in data:
                return {
                    "reply": data.get("reply"),
                    "is_emergency": bool(data.get("is_emergency", False)),
                    "emergency_code": data.get("emergency_code"),
                    "show_booking": bool(data.get("show_booking", True)),
                }
        except Exception as e:
            logger.info("FastAPI triage gateway unavailable, using local fallback: %s", e)

    return _local_rule_based_triage(message)
