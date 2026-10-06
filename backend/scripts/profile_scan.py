import os
import time
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
from django.utils import timezone

def profile_scan():
    repo = Repository.objects.filter(full_name__icontains="cricket-simulator").first()
    if not repo:
        print("Cricket simulator repo not found")
        return
        
    print(f"Profiling scan for {repo.full_name}...")
    
    # 1. Trigger scan
    t0 = time.time()
    user = User.objects.first()
    scan = Scan.objects.create(
        repository=repo,
        triggered_by=user,
        trigger_source='MANUAL',
        status='QUEUED'
    )
    t1 = time.time()
    print(f"Setup time: {t1-t0:.4f}s")
    
    # 2. Run scan (mocking execute_langgraph_scan celery task)
    print("Executing scan...")
    vcs = GitProvider()
    notifier = WebSocketNotifier()
    scanner = FileScannerService()
    ai_orchestrator = ScanOrchestrator()
    service = ScanOrchestrationService(vcs, notifier, scanner, ai_orchestrator)
    service.execute_scan(str(scan.id))
    
    t2 = time.time()
    print(f"Total execute_scan time: {t2-t1:.4f}s")
    
    # Read agent logs for timing if available? We can just look at the structlog output
    
if __name__ == "__main__":
    profile_scan()
