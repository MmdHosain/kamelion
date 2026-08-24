from rest_framework import serializers


class ChatMessageInputSerializer(serializers.Serializer):
    """
    POST /api/chat/message
    Payload: {"message": "...", "session_id": "...", "context": {}}
    """
    message = serializers.CharField(allow_blank=False, trim_whitespace=True)
    session_id = serializers.CharField(max_length=100)
    context = serializers.DictField(required=False, default=dict)


class ChatReplySerializer(serializers.Serializer):
    reply = serializers.CharField()
    is_emergency = serializers.BooleanField()
    emergency_code = serializers.CharField(allow_null=True)
    show_booking = serializers.BooleanField()
