import os
import django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from core.models import Scan
from core.services import ScanOrchestrationService, trigger_scan
from core.services.vcs import GitProvider
from core.services.notifier import WebSocketNotifier
from core.services.scanner import FileScannerService
from ai.agents.orchestrator import ScanOrchestrator

scan = Scan.objects.filter(repository__name='cricket-simulator').last()
if scan:
    print(f"Executing scan for {scan.repository.name} (URL: {scan.repository.clone_url})")
    vcs = GitProvider()
    notifier = WebSocketNotifier()
    scanner = FileScannerService()
    ai_orchestrator = ScanOrchestrator()
    service = ScanOrchestrationService(vcs, notifier, scanner, ai_orchestrator)
    service.execute_scan(scan.id)
    scan.refresh_from_db()
    print(f"Scan Status: {scan.status}")
    print(f"Total Vulnerabilities: {scan.total_vulnerabilities}")
    for vuln in scan.vulnerabilities.all():
        print(f" - {vuln.title} [{vuln.severity}]: {vuln.file_path}:{vuln.line_start}")
else:
    print("Scan not found")
