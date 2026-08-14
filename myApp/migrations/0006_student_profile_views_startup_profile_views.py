from django.db import migrations, models
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ('myApp', '0005_opportunity_is_general_notification_application'),
    ]

    operations = [
        migrations.AddField(
            model_name='student',
            name='profile_views',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='startup',
            name='profile_views',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='opportunity',
            name='created_at',
            field=models.DateTimeField(default=django.utils.timezone.now, auto_now_add=True),
        ),
    ]
