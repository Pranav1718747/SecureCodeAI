import os
import django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from repositories.models import Repository
from reviews.models import Scan
from reviews.services import ScanOrchestrationService

try:
    repo = Repository.objects.get(id="db39b12e-fba6-4424-86d5-013609e3cb7b")
    print(f"Repo: {repo.name} - URL: {repo.clone_url}")
    scans = Scan.objects.filter(repository=repo)
    if scans.exists():
        scan = scans.last()
        print(f"Testing scan {scan.id}")
        ScanOrchestrationService.execute_scan(scan.id)
        scan.refresh_from_db()
        print(f"Scan status is now {scan.status}")
        print(f"Scan error_message: {scan.error_message}")
    else:
        print("No scans found.")
except Exception as e:
    print(f"Exception: {e}")
