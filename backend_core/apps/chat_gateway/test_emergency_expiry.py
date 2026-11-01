"""Expiry and renewal through real gateway orchestration with a mocked AI."""
from datetime import timedelta
from unittest import mock

from django.utils import timezone

from .models import ChatMessage, ChatSession, TriageAction
from .tests import ChatTestCase, err, ok


class EmergencyExpiryTests(ChatTestCase):
    def setUp(self):
        super().setUp()
        self.now = timezone.now()
        clock = mock.patch("django.utils.timezone.now", return_value=self.now)
        clock.start()
        self.addCleanup(clock.stop)
        self.post.return_value = ok(level="urgent", summary="Urgent symptoms")

    def expire_code(self):
        TriageAction.objects.update(emergency_code_issued_at=self.now - timedelta(days=7))

    def test_new_code_expires_exactly_seven_days_after_issue(self):
        code = self.send().json()["emergency_code"]
        action = TriageAction.objects.get()
        self.assertEqual(action.emergency_code, code)
        self.assertEqual(action.emergency_code_issued_at, self.now)
        self.assertEqual(action.emergency_code_expires_at, self.now + timedelta(days=7))
        self.assertFalse(action.emergency_code_is_expired)

    def test_valid_code_does_not_renew_or_extend_expiry(self):
        code = self.send().json()["emergency_code"]
        issued_at = self.now - timedelta(days=7) + timedelta(microseconds=1)
        TriageAction.objects.update(emergency_code_issued_at=issued_at)
        self.assertEqual(self.send().json()["emergency_code"], code)
        self.assertEqual(TriageAction.objects.get().emergency_code_issued_at, issued_at)
        self.assertEqual(ChatMessage.objects.filter(kind="emergency_code").count(), 1)

    def test_expired_code_is_replaced_on_next_urgent_assessment(self):
        old_code = self.send().json()["emergency_code"]
        action = TriageAction.objects.get()
        self.expire_code()
        response = self.send("still urgent").json()
        self.assertNotEqual(response["emergency_code"], old_code)
        self.assertFalse(response["booking_offer"])
        self.assertFalse(response["fallback"])
        action.refresh_from_db()
        self.assertEqual(TriageAction.objects.count(), 1)
        self.assertEqual(action.emergency_code_issued_at, self.now)
        self.assertEqual(action.emergency_code_expires_at, self.now + timedelta(days=7))
        self.assertFalse(action.emergency_code_is_expired)
        self.assertEqual(action.created_at, self.now)
        messages = list(ChatMessage.objects.filter(kind="emergency_code"))
        self.assertEqual(len(messages), 2)
        self.assertIn(old_code, messages[0].content)
        self.assertIn(response["emergency_code"], messages[1].content)
        self.send("another message")
        self.assertTrue(all(m["role"] != "backend" for m in self.sent_payload()["history"]))

    def test_expired_code_is_not_renewed_on_ai_failure(self):
        old_code = self.send().json()["emergency_code"]
        self.expire_code()
        self.post.return_value = err(400)
        response = self.send().json()
        self.assertTrue(response["fallback"])
        self.assertEqual(response["emergency_code"], old_code)
        self.assertTrue(TriageAction.objects.get().emergency_code_is_expired)
        self.assertEqual(ChatMessage.objects.filter(kind="emergency_code").count(), 1)

    def test_expired_code_is_not_renewed_on_rejected_downgrade(self):
        old_code = self.send().json()["emergency_code"]
        self.expire_code()
        self.post.return_value = ok(level="low_priority", summary="lower")
        with self.assertLogs("apps.chat_gateway.services", level="ERROR"):
            response = self.send().json()
        self.assertTrue(response["fallback"])
        self.assertEqual(response["emergency_code"], old_code)
        self.assertTrue(TriageAction.objects.get().emergency_code_is_expired)

    def test_failed_renewal_rolls_back_then_retries_on_next_success(self):
        old_code = self.send().json()["emergency_code"]
        self.expire_code()
        # Fail after the action row has been updated, so atomic rollback is exercised.
        with mock.patch("apps.chat_gateway.actions.emergency_code_message", side_effect=RuntimeError("failed")):
            with self.assertLogs("apps.chat_gateway.actions", level="ERROR"):
                response = self.send().json()
        self.assertFalse(response["fallback"])
        self.assertEqual(response["emergency_code"], old_code)
        self.assertTrue(TriageAction.objects.get().emergency_code_is_expired)
        self.assertEqual(ChatMessage.objects.filter(kind="emergency_code").count(), 1)
        self.assertNotEqual(self.send().json()["emergency_code"], old_code)
        self.assertEqual(TriageAction.objects.count(), 1)

    def test_renewed_patient_reappears_in_queue(self):
        from apps.users.models import User
        admin = User.objects.create_user("09120000001")
        admin.is_staff = True
        admin.save()
        self.send()
        self.expire_code()
        self.client.force_authenticate(admin)
        url = "/api/admin/patients/urgent/"
        self.assertEqual(self.client.get(url).json()["count"], 0)
        self.client.force_authenticate(self.user)
        new_code = self.send().json()["emergency_code"]
        self.client.force_authenticate(admin)
        response = self.client.get(url).json()
        self.assertEqual(response["count"], 1)
        self.assertEqual(response["results"][0]["emergency_code"], new_code)

    def test_booking_action_still_runs_only_once(self):
        self.post.return_value = ok(level="low_priority", summary="routine")
        self.send()
        self.send()
        action = TriageAction.objects.get()
        self.assertEqual(action.kind, "booking_offer")
        self.assertIsNone(action.emergency_code_issued_at)
        self.assertIsNone(action.emergency_code_expires_at)
        self.assertEqual(ChatSession.objects.get().triage_level, "low_priority")
