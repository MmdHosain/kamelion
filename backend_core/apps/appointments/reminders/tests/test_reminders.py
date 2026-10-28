from datetime import date, time, timezone as dt_timezone
from unittest.mock import patch

from django.test import TestCase, override_settings
from django.db import transaction

from apps.appointments.models import Appointment
from apps.appointments.serializers import AppointmentSerializer
from apps.appointments.services import approve_appointment, disapprove_appointment
from apps.common.panelchi import SmsProviderError

from ..delivery import dispatch_reminders
from ..models import AppointmentReminder as Reminder
from .base import ReminderFixtures


@override_settings(SMS_PROVIDER="panelchi", PANELCHI_PATTERN_APPOINTMENT_REMINDER="reminder-pattern")
class ReminderTests(ReminderFixtures, TestCase):
    def setUp(self):
        super().setUp()
        sender = patch("apps.appointments.reminders.delivery.send_pattern_sms", return_value={})
        self.sender = sender.start()
        self.addCleanup(sender.stop)

    def test_sends_at_10_tehran_with_correct_pattern_and_jalali_values(self):
        appointment = self.appointment()
        self.set_time(10)
        # The deployment/Django timezone need not be Tehran.
        self.clock.return_value = self.clock.return_value.astimezone(dt_timezone.utc)
        self.assertEqual(dispatch_reminders(), 1)
        self.sender.assert_called_once_with(
            pattern="reminder-pattern", recipient=self.user.phone_number,
            variables={"full_name": "هیراد ترابی", "date": "1405/06/29", "time": "17:30"},
        )
        reminder = appointment.sms_reminders.get()
        self.assertEqual(reminder.status, Reminder.Status.SENT)
        self.assertIsNotNone(reminder.attempted_at)

    def test_never_sends_before_10_or_catches_up_after_10_minute(self):
        self.appointment()
        self.set_time(9, 59, 59)
        self.assertEqual(dispatch_reminders(), 0)
        self.set_time(10, 1)
        self.assertEqual(dispatch_reminders(), 0)
        self.assertEqual(Reminder.objects.get().status, Reminder.Status.SKIPPED)
        self.sender.assert_not_called()

    def test_only_tomorrows_approved_appointments_are_sent(self):
        self.appointment()
        self.appointment(appointment_date=date(2026, 9, 21))
        for index, status in enumerate([
            Appointment.PENDING, Appointment.CANCELLED_BY_ADMIN,
            Appointment.CANCELLED_BY_USER, Appointment.VISITED,
        ]):
            self.appointment(status=status, appointment_time=time(12, index))
        self.set_time(10)
        self.assertEqual(dispatch_reminders(), 1)
        self.sender.assert_called_once()

    def test_late_approval_is_skipped_even_within_dispatch_minute(self):
        appointment = self.appointment(status=Appointment.PENDING)
        self.set_time(10, 0, 1)
        appointment.status = Appointment.SCHEDULED
        appointment.save(update_fields=["status"])
        self.assertEqual(appointment.sms_reminders.get().status, Reminder.Status.SKIPPED)
        self.assertEqual(dispatch_reminders(), 0)
        self.sender.assert_not_called()

    def test_booking_entered_by_staff_after_cutoff_is_skipped(self):
        self.set_time(11)
        appointment = self.appointment()
        self.assertEqual(appointment.sms_reminders.get().status, Reminder.Status.SKIPPED)
        self.sender.assert_not_called()

    def test_repeated_runs_and_unrelated_edits_do_not_duplicate_sms(self):
        appointment = self.appointment()
        self.set_time(10)
        dispatch_reminders()
        appointment.reason = "Updated note"
        appointment.save(update_fields=["reason"])
        dispatch_reminders()
        self.sender.assert_called_once()
        self.assertEqual(appointment.sms_reminders.count(), 1)

    def test_failed_sms_is_saved_and_never_retried(self):
        appointment = self.appointment()
        self.sender.side_effect = SmsProviderError("SMS provider rejected the request (status 503).")
        self.set_time(10)
        dispatch_reminders()
        reminder = appointment.sms_reminders.get()
        self.assertEqual(reminder.status, Reminder.Status.FAILED)
        self.assertIn("503", reminder.error_message)
        self.assertIsNotNone(reminder.attempted_at)
        appointment.save()
        dispatch_reminders()
        self.sender.assert_called_once()

    def test_console_mode_is_never_recorded_as_sent(self):
        self.appointment()
        self.set_time(10)
        with override_settings(SMS_PROVIDER="console"):
            dispatch_reminders()
        self.assertEqual(Reminder.objects.get().status, Reminder.Status.SKIPPED)
        self.sender.assert_not_called()

    def test_cancelled_or_rescheduled_booking_cannot_send_old_reminder(self):
        appointment = self.appointment()
        appointment.status = Appointment.CANCELLED_BY_USER
        appointment.save(update_fields=["status"])
        self.set_time(10)
        dispatch_reminders()
        self.assertEqual(appointment.sms_reminders.get().status, Reminder.Status.SKIPPED)
        self.sender.assert_not_called()

    def test_rescheduling_before_cutoff_uses_new_time(self):
        appointment = self.appointment()
        appointment.appointment_time = time(18)
        appointment.save(update_fields=["appointment_time"])
        self.set_time(10)
        self.assertEqual(dispatch_reminders(), 1)
        self.assertEqual(self.sender.call_args.kwargs["variables"]["time"], "18:00")
        self.assertEqual(appointment.sms_reminders.filter(status=Reminder.Status.SKIPPED).count(), 1)

    def test_rescheduling_after_cutoff_skips_the_new_slot(self):
        appointment = self.appointment()
        self.set_time(10, 0, 1)
        appointment.appointment_time = time(18)
        appointment.save(update_fields=["appointment_time"])
        self.assertEqual(dispatch_reminders(), 0)
        self.assertFalse(appointment.sms_reminders.exclude(status=Reminder.Status.SKIPPED).exists())

    def test_partial_save_uses_persisted_slot_instead_of_unsaved_attributes(self):
        appointment = self.appointment()
        appointment.appointment_time = time(18)
        appointment.reason = "Updated note"
        appointment.save(update_fields=["reason"])
        self.assertEqual(appointment.sms_reminders.get().appointment_time, time(17, 30))

    def test_unrelated_edit_after_cutoff_keeps_original_eligibility(self):
        appointment = self.appointment()
        self.set_time(10, 0, 5)
        appointment.reason = "Updated note"
        appointment.save(update_fields=["reason"])
        self.assertEqual(dispatch_reminders(), 1)

    def test_rolled_back_approval_does_not_leave_a_reminder(self):
        appointment = self.appointment(status=Appointment.PENDING)
        with self.assertRaises(RuntimeError):
            with transaction.atomic():
                appointment.status = Appointment.SCHEDULED
                appointment.save(update_fields=["status"])
                raise RuntimeError("Rollback")
        appointment.refresh_from_db()
        self.assertEqual(appointment.status, Appointment.PENDING)
        self.assertFalse(appointment.sms_reminders.exists())

    def test_rechecks_current_status_even_if_signal_was_bypassed(self):
        appointment = self.appointment()
        Appointment.objects.filter(pk=appointment.pk).update(status=Appointment.CANCELLED_BY_ADMIN)
        self.set_time(10)
        self.assertEqual(dispatch_reminders(), 0)
        self.sender.assert_not_called()

    def test_process_crash_does_not_retry_an_uncertain_attempt(self):
        self.appointment()
        self.set_time(10)
        with patch("apps.appointments.reminders.delivery._deliver", side_effect=RuntimeError("crash")):
            with self.assertRaises(RuntimeError):
                dispatch_reminders()
        self.assertEqual(Reminder.objects.get().status, Reminder.Status.PROCESSING)
        self.assertEqual(dispatch_reminders(), 0)
        self.sender.assert_not_called()

    def test_approval_and_rejection_sms_keep_existing_behavior(self):
        approved = self.appointment(status=Appointment.PENDING)
        rejected = self.appointment(status=Appointment.PENDING, appointment_time=time(18))
        with patch("apps.appointments.notifications.send_pattern_sms") as decision_sender:
            approve_appointment(approved)
            disapprove_appointment(rejected, "پزشک حضور ندارد")
        self.assertEqual(decision_sender.call_count, 2)
        self.assertEqual(decision_sender.call_args.kwargs["variables"]["reason"], "پزشک حضور ندارد")
        self.sender.assert_not_called()
        self.assertEqual(approved.sms_reminders.get().status, Reminder.Status.PENDING)
        self.assertFalse(rejected.sms_reminders.exists())
        self.assertNotIn("sms_reminders", AppointmentSerializer(approved).data)
