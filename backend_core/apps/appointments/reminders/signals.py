"""Track eligibility without changing the existing approval/rejection SMS flows."""

from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone

from apps.appointments.models import Appointment

from .models import AppointmentReminder
from .schedule import reminder_time


@receiver(post_save, sender=Appointment, dispatch_uid="appointment_reminder_schedule")
def schedule_appointment_reminder(sender, instance, raw=False, using="default", **kwargs):
    if raw:
        return

    # Read persisted fields: save(update_fields=...) may leave other instance
    # attributes different from the actual booking stored in the database.
    appointment = sender.objects.using(using).get(pk=instance.pk)
    reminders = AppointmentReminder.objects.using(using).filter(appointment_id=instance.pk)
    now = timezone.now()
    current_slot = {
        "appointment_date": appointment.appointment_date,
        "appointment_time": appointment.appointment_time,
    }
    pending = reminders.filter(status=AppointmentReminder.Status.PENDING)
    if appointment.status != Appointment.SCHEDULED:
        pending.update(
            status=AppointmentReminder.Status.SKIPPED,
            error_message="Appointment is no longer approved.",
            updated_at=now,
        )
        return

    pending.exclude(**current_slot).update(
        status=AppointmentReminder.Status.SKIPPED,
        error_message="Appointment date or time changed.",
        updated_at=now,
    )
    due = reminder_time(appointment.appointment_date)
    late = now > due
    reminder, created = reminders.get_or_create(
        appointment_id=instance.pk,
        **current_slot,
        defaults={
            "scheduled_for": due,
            "status": AppointmentReminder.Status.SKIPPED if late else AppointmentReminder.Status.PENDING,
            "error_message": "Approved after the reminder cutoff." if late else "",
        },
    )
    # A cancellation/reschedule reversed before the cutoff may become eligible
    # again. A started, successful or failed send is never reset or retried.
    if not created and not late:
        reminders.filter(
            pk=reminder.pk, status=AppointmentReminder.Status.SKIPPED, attempted_at__isnull=True
        ).update(
            status=AppointmentReminder.Status.PENDING, error_message="", updated_at=now
        )
