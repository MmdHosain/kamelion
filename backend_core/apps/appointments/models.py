# apps/appointments/models.py

from django.db import models
from django.core.exceptions import ValidationError # For custom validation
from django.utils import timezone # Useful for date/time operations, especially with timezones
import datetime # For date and time calculations

from apps.users.models import User


class DoctorAvailability(models.Model):
    """
    Defines the fixed weekly rules for the doctor's presence in the clinic.
    This model stores the standard operating hours for the doctor each day of the week.
    Since it's a single doctor setup, we don't need to link this to a specific doctor instance.
    """
    
    MONDAY = 'MON'
    TUESDAY = 'TUE'
    WEDNESDAY = 'WED'
    THURSDAY = 'THU'
    FRIDAY = 'FRI'
    SATURDAY = 'SAT'
    SUNDAY = 'SUN'

    DAY_CHOICES = [
        (MONDAY, 'Monday'),
        (TUESDAY, 'Tuesday'),
        (WEDNESDAY, 'Wednesday'),
        (THURSDAY, 'Thursday'),
        (FRIDAY, 'Friday'),
        (SATURDAY, 'Saturday'),
        (SUNDAY, 'Sunday'),
    ]

    day_of_week = models.CharField(
        max_length=3,
        choices=DAY_CHOICES,
        unique=True,  # Ensures only one availability rule per day of the week.
        help_text="The day of the week this rule applies to."
    )
    start_time = models.TimeField(
        help_text="The start time of the doctor's availability on this day."
    )
    end_time = models.TimeField(
        help_text="The end time of the doctor's availability on this day."
    )
    visit_duration = models.PositiveIntegerField( 
        help_text="Duration of each visit in minutes (e.g., 15). Must be a positive value."
    )
    time_gap = models.PositiveIntegerField(
        default=0, # Default to 0 if no gap is needed between visits.
        help_text="Gap between consecutive visits in minutes (e.g., 5). Must be a positive value or zero."
    )
    is_active = models.BooleanField(
        default=True, # Allows temporarily disabling a rule without deleting it.
        help_text="Is this availability rule currently active and in effect?"
    )

    class Meta:
        verbose_name_plural = "Doctor Availabilities" 
        ordering = ['day_of_week'] 

    def __str__(self):
        # Provides a human-readable representation of the availability rule.
        # Example: "Monday 09:00 - 17:00"
        return (f"{self.get_day_of_week_display()} "
                f"{self.start_time.strftime('%H:%M')} - {self.end_time.strftime('%H:%M')}")

    def clean(self):
        """
        Custom validation for the model.
        Ensures logical consistency within the availability rule.
        """
        from django.core.exceptions import ValidationError

        # Check if end time is actually after start time.
        if self.start_time and self.end_time and self.end_time <= self.start_time:
            raise ValidationError("End time must be after start time.")

        # Check if visit duration is a positive number.
        if self.visit_duration <= 0:
            raise ValidationError("Visit duration must be a positive integer.")

        # Check if time gap is a positive number or zero.
        if self.time_gap < 0:
            raise ValidationError("Time gap cannot be negative.")

        if self.is_active: # Only perform this check if the rule is active.
            try:
                # Create dummy datetime objects for calculation
                dummy_start_dt = datetime.datetime.combine(datetime.date.today(), self.start_time)
                dummy_end_dt = datetime.datetime.combine(datetime.date.today(), self.end_time)
                total_available_minutes = (dummy_end_dt - dummy_start_dt).total_seconds() / 60

                # Check if the combined duration and gap could theoretically fit at least one visit.
                # This prevents setting a visit_duration longer than the entire working day minus any gap.
                if self.visit_duration > total_available_minutes:
                    raise ValidationError(
                        "Visit duration is longer than the total available time for this day."
                    )

            except TypeError:
                # Handle cases where start_time or end_time might be None if validation hasn't run yet.
                pass


class AvailabilityException(models.Model):
    """
    Represents specific dates or date ranges when the clinic is closed,
    overriding regular doctor availability. This is for holidays, specific days off, etc.
    """
    start_date = models.DateField(
        help_text="The start date of the closure period."
    )
    end_date = models.DateField(
        help_text="The end date of the closure period. If it's a single day, start_date and end_date should be the same."
    )
    reason = models.CharField(
        max_length=255,
        blank=True, # Reason is optional.
        help_text="Reason for the exception (e.g., Holiday, Doctor's leave, Clinic maintenance)."
    )

    class Meta:
        verbose_name_plural = "Availability Exceptions"
        # Ensures that the end_date is always on or after the start_date.
        constraints = [
            models.CheckConstraint(
                check=models.Q(end_date__gte=models.F('start_date')),
                name='end_date_after_start_date' # Name for the constraint.
            )
        ]

    def __str__(self):
        """
        Provides a human-readable representation of the exception.
        Distinguishes between single-day and multi-day exceptions.
        """
        if self.start_date == self.end_date:
            # Example: "Blocked: 2023-12-25"
            return f"Blocked: {self.start_date.strftime('%Y-%m-%d')}"
        else:
            # Example: "Blocked: 2023-12-24 to 2023-12-26"
            return (f"Blocked: {self.start_date.strftime('%Y-%m-%d')} "
                    f"to {self.end_date.strftime('%Y-%m-%d')}")



