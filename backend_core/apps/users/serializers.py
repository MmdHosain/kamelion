from rest_framework import serializers
from .models import PatientProfile, PatientNote
from .models import User


class RequestOTPSerializer(serializers.Serializer):
    phone_number = serializers.CharField(max_length=15)


class VerifyOTPSerializer(serializers.Serializer):
    phone_number = serializers.CharField(max_length=15)
    code = serializers.CharField(max_length=6)
    full_name = serializers.CharField(
        max_length=100,
        required=False,
        allow_blank=True,
        allow_null=True
    )


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


class PatientDetailSerializer(serializers.Serializer):
    """
    GET /api/admin/patients/<id>/ - full dossier.
    """
    id = serializers.IntegerField()
    full_name = serializers.CharField()
    phone_number = serializers.CharField()
    national_id = serializers.CharField(allow_null=True)
    date_of_birth = serializers.DateField(allow_null=True)
    address = serializers.CharField(allow_null=True)
    appointments = serializers.ListField()
    notes = PatientNoteSerializer(many=True)
