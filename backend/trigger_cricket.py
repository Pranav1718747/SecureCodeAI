import os
import django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from repositories.models import Repository
from accounts.models import User
from reviews.services import ScanOrchestrationService

user = User.objects.first()
repo = Repository.objects.filter(full_name__icontains="cricket-simulator").first()
scan = ScanOrchestrationService.trigger_scan(repo, user)
print(f"Triggered scan {scan.id}")
ScanOrchestrationService.execute_scan(scan.id)
