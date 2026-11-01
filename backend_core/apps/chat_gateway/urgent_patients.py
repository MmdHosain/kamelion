"""Admin list of patients whose latest triage is urgent and whose code is valid."""
from datetime import timedelta

from django.db.models import OuterRef, Subquery
from django.utils import timezone
from rest_framework import serializers
from rest_framework.generics import ListAPIView
from rest_framework.permissions import IsAdminUser

from apps.appointments.pagination import AppointmentPagination

from . import constants as c
from .models import ChatSession, TriageAction


class UrgentPatientSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(source="session.user_id")
    full_name = serializers.SerializerMethodField()
    phone_number = serializers.CharField(source="session.user.phone_number")
    chat_id = serializers.IntegerField(source="session_id")
    session_id = serializers.CharField(source="session.session_id")
    triage_level = serializers.CharField(source="session.triage_level")
    triage_summary = serializers.CharField(source="session.triage_summary", allow_null=True)
    assessed_at = serializers.DateTimeField(source="session.updated_at")
    emergency_code_expires_at = serializers.DateTimeField(read_only=True)
    # Membership was evaluated against one timestamp for the entire request.
    emergency_code_is_expired = serializers.SerializerMethodField()

    class Meta:
        model = TriageAction
        fields = [
            "id", "full_name", "phone_number", "chat_id", "session_id",
            "triage_level", "triage_summary", "assessed_at", "emergency_code",
            "emergency_code_issued_at", "emergency_code_expires_at",
            "emergency_code_is_expired",
        ]

    def get_full_name(self, obj):
        return obj.session.user.full_name or ""

    def get_emergency_code_is_expired(self, obj):
        return False


class AdminUrgentPatientsView(ListAPIView):
    """GET /api/admin/patients/urgent/; one latest triaged session per patient."""
    permission_classes = [IsAdminUser]
    serializer_class = UrgentPatientSerializer
    pagination_class = AppointmentPagination

    def get_queryset(self):
        # Select the latest triaged chat BEFORE testing urgency or expiry. An older
        # urgent chat must not reappear when the newer assessment is nonurgent/expired.
        latest = ChatSession.objects.filter(
            user_id=OuterRef("session__user_id"), triage_level__isnull=False,
        ).order_by("-updated_at", "-id")
        return (
            TriageAction.objects.filter(
                session_id=Subquery(latest.values("id")[:1]),
                session__user__is_staff=False,
                session__triage_level=c.URGENT,
                level=c.URGENT,
                kind=TriageAction.EMERGENCY_CODE,
                emergency_code__isnull=False,
                emergency_code_issued_at__gt=timezone.now() - timedelta(days=7),
            )
            .exclude(emergency_code="")
            .select_related("session__user")
            .order_by("-session__updated_at", "-session_id")
        )
