import importlib
from datetime import date, time
from types import SimpleNamespace

from django.db import connection
from django.db.migrations.executor import MigrationExecutor
from django.test import TestCase

from apps.appointments.models import Appointment

from ..models import AppointmentReminder as Reminder
from .base import ReminderFixtures

seed = importlib.import_module(
    "apps.appointments.migrations.0007_seed_existing_reminders"
).seed_existing_reminders


class BackfillTests(ReminderFixtures, TestCase):
    def setUp(self):
        super().setUp()
        self.historical_apps = MigrationExecutor(connection).loader.project_state(
            [("appointments", "0006_appointmentreminder")]
        ).apps

    def backfill(self):
        seed(self.historical_apps, SimpleNamespace(connection=connection))

    def test_existing_approved_future_bookings_are_scheduled_once(self):
        tomorrow = self.appointment()
        later = self.appointment(appointment_date=date(2026, 9, 21))
        self.appointment(status=Appointment.PENDING, appointment_time=time(18))
        self.appointment(appointment_date=date(2026, 9, 19))
        # Simulate bookings which predate the reminder feature.
        Reminder.objects.all().delete()
        self.backfill()
        self.backfill()
        self.assertEqual(Reminder.objects.count(), 2)
        self.assertEqual(tomorrow.sms_reminders.get().status, Reminder.Status.PENDING)
        self.assertEqual(later.sms_reminders.get().status, Reminder.Status.PENDING)

    def test_activation_after_cutoff_does_not_send_late_reminders(self):
        tomorrow = self.appointment()
        later = self.appointment(appointment_date=date(2026, 9, 21))
        Reminder.objects.all().delete()
        self.set_time(11)
        self.backfill()
        self.assertEqual(tomorrow.sms_reminders.get().status, Reminder.Status.SKIPPED)
        self.assertEqual(later.sms_reminders.get().status, Reminder.Status.PENDING)
