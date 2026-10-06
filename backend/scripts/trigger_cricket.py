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

user = User.objects.first()
repo = Repository.objects.filter(full_name__icontains="cricket-simulator").first()
scan = trigger_scan(repo, user)
print(f"Triggered scan {scan.id}")
vcs = GitProvider()
notifier = WebSocketNotifier()
scanner = FileScannerService()
ai_orchestrator = ScanOrchestrator()
service = ScanOrchestrationService(vcs, notifier, scanner, ai_orchestrator)
service.execute_scan(scan.id)
