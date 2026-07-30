import os
import django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from repositories.models import Repository
from reviews.models import Scan
from reviews.services import ScanOrchestrationService

# Try finding the repo
repos = Repository.objects.filter(name__icontains='Shooter')
for r in repos:
    print(f"Found repo: {r.id} - {r.name} - URL: {r.clone_url} - Branch: {r.default_branch}")
    scans = Scan.objects.filter(repository=r)
    for s in scans:
        print(f"Scan {s.id} - Status: {s.status}")
        # Try running it
        try:
            ScanOrchestrationService.execute_scan(s.id)
        except Exception as e:
            print(f"Execute scan threw an error: {e}")
            import traceback
            traceback.print_exc()

