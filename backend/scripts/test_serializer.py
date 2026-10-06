import os
import django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from core.models import Scan, Vulnerability
from reviews.serializers import VulnerabilitySerializer

scan = Scan.objects.filter(status='IN_PROGRESS').first() or Scan.objects.filter(status='COMPLETED', total_vulnerabilities__gt=0).first()
if not scan:
    print("No scans")
    exit()

vulns = Vulnerability.objects.filter(scan=scan)
print(f"Total Vulns in DB: {vulns.count()}")

# simulate pagination manually, DRF defaults to 20
page = vulns[:20]
data = VulnerabilitySerializer(page, many=True).data

print(f"Serialized count: {len(data)}")
if len(data) > 0:
    print(f"First vuln ID: {data[0]['id']}")
