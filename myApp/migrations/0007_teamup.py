from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('myApp', '0006_student_profile_views_startup_profile_views'),
    ]

    operations = [
        migrations.CreateModel(
            name='TeamUp',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('status', models.CharField(choices=[('pending', 'Pending'), ('accepted', 'Accepted'), ('declined', 'Declined')], default='pending', max_length=20)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('recipient', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='teamup_received', to='myApp.student')),
                ('requester', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='teamup_sent', to='myApp.student')),
            ],
            options={
                'unique_together': {('requester', 'recipient')},
            },
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
                    ('teamup_request', 'Team-up request'),
                    ('teamup_accepted', 'Team-up accepted'),
                ],
                max_length=30,
            ),
        ),
    ]
