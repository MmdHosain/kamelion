from rest_framework import serializers
from .models import DoctorAvailability, AvailabilityException, Appointment


class SlotQuerySerializer(serializers.Serializer):
    date = serializers.DateField()


class BookAppointmentSerializer(serializers.Serializer):
    date = serializers.DateField()
    time = serializers.TimeField()
    reason = serializers.CharField(required=False, allow_blank=True)


class AppointmentSerializer(serializers.ModelSerializer):

    class Meta:
        model = Appointment
        fields = [
            "id",
            "appointment_date",
            "appointment_time",
            "status",
            "reason",
            "created_at",
        ]


class DoctorAvailabilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = DoctorAvailability
        fields = "__all__"


class AvailabilityExceptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = AvailabilityException
        fields = "__all__"


class AppointmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appointment
        fields = "__all__"
