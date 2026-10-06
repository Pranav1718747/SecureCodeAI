import os
import django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from django.test import Client
from core.models import Repository
from core.models import Scan
from accounts.models import User

# Need an authenticated client
user = User.objects.first()
scan = Scan.objects.filter(status='IN_PROGRESS').first() or Scan.objects.filter(status='COMPLETED', total_vulnerabilities__gt=0).first() or Scan.objects.first()
if not scan:
    print("No scans")
    exit()

print(f"Testing scan {scan.id}, status={scan.status}")

client = Client()
client.force_login(user)
resp = client.get(f'/api/v1/reviews/vulnerabilities/?scan_id={scan.id}')
data = resp.json()

print(f"Total count in API response: {data.get('count')}")
results = data.get('results', [])
print(f"Results array length: {len(results)}")
if len(results) > 0:
    print(f"First vuln ID: {results[0]['id']}")
