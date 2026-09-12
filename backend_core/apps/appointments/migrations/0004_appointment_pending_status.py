from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('appointments', '0003_alter_doctoravailability_options_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='appointment',
            name='status',
            field=models.CharField(
                choices=[
                    ('pending', 'Pending'),
                    ('scheduled', 'Scheduled'),
                    ('cancelled_user', 'Cancelled by User'),
                    ('cancelled_admin', 'Cancelled by Admin'),
                    ('visited', 'Visited'),
                ],
                default='pending',
                max_length=20,
            ),
        ),
        migrations.RemoveConstraint(
            model_name='appointment',
            name='unique_scheduled_appointment_slot',
        ),
        migrations.AddConstraint(
            model_name='appointment',
            constraint=models.UniqueConstraint(
                condition=models.Q(status__in=['scheduled', 'pending']),
                fields=('appointment_date', 'appointment_time'),
                name='unique_scheduled_appointment_slot',
            ),
        ),
    ]
