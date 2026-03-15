from rest_framework import serializers
from .models import PatientProfile


class RequestOTPSerializer(serializers.Serializer):
    phone_number = serializers.CharField(max_length=15)


class VerifyOTPSerializer(serializers.Serializer):
    phone_number = serializers.CharField(max_length=15)
    code = serializers.CharField(max_length=6)


class PatientProfileSerializer(serializers.ModelSerializer):

    phone_number = serializers.CharField(source="user.phone_number", read_only=True)

    class Meta:
        model = PatientProfile
        fields = [
            "phone_number",
            "first_name",
            "last_name",
            "date_of_birth",
            "gender",
        ]