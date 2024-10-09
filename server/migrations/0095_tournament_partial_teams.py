# Generated by Django 4.2.2 on 2024-10-09 17:52

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("server", "0094_event_is_membership_needed"),
    ]

    operations = [
        migrations.AddField(
            model_name="tournament",
            name="partial_teams",
            field=models.ManyToManyField(
                blank=True, related_name="partial_reg_tournaments", to="server.team"
            ),
        ),
    ]
