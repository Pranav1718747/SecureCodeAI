import os
import django
import logging
logging.basicConfig(level=logging.INFO)
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from core.models import Repository
from core.models import Scan
from accounts.models import User
from core.services import ScanOrchestrationService, trigger_scan
from core.services.vcs import GitProvider
from core.services.notifier import WebSocketNotifier
from core.services.scanner import FileScannerService
from ai.agents.orchestrator import ScanOrchestrator

user = User.objects.first()
repo = Repository.objects.first()

scan = Scan.objects.create(
    repository=repo,
    triggered_by=user,
    trigger_source='MANUAL',
    status='QUEUED'
)
print(f"Created scan {scan.id}")

try:
    vcs = GitProvider()
    notifier = WebSocketNotifier()
    scanner = FileScannerService()
    ai_orchestrator = ScanOrchestrator()
    service = ScanOrchestrationService(vcs, notifier, scanner, ai_orchestrator)
    service.execute_scan(str(scan.id))
    scan.refresh_from_db()
    print(f"Final DB Status: {scan.status}")
except Exception as e:
    print(f"Test failed with {e}")
