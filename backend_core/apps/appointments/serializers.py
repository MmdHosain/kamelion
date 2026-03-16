from rest_framework import serializers
from .models import Appointment


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
