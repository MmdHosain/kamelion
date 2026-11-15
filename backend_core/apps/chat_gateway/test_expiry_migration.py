"""Existing codes retain their original seven-day lifetime after upgrading."""
from datetime import timedelta

from django.db import connection
from django.db.migrations.executor import MigrationExecutor
from django.test import TransactionTestCase
from django.utils import timezone


class EmergencyExpiryMigrationTests(TransactionTestCase):
    def test_backfill_uses_original_issue_date_and_leaves_booking_actions_null(self):
        previous = [("chat_gateway", "0004_triage_actions")]
        current = [("chat_gateway", "0005_emergency_code_issued_at")]
        executor = MigrationExecutor(connection)
        executor.migrate(previous)
        try:
            old_apps = executor.loader.project_state(previous).apps
            session_model = old_apps.get_model("chat_gateway", "ChatSession")
            action_model = old_apps.get_model("chat_gateway", "TriageAction")
            session = session_model.objects.create(session_id="old")
            original = timezone.now() - timedelta(days=10)
            urgent = action_model.objects.create(
                session=session, level="urgent", kind="emergency_code", emergency_code="URG-OLD234",
            )
            action_model.objects.filter(pk=urgent.pk).update(created_at=original)
            booking = action_model.objects.create(session=session, level="low_priority", kind="booking_offer")
        finally:
            executor = MigrationExecutor(connection)
            executor.migrate(current)
        from .models import TriageAction
        action = TriageAction.objects.get(pk=urgent.pk)
        self.assertEqual(action.emergency_code_issued_at, original)
        self.assertEqual(action.emergency_code_expires_at, original + timedelta(days=7))
        self.assertTrue(action.emergency_code_is_expired)
        self.assertIsNone(TriageAction.objects.get(pk=booking.pk).emergency_code_issued_at)
