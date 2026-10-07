from rest_framework import serializers
from datetime import date

from django.utils import timezone

from .models import PatientNote, User


class RequestOTPSerializer(serializers.Serializer):
    phone_number = serializers.CharField(max_length=15)


class VerifyOTPSerializer(serializers.Serializer):
    phone_number = serializers.CharField(max_length=15)
    code = serializers.CharField(max_length=6)


class CompleteRegistrationSerializer(serializers.Serializer):
    """
    Second step for first-time patients only, after verify-otp comes
    back with a signup_token instead of logging them straight in.
    """
    signup_token = serializers.CharField(max_length=64)
    full_name = serializers.CharField(max_length=100)
    national_id = serializers.CharField(max_length=20)
    # Optional: may be left out, null or blank.
    sex = serializers.ChoiceField(
        choices=User.SEX_CHOICES, required=False, allow_null=True, allow_blank=True
    )
    date_of_birth = serializers.DateField(required=False, allow_null=True)

    def validate_date_of_birth(self, value):
        if value is None:
            return value
        today = timezone.localdate()
        if value > today:
            raise serializers.ValidationError("Date of birth cannot be in the future.")
        if value < date(today.year - 120, today.month, min(today.day, 28)):
            raise serializers.ValidationError("Date of birth is not plausible.")
        return value


class AdminLoginSerializer(serializers.Serializer):
    phone_number = serializers.CharField(max_length=15)
    password = serializers.CharField(write_only=True)


class RefreshTokenSerializer(serializers.Serializer):
    """
    Frontend sends the
    refresh token under the key "refreshToken" (camelCase), not SimpleJWT's
    default "refresh". This serializer accepts the frontend's field name
    and hands it off to SimpleJWT's own TokenRefreshSerializer internally.
    """
    refreshToken = serializers.CharField()


class PatientNoteSerializer(serializers.ModelSerializer):
    """
    POST /api/admin/patients/<id>/notes/
    """
    author_name = serializers.CharField(source="author.full_name", read_only=True, default=None)

    class Meta:
        model = PatientNote
        fields = ["id", "text", "author_name", "created_at"]
        read_only_fields = ["id", "author_name", "created_at"]


class PatientListSerializer(serializers.Serializer):
    """
    GET /api/admin/patients/?search= - one row per patient.
    """
    id = serializers.IntegerField()
    full_name = serializers.CharField()
    phone_number = serializers.CharField()
    last_appointment = serializers.DateField(allow_null=True)
    appointment_count = serializers.IntegerField()
    notes_count = serializers.IntegerField()
    triage_level = serializers.CharField(allow_null=True)


class PatientDetailSerializer(serializers.Serializer):
    """
    GET /api/admin/patients/<id>/ - full dossier.
    """
    id = serializers.IntegerField()
    full_name = serializers.CharField()
    phone_number = serializers.CharField()
    national_id = serializers.CharField(allow_null=True)
    sex = serializers.CharField(allow_null=True)
    date_of_birth = serializers.DateField(allow_null=True)
    appointments = serializers.ListField()
    notes = PatientNoteSerializer(many=True)


class AdminPatientUpdateSerializer(serializers.Serializer):
    """
    PUT/PATCH /api/admin/patients/<id>/ - admin editing a patient's
    own info. Both fields optional so the admin can send just one.
    """
    full_name = serializers.CharField(max_length=100, required=False, allow_blank=True)
    national_id = serializers.CharField(max_length=20, required=False, allow_blank=True, allow_null=True)
