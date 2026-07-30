import os
import django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from reviews.models import Scan
from reviews.services import ScanOrchestrationService

failed_scans = Scan.objects.filter(status='FAILED')
if failed_scans.exists():
    scan = failed_scans.last()
    print(f"Retrying Scan {scan.id} for repo {scan.repository.name}")
    ScanOrchestrationService.execute_scan(scan.id)
else:
    print("No failed scans found.")
