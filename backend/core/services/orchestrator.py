"""Scan orchestration and lifecycle service."""

import tempfile
import structlog
import traceback
from django.utils import timezone
from core.models import Scan, Vulnerability, Repository
from accounts.models import User
from ai.agents.state import WorkflowState

logger = structlog.get_logger(__name__)


def trigger_scan(repo: Repository, user: User, branch: str = None, commit: str = None) -> Scan:
    """Creates a Scan record and dispatches the Celery task."""
    from core.tasks import execute_langgraph_scan
    
    scan = Scan.objects.create(
        repository=repo,
        triggered_by=user,
        trigger_source='MANUAL',
        branch_name=branch,
        commit_hash=commit,
        status='QUEUED'
    )
    
    execute_langgraph_scan.delay(scan.id)
    return scan


class ScanOrchestrationService:
    def __init__(self, vcs_provider, notifier, file_scanner, ai_orchestrator):
        self.vcs = vcs_provider
        self.notifier = notifier
        self.file_scanner = file_scanner
        self.ai = ai_orchestrator

    def execute_scan(self, scan_id: str):
        """Loads repo file tree, builds WorkflowState, calls ScanOrchestrator, and updates DB."""
        scan = Scan.objects.get(id=scan_id)
        scan.status = 'IN_PROGRESS'
        scan.started_at = timezone.now()
        scan.save()
        
        try:
            print(f"[{timezone.now().isoformat()}] [Stage 1] Clone Repository - START", flush=True)
            self.notifier.publish_progress(scan_id, "Cloning Repository", 5)
            repo_url = scan.repository.clone_url or "local://stub"
            branch = scan.branch_name or scan.repository.default_branch
            
            temp_dir_obj = tempfile.TemporaryDirectory()
            local_repo_path = temp_dir_obj.name
            
            self.vcs.clone(repo_url, local_repo_path, branch)
            print(f"[{timezone.now().isoformat()}] [Stage 1] Clone Repository - END", flush=True)
            
            print(f"[{timezone.now().isoformat()}] [Stage 2] Analyze Files - START", flush=True)
            self.notifier.publish_progress(scan_id, "Analyzing File Tree", 10)
            
            file_tree = self.file_scanner.generate_file_tree(local_repo_path)
            
            state = WorkflowState(
                repository_id=scan.repository.id,
                scan_id=str(scan.id),
                repository_url=repo_url,
                local_repo_path=local_repo_path,
                branch=branch,
                file_tree=file_tree
            )
            print(f"[{timezone.now().isoformat()}] [Stage 2] Analyze Files - END", flush=True)
            
            print(f"[{timezone.now().isoformat()}] [Stage 3] Detect Vulnerabilities - START", flush=True)
            self.notifier.publish_progress(scan_id, "Building Workflow Plan", 20)
            final_state = self.ai.run_scan(state)
            print(f"[{timezone.now().isoformat()}] [Stage 3] Detect Vulnerabilities - END", flush=True)
            
            print(f"[{timezone.now().isoformat()}] [Stage 4] Cleanup - START", flush=True)
            self.notifier.publish_progress(scan_id, "Cleaning Up", 95)
            temp_dir_obj.cleanup()
            print(f"[{timezone.now().isoformat()}] [Stage 4] Cleanup - END", flush=True)
            
            scan.status = 'COMPLETED'
            
        except Exception as e:
            print(f"[{timezone.now().isoformat()}] ERROR encountered: {e}", flush=True)
            logger.error("execute_scan.failed", scan_id=scan_id, error=str(e), traceback=traceback.format_exc())
            scan.status = 'FAILED'
            scan.error_message = f"Analysis Failed: {str(e)}"
                
        finally:
            print(f"[{timezone.now().isoformat()}] [Stage 6] Final Database Write - START", flush=True)
            final_status = scan.status
            final_error = scan.error_message
            
            scan.refresh_from_db()
            
            scan.status = final_status
            scan.error_message = final_error
            scan.completed_at = timezone.now()
            
            scan.save(update_fields=['completed_at', 'status', 'error_message'])
            print(f"[{timezone.now().isoformat()}] [Stage 6] Final Database Write - END", flush=True)

    @staticmethod
    def mark_false_positive(vuln_id: str, user: User):
        """Toggles is_false_positive flag."""
        vuln = Vulnerability.objects.get(id=vuln_id)
        vuln.is_false_positive = not vuln.is_false_positive
        vuln.save()
        return vuln
