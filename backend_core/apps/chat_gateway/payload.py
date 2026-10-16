"""Builds the POST /v1/chat request body (API.md §4.1 - §4.4)."""
from datetime import date, timezone as dt_timezone

from django.utils import timezone

from . import constants as c
from .models import ChatMessage


def to_rfc3339(value) -> str:
    """RFC 3339 in UTC, e.g. 2026-09-26T10:15:00Z (§2)."""
    return value.astimezone(dt_timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def build_history(session, current_message) -> list:
    """
    Earlier messages, oldest first (§4.3):
      * only patient messages and AI Service replies (never backend-generated ones)
      * never the current message
      * at most the 100 most recent items
    """
    rows = list(
        session.messages
        .filter(role__in=[ChatMessage.USER, ChatMessage.ASSISTANT])
        .exclude(pk=current_message.pk)
        .order_by("-created_at", "-id")[: c.HISTORY_MAX_ITEMS]
    )
    rows.reverse()
    return [
        {"role": m.role, "content": m.content, "created_at": to_rfc3339(m.created_at)}
        for m in rows
    ]


def build_triage(session):
    """The triage object from the last successful response, unchanged, or null (§4.1)."""
    if session.triage_level is None:
        return None
    return {"level": session.triage_level, "summary": session.triage_summary}


def _age_from(born: date):
    today = timezone.localdate()
    age = today.year - born.year - ((today.month, today.day) < (born.month, born.day))
    return age if c.PATIENT_AGE_MIN <= age <= c.PATIENT_AGE_MAX else None


def build_patient(user):
    """
    Known patient information (§4.4). Only name, age and sex may ever be sent
    (data minimisation): never the phone number, national ID or address.
    Returns None when nothing is known.
    """
    if user is None:
        return None

    patient = {}

    # "A first name is enough."
    full_name = (user.full_name or "").strip()
    if full_name:
        patient["name"] = full_name.split()[0][: c.PATIENT_NAME_MAX_LENGTH]

    if user.date_of_birth:
        age = _age_from(user.date_of_birth)
        if age is not None:
            patient["age"] = age

    if user.sex in ("female", "male"):
        patient["sex"] = user.sex

    return patient or None


def build_request(session, current_message, user) -> dict:
    return {
        "session_id": str(session.ai_session_id),
        "message": {
            "content": current_message.content,
            "created_at": to_rfc3339(current_message.created_at),
        },
        "history": build_history(session, current_message),
        "triage": build_triage(session),
        "patient": build_patient(user),
    }
