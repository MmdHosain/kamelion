from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0003_patientnote'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='national_id',
            field=models.CharField(blank=True, max_length=20, null=True),
        ),
        migrations.RemoveIndex(
            model_name='patientprofile',
            name='users_patie_nationa_d4de0b_idx',
        ),
        migrations.RemoveField(
            model_name='patientprofile',
            name='national_id',
        ),
    ]
