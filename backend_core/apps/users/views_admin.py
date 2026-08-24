from django.db.models import Q, Count, Max
from rest_framework.views import APIView
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework import status

from .models import User, PatientProfile, PatientNote
from .serializers import PatientListSerializer, PatientDetailSerializer, PatientNoteSerializer


def _patient_queryset():
    """Patients are non-staff users - anyone who can log in as a regular user."""
    return User.objects.filter(is_staff=False)


class AdminPatientListView(APIView):
    """
    GET /api/admin/patients/?search= - Admin.
    Returns patient profiles + a summary of their appointment history.
    """
    permission_classes = [IsAdminUser]

    def get(self, request):
        queryset = _patient_queryset().annotate(
            appointment_count=Count("appointments", distinct=True),
            last_appointment=Max("appointments__appointment_date"),
            notes_count=Count("clinical_notes", distinct=True),
        )

        search = request.query_params.get("search", "").strip()
        if search:
            queryset = queryset.filter(
                Q(full_name__icontains=search) | Q(phone_number__icontains=search)
            )

        data = [
            {
                "id": u.id,
                "full_name": u.full_name or "",
                "phone_number": u.phone_number,
                "last_appointment": u.last_appointment,
                "appointment_count": u.appointment_count,
                "notes_count": u.notes_count,
            }
            for u in queryset.order_by("-last_appointment")
        ]

        serializer = PatientListSerializer(data, many=True)
        return Response(serializer.data)


class AdminPatientDetailView(APIView):
    """
    GET /api/admin/patients/<id>/ - Admin.
    Full dossier: profile fields, appointment history, clinical notes.
    """
    permission_classes = [IsAdminUser]

    def get(self, request, pk):
        try:
            patient = _patient_queryset().get(pk=pk)
        except User.DoesNotExist:
            return Response({"detail": "Patient not found"}, status=status.HTTP_404_NOT_FOUND)

        profile = PatientProfile.objects.filter(user=patient).first()

        appointments = [
            {
                "id": a.id,
                "date": a.appointment_date,
                "time": a.appointment_time.strftime("%H:%M:%S"),
                "status": a.status,
                "reason": a.reason,
            }
            for a in patient.appointments.order_by("-appointment_date", "-appointment_time")
        ]

        notes = PatientNote.objects.filter(patient=patient)

        data = {
            "id": patient.id,
            "full_name": patient.full_name or "",
            "phone_number": patient.phone_number,
            "national_id": profile.national_id if profile else None,
            "date_of_birth": profile.date_of_birth if profile else None,
            "address": profile.address if profile else None,
            "appointments": appointments,
            "notes": notes,
        }

        serializer = PatientDetailSerializer(data)
        return Response(serializer.data)


class AdminPatientNoteCreateView(APIView):
    """
    POST /api/admin/patients/<id>/notes/ - Admin.
    Payload accepts either {"text": "..."} or {"note": "..."} 
    """
    permission_classes = [IsAdminUser]

    def post(self, request, pk):
        try:
            patient = _patient_queryset().get(pk=pk)
        except User.DoesNotExist:
            return Response({"detail": "Patient not found"}, status=status.HTTP_404_NOT_FOUND)

        text = (request.data.get("text") or request.data.get("note") or "").strip()
        if not text:
            return Response({"detail": "Note text is required."}, status=status.HTTP_400_BAD_REQUEST)

        note = PatientNote.objects.create(patient=patient, author=request.user, text=text)

        return Response(PatientNoteSerializer(note).data, status=status.HTTP_201_CREATED)
