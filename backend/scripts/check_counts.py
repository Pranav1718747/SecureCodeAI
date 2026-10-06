import os
import django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from core.models import Repository
from core.models import Scan, Vulnerability

repo = Repository.objects.filter(full_name__icontains="cricket-simulator").first()
if repo:
    scans = Scan.objects.filter(repository=repo).order_by('-created_at')
    for scan in scans:
        vulns = Vulnerability.objects.filter(scan=scan)
        print(f"Scan ID: {scan.id}, Status: {scan.status}, Total on Scan: {scan.total_vulnerabilities}, Vulns in DB: {vulns.count()}")
else:
    print("Cricket simulator repo not found")
