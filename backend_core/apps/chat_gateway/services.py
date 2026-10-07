"""
Orchestration of one patient message (API.md §6):

  1. store the patient's message
  2. build the request
  3. call POST /v1/chat (timeout + retry rules live in ai_client)
  4. on 200: store `reply`, store `triage`, run the backend action of the level (actions.py)
  5. on failure: fallback (§7.3)
"""
import logging

from django.db import transaction

from . import ai_client
from .actions import patient_actions, run_actions
from . import constants as c
from .models import ChatMessage, ChatSession
from .payload import build_request
from .texts import fallback_message

logger = logging.getLogger(__name__)


class SessionForbidden(Exception):
    """The session belongs to another patient."""


class MessageSuperseded(Exception):
    """
    This message is not the newest unanswered one, so another request is (or was) responsible
    for answering it. Only one request per session is ever sent to the AI Service, and its
    `message` is always the latest one (§6, Concurrency).
    """


def get_or_create_session(session_id: str, user) -> ChatSession:
    """The chat requires a logged-in patient, so every session has an owner."""
    session, _ = ChatSession.objects.get_or_create(session_id=session_id, defaults={"user": user})

    if session.user_id is None:
        # Session created before login was required: the first authenticated patient adopts it.
        session.user = user
        session.save(update_fields=["user", "updated_at"])
    elif session.user_id != user.pk:
        raise SessionForbidden()
    return session


def _latest_unanswered_user_message(session):
    """
    Patient messages that come after the last AI Service reply are unanswered. Backend
    generated messages (fallbacks) do not count as answers.
    """
    last_reply = (
        session.messages.filter(role=ChatMessage.ASSISTANT).order_by("-id").values_list("id", flat=True).first()
    )
    unanswered = session.messages.filter(role=ChatMessage.USER)
    if last_reply is not None:
        unanswered = unanswered.filter(id__gt=last_reply)
    return unanswered.order_by("-id").first()


def process_patient_message(session: ChatSession, text: str) -> dict:
    # 1. Store the patient's message.
    message = ChatMessage.objects.create(session=session, role=ChatMessage.USER, content=text)

    # Concurrency (§6): at most one request per session at a time. The row lock makes a second
    # request wait until the first has finished.
    with transaction.atomic():
        locked = ChatSession.objects.select_for_update().select_related("user").get(pk=session.pk)

        latest = _latest_unanswered_user_message(locked)
        if latest is None or latest.pk != message.pk:
            raise MessageSuperseded()

        # 2-3. Build the request and call the AI Service.
        payload = build_request(locked, message, locked.user)
        try:
            result = ai_client.call_chat(payload)
            _reject_downgrade(locked.triage_level, result["triage"]["level"])
        except ai_client.AIServiceError:
            return _fallback(locked, text)

        # 4. Store `reply` as an assistant message, then store `triage`.
        ChatMessage.objects.create(session=locked, role=ChatMessage.ASSISTANT, content=result["reply"])

        new_triage = result["triage"]
        # §5.2 rule 4: always store the latest triage, the summary can be refined on any turn.
        locked.triage_level = new_triage["level"]
        locked.triage_summary = new_triage["summary"]
        locked.save(update_fields=["triage_level", "triage_summary", "updated_at"])

        # §5: the action of the level the session is in (once per level).
        run_actions(locked, text)

        return {
            "reply": result["reply"],
            "triage_level": new_triage["level"],
            "fallback": False,
            **patient_actions(locked),
        }


def _reject_downgrade(previous_level, new_level) -> None:
    """§5.1: a session that reached low/high/urgent never goes down or back to unknown/out_of_scope."""
    if previous_level in c.SEVERITY and (
        new_level not in c.SEVERITY or c.SEVERITY[new_level] < c.SEVERITY[previous_level]
    ):
        logger.error(
            "AI Service broke the triage guarantee (§5.1): %s -> %s. Response discarded.",
            previous_level, new_level,
        )
        raise ai_client.AIServiceError("triage level went down")


def _fallback(session: ChatSession, patient_text: str) -> dict:
    """§7.3: fixed message, stored triage untouched, never sent back as history."""
    text = fallback_message(patient_text)
    ChatMessage.objects.create(
        session=session, role=ChatMessage.BACKEND, kind=ChatMessage.FALLBACK, content=text
    )
    return {
        "reply": text,
        "triage_level": session.triage_level or "unknown",
        "fallback": True,
        **patient_actions(session),
    }
