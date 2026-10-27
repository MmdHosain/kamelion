import time

from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.generics import ListAPIView
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.appointments.pagination import AppointmentPagination
from apps.users.models import User

from . import constants as c
from .models import ChatMessage, ChatSession, TriageAction
from .serializers import (
    AdminChatMessageSerializer,
    AdminChatSessionDetailSerializer,
    AdminChatSessionSerializer,
    AdminResetChatSessionInputSerializer,
    AdminTestChatMessageInputSerializer,
)
from .services import (
    MessageSuperseded,
    SessionForbidden,
    get_or_create_session,
    process_patient_message,
)


def _get_patient(pk):
    """Patients are non-staff users (same rule as apps.users.views_admin)."""
    return get_object_or_404(User.objects.filter(is_staff=False), pk=pk)


def _patient_sessions(patient):
    return ChatSession.objects.filter(user=patient).prefetch_related("triage_actions")


class AdminPatientChatsView(ListAPIView):
    """
    GET /api/admin/patients/<pk>/chats/  - ALL of the patient's chats (not just the latest), newest
    activity first. Each has its latest triage (level, summary, emergency code) and its full
    conversation. Optional: ?level=urgent|high_priority|low_priority|unknown|out_of_scope
    """
    permission_classes = [IsAdminUser]
    serializer_class = AdminChatSessionDetailSerializer
    pagination_class = AppointmentPagination

    def get_queryset(self):
        qs = _patient_sessions(_get_patient(self.kwargs["pk"])).prefetch_related("messages")
        level = self.request.query_params.get("level")
        if level in c.TRIAGE_LEVELS:
            qs = qs.filter(triage_level=level)
        return qs.order_by("-updated_at", "-id")


class AdminPatientTriageLevelView(APIView):
    """
    GET /api/admin/patients/<pk>/triage_level/  - the patient's latest triage: the most recently
    active chat that has one. `emergency_code` is set when that triage is urgent.
    All fields are null when the patient has no triaged chat yet.
    """
    permission_classes = [IsAdminUser]

    def get(self, request, pk):
        session = (
            _patient_sessions(_get_patient(pk))
            .filter(triage_level__isnull=False)
            .order_by("-updated_at", "-id")
            .first()
        )
        if session is None:
            return Response({
                "id": None, "session_id": None, "triage_level": None, "triage_summary": None,
                "emergency_code": None, "created_at": None, "updated_at": None,
            })
        return Response(AdminChatSessionSerializer(session).data)


class AdminTestChatMessageView(APIView):
    """
    POST /api/admin/chat/test/message/
    Dedicated testing endpoint for clinic administrators to simulate AI triage dialogues,
    inspect raw triage metadata, toggle context features (history, patient demographics, prior triage),
    and inspect both the outbound payload to the AI service and the raw AI response.
    """
    permission_classes = [IsAdminUser]

    def post(self, request):
        serializer = AdminTestChatMessageInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        session_id = serializer.validated_data["session_id"]
        message_text = serializer.validated_data["message"]
        include_history = serializer.validated_data.get("include_history", True)
        include_patient = serializer.validated_data.get("include_patient", True)
        include_triage = serializer.validated_data.get("include_triage", True)
        simulated_patient = serializer.validated_data.get("simulated_patient")

        start_time = time.perf_counter()
        try:
            session = get_or_create_session(session_id, request.user)
            result = process_patient_message(
                session,
                message_text,
                include_history=include_history,
                include_triage=include_triage,
                include_patient=include_patient,
                simulated_patient=simulated_patient,
            )
        except SessionForbidden:
            return Response(
                {"detail": "این شناسه نشست متعلق به کاربر دیگری است."},
                status=status.HTTP_403_FORBIDDEN,
            )
        except MessageSuperseded:
            return Response(
                {"detail": "پیام دیگری در این نشست در حال پردازش است."},
                status=status.HTTP_409_CONFLICT,
            )

        latency_ms = int((time.perf_counter() - start_time) * 1000)

        session.refresh_from_db()
        history_count = session.messages.count()

        return Response(
            {
                "reply": result.get("reply", ""),
                "triage_level": result.get("triage_level", "unknown"),
                "triage_summary": session.triage_summary,
                "booking_offer": bool(result.get("booking_offer", False)),
                "emergency_code": result.get("emergency_code"),
                "fallback": bool(result.get("fallback", False)),
                "session_id": session.session_id,
                "ai_session_id": str(session.ai_session_id),
                "history_count": history_count,
                "latency_ms": latency_ms,
                # Deep Inspector metadata for the admin
                "outbound_payload": result.get("_outbound_payload"),
                "ai_response": result.get("_ai_response"),
                "applied_toggles": {
                    "include_history": include_history,
                    "include_patient": include_patient,
                    "include_triage": include_triage,
                    "has_simulated_patient": bool(simulated_patient),
                },
            },
            status=status.HTTP_200_OK,
        )


