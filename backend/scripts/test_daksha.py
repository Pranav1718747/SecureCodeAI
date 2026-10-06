import os
import django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from core.models import Repository
from accounts.models import User
from core.services import ScanOrchestrationService, trigger_scan
from core.services.vcs import GitProvider
from core.services.notifier import WebSocketNotifier
from core.services.scanner import FileScannerService
from ai.agents.orchestrator import ScanOrchestrator
from core.models import Scan

user = User.objects.first()
repo = Repository.objects.filter(full_name__icontains="Shooter-ai-Agent-Demo").first()
if repo:
    scan = trigger_scan(repo, user)
    print(f"Triggered scan {scan.id}")
    vcs = GitProvider()
    notifier = WebSocketNotifier()
    scanner = FileScannerService()
    ai_orchestrator = ScanOrchestrator()
    service = ScanOrchestrationService(vcs, notifier, scanner, ai_orchestrator)
    service.execute_scan(str(scan.id))
    
    scan.refresh_from_db()
    print(f"Final Status: {scan.status}, Error: {scan.error_message}")
else:
    print("Daksha repo not found")
