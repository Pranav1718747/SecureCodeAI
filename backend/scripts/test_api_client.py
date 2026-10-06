import os
import django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from rest_framework.test import APIClient
from accounts.models import User
from core.models import Scan

user = User.objects.first()
scan = Scan.objects.filter(total_vulnerabilities__gt=1).first() or Scan.objects.filter(status='IN_PROGRESS').first()
if not scan:
    scan = Scan.objects.first()

print(f"Testing scan {scan.id} with status {scan.status}")

client = APIClient(SERVER_NAME='localhost')
client.force_authenticate(user=user)
response = client.get(f'/api/v1/reviews/vulnerabilities/?scan_id={scan.id}')
print("Status:", response.status_code)
if response.status_code == 200:
    data = response.json()
    print("Count:", data.get('count'))
    results = data.get('results', [])
    print("Results length:", len(results))
