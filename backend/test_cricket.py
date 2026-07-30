import os
import django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from reviews.models import Scan
from reviews.services import ScanOrchestrationService

scan = Scan.objects.filter(repository__name='cricket-simulator').last()
if scan:
    print(f"Executing scan for {scan.repository.name} (URL: {scan.repository.clone_url})")
    ScanOrchestrationService.execute_scan(scan.id)
    scan.refresh_from_db()
    print(f"Scan Status: {scan.status}")
    print(f"Total Vulnerabilities: {scan.total_vulnerabilities}")
    for vuln in scan.vulnerabilities.all():
        print(f" - {vuln.title} [{vuln.severity}]: {vuln.file_path}:{vuln.line_start}")
else:
    print("Scan not found")
