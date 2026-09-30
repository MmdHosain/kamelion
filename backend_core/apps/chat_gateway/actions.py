"""
Backend actions of API.md §5, run after a successful AI Service call.

  low_priority / high_priority -> offer the patient a reservation (the frontend shows the
                                  "make a reservation" button)
  urgent                       -> generate an emergency code and show it to the patient

Actions do NOT wait for the conversation to end. The AI Service re-triages the session on every
message, and an action runs on the turn where the session reaches its level.

To add a new action later, write a handler `(session, level, patient_text)` that creates the
TriageAction row (plus anything else it needs) and add it to HANDLERS.
"""
import logging
import secrets

from django.db import transaction

from . import constants as c
from .models import ChatMessage, TriageAction
from .texts import emergency_code_message

logger = logging.getLogger(__name__)

# No 0/O/1/I/L: the code is read out and typed by people.
_CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"
_CODE_LENGTH = 6
_CODE_PREFIX = "URG-"


def generate_emergency_code() -> str:
    for _ in range(20):
        code = _CODE_PREFIX + "".join(secrets.choice(_CODE_ALPHABET) for _ in range(_CODE_LENGTH))
        if not TriageAction.objects.filter(emergency_code=code).exists():
            return code
    raise RuntimeError("could not generate a unique emergency code")


def _offer_booking(session, level, patient_text):
    TriageAction.objects.create(session=session, level=level, kind=TriageAction.BOOKING_OFFER)


def _issue_emergency_code(session, level, patient_text):
    code = generate_emergency_code()
    TriageAction.objects.create(
        session=session, level=level, kind=TriageAction.EMERGENCY_CODE, emergency_code=code
    )
    # Kept in the conversation record. Backend messages are never sent as history (§4.3).
    ChatMessage.objects.create(
        session=session,
        role=ChatMessage.BACKEND,
        kind=ChatMessage.EMERGENCY_CODE,
        content=emergency_code_message(patient_text, code),
    )


HANDLERS = {
    c.LOW_PRIORITY: _offer_booking,
    c.HIGH_PRIORITY: _offer_booking,
    c.URGENT: _issue_emergency_code,
}


def run_actions(session, patient_text: str) -> None:
    """
    Run the action of the session's current level unless it already ran (§5.2 rules 1 and 2).

    Checking "has this level's action run?" instead of "did the level change?" gives the same
    once-per-level result, and a failed action is retried on the next successful turn. A failure
    never breaks the patient's reply (§5.2 rule 6: the backend handles its own failures).
    """
    level = session.triage_level
    handler = HANDLERS.get(level)
    if handler is None or session.triage_actions.filter(level=level).exists():
        return
    try:
        with transaction.atomic():
            handler(session, level, patient_text)
    except Exception:
        logger.exception("Triage action for level %s failed (session pk=%s)", level, session.pk)


def patient_actions(session) -> dict:
    """What the frontend must show, derived from the stored state (also correct after a fallback)."""
    level = session.triage_level
    emergency_code = None
    if level == c.URGENT:
        emergency_code = (
            session.triage_actions.filter(level=c.URGENT).values_list("emergency_code", flat=True).first()
        )
    return {
        "booking_offer": level in (c.LOW_PRIORITY, c.HIGH_PRIORITY),
        "emergency_code": emergency_code,
    }
