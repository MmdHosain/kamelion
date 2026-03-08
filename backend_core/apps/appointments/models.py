# apps/appointments/models.py

from django.db import models
from apps.users.models import User


class DoctorAvailability(models.Model):
    """
    Fixed rules for doctor's presence in the clinic
    """
    MONDAY = 0
    TUESDAY = 1
    WEDNESDAY = 2
    THURSDAY = 3
    FRIDAY = 4
    SATURDAY = 5
    SUNDAY = 6

    DAY_CHOICES = [
        (MONDAY, 'Monday'),
        (TUESDAY, 'Tuesday'),
        (WEDNESDAY, 'Wednesday'),
        (THURSDAY, 'Thursday'),
        (FRIDAY, 'Friday'),
        (SATURDAY, 'Saturday'),
        (SUNDAY, 'Sunday'),
    ]

    day_of_week = models.IntegerField(choices=DAY_CHOICES)
    start_time = models.TimeField()
    end_time = models.TimeField()
    visit_duration = models.IntegerField(
        help_text="Duration of each visit in minutes (e.g., 15)"
    )
    time_gap = models.IntegerField(
        help_text="Gap between consecutive visits in minutes (e.g., 5)",
        default=0
    )
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name_plural = "Doctor Availabilities"
        constraints = [
            models.UniqueConstraint(
                fields=['day_of_week', 'start_time', 'end_time'],
                name='unique_availability_rule'
            )
        ]

    def __str__(self):
        return f"{self.get_day_of_week_display()} {self.start_time} - {self.end_time}"


class AvailabilityException(models.Model):
    """
    Holidays or days the clinic is exceptionally closed
    """
    start_date = models.DateField()
    end_date = models.DateField()
    reason = models.CharField(max_length=255, blank=True)

    class Meta:
        constraints = [
            models.CheckConstraint(
                check=models.Q(end_date__gte=models.F('start_date')),
                name='end_date_after_start_date'
            )
        ]

    def __str__(self):
        return f"Blocked: {self.start_date} to {self.end_date}"


class Appointment(models.Model):
    """
    Reserved appointments
    """
    SCHEDULED = 'scheduled'
    CANCELLED_BY_USER = 'cancelled'
    CANCELLED_BY_ADMIN = 'cancelled_by_admin'
    VISITED = 'visited'

    STATUS_CHOICES = [
        (SCHEDULED, 'Scheduled'),
        (CANCELLED_BY_USER, 'Cancelled by User'),
        (CANCELLED_BY_ADMIN, 'Cancelled by Admin'),
        (VISITED, 'Visited'),
    ]

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='appointments'
    )
    appointment_date = models.DateField()
    appointment_time = models.TimeField()
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=SCHEDULED
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        # Prevent double-booking an active time slot
        unique_together = ('appointment_date', 'appointment_time', 'status')
        indexes = [
            models.Index(fields=['appointment_date', 'appointment_time']),
            models.Index(fields=['status']),
            models.Index(fields=['user', 'appointment_date']),
        ]

    def __str__(self):
        return (
            f"{self.user.phone_number} - "
            f"{self.appointment_date} {self.appointment_time} "
            f"({self.status})"
        )

    @property
    def is_active(self):
        return self.status == self.SCHEDULED
