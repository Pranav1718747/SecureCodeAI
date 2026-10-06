import os
import django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from core.models import Scan

scans = Scan.objects.all()
for s in scans:
    db_count = s.vulnerabilities.count()
    if s.total_vulnerabilities != db_count and s.status == 'COMPLETED':
        print(f"Mismatch in scan {s.id}: DB has {db_count} vulns, but total_vulnerabilities is {s.total_vulnerabilities}")
