from rest_framework import serializers

from . import constants as c
from .models import ChatMessage, ChatSession


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
    # True for low_priority and high_priority: the frontend shows "make a reservation".
    booking_offer = serializers.BooleanField()
    # Set while the session is urgent: the code the frontend shows to the patient.
    emergency_code = serializers.CharField(allow_null=True)
    # True when `reply` is the backend's fixed fallback message (§7.3).
    fallback = serializers.BooleanField()


class AdminChatSessionSerializer(serializers.ModelSerializer):
    """Latest triage of a chat, for clinic staff. `triage_summary` is staff-only (API.md §4.6)."""
    emergency_code = serializers.SerializerMethodField()

    class Meta:
        model = ChatSession
        fields = ["id", "session_id", "triage_level", "triage_summary",
                  "emergency_code", "created_at", "updated_at"]

    def get_emergency_code(self, obj):
        if obj.triage_level != c.URGENT:
            return None
        # Reads the prefetched actions (see views_admin), so a list costs no extra query per row.
        for action in obj.triage_actions.all():
            if action.level == c.URGENT:
                return action.emergency_code
        return None


class AdminChatMessageSerializer(serializers.ModelSerializer):
    """One message of a chat, for clinic staff. `role` is patient / AI reply / backend generated."""

    class Meta:
        model = ChatMessage
        fields = ["id", "role", "kind", "content", "created_at"]


class AdminChatSessionDetailSerializer(AdminChatSessionSerializer):
    """Detailed chat for GET /api/admin/patients/<pk>/chats/: triage + the full conversation."""
    message_count = serializers.SerializerMethodField()
    last_message_at = serializers.SerializerMethodField()
    messages = serializers.SerializerMethodField()

    class Meta(AdminChatSessionSerializer.Meta):
        fields = AdminChatSessionSerializer.Meta.fields + ["message_count", "last_message_at", "messages"]

    def _messages(self, obj):
        # Reads the prefetched messages (see views_admin), so a page costs no query per chat.
        return list(obj.messages.all())

    def get_message_count(self, obj):
        return len(self._messages(obj))

    def get_last_message_at(self, obj):
        msgs = self._messages(obj)
        # Same timestamp format as the other datetime fields of this serializer.
        return serializers.DateTimeField().to_representation(msgs[-1].created_at) if msgs else None

    def get_messages(self, obj):
        return AdminChatMessageSerializer(self._messages(obj), many=True).data


class SimulatedPatientSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=50, required=False, allow_blank=True, allow_null=True)
    age = serializers.IntegerField(min_value=0, max_value=120, required=False, allow_null=True)
    sex = serializers.ChoiceField(choices=["female", "male"], required=False, allow_null=True)


class AdminTestChatMessageInputSerializer(serializers.Serializer):
    """
    POST /api/admin/chat/test/message/
    For clinic admins to test AI triage responses, inspector metadata, context toggles, and fallback handling.
    """
    message = serializers.CharField(
        trim_whitespace=True,
        allow_blank=False,
        min_length=c.MESSAGE_MIN_LENGTH,
        max_length=c.MESSAGE_MAX_LENGTH,
    )
    session_id = serializers.CharField(max_length=100)
    include_history = serializers.BooleanField(default=True, required=False)
    include_patient = serializers.BooleanField(default=True, required=False)
    include_triage = serializers.BooleanField(default=True, required=False)
    simulated_patient = SimulatedPatientSerializer(required=False, allow_null=True)


class AdminResetChatSessionInputSerializer(serializers.Serializer):
    """
    POST /api/admin/chat/test/reset/
    Supports 4 reset modes:
      * 'soft': client-side reset / new session ID, preserves db records
      * 'hard': physical deletion of the current session & messages from db
      * 'triage': resets triage_level & summary to null and deletes emergency actions, keeps messages
      * 'global_test': wipes all test sessions created by this admin
    """
    session_id = serializers.CharField(max_length=100, required=False, allow_blank=True)
    mode = serializers.ChoiceField(
        choices=["soft", "hard", "triage", "global_test"],
        default="hard",
    )
