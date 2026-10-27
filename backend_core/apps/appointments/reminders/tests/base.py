from datetime import datetime, time
from unittest.mock import patch

from apps.appointments.models import Appointment
from apps.users.models import User

from ..schedule import TEHRAN


class ReminderFixtures:
    def setUp(self):
        super().setUp()
        self.clock = patch("django.utils.timezone.now").start()
        self.addCleanup(patch.stopall)
        self.set_time(9)
        self.user = User.objects.create_user("09120000001", full_name="هیراد ترابی")

    def set_time(self, hour, minute=0, second=0, day=19):
        self.clock.return_value = datetime(2026, 9, day, hour, minute, second, tzinfo=TEHRAN)

    def appointment(self, **kwargs):
        return Appointment.objects.create(
            user=self.user,
            appointment_date=kwargs.pop("appointment_date", datetime(2026, 9, 20).date()),
            appointment_time=kwargs.pop("appointment_time", time(17, 30)),
            status=kwargs.pop("status", Appointment.SCHEDULED),
            **kwargs,
        )
