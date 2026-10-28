"""Schedule existing approved future bookings without sending during migration."""

from datetime import datetime, time, timedelta
from zoneinfo import ZoneInfo

from django.db import migrations
from django.utils import timezone


def seed_existing_reminders(apps, schema_editor):
    Appointment = apps.get_model("appointments", "Appointment")
    Reminder = apps.get_model("appointments", "AppointmentReminder")
    alias = schema_editor.connection.alias
    now = timezone.now()
    tehran = ZoneInfo("Asia/Tehran")
    today = now.astimezone(tehran).date()
    appointments = Appointment.objects.using(alias).filter(
        status="scheduled", appointment_date__gt=today
    ).iterator()
    for appointment in appointments:
        due = datetime.combine(
            appointment.appointment_date - timedelta(days=1), time(10), tzinfo=tehran
        )
        late = now > due
        Reminder.objects.using(alias).get_or_create(
            appointment_id=appointment.pk,
            appointment_date=appointment.appointment_date,
            appointment_time=appointment.appointment_time,
            defaults={
                "scheduled_for": due,
                "status": "skipped" if late else "pending",
                "error_message": "Reminder cutoff passed before feature activation." if late else "",
            },
        )


class Migration(migrations.Migration):
    dependencies = [("appointments", "0006_appointmentreminder")]
    operations = [migrations.RunPython(seed_existing_reminders, migrations.RunPython.noop)]
