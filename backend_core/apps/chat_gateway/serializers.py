from rest_framework import serializers

from . import constants as c


class ChatMessageInputSerializer(serializers.Serializer):
    """
    POST /api/chat/message
    Payload: {"message": "...", "session_id": "..."}

    `message` follows API.md §4.2: 1-4,000 characters after trimming whitespace.
    Patient data, history and triage are never taken from the client: the backend
    builds them itself (§1: the backend is the single source of truth).
    """
    message = serializers.CharField(
        trim_whitespace=True,
        allow_blank=False,
        min_length=c.MESSAGE_MIN_LENGTH,
        max_length=c.MESSAGE_MAX_LENGTH,
    )
    session_id = serializers.CharField(max_length=100)


class ChatReplySerializer(serializers.Serializer):
    # Plain text as sent by the AI Service: may contain "\n", no Markdown or HTML.
    reply = serializers.CharField()
    # The session's current level. `triage.summary` is for staff and never returned here.
    triage_level = serializers.CharField()
    # True when `reply` is the backend's fixed fallback message (§7.3).
    fallback = serializers.BooleanField()
