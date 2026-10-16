from django.db import migrations, models


def copy_date_of_birth(apps, schema_editor):
    """Keep any date of birth already stored on a PatientProfile."""
    PatientProfile = apps.get_model("users", "PatientProfile")
    User = apps.get_model("users", "User")
    for profile in PatientProfile.objects.exclude(date_of_birth__isnull=True).iterator():
        User.objects.filter(pk=profile.user_id).update(date_of_birth=profile.date_of_birth)


class Migration(migrations.Migration):

    dependencies = [
        ("users", "0005_phoneverification"),
    ]

    operations = [
        migrations.AddField(
            model_name="user",
            name="sex",
            field=models.CharField(blank=True, choices=[("female", "Female"), ("male", "Male")], max_length=10, null=True),
        ),
        migrations.AddField(
            model_name="user",
            name="date_of_birth",
            field=models.DateField(blank=True, null=True),
        ),
        migrations.RunPython(copy_date_of_birth, migrations.RunPython.noop),
        migrations.DeleteModel(name="PatientProfile"),
    ]
