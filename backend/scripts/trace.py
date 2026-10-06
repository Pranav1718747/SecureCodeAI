import os
import django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from core.models import Scan, Vulnerability
from accounts.models import User
from rest_framework.test import APIRequestFactory, force_authenticate
from core.views import VulnerabilityViewSet

def trace_scan(scan_id):
    scan = Scan.objects.get(id=scan_id)
    print(f"Tracing Scan ID: {scan_id}")
    print(f"Repository: {scan.repository.full_name}")
    print(f"Scan Status: {scan.status}")
    print(f"Scan total_vulnerabilities: {scan.total_vulnerabilities}")
    
    db_vulns = Vulnerability.objects.filter(scan=scan).count()
    print(f"Database Saved: {db_vulns}")
    
    user = User.objects.first()
    factory = APIRequestFactory()
    view = VulnerabilityViewSet.as_view({'get': 'list'})
    request = factory.get(f'/api/v1/vulnerabilities/?scan_id={scan_id}')
    force_authenticate(request, user=user)
    
    response = view(request)
    api_count = response.data.get('count')
    print(f"API Returned count: {api_count}")
    print("-" * 40)

trace_scan('288b3025-54c5-4f30-90f1-07499cbb58f2') # working
trace_scan('920238ca-07d3-4b14-af69-7e74acec29bc') # failing (ClimateSync)
trace_scan('53dbf086-8958-4ca8-bba7-ee75bd393d5a') # my test (ClimateSync)
