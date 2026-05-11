# apps/appointments/models.py

from django.db import models
from django.core.exceptions import ValidationError
import datetime

from apps.users.models import User


class DoctorAvailability(models.Model):
    """
    Defines the doctor's weekly working schedule.
    Since this is a single‑doctor clinic, we only store the day of week
    and the working hours for that day.
    """

    # Constants for weekday values stored in the database
    MONDAY = "MON"
    TUESDAY = "TUE"
    WEDNESDAY = "WED"
    THURSDAY = "THU"
    FRIDAY = "FRI"
    SATURDAY = "SAT"
    SUNDAY = "SUN"

    # Choices allow Django admin/forms to display readable names
    DAY_CHOICES = [
        (MONDAY, "Monday"),
        (TUESDAY, "Tuesday"),
        (WEDNESDAY, "Wednesday"),
        (THURSDAY, "Thursday"),
        (FRIDAY, "Friday"),
        (SATURDAY, "Saturday"),
        (SUNDAY, "Sunday"),
    ]

    # Which weekday this rule applies to
    day_of_week = models.CharField(
        max_length=3,
        choices=DAY_CHOICES,
        unique=True,
        help_text="Day of the week this availability applies to."
    )

    # Start of clinic working hours
    start_time = models.TimeField(
        help_text="Start of working hours."
    )

    # End of clinic working hours
    end_time = models.TimeField(
        help_text="End of working hours."
    )

    # How long each patient visit lasts (minutes)
    visit_duration = models.PositiveIntegerField(
        help_text="Visit duration in minutes (e.g. 15)."
    )

    # Optional break between visits
    time_gap = models.PositiveIntegerField(
        default=0,
        help_text="Gap between visits in minutes."
    )

    # Allows temporarily disabling a schedule rule without deleting it
    is_active = models.BooleanField(
        default=True
    )

    class Meta:
        verbose_name = "Doctor Availability"
        verbose_name_plural = "Doctor Availabilities"

        # Default ordering when querying objects
        ordering = ["day_of_week"]

    def __str__(self):
        """
        Human‑readable representation of the object.
        Used in Django admin and shell.
        """
        return f"{self.get_day_of_week_display()} {self.start_time} - {self.end_time}"

    def clean(self):
        """
        Custom validation logic that runs before saving.

        Ensures:
        - end_time is after start_time
        - visit_duration is valid
        - visit duration does not exceed the total working window
        """

        if self.end_time <= self.start_time:
            raise ValidationError("End time must be after start time.")

        if self.visit_duration <= 0:
            raise ValidationError("Visit duration must be positive.")

        if self.time_gap < 0:
            raise ValidationError("Time gap cannot be negative.")

        # Calculate total working minutes for the day
        total_minutes = (
            datetime.datetime.combine(datetime.date.today(), self.end_time)
            - datetime.datetime.combine(datetime.date.today(), self.start_time)
        ).total_seconds() / 60

        if self.visit_duration > total_minutes:
            raise ValidationError(
                "Visit duration cannot exceed total working time."
            )


class AvailabilityException(models.Model):
    """
    Represents days when the clinic is closed.
    This overrides the normal weekly availability.

    Example:
    Doctor on vacation from 2026‑03‑20 → 2026‑03‑25
    """

    # First closed day
    start_date = models.DateField()

    # Last closed day
    end_date = models.DateField()

    # Optional explanation (holiday, vacation, etc.)
    reason = models.CharField(
        max_length=255,
        blank=True
    )

    class Meta:
        verbose_name = "Availability Exception"
        verbose_name_plural = "Availability Exceptions"
        
        # Database constraint ensuring end_date >= start_date
        constraints = [
            models.CheckConstraint(
                condition=models.Q(end_date__gte=models.F("start_date")),
                name="end_date_after_start_date"
            )
        ]

        # Index improves queries that check if a date is blocked
        indexes = [
            models.Index(fields=["start_date", "end_date"]),
        ]

    def __str__(self):
        """
        Display text used in Django admin.
        """
        if self.start_date == self.end_date:
            return f"Closed: {self.start_date}"
        return f"Closed: {self.start_date} → {self.end_date}"


class Appointment(models.Model):
    """
    Represents a booked appointment for a patient.
    Each appointment belongs to a user.
    """

    # Appointment status values
    SCHEDULED = "scheduled"
    CANCELLED_BY_USER = "cancelled_user"
    CANCELLED_BY_ADMIN = "cancelled_admin"
    VISITED = "visited"

    STATUS_CHOICES = [
        (SCHEDULED, "Scheduled"),
        (CANCELLED_BY_USER, "Cancelled by User"),
        (CANCELLED_BY_ADMIN, "Cancelled by Admin"),
        (VISITED, "Visited"),
    ]

    # Patient who booked the appointment
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="appointments"
    )

    # Date of appointment
    appointment_date = models.DateField()

    # Time of appointment
    appointment_time = models.TimeField()

    # Optional reason for visit
    reason = models.TextField(
        blank=True,
        help_text="Optional reason for visit."
    )

    # Current appointment status
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=SCHEDULED
    )

    # Automatically recorded timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:

        # Prevent two scheduled appointments at the same time
        constraints = [
            models.UniqueConstraint(
                fields=["appointment_date", "appointment_time"],
                condition=models.Q(status="scheduled"),
                name="unique_scheduled_appointment_slot",
            )

        ]

        # Database indexes for faster queries
        indexes = [
            models.Index(fields=["appointment_date", "appointment_time"]),
            models.Index(fields=["status"]),
            models.Index(fields=["user", "appointment_date"]),
        ]

        ordering = ["appointment_date", "appointment_time"]

    def __str__(self):
        """
        String representation shown in admin or logs.
        """
        return (
            f"{self.user.phone_number} | "
            f"{self.appointment_date} {self.appointment_time} | "
            f"{self.get_status_display()}"
        )

    @property
    def is_active(self):
        """
        Convenience property used in code to check
        whether the appointment is still active.
        """
        return self.status == self.SCHEDULED

