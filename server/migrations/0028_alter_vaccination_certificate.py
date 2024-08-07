# Generated by Django 4.2.2 on 2023-09-20 13:40

from django.db import migrations, models

from server.core.models import upload_vaccination_certificates


class Migration(migrations.Migration):
    dependencies = [
        ("server", "0027_manualtransaction"),
    ]

    operations = [
        migrations.AlterField(
            model_name="vaccination",
            name="certificate",
            field=models.FileField(blank=True, upload_to=upload_vaccination_certificates),
        ),
    ]
