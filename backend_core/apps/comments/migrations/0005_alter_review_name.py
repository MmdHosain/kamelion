# Generated manually

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('comments', '0004_review_remove_comment_comments_co_status_2720ea_idx_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='review',
            name='name',
            field=models.CharField(blank=True, default='', max_length=100),
        ),
    ]
