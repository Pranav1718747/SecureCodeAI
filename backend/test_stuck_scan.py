import os
import django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()
from reviews.models import Scan
scan = Scan.objects.get(id="054b882d-a99d-4638-a505-91ebdf5ea246")
print("Status:", scan.status)
print("Total Vulns:", scan.total_vulnerabilities)
