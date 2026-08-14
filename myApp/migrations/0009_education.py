from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('myApp', '0008_experience_certification_bookmarked_startups'),
    ]

    operations = [
        migrations.CreateModel(
            name='Education',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('institution', models.CharField(max_length=255)),
                ('degree', models.CharField(blank=True, default='', max_length=255)),
                ('period', models.CharField(blank=True, default='', max_length=100)),
                ('gpa', models.CharField(blank=True, default='', max_length=50)),
                ('courses', models.CharField(blank=True, default='', max_length=500)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('student', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='education_entries', to='myApp.student')),
            ],
            options={
                'ordering': ['-created_at'],
            },
        ),
    ]
