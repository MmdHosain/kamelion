from rest_framework import serializers
from .models import DoctorAvailability, AvailabilityException, Appointment
from apps.users.models import User


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

class AdminAppointmentListSerializer(serializers.ModelSerializer):
    phone_number = serializers.CharField(source="user.phone_number", read_only=True)
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = Appointment
        fields = [
            "id",
            "phone_number",
            "full_name",
            "appointment_date",
            "appointment_time",
            "status",
            "reason",
            "created_at",
        ]

    def get_full_name(self, obj):
        user = obj.user

        if hasattr(user, "get_full_name"):
            full_name = user.get_full_name()
            if full_name:
                return full_name

        first_name = getattr(user, "first_name", "") or ""
        last_name = getattr(user, "last_name", "") or ""
        full_name = f"{first_name} {last_name}".strip()

        return full_name or user.phone_number


class AdminAppointmentCreateSerializer(serializers.Serializer):
    phone_number = serializers.CharField()
    full_name = serializers.CharField(required=False, allow_blank=True)
    appointment_date = serializers.DateField()
    appointment_time = serializers.TimeField()
    reason = serializers.CharField(required=False, allow_blank=True)
    force_create_user = serializers.BooleanField(default=False, write_only=True)

    def validate(self, attrs):
        phone_number = attrs["phone_number"]
        full_name = attrs.get("full_name")
        force_create = attrs.get("force_create_user", False)

        exists = Appointment.objects.filter(
            appointment_date=attrs["appointment_date"],
            appointment_time=attrs["appointment_time"],
            status=Appointment.SCHEDULED,
        ).exists()

        if exists:
            raise serializers.ValidationError({
                "appointment_time": "This appointment slot is already booked."
            })

        user = User.objects.filter(phone_number=phone_number).first()

        if not user:
            if not force_create:
                raise serializers.ValidationError({
                    "user_exists": [False],
                    "detail": ["No user exists with this phone number."],
                })

            user = User.objects.create_user(
                phone_number=phone_number,
                full_name=full_name,
            )

        attrs["user"] = user
        return attrs


    def create(self, validated_data):
        validated_data.pop("force_create_user", None)

        return Appointment.objects.create(
            user=validated_data["user"],
            appointment_date=validated_data["appointment_date"],
            appointment_time=validated_data["appointment_time"],
            reason=validated_data.get("reason", ""),
            status=Appointment.SCHEDULED,
        )

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

