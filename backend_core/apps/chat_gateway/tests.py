import datetime
from unittest import mock

import httpx
from django.conf import settings
from django.test import SimpleTestCase, TestCase, override_settings
from rest_framework.test import APIClient

from apps.users.models import User

from . import ai_client
from . import constants as c
from .models import ChatMessage, ChatSession
from .payload import build_patient, to_rfc3339

URL = "/api/chat/message"
SID = "widget-session-1"


def ok(reply="Hello.", level="unknown", summary=None):
    """A 200 response from the AI Service."""
    return httpx.Response(200, json={"reply": reply, "triage": {"level": level, "summary": summary}})


def err(status, code="internal_error"):
    return httpx.Response(status, json={"error": {"code": code, "message": "m", "request_id": "r"}})


class ChatTestCase(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(phone_number="09129990000")
        self.client = APIClient()
        self.client.force_authenticate(self.user)
        patcher = mock.patch("apps.chat_gateway.ai_client.httpx.post")
        self.post = patcher.start()
        self.addCleanup(patcher.stop)

    def send(self, text="hi", session_id=SID, **kwargs):
        return self.client.post(URL, {"message": text, "session_id": session_id}, format="json", **kwargs)

    def sent_payload(self, call=-1):
        return self.post.call_args_list[call].kwargs["json"]


class RequestContractTests(ChatTestCase):
    """API.md §2, §4.1 - §4.4."""

    def test_first_message_body_and_headers(self):
        self.post.return_value = ok()
        self.assertEqual(self.send("Hi, I found a lump.").status_code, 200)

        kwargs = self.post.call_args.kwargs
        self.assertEqual(self.post.call_args.args[0], "https://ai.test/v1/chat")
        self.assertEqual(kwargs["headers"]["Authorization"], "Bearer test-key")
        self.assertEqual(kwargs["headers"]["Content-Type"], "application/json")
        self.assertTrue(kwargs["headers"]["X-Request-ID"])
        self.assertEqual(kwargs["timeout"], settings.AI_SERVICE_TIMEOUT)

        body = kwargs["json"]
        self.assertEqual(set(body), {"session_id", "message", "history", "triage", "patient"})
        self.assertEqual(body["message"]["content"], "Hi, I found a lump.")
        self.assertRegex(body["message"]["created_at"], r"^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\dZ$")
        self.assertEqual(body["history"], [])
        self.assertIsNone(body["triage"])
        self.assertIsNone(body["patient"])
        # the AI Service gets the backend-generated ID, not the widget's key
        self.assertNotEqual(body["session_id"], SID)
        self.assertEqual(body["session_id"], str(ChatSession.objects.get().ai_session_id))

    def test_history_triage_and_current_message_not_duplicated(self):
        self.post.side_effect = [ok("First reply."), ok("Second reply.")]
        self.send("one")
        self.send("two")

        body = self.sent_payload()
        self.assertEqual(body["message"]["content"], "two")
        self.assertEqual([(h["role"], h["content"]) for h in body["history"]],
                         [("user", "one"), ("assistant", "First reply.")])
        self.assertEqual(body["triage"], {"level": "unknown", "summary": None})

    def test_backend_generated_messages_never_in_history(self):
        session = ChatSession.objects.create(session_id=SID)
        ChatMessage.objects.create(session=session, role=ChatMessage.USER, content="u1")
        ChatMessage.objects.create(session=session, role=ChatMessage.BACKEND, kind="fallback", content="fallback text")
        self.post.return_value = ok()
        self.send("u2")

        history = self.sent_payload()["history"]
        self.assertEqual([h["content"] for h in history], ["u1"])

    def test_history_is_capped_to_100_most_recent_oldest_first(self):
        session = ChatSession.objects.create(session_id=SID)
        base = datetime.datetime(2026, 9, 1, tzinfo=datetime.timezone.utc)
        for i in range(120):
            ChatMessage.objects.create(
                session=session, role=ChatMessage.USER if i % 2 == 0 else ChatMessage.ASSISTANT,
                content=f"m{i}", created_at=base + datetime.timedelta(minutes=i),
            )
        self.post.return_value = ok()
        self.send("new")

        history = self.sent_payload()["history"]
        self.assertEqual(len(history), 100)
        self.assertEqual(history[0]["content"], "m20")
        self.assertEqual(history[-1]["content"], "m119")

    def test_patient_only_contains_allowed_fields(self):
        user = User.objects.create_user(phone_number="09120000000", full_name="Sara Ahmadi")
        user.national_id = "123"
        user.sex = "female"
        user.date_of_birth = datetime.date(1980, 1, 1)
        user.save()

        patient = build_patient(user)
        self.assertEqual(set(patient), {"name", "age", "sex"})
        self.assertEqual(patient["name"], "Sara")
        self.assertEqual(patient["sex"], "female")
        self.assertTrue(0 <= patient["age"] <= 120)

    def test_patient_optional_fields_are_omitted_when_unknown(self):
        user = User.objects.create_user(phone_number="09122222222", full_name="Sara")
        self.assertEqual(build_patient(user), {"name": "Sara"})

    def test_patient_null_when_nothing_known(self):
        self.assertIsNone(build_patient(None))
        user = User.objects.create_user(phone_number="09121111111")
        self.assertIsNone(build_patient(user))

    def test_logged_in_patient_is_sent_in_request(self):
        self.user.full_name = "Sara Ahmadi"
        self.user.sex = "female"
        self.user.save()
        self.post.return_value = ok()
        self.send("hi")
        self.assertEqual(self.sent_payload()["patient"], {"name": "Sara", "sex": "female"})

    def test_message_validation(self):
        self.assertEqual(self.send("   ").status_code, 400)
        self.assertEqual(self.send("x" * 4001).status_code, 400)
        self.post.return_value = ok()
        self.assertEqual(self.send("  " + "x" * 4000 + "  ").status_code, 200)
        self.assertEqual(self.post.call_count, 1)

    def test_timestamp_format(self):
        aware = datetime.datetime(2026, 9, 26, 12, 45, tzinfo=datetime.timezone(datetime.timedelta(hours=3, minutes=30)))
        self.assertEqual(to_rfc3339(aware), "2026-09-26T09:15:00Z")


class TriageStorageTests(ChatTestCase):
    """API.md §4.1 / §4.6 / §5.1: the backend stores the triage and sends it back unchanged.
    The backend actions of §5 are not built yet."""

    def test_triage_stored_after_every_successful_call(self):
        self.post.side_effect = [ok(level="unknown"), ok(level="high_priority", summary="first")]
        self.send("a")
        session = ChatSession.objects.get()
        self.assertEqual((session.triage_level, session.triage_summary), ("unknown", None))
        self.send("b")
        session.refresh_from_db()
        self.assertEqual((session.triage_level, session.triage_summary), ("high_priority", "first"))

    def test_summary_is_refined_when_level_does_not_change(self):
        self.post.side_effect = [ok(level="high_priority", summary="first"), ok(level="high_priority", summary="refined")]
        self.send("a"); self.send("b")
        self.assertEqual(ChatSession.objects.get().triage_summary, "refined")

    def test_stored_triage_is_sent_back_unchanged(self):
        self.post.side_effect = [ok(level="urgent", summary="chest pain"), ok(level="urgent", summary="chest pain, 20 min")]
        self.send("a"); self.send("b")
        self.assertEqual(self.sent_payload()["triage"], {"level": "urgent", "summary": "chest pain"})

    def test_response_has_no_summary_and_no_actions(self):
        self.post.return_value = ok(level="urgent", summary="staff only text")
        data = self.send("a").json()
        self.assertEqual(set(data), {"reply", "triage_level", "fallback"})
        self.assertEqual(data["triage_level"], "urgent")
        self.assertNotIn("staff only text", str(data))

    def test_downgrade_from_ai_service_is_discarded(self):
        self.post.side_effect = [ok(level="urgent", summary="s"), ok(level="low_priority", summary="s")]
        self.send("a")
        with self.assertLogs("apps.chat_gateway.services", level="ERROR"):
            data = self.send("b").json()
        self.assertTrue(data["fallback"])
        self.assertEqual(ChatSession.objects.get().triage_level, "urgent")

    def test_going_up_and_leaving_unknown_are_allowed(self):
        self.post.side_effect = [ok(level="unknown"), ok(level="low_priority", summary="s"), ok(level="urgent", summary="s")]
        for text in "abc":
            self.assertFalse(self.send(text).json()["fallback"])
        self.assertEqual(ChatSession.objects.get().triage_level, "urgent")


class FailureTests(ChatTestCase):
    """API.md §7."""

    def test_retry_once_on_503_then_success(self):
        self.post.side_effect = [err(503, "unavailable"), ok("recovered")]
        with mock.patch("apps.chat_gateway.ai_client.time.sleep") as sleep:
            data = self.send("a").json()
        self.assertEqual(data["reply"], "recovered")
        self.assertFalse(data["fallback"])
        self.assertEqual(self.post.call_count, 2)
        sleep.assert_called_once_with(settings.AI_SERVICE_RETRY_DELAY)

    def test_retry_once_on_timeout_and_connection_error(self):
        for first in (httpx.ReadTimeout("t"), httpx.ConnectError("c")):
            self.post.reset_mock()
            self.post.side_effect = [first, ok()]
            self.assertFalse(self.send("a", session_id=f"s-{type(first).__name__}").json()["fallback"])
            self.assertEqual(self.post.call_count, 2)

    def test_no_retry_on_400_and_401(self):
        for status in (400, 401):
            self.post.reset_mock()
            self.post.side_effect = None
            self.post.return_value = err(status, "invalid_request")
            with self.assertLogs("apps.chat_gateway.ai_client", level="ERROR"):
                data = self.send("a", session_id=f"s{status}").json()
            self.assertTrue(data["fallback"])
            self.assertEqual(self.post.call_count, 1)

    def test_fallback_after_two_failures(self):
        self.post.return_value = err(500)
        with mock.patch("apps.chat_gateway.ai_client.time.sleep"):
            data = self.send("a").json()
        self.assertEqual(self.post.call_count, 2)
        self.assertTrue(data["fallback"])
        # §7.3: unavailable + phone number + emergency services
        self.assertIn("temporarily unavailable", data["reply"])
        self.assertIn(settings.CLINIC_PHONE_NUMBER, data["reply"])
        self.assertIn("emergency", data["reply"])

    def test_fallback_keeps_triage_and_stays_out_of_history(self):
        self.post.side_effect = [ok(level="high_priority", summary="s"), err(500), err(500), ok(level="high_priority", summary="s")]
        self.send("a")
        with mock.patch("apps.chat_gateway.ai_client.time.sleep"):
            data = self.send("b").json()
        self.assertEqual(data["triage_level"], "high_priority")
        session = ChatSession.objects.get()
        self.assertEqual((session.triage_level, session.triage_summary), ("high_priority", "s"))

        self.send("c")
        history = self.sent_payload()["history"]
        self.assertNotIn(data["reply"], [h["content"] for h in history])
        # the unanswered patient message "b" is sent as a `user` history item (§6)
        self.assertIn(("user", "b"), [(h["role"], h["content"]) for h in history])

    def test_invalid_200_body_uses_fallback_without_retry(self):
        bad_bodies = [
            {"reply": "x", "triage": {"level": "nonsense", "summary": None}},
            {"reply": "x", "triage": {"level": "urgent", "summary": None}},
            {"triage": {"level": "unknown", "summary": None}},
        ]
        for i, body in enumerate(bad_bodies):
            self.post.reset_mock()
            self.post.return_value = httpx.Response(200, json=body)
            with self.assertLogs("apps.chat_gateway.ai_client", level="ERROR"):
                self.assertTrue(self.send("a", session_id=f"bad{i}").json()["fallback"])
            self.assertEqual(self.post.call_count, 1)

    def test_unknown_response_fields_are_ignored(self):
        self.post.return_value = httpx.Response(200, json={
            "reply": "r", "extra": 1, "triage": {"level": "unknown", "summary": None, "confidence": 0.3}})
        self.assertEqual(self.send("a").json()["reply"], "r")


class ConcurrencyAndOwnershipTests(ChatTestCase):
    def test_older_unanswered_message_is_not_sent_as_current(self):
        """Two messages stored, the older request must not call the AI Service (§6)."""
        session = ChatSession.objects.create(session_id=SID)
        older = ChatMessage.objects.create(session=session, role="user", content="older")
        ChatMessage.objects.create(session=session, role="user", content="newer")
        from .services import _latest_unanswered_user_message
        self.assertNotEqual(_latest_unanswered_user_message(session).pk, older.pk)

        self.post.return_value = ok()
        self.send("newest")
        body = self.sent_payload()
        self.assertEqual(body["message"]["content"], "newest")
        self.assertEqual([h["content"] for h in body["history"]], ["older", "newer"])
        self.assertTrue(all(h["role"] == "user" for h in body["history"]))

    def test_session_of_another_patient_is_forbidden(self):
        owner = User.objects.create_user(phone_number="09123334444")
        ChatSession.objects.create(session_id=SID, user=owner)
        self.post.return_value = ok()
        self.assertEqual(self.send("hi").status_code, 403)
        self.post.assert_not_called()

    def test_ai_request_never_carries_frontend_or_action_fields(self):
        """The request body is exactly the five fields of API.md §4.1."""
        self.post.return_value = ok(level="urgent", summary="s")
        self.send("a"); self.send("b")
        for call in self.post.call_args_list:
            self.assertEqual(set(call.kwargs["json"]), {"session_id", "message", "history", "triage", "patient"})
        self.assertNotIn("show_booking", str(self.post.call_args_list))
        self.assertNotIn("urgent_visit", str(self.post.call_args_list))

    def test_authentication_is_required(self):
        anonymous = APIClient()
        response = anonymous.post(URL, {"message": "hi", "session_id": SID}, format="json")
        self.assertEqual(response.status_code, 401)
        self.assertEqual(ChatSession.objects.count(), 0)
        self.post.assert_not_called()

    def test_invalid_token_is_rejected(self):
        response = APIClient().post(
            URL, {"message": "hi", "session_id": SID}, format="json",
            HTTP_AUTHORIZATION="Bearer not-a-token",
        )
        self.assertEqual(response.status_code, 401)
        self.post.assert_not_called()

    def test_valid_jwt_works_and_session_is_owned_by_the_patient(self):
        from rest_framework_simplejwt.tokens import RefreshToken
        token = str(RefreshToken.for_user(self.user).access_token)
        self.post.return_value = ok()
        response = APIClient().post(
            URL, {"message": "hi", "session_id": SID}, format="json",
            HTTP_AUTHORIZATION=f"Bearer {token}",
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(ChatSession.objects.get().user, self.user)

    def test_legacy_ownerless_session_is_adopted(self):
        ChatSession.objects.create(session_id=SID)
        self.post.return_value = ok()
        self.assertEqual(self.send("hi").status_code, 200)
        self.assertEqual(ChatSession.objects.get().user, self.user)


class ClientUnitTests(SimpleTestCase):
    def test_settings_present(self):
        for name in ("AI_SERVICE_BASE_URL", "AI_SERVICE_API_KEY", "AI_SERVICE_TIMEOUT", "AI_SERVICE_RETRY_DELAY", "CLINIC_PHONE_NUMBER"):
            self.assertTrue(hasattr(settings, name))

    def test_default_timeout_is_30_seconds(self):
        from config import settings as project_settings
        self.assertEqual(project_settings.AI_SERVICE_TIMEOUT, 30)
        self.assertEqual(project_settings.AI_SERVICE_RETRY_DELAY, 2)
