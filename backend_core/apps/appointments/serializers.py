from rest_framework import serializers
from .models import DoctorAvailability, AvailabilityException, Appointment
from rest_framework import serializers
from .models import DoctorAvailability



class SlotQuerySerializer(serializers.Serializer):
    date = serializers.DateField()


class BookAppointmentSerializer(serializers.Serializer):
    date = serializers.DateField()
    time = serializers.TimeField()
    reason = serializers.CharField(required=False, allow_blank=True)


class AdminBookAppointmentSerializer(serializers.Serializer):
    """
    Input for an admin booking an appointment on behalf of a patient,
    identified by full name + phone number rather than a JWT.
    """
    full_name = serializers.CharField(max_length=100)
    phone_number = serializers.CharField(max_length=15)
    date = serializers.DateField()
    time = serializers.TimeField()
    reason = serializers.CharField(required=False, allow_blank=True)

    def validate_full_name(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Full name cannot be empty.")
        return value

    def validate_phone_number(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Phone number cannot be empty.")
        return value


class DoctorAvailabilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = DoctorAvailability
        fields = [
            "id",
            "name",
            "days_of_week",
            "start_time",
            "end_time",
            "visit_duration",
            "time_gap",
            "is_active",
            "created_at",
            "updated_at",
        ]

    def validate_days_of_week(self, value):
        valid_days = {"SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"}

        if not isinstance(value, list) or not value:
            raise serializers.ValidationError("At least one day must be selected.")

        if len(set(value)) != len(value):
            raise serializers.ValidationError("Duplicate days are not allowed.")

        invalid = [day for day in value if day not in valid_days]
        if invalid:
            raise serializers.ValidationError(f"Invalid day(s): {', '.join(invalid)}")

        return value

    def validate(self, attrs):
        start_time = attrs.get("start_time", getattr(self.instance, "start_time", None))
        end_time = attrs.get("end_time", getattr(self.instance, "end_time", None))
        visit_duration = attrs.get("visit_duration", getattr(self.instance, "visit_duration", None))
        time_gap = attrs.get("time_gap", getattr(self.instance, "time_gap", None))
        days_of_week = attrs.get("days_of_week", getattr(self.instance, "days_of_week", []))

        if start_time and end_time and end_time <= start_time:
            raise serializers.ValidationError({"end_time": "End time must be after start time."})

        if visit_duration is not None and visit_duration <= 0:
            raise serializers.ValidationError({"visit_duration": "Visit duration must be greater than zero."})

        if time_gap is not None and time_gap < 0:
            raise serializers.ValidationError({"time_gap": "Gap cannot be negative."})

        queryset = DoctorAvailability.objects.all()
        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)

        conflicting_days = set()
        requested_days = set(days_of_week)

        for obj in queryset:
            overlap = requested_days.intersection(set(obj.days_of_week or []))
            conflicting_days.update(overlap)

        if conflicting_days:
            raise serializers.ValidationError({
                "days_of_week": f"These day(s) are already used in another schedule: {', '.join(sorted(conflicting_days))}"
            })

        return attrs



class AvailabilityExceptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = AvailabilityException
        fields = "__all__"

class AppointmentSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()

    phone_number = serializers.CharField(
        source="user.phone_number",
        read_only=True
    )

    class Meta:
        model = Appointment
        fields = [
            "id",
            "full_name",
            "phone_number",
            "appointment_date",
            "appointment_time",
            "status",
            "reason",
            "created_at",
            "updated_at",
        ]

    def get_full_name(self, obj):
        # Fall back to phone number so the admin table never shows
        # a blank name - most commonly hit for users who logged in
        # before full_name started being captured during OTP verify.
        return obj.user.full_name or obj.user.phone_number
class DoctorAvailabilityBulkSerializer(serializers.Serializer):
    schedules = serializers.ListField()

    def validate_schedules(self, schedules):
        valid_days = {"SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"}

        if not isinstance(schedules, list):
            raise serializers.ValidationError("Schedules must be a list.")

        used_days = set()

        for index, item in enumerate(schedules):
            days = item.get("days_of_week", [])
            start_time = item.get("start_time")
            end_time = item.get("end_time")
            visit_duration = item.get("visit_duration")
            time_gap = item.get("time_gap", 0)

            if not isinstance(days, list) or not days:
                raise serializers.ValidationError(f"Schedule #{index + 1}: at least one day must be selected.")

            if len(set(days)) != len(days):
                raise serializers.ValidationError(f"Schedule #{index + 1}: duplicate days are not allowed.")

            invalid = [d for d in days if d not in valid_days]
            if invalid:
                raise serializers.ValidationError(
                    f"Schedule #{index + 1}: invalid day(s): {', '.join(invalid)}"
                )

            overlap = used_days.intersection(set(days))
            if overlap:
                raise serializers.ValidationError(
                    f"Schedule #{index + 1}: these day(s) are already used in another schedule: {', '.join(sorted(overlap))}"
                )

            used_days.update(days)

            if not start_time or not end_time:
                raise serializers.ValidationError(f"Schedule #{index + 1}: start_time and end_time are required.")

            if end_time <= start_time:
                raise serializers.ValidationError(f"Schedule #{index + 1}: end_time must be after start_time.")

            if visit_duration is None or int(visit_duration) <= 0:
                raise serializers.ValidationError(f"Schedule #{index + 1}: visit_duration must be greater than zero.")

            if time_gap is None or int(time_gap) < 0:
                raise serializers.ValidationError(f"Schedule #{index + 1}: time_gap cannot be negative.")

        return schedules
    
class AvailabilityExceptionBulkSerializer(serializers.Serializer):
    exceptions = serializers.ListField()

    def validate_exceptions(self, exceptions):
        if not isinstance(exceptions, list):
            raise serializers.ValidationError("Exceptions must be a list.")

        for index, item in enumerate(exceptions):
            start_date = item.get("start_date")
            end_date = item.get("end_date")

            if not start_date or not end_date:
                raise serializers.ValidationError(
                    f"Exception #{index + 1}: start_date and end_date are required."
                )

            if end_date < start_date:
                raise serializers.ValidationError(
                    f"Exception #{index + 1}: end_date must be after or equal to start_date."
                )

        return exceptions