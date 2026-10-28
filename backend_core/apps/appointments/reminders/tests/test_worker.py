from concurrent.futures import ThreadPoolExecutor
from io import StringIO
from threading import Barrier
from unittest.mock import patch

from django.core.management import call_command
from django.db import close_old_connections
from django.test import TestCase, TransactionTestCase, override_settings, skipUnlessDBFeature

from ..delivery import _claim, dispatch_reminders
from ..models import AppointmentReminder as Reminder
from .base import ReminderFixtures


class WorkerCommandTests(TestCase):
    @patch("apps.appointments.management.commands.run_appointment_reminders.dispatch_reminders")
    def test_once_command_runs_without_sleeping_or_sending_real_sms(self, dispatch):
        with patch("apps.appointments.management.commands.run_appointment_reminders.time.sleep") as sleep:
            call_command("run_appointment_reminders", once=True, stdout=StringIO())
        dispatch.assert_called_once_with()
        sleep.assert_not_called()


@override_settings(SMS_PROVIDER="panelchi", PANELCHI_PATTERN_APPOINTMENT_REMINDER="reminder-pattern")
class ConcurrentWorkerTests(ReminderFixtures, TransactionTestCase):
    @skipUnlessDBFeature("has_select_for_update")
    def test_two_workers_send_exactly_one_sms(self):
        self.appointment()
        self.set_time(10)
        both_workers_selected = Barrier(2)

        def simultaneous_claim(*args):
            both_workers_selected.wait(timeout=5)
            return _claim(*args)

        def run_worker():
            close_old_connections()
            try:
                return dispatch_reminders()
            finally:
                close_old_connections()

        with patch("apps.appointments.reminders.delivery.send_pattern_sms") as sender:
            with patch("apps.appointments.reminders.delivery._claim", side_effect=simultaneous_claim):
                with ThreadPoolExecutor(max_workers=2) as workers:
                    attempts = list(workers.map(lambda _: run_worker(), range(2)))
        self.assertEqual(sum(attempts), 1)
        sender.assert_called_once()
        self.assertEqual(Reminder.objects.get().status, Reminder.Status.SENT)
