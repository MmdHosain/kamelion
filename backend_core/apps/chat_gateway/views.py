from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .models import ChatSession, ChatMessage
from .serializers import ChatMessageInputSerializer, ChatReplySerializer
from .services import get_triage_reply


class ChatMessageView(APIView):
    """
    POST /api/chat/message - Public / Authenticated.
    """
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        serializer = ChatMessageInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        message = serializer.validated_data["message"]
        session_id = serializer.validated_data["session_id"]
        context = serializer.validated_data.get("context", {})

        user = request.user if request.user and request.user.is_authenticated else None
        session, _ = ChatSession.objects.get_or_create(
            session_id=session_id,
            defaults={"user": user},
        )

        ChatMessage.objects.create(session=session, sender=ChatMessage.USER, text=message)

        result = get_triage_reply(message, session_id, context)

        ChatMessage.objects.create(
            session=session,
            sender=ChatMessage.BOT,
            text=result["reply"],
            is_emergency=result["is_emergency"],
            emergency_code=result["emergency_code"],
        )

        return Response(ChatReplySerializer(result).data, status=status.HTTP_200_OK)
