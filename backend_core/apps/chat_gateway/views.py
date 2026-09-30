from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.authentication import JWTAuthentication

from .serializers import ChatMessageInputSerializer, ChatReplySerializer
from .services import (
    MessageSuperseded,
    SessionForbidden,
    get_or_create_session,
    process_patient_message,
)


class ChatMessageView(APIView):
    """
    POST /api/chat/message - authenticated patients only (JWT: "Authorization: Bearer <access>").

    200  reply for the patient (see ChatReplySerializer)
    400  validation error
    401  missing, invalid or expired token
    403  the session belongs to another patient
    409  a newer message in this session is being answered instead of this one
    """
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChatMessageInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            session = get_or_create_session(serializer.validated_data["session_id"], request.user)
            result = process_patient_message(session, serializer.validated_data["message"])
        except SessionForbidden:
            return Response(
                {"detail": "This chat session belongs to another patient."},
                status=status.HTTP_403_FORBIDDEN,
            )
        except MessageSuperseded:
            return Response(
                {"detail": "A newer message in this session is being answered."},
                status=status.HTTP_409_CONFLICT,
            )

        return Response(ChatReplySerializer(result).data, status=status.HTTP_200_OK)
