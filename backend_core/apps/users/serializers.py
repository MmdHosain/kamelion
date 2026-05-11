from rest_framework import serializers
from .models import PatientProfile


class RequestOTPSerializer(serializers.Serializer):
    phone_number = serializers.CharField(max_length=15)


class VerifyOTPSerializer(serializers.Serializer):
    phone_number = serializers.CharField(max_length=15)
    code = serializers.CharField(max_length=6)

class PatientProfileSerializer(serializers.ModelSerializer):
    phone_number = serializers.CharField(source="user.phone_number", read_only=True)
    full_name = serializers.CharField(source="user.full_name", required=False)

    def update(self, instance, validated_data):
        user_data = validated_data.pop("user", {})

        if "full_name" in user_data:
            instance.user.full_name = user_data["full_name"]
            instance.user.save()

        return super().update(instance, validated_data)


    class Meta:
        model = PatientProfile
        fields = [
            "phone_number",
            "full_name",
            "national_id",
            "date_of_birth",
            "address",
        ]
    

