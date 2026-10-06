import os
import django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from core.models import Repository
from core.models import Scan, Vulnerability

repo = Repository.objects.filter(full_name__icontains="cricket-simulator").first()
if repo:
    scans = Scan.objects.filter(repository=repo).order_by('-created_at')
    if scans.exists():
        scan = scans.first()
        print(f"Scan ID: {scan.id}, Status: {scan.status}")
        print(f"Total vulnerabilities field on scan: {scan.total_vulnerabilities}")
        vulns = Vulnerability.objects.filter(scan=scan)
        print(f"Total vulnerabilities in DB for this scan: {vulns.count()}")
        print("Titles:")
        for v in vulns:
            print(f"- {v.title} ({v.file_path}:{v.line_start})")
    else:
        print("No scans found for cricket simulator")
else:
    print("Cricket simulator repo not found")
