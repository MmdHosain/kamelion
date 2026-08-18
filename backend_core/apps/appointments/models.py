# apps/appointments/models.py

from django.db import models
from django.core.exceptions import ValidationError
import datetime

from apps.users.models import User


class DoctorAvailability(models.Model):
    DAY_CHOICES = [
        ("SUN", "Sunday"),
        ("MON", "Monday"),
        ("TUE", "Tuesday"),
        ("WED", "Wednesday"),
        ("THU", "Thursday"),
        ("FRI", "Friday"),
        ("SAT", "Saturday"),
    ]

    name = models.CharField(max_length=255, blank=True, default="")
    days_of_week = models.JSONField(default=list)
    start_time = models.TimeField()
    end_time = models.TimeField()
    visit_duration = models.PositiveIntegerField(default=30)
    time_gap = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def clean(self):
        valid_days = {code for code, _ in self.DAY_CHOICES}

        if not isinstance(self.days_of_week, list) or not self.days_of_week:
            raise ValidationError({"days_of_week": "At least one day must be selected."})

        invalid_days = [day for day in self.days_of_week if day not in valid_days]
        if invalid_days:
            raise ValidationError({"days_of_week": f"Invalid day(s): {', '.join(invalid_days)}"})

        if len(set(self.days_of_week)) != len(self.days_of_week):
            raise ValidationError({"days_of_week": "Duplicate days are not allowed in one schedule."})

        if self.end_time <= self.start_time:
            raise ValidationError({"end_time": "End time must be after start time."})

        if self.visit_duration <= 0:
            raise ValidationError({"visit_duration": "Visit duration must be greater than zero."})

        if self.time_gap < 0:
            raise ValidationError({"time_gap": "Gap cannot be negative."})

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name or f"Availability #{self.pk}"
    class Meta:
        verbose_name = "Doctor Availability"
        verbose_name_plural = "Doctor Availabilities"
        ordering = ["id"]


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

