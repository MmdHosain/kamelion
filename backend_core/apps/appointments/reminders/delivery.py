"""One durable attempt per approved appointment occurrence; never retry SMS."""

import logging
from datetime import timedelta

import jdatetime
from django.conf import settings
from django.db import transaction
from django.utils import timezone

from apps.appointments.models import Appointment
from apps.common.panelchi import SmsProviderError, panelchi_enabled, send_pattern_sms

from .models import AppointmentReminder
from .schedule import dispatch_time

logger = logging.getLogger(__name__)


def _claim(reminder_id, cutoff):
    with transaction.atomic():
        # Match booking writes' lock order: appointment first, reminder second.
        appointment_id = AppointmentReminder.objects.values_list(
            "appointment_id", flat=True
        ).filter(pk=reminder_id).first()
        appointment = Appointment.objects.select_for_update().filter(pk=appointment_id).first()
        if appointment is None:
            return None
        reminder = AppointmentReminder.objects.select_for_update().get(pk=reminder_id)
        if reminder.status != AppointmentReminder.Status.PENDING:
            return None
        if (
            appointment.status != Appointment.SCHEDULED
            or appointment.appointment_date != reminder.appointment_date
            or appointment.appointment_time != reminder.appointment_time
            or reminder.scheduled_for != cutoff
        ):
            reminder.status = AppointmentReminder.Status.SKIPPED
            reminder.error_message = "Appointment is no longer eligible."
            reminder.save(update_fields=["status", "error_message", "updated_at"])
            return None

        # Commit BEFORE contacting the provider. A crash after this point leaves
        # PROCESSING (unknown), never a second SMS on the next run/restart.
        reminder.status = AppointmentReminder.Status.PROCESSING
        reminder.attempted_at = timezone.now()
        reminder.save(update_fields=["status", "attempted_at", "updated_at"])
        return reminder, appointment


def _deliver(reminder, appointment):
    status = AppointmentReminder.Status.SENT
    error = ""
    try:
        if not panelchi_enabled():
            status = AppointmentReminder.Status.SKIPPED
            error = "SMS provider is in console mode; no SMS was sent."
        else:
            send_pattern_sms(
                pattern=settings.PANELCHI_PATTERN_APPOINTMENT_REMINDER,
                recipient=appointment.user.phone_number,
                variables={
                    "full_name": appointment.user.full_name or "مراجع کننده",
                    "date": jdatetime.date.fromgregorian(date=reminder.appointment_date).strftime("%Y/%m/%d"),
                    "time": reminder.appointment_time.strftime("%H:%M"),
                },
            )
    except SmsProviderError as exc:
        status = AppointmentReminder.Status.FAILED
        error = str(exc)
    except Exception:
        # Keep unexpected failures terminal too; do not persist arbitrary
        # exception text that might contain provider credentials.
        logger.exception("Unexpected reminder failure for reminder %s", reminder.pk)
        status = AppointmentReminder.Status.FAILED
        error = "Unexpected SMS delivery failure."

    AppointmentReminder.objects.filter(pk=reminder.pk).update(
        status=status, error_message=error, updated_at=timezone.now()
    )
    logger.info("Appointment reminder %s: %s", reminder.pk, status)


def dispatch_reminders():
    now = timezone.now()
    # Expired jobs are terminal, so an outage cannot cause late catch-up texts.
    AppointmentReminder.objects.filter(
        status=AppointmentReminder.Status.PENDING,
        scheduled_for__lte=now - timedelta(minutes=1),
    ).update(
        status=AppointmentReminder.Status.SKIPPED,
        error_message="Reminder time was missed.",
        updated_at=now,
    )
    cutoff = dispatch_time(now)
    if cutoff is None:
        return 0

    ids = AppointmentReminder.objects.filter(
        status=AppointmentReminder.Status.PENDING, scheduled_for=cutoff
    ).values_list("pk", flat=True).iterator()
    attempted = 0
    for reminder_id in ids:
        claimed = _claim(reminder_id, cutoff)
        if claimed is not None:
            _deliver(*claimed)
            attempted += 1
    return attempted
