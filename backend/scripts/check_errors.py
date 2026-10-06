import os
import django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from core.models import Scan

scans = Scan.objects.filter(status='FAILED')
print(f"Found {scans.count()} failed scans")
for s in scans:
    print(f"Scan {s.id} error: {s.error_message}")
