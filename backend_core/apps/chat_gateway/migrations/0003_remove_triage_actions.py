from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("chat_gateway", "0002_ai_service_contract_rebuild"),
    ]

    operations = [
        migrations.DeleteModel(name="TriageAction"),
        migrations.AlterField(
            model_name="chatmessage",
            name="kind",
            field=models.CharField(
                blank=True, default="", max_length=30,
                choices=[("fallback", "Fallback message")],
            ),
        ),
    ]
