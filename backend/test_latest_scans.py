import os
import django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()
from reviews.models import Scan
scans = Scan.objects.all().order_by('-created_at')[:5]
for s in scans:
    print(f"Scan {s.id}: Status={s.status} Vulns={s.total_vulnerabilities}")
