from django.shortcuts import get_object_or_404
from rest_framework.generics import ListAPIView
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.appointments.pagination import AppointmentPagination
from apps.users.models import User

from . import constants as c
from .models import ChatSession
from .serializers import AdminChatSessionSerializer


def _get_patient(pk):
    """Patients are non-staff users (same rule as apps.users.views_admin)."""
    return get_object_or_404(User.objects.filter(is_staff=False), pk=pk)


def _patient_sessions(patient):
    return ChatSession.objects.filter(user=patient).prefetch_related("triage_actions")


class AdminPatientChatsView(ListAPIView):
    """
    GET /api/admin/patients/<pk>/chats/  - the patient's chats with the latest triage of each,
    newest activity first. Optional: ?level=urgent|high_priority|low_priority|unknown|out_of_scope
    """
    permission_classes = [IsAdminUser]
    serializer_class = AdminChatSessionSerializer
    pagination_class = AppointmentPagination

    def get_queryset(self):
        qs = _patient_sessions(_get_patient(self.kwargs["pk"]))
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
