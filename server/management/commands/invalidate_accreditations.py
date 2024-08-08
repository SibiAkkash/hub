from typing import Any

from dateutil.relativedelta import relativedelta
from django.core.management.base import BaseCommand
from django.utils.timezone import now

from server.core.models import Accreditation


class Command(BaseCommand):
    help = "Invalidate accreditations whose validity end date has passed"

    def handle(self, *args: Any, **options: Any) -> None:
        start_date = now() - relativedelta(months=18)
        stale_accreditations = Accreditation.objects.filter(date__lte=start_date)
        n = stale_accreditations.count()
        if n > 0:
            stale_accreditations.update(is_valid=False)
            self.stdout.write(self.style.SUCCESS(f"Invalidated {n} accreditations"))
        else:
            self.stdout.write(self.style.NOTICE("No outdated accreditations found"))

        valid_accreditations = Accreditation.objects.filter(date__gt=start_date)
        n = valid_accreditations.count()
        if n > 0:
            valid_accreditations.update(is_valid=True)
            self.stdout.write(self.style.SUCCESS(f"Validated {n} accreditations"))
        else:
            self.stdout.write(self.style.NOTICE("No valid accreditations found"))
