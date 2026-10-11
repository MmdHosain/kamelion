from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("appointments", "0004_appointment_pending_status"),
    ]

    operations = [
        migrations.AddField(
            model_name="appointment",
            name="disapproval_reason",
            field=models.TextField(blank=True, default=""),
        ),
    ]