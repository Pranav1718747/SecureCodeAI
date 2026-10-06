import os
import django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from django.test import RequestFactory
from accounts.models import User
from core.models import Scan
from core.views import VulnerabilityViewSet

user = User.objects.first()
scan = Scan.objects.filter(total_vulnerabilities__gt=1).first() or Scan.objects.filter(status='IN_PROGRESS').first()
if not scan:
    print("No scan")
    exit()
    
factory = RequestFactory()
request = factory.get(f'/api/v1/reviews/vulnerabilities/?scan_id={scan.id}')
request.user = user

view = VulnerabilityViewSet.as_view({'get': 'list'})
response = view(request)
print("Status:", response.status_code)
if response.status_code == 200:
    data = response.data
    print("Count:", data.get('count'))
    print("Results length:", len(data.get('results', [])))