class AdminResetChatSessionView(APIView):
    """
    POST /api/admin/chat/test/reset/
    Comprehensive multi-mode reset endpoint for AI testing:
      * 'soft': acknowledges client-side clean slate, keeps db untouched
      * 'hard': physically deletes the current session, messages, and actions from db
      * 'triage': resets session.triage_level & triage_summary to null and removes emergency action, keeping messages
      * 'global_test': purges all test sessions ('test_%') created by this admin
    """
    permission_classes = [IsAdminUser]

    def post(self, request):
        serializer = AdminResetChatSessionInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        session_id = serializer.validated_data.get("session_id", "").strip()
        mode = serializer.validated_data.get("mode", "hard")

        if mode == "soft":
            return Response(
                {
                    "mode": "soft",
                    "detail": "ریست نرم انجام شد؛ سوابق قبلی در دیتابیس بدون تغییر حفظ شدند.",
                    "session_id": session_id,
                    "success": True,
                },
                status=status.HTTP_200_OK,
            )

        if mode == "triage":
            session = ChatSession.objects.filter(session_id=session_id).first()
            if not session:
                return Response(
                    {"detail": "نشست مورد نظر یافت نشد.", "session_id": session_id, "success": False},
                    status=status.HTTP_404_NOT_FOUND,
                )
            # Reset triage data
            session.triage_level = None
            session.triage_summary = None
            session.save(update_fields=["triage_level", "triage_summary", "updated_at"])
            # Remove any issued triage actions (such as emergency codes)
            deleted_actions = session.triage_actions.all().delete()[0]

            return Response(
                {
                    "mode": "triage",
                    "detail": "سطح تریاژ، خلاصه و کدهای ارجاع بازنشانی شدند؛ سوابق پیام‌ها حفظ گردیدند.",
                    "session_id": session_id,
                    "deleted_actions_count": deleted_actions,
                    "success": True,
                },
                status=status.HTTP_200_OK,
            )

        if mode == "global_test":
            # Delete all sessions starting with 'test_' owned by request.user (or any test_ session)
            test_sessions = ChatSession.objects.filter(session_id__startswith="test_")
            if not request.user.is_superuser:
                test_sessions = test_sessions.filter(user=request.user)

            total_sessions = test_sessions.count()
            total_messages = ChatMessage.objects.filter(session__in=test_sessions).count()
            test_sessions.delete()

            return Response(
                {
                    "mode": "global_test",
                    "detail": f"تمامی نشست‌های تستی پاک‌سازی شدند ({total_sessions} نشست و {total_messages} پیام).",
                    "deleted_sessions_count": total_sessions,
                    "deleted_messages_count": total_messages,
                    "success": True,
                },
                status=status.HTTP_200_OK,
            )

        # Default: mode == 'hard'
        session = ChatSession.objects.filter(session_id=session_id).first()
        deleted_messages = 0
        if session:
            deleted_messages = session.messages.count()
            session.delete()

        return Response(
            {
                "mode": "hard",
                "detail": "حافظه نشست و سوابق پیام‌ها با موفقیت از دیتابیس پاک‌سازی شدند.",
                "session_id": session_id,
                "deleted_messages_count": deleted_messages,
                "success": True,
            },
            status=status.HTTP_200_OK,
        )
