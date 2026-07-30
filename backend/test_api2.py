import os
import django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from django.test import Client
from accounts.models import User
from reviews.models import Scan

user = User.objects.first()
scan = Scan.objects.filter(total_vulnerabilities__gt=1).first() or Scan.objects.filter(status='IN_PROGRESS').first()
if not scan:
    print("No scans with >1 vulns found")
    exit()
print(f"Testing scan {scan.id}")
client = Client(SERVER_NAME='localhost')
client.force_login(user)
resp = client.get(f'/api/v1/reviews/vulnerabilities/?scan_id={scan.id}')
data = resp.json()
results = data.get('results', [])
print(f"Count: {data.get('count')}")
print(f"Results len: {len(results)}")
if len(results) > 0:
    print("IDs:", [r['id'] for r in results][:5])
