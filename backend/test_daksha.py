import os
import django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from repositories.models import Repository
from accounts.models import User
from reviews.services import ScanOrchestrationService
from reviews.models import Scan

user = User.objects.first()
repo = Repository.objects.filter(full_name__icontains="Shooter-ai-Agent-Demo").first()
if repo:
    scan = ScanOrchestrationService.trigger_scan(repo, user)
    print(f"Triggered scan {scan.id}")
    ScanOrchestrationService.execute_scan(str(scan.id))
    
    scan.refresh_from_db()
    print(f"Final Status: {scan.status}, Error: {scan.error_message}")
else:
    print("Daksha repo not found")
