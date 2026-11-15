"""Urgent queue membership, permissions, response contract and pagination."""
from datetime import timedelta
from unittest import mock

from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient

from apps.users.models import User

from .models import ChatSession, TriageAction

URL = "/api/admin/patients/urgent/"


class UrgentPatientsTests(TestCase):
    def setUp(self):
        self.now = timezone.now()
        clock = mock.patch("django.utils.timezone.now", return_value=self.now)
        clock.start()
        self.addCleanup(clock.stop)
        self.admin = User.objects.create_user("09120000000")
        self.admin.is_staff = True
        self.admin.save()
        self.client = APIClient()
        self.client.force_authenticate(self.admin)
        self.counter = 0

    def patient(self, name="Patient"):
        self.counter += 1
        return User.objects.create_user(f"0912{self.counter:07}", full_name=name)

    def assessment(self, patient, level="urgent", assessed_at=None, issued_at=None, code=True):
        sid = f"session-{ChatSession.objects.count() + 1}"
        session = ChatSession.objects.create(
            user=patient, session_id=sid, triage_level=level,
            triage_summary="Staff-only clinical summary" if level else None,
        )
        ChatSession.objects.filter(pk=session.pk).update(updated_at=assessed_at or self.now)
        session.refresh_from_db()
        if level == "urgent" and code:
            TriageAction.objects.create(
                session=session, level="urgent", kind="emergency_code",
                emergency_code=f"URG-{session.pk:06}",
                emergency_code_issued_at=issued_at or self.now,
            )
        return session

    def results(self):
        response = self.client.get(URL)
        self.assertEqual(response.status_code, 200)
        return response.json()["results"]

    def test_admin_only(self):
        self.client.force_authenticate(None)
        self.assertEqual(self.client.get(URL).status_code, 401)
        self.client.force_authenticate(self.patient())
        self.assertEqual(self.client.get(URL).status_code, 403)

    def test_empty_queue_is_paginated(self):
        self.assertEqual(self.client.get(URL).json(), {
            "count": 0, "next": None, "previous": None, "results": [],
        })

    def test_response_includes_contact_summary_and_exact_seven_day_expiry(self):
        patient = self.patient("Test Patient")
        session = self.assessment(patient)
        row, = self.results()
        self.assertEqual(set(row), {
            "id", "full_name", "phone_number", "chat_id", "session_id",
            "triage_level", "triage_summary", "assessed_at", "emergency_code",
            "emergency_code_issued_at", "emergency_code_expires_at",
            "emergency_code_is_expired",
        })
        self.assertEqual(row["id"], patient.pk)
        self.assertEqual(row["full_name"], "Test Patient")
        self.assertEqual(row["phone_number"], patient.phone_number)
        self.assertEqual(row["chat_id"], session.pk)
        self.assertEqual(row["session_id"], session.session_id)
        self.assertEqual(row["triage_level"], "urgent")
        self.assertEqual(row["triage_summary"], session.triage_summary)
        self.assertEqual(row["emergency_code"], session.triage_actions.get().emergency_code)
        from django.utils.dateparse import parse_datetime
        self.assertEqual(parse_datetime(row["emergency_code_issued_at"]), self.now)
        self.assertEqual(parse_datetime(row["emergency_code_expires_at"]), self.now + timedelta(days=7))
        self.assertFalse(row["emergency_code_is_expired"])

    def test_expired_and_exact_boundary_codes_are_excluded(self):
        for age in (timedelta(days=8), timedelta(days=7)):
            self.assessment(self.patient(), issued_at=self.now - age)
        active = self.patient()
        self.assessment(active, issued_at=self.now - timedelta(days=7) + timedelta(microseconds=1))
        self.assertEqual([row["id"] for row in self.results()], [active.pk])

    def test_newer_nonurgent_assessment_hides_old_valid_urgent_code(self):
        for level in ("unknown", "out_of_scope", "low_priority", "high_priority"):
            patient = self.patient()
            self.assessment(patient, assessed_at=self.now - timedelta(minutes=1))
            self.assessment(patient, level=level)
        self.assertEqual(self.results(), [])

    def test_new_untriaged_chat_does_not_replace_latest_assessment(self):
        patient = self.patient()
        self.assessment(patient, assessed_at=self.now - timedelta(minutes=1))
        self.assessment(patient, level=None)
        self.assertEqual([row["id"] for row in self.results()], [patient.pk])

    def test_expired_latest_code_does_not_reveal_older_valid_code(self):
        patient = self.patient()
        self.assessment(patient, assessed_at=self.now - timedelta(minutes=1))
        self.assessment(patient, issued_at=self.now - timedelta(days=8))
        self.assertEqual(self.results(), [])

    def test_patient_is_listed_once_with_newest_urgent_session(self):
        patient = self.patient()
        self.assessment(patient, assessed_at=self.now - timedelta(minutes=1))
        latest = self.assessment(patient)
        row, = self.results()
        self.assertEqual(row["chat_id"], latest.pk)

    def test_latest_assessment_ties_use_larger_chat_id(self):
        patient = self.patient()
        self.assessment(patient)
        self.assessment(patient, level="low_priority")
        self.assertEqual(self.results(), [])

    def test_staff_ownerless_missing_or_incomplete_codes_are_excluded(self):
        self.assessment(self.admin)
        self.assessment(None)
        self.assessment(self.patient(), code=False)
        blank = self.assessment(self.patient())
        blank.triage_actions.update(emergency_code="")
        incomplete = self.assessment(self.patient())
        incomplete.triage_actions.update(emergency_code_issued_at=None)
        self.assertEqual(self.results(), [])

    def test_missing_name_is_empty_string(self):
        self.assessment(self.patient(None))
        self.assertEqual(self.results()[0]["full_name"], "")

    def test_newest_first_and_default_pagination(self):
        sessions = [self.assessment(self.patient(), assessed_at=self.now - timedelta(minutes=i))
                    for i in range(12)]
        response = self.client.get(URL).json()
        self.assertEqual(response["count"], 12)
        self.assertEqual([row["chat_id"] for row in response["results"]],
                         [session.pk for session in sessions[:10]])
        self.assertIsNotNone(response["next"])
        page2 = self.client.get(URL, {"page": 2}).json()
        self.assertEqual([row["chat_id"] for row in page2["results"]],
                         [session.pk for session in sessions[10:]])
        self.assertEqual(len(self.client.get(URL, {"page_size": 1000}).json()["results"]), 12)

    def test_page_size_is_capped_at_100(self):
        for _ in range(101):
            self.assessment(self.patient())
        self.assertEqual(len(self.client.get(URL, {"page_size": 1000}).json()["results"]), 100)

    def test_response_queries_do_not_grow_with_patient_count(self):
        self.assessment(self.patient())
        with self.assertNumQueries(2):
            self.results()
        for _ in range(5):
            self.assessment(self.patient())
        with self.assertNumQueries(2):
            self.results()
