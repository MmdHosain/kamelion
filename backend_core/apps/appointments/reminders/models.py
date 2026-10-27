from django.db import models


class AppointmentReminder(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        PROCESSING = "processing", "Attempt started (delivery unknown)"
        SENT = "sent", "Accepted by SMS provider"
        FAILED = "failed", "Failed (no retry)"
        SKIPPED = "skipped", "Skipped"

    appointment = models.ForeignKey(
        "appointments.Appointment", on_delete=models.CASCADE, related_name="sms_reminders"
    )
    appointment_date = models.DateField()
    appointment_time = models.TimeField()
    scheduled_for = models.DateTimeField()
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.PENDING)
    attempted_at = models.DateTimeField(null=True, blank=True)
    error_message = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["appointment", "appointment_date", "appointment_time"],
                name="unique_appointment_reminder_slot",
            ),
        ]
        indexes = [models.Index(fields=["status", "scheduled_for"], name="reminder_status_due_idx")]
        ordering = ["-scheduled_for", "-id"]
