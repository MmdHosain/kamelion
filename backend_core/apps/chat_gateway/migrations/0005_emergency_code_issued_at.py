from django.db import migrations, models
from django.db.models import F


def backfill_issue_dates(apps, schema_editor):
    action = apps.get_model("chat_gateway", "TriageAction")
    action.objects.using(schema_editor.connection.alias).filter(
        kind="emergency_code", emergency_code__isnull=False,
    ).exclude(emergency_code="").update(emergency_code_issued_at=F("created_at"))


class Migration(migrations.Migration):
    dependencies = [("chat_gateway", "0004_triage_actions")]

    operations = [
        migrations.AddField(
            model_name="triageaction",
            name="emergency_code_issued_at",
            field=models.DateTimeField(blank=True, db_index=True, null=True),
        ),
        migrations.RunPython(backfill_issue_dates, migrations.RunPython.noop),
    ]