class Appointment(models.Model):
    """
    Represents a reserved appointment slot for a user.
    This model tracks the status of each appointment.
    """
    # --- Status Choices ---
    # Define clear choices for the appointment status.
    SCHEDULED = 'scheduled'
    CANCELLED_BY_USER = 'cancelled_user' 
    CANCELLED_BY_ADMIN = 'cancelled_admin' 
    VISITED = 'visited'

    STATUS_CHOICES = [
        (SCHEDULED, 'Scheduled'),
        (CANCELLED_BY_USER, 'Cancelled by User'),
        (CANCELLED_BY_ADMIN, 'Cancelled by Admin'),
        (VISITED, 'Visited'), 
        ]

    # --- Foreign Key to User ---
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE, # If a user is deleted, their appointments are also deleted.
        related_name='appointments', # Allows accessing appointments from a User object: user.appointments.all()
        help_text="The user who booked this appointment."
    )

    # --- Date and Time Fields ---
    appointment_date = models.DateField(
        help_text="The date of the appointment."
    )
    appointment_time = models.TimeField(
        help_text="The time of the appointment."
    )

    # --- Status Field ---
    status = models.CharField(
        max_length=20, # Ensure max_length accommodates the longest status string.
        choices=STATUS_CHOICES,
        default=SCHEDULED, # Default status for new appointments.
        help_text="The current status of the appointment."
    )

    # --- Timestamps ---
    created_at = models.DateTimeField(
        auto_now_add=True, # Automatically set the date/time when the object is first created.
        help_text="Timestamp when the appointment was created."
    )
    updated_at = models.DateTimeField(
        auto_now=True, # Automatically set the date/time every time the object is saved.
        help_text="Timestamp when the appointment was last updated."
    )

    class Meta:
        # *** IMPORTANT: Preventing Double Bookings ***
        # The most robust way to prevent double-booking is using a conditional UniqueConstraint.
        # This constraint ensures that a specific date/time combination is unique *only if*
        # the status is 'scheduled'. This allows cancelled or visited slots to be re-booked.
        constraints = [
            models.UniqueConstraint(
                fields=['appointment_date', 'appointment_time'],
                condition=models.Q(status='Scheduled'), # Applies only when status is SCHEDULED.
                name='unique_scheduled_appointment_slot' # Name of the constraint.
            ),
            # Optional: You might want to ensure a user doesn't book two *scheduled* appointments
            # on the same day, or overlapping times. This would require another conditional constraint.
            # Example for ensuring a user doesn't have two *scheduled* appointments on the same date:
            # models.UniqueConstraint(
            #     fields=['user', 'appointment_date'],
            #     condition=models.Q(status=SCHEDULED),
            #     name='unique_user_scheduled_appointment_date'
            # )
        ]

        # --- Indexes ---
        # Indexes speed up queries on the specified fields.
        indexes = [
            # Quickly find all appointments for a specific date and time.
            models.Index(fields=['appointment_date', 'appointment_time']),
            # Quickly filter appointments by their status (e.g., find all 'scheduled' appointments).
            models.Index(fields=['status']),
            # Quickly find all appointments for a specific user on a specific date.
            models.Index(fields=['user', 'appointment_date']),
            # Index for checking user's appointments across all dates if needed.
            models.Index(fields=['user']),
        ]

    def __str__(self):
        """
        Provides a human-readable representation of the appointment.
        Example: "989123456789 - 2023-12-25 10:30 (Scheduled)"
        """
        return (f"{self.user.phone_number} - "
                f"{self.appointment_date.strftime('%Y-%m-%d')} {self.appointment_time.strftime('%H:%M')} "
                f"({self.get_status_display()})")

    @property
    def is_active(self):
        """
        A property to easily check if the appointment is currently considered active (i.e., scheduled).
        This is useful for filtering or displaying active appointments.
        """
        # Changed to check against 'scheduled' status directly.
        return self.status == self.SCHEDULED
