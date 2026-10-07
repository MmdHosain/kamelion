import datetime
import uuid

from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient

from .models import PhoneVerification, User

URL = "/api/auth/complete-registration"


def _token(phone="09120000001"):
    return PhoneVerification.objects.create(phone_number=phone, token=uuid.uuid4().hex).token


class CompleteRegistrationTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def register(self, **extra):
        body = {"signup_token": _token(), "full_name": "Sara Ahmadi", "national_id": "0012345678", **extra}
        return self.client.post(URL, body, format="json")

    def test_sex_and_date_of_birth_are_optional(self):
        response = self.register()
        self.assertEqual(response.status_code, 200)
        user = User.objects.get()
        self.assertIsNone(user.sex)
        self.assertIsNone(user.date_of_birth)
        self.assertIsNone(response.json()["user"]["sex"])

    def test_sex_and_date_of_birth_are_saved(self):
        response = self.register(sex="female", date_of_birth="1985-04-12")
        self.assertEqual(response.status_code, 200)
        user = User.objects.get()
        self.assertEqual(user.sex, "female")
        self.assertEqual(user.date_of_birth, datetime.date(1985, 4, 12))
        self.assertEqual(response.json()["user"]["date_of_birth"], "1985-04-12")

    def test_null_and_blank_are_accepted(self):
        self.assertEqual(self.register(sex=None, date_of_birth=None).status_code, 200)
        client_user = User.objects.get()
        self.assertIsNone(client_user.sex)

        body = {"signup_token": _token("09120000002"), "full_name": "Ali", "national_id": "1", "sex": ""}
        self.assertEqual(self.client.post(URL, body, format="json").status_code, 200)
        self.assertIsNone(User.objects.get(phone_number="09120000002").sex)

    def test_invalid_values_are_rejected(self):
        self.assertEqual(self.register(sex="other").status_code, 400)
        future = (timezone.localdate() + datetime.timedelta(days=1)).isoformat()
        self.assertEqual(self.register(date_of_birth=future).status_code, 400)
        self.assertEqual(self.register(date_of_birth="1800-01-01").status_code, 400)
        self.assertEqual(self.register(date_of_birth="not-a-date").status_code, 400)
        self.assertEqual(User.objects.count(), 0)

    def test_name_and_national_id_are_still_required(self):
        body = {"signup_token": _token("09120000003"), "full_name": "Ali"}
        self.assertEqual(self.client.post(URL, body, format="json").status_code, 400)
