import uuid

import django.db.models.deletion
import django.utils.timezone
from django.conf import settings
from django.db import migrations, models


def fill_ai_session_ids(apps, schema_editor):
    ChatSession = apps.get_model("chat_gateway", "ChatSession")
    for session in ChatSession.objects.filter(ai_session_id__isnull=True).iterator():
        session.ai_session_id = uuid.uuid4()
        session.save(update_fields=["ai_session_id"])


def bot_to_backend(apps, schema_editor):
    """
    Messages written before the rebuild came from the old local rule-based / FastAPI
    gateway, not from the AI Service contract. Marking them `backend` keeps them out of
    the `history` sent to the AI Service (API.md §4.3).
    """
    ChatMessage = apps.get_model("chat_gateway", "ChatMessage")
    ChatMessage.objects.filter(role="bot").update(role="backend")


def backend_to_bot(apps, schema_editor):
    ChatMessage = apps.get_model("chat_gateway", "ChatMessage")
    ChatMessage.objects.filter(role__in=["backend", "assistant"]).update(role="bot")


class Migration(migrations.Migration):

    dependencies = [
        ("chat_gateway", "0001_initial"),
    ]

    operations = [
        # ── ChatSession ────────────────────────────────────────────────
        migrations.AddField(
            model_name="chatsession",
            name="triage_level",
            field=models.CharField(
                blank=True, null=True, max_length=20,
                choices=[
                    ("unknown", "Unknown"), ("out_of_scope", "Out of scope"),
                    ("low_priority", "Low priority"), ("high_priority", "High priority"),
                    ("urgent", "Urgent"),
                ],
            ),
        ),
        migrations.AddField(
            model_name="chatsession",
            name="triage_summary",
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="chatsession",
            name="ai_session_id",
            field=models.UUIDField(null=True, editable=False),
        ),
        migrations.RunPython(fill_ai_session_ids, migrations.RunPython.noop),
        migrations.AlterField(
            model_name="chatsession",
            name="ai_session_id",
            field=models.UUIDField(default=uuid.uuid4, editable=False, unique=True),
        ),
        migrations.AlterModelOptions(
            name="chatsession",
            options={"ordering": ["-updated_at"]},
        ),

        # ── ChatMessage ────────────────────────────────────────────────
        migrations.RemoveIndex(
            model_name="chatmessage",
            name="chat_gatewa_is_emer_fa2ad4_idx",
        ),
        migrations.RemoveField(model_name="chatmessage", name="is_emergency"),
        migrations.RemoveField(model_name="chatmessage", name="emergency_code"),
        migrations.RenameField(model_name="chatmessage", old_name="sender", new_name="role"),
        migrations.RenameField(model_name="chatmessage", old_name="text", new_name="content"),
        migrations.AlterField(
            model_name="chatmessage",
            name="role",
            field=models.CharField(
                max_length=10,
                choices=[("user", "Patient"), ("assistant", "AI Service reply"), ("backend", "Backend generated")],
            ),
        ),
        migrations.RunPython(bot_to_backend, backend_to_bot),
        migrations.AddField(
            model_name="chatmessage",
            name="kind",
            field=models.CharField(
                blank=True, default="", max_length=30,
                choices=[("fallback", "Fallback message"), ("urgent_confirmation", "Urgent visit confirmation")],
            ),
        ),
        migrations.AlterField(
            model_name="chatmessage",
            name="created_at",
            field=models.DateTimeField(default=django.utils.timezone.now),
        ),
        migrations.AlterModelOptions(
            name="chatmessage",
            options={"ordering": ["created_at", "id"]},
        ),
        migrations.AddIndex(
            model_name="chatmessage",
            index=models.Index(fields=["session", "id"], name="chat_gatewa_session_e0cbc5_idx"),
        ),

        # ── TriageAction ───────────────────────────────────────────────
        migrations.CreateModel(
            name="TriageAction",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("level", models.CharField(
                    max_length=20,
                    choices=[("low_priority", "Low priority"), ("high_priority", "High priority"), ("urgent", "Urgent")],
                )),
                ("status", models.CharField(
                    default="open", max_length=12,
                    choices=[
                        ("open", "Open"), ("done", "Handled"), ("superseded", "Superseded"),
                        ("failed", "Failed - needs staff attention"),
                    ],
                )),
                ("visit_code", models.CharField(blank=True, max_length=20, null=True, unique=True)),
                ("visit_date", models.DateField(blank=True, null=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("session", models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE, related_name="actions", to="chat_gateway.chatsession",
                )),
            ],
            options={"ordering": ["-created_at"]},
        ),
        migrations.AddIndex(
            model_name="triageaction",
            index=models.Index(fields=["level", "status"], name="chat_gatewa_level_87a096_idx"),
        ),
        migrations.AddConstraint(
            model_name="triageaction",
            constraint=models.UniqueConstraint(fields=("session", "level"), name="unique_action_per_session_level"),
        ),
    ]
