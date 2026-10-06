import os
import django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from core.models import Repository
from core.models import Scan
from core.services import ScanOrchestrationService, trigger_scan
from core.services.vcs import GitProvider
from core.services.notifier import WebSocketNotifier
from core.services.scanner import FileScannerService
from ai.agents.orchestrator import ScanOrchestrator

# Try finding the repo
repos = Repository.objects.filter(name__icontains='Shooter')
for r in repos:
    print(f"Found repo: {r.id} - {r.name} - URL: {r.clone_url} - Branch: {r.default_branch}")
    scans = Scan.objects.filter(repository=r)
    for s in scans:
        print(f"Scan {s.id} - Status: {s.status}")
        # Try running it
        try:
            vcs = GitProvider()
    notifier = WebSocketNotifier()
    scanner = FileScannerService()
    ai_orchestrator = ScanOrchestrator()
    service = ScanOrchestrationService(vcs, notifier, scanner, ai_orchestrator)
    service.execute_scan(s.id)
        except Exception as e:
            print(f"Execute scan threw an error: {e}")
            import traceback
            traceback.print_exc()

