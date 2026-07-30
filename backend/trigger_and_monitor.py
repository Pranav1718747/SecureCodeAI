import os
import django
import time
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from repositories.models import Repository
from reviews.models import Scan, Vulnerability
from reviews.services import ScanOrchestrationService
from accounts.models import User

user = User.objects.first()
repo = Repository.objects.filter(full_name__icontains="cricket").first()

if not repo:
    print("Cricket repo not found")
    exit()

print(f"Triggering scan for {repo.name}...")
scan = ScanOrchestrationService.trigger_scan(repo, user)

while True:
    scan.refresh_from_db()
    vulns = Vulnerability.objects.filter(scan=scan)
    print(f"Scan {scan.id} | Status: {scan.status} | Vulns in DB: {vulns.count()} | DB counter: {scan.total_vulnerabilities}")
    if scan.status in ['COMPLETED', 'FAILED']:
        break
    time.sleep(2)
print("Final DB vulns:", vulns.count())
