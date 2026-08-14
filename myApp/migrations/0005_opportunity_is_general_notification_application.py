from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('myApp', '0004_student_bookmarks'),
    ]

    operations = [
        migrations.AddField(
            model_name='opportunity',
            name='is_general',
            field=models.BooleanField(default=False),
        ),
        migrations.AlterField(
            model_name='notification',
            name='type',
            field=models.CharField(
                choices=[
                    ('invitation', 'Project invitation'),
                    ('invite_accepted', 'Teammate accepted'),
                    ('invite_declined', 'Teammate declined'),
                    ('group_active', 'Group is now active'),
                    ('status_change', 'Application status changed'),
                    ('message', 'New message'),
                    ('application', 'New application received'),
                ],
                max_length=30,
            ),
        ),
    ]
