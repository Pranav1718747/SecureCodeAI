"""Services for Reviews app."""

from django.utils import timezone
from .models import Scan, Vulnerability
from repositories.models import Repository
from accounts.models import User
from .tasks import execute_langgraph_scan

class ScanOrchestrationService:
    @staticmethod
    def trigger_scan(repo: Repository, user: User, branch: str = None, commit: str = None) -> Scan:
        """Creates a Scan record and dispatches the Celery task."""
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

    @staticmethod
    def execute_scan(scan_id: str):
        """
        Loads repo file tree, builds WorkflowState, calls ScanOrchestrator.
        Updates DB records. Stub for MVP.
        """
        import traceback
        import structlog
        
        logger = structlog.get_logger(__name__)
        scan = Scan.objects.get(id=scan_id)
        scan.status = 'IN_PROGRESS'
        scan.started_at = timezone.now()
        scan.save()
        
        try:
            import tempfile
            import subprocess
            import os
            from ai.agents.orchestrator import ScanOrchestrator
            from ai.agents.state import WorkflowState
            
            repo_url = scan.repository.clone_url or "local://stub"
            branch = scan.branch_name or scan.repository.default_branch
            
            # Temporary directory for cloning
            temp_dir_obj = tempfile.TemporaryDirectory()
            local_repo_path = temp_dir_obj.name
            
            # Clone the repository
            if repo_url.startswith("http"):
                logger.info("execute_scan.cloning", repo_url=repo_url, path=local_repo_path)
                subprocess.run(
                    ["git", "clone", "--depth", "1", "--branch", branch, repo_url, local_repo_path],
                    check=True,
                    capture_output=True
                )
            
            # Generate file tree (filtering out .git and pycache)
            file_tree = []
            for root, dirs, files in os.walk(local_repo_path):
                if ".git" in dirs: dirs.remove(".git")
                if "__pycache__" in dirs: dirs.remove("__pycache__")
                if "node_modules" in dirs: dirs.remove("node_modules")
                
                for file in files:
                    full_path = os.path.join(root, file)
                    rel_path = os.path.relpath(full_path, local_repo_path)
                    file_tree.append(rel_path)
            
            logger.info("execute_scan.file_tree_generated", file_count=len(file_tree))
            
            state = WorkflowState(
                repository_id=scan.repository.id,
                scan_id=str(scan.id),
                repository_url=repo_url,
                local_repo_path=local_repo_path,
                branch=branch,
                file_tree=file_tree
            )
            
            orchestrator = ScanOrchestrator()
            final_state = orchestrator.run_scan(state)
            
            # Cleanup
            temp_dir_obj.cleanup()
            
            # Vulnerabilities are now created incrementally by the StreamAgent
            # We just need to update the final status
            scan.status = 'COMPLETED'
            
        except Exception as e:
            logger.error("execute_scan.failed", scan_id=scan_id, error=str(e), traceback=traceback.format_exc())
            scan.status = 'FAILED'
            
            # Extract meaningful error message for the UI
            import subprocess
            if isinstance(e, subprocess.CalledProcessError):
                error_msg = e.stderr.decode('utf-8') if e.stderr else str(e)
                scan.error_message = f"Git Clone Failed: {error_msg.strip()}"
            else:
                scan.error_message = f"Analysis Failed: {str(e)}"
                
        finally:
            scan.completed_at = timezone.now()
            scan.save()

    @staticmethod
    def mark_false_positive(vuln_id: str, user: User):
        """Toggles is_false_positive flag."""
        vuln = Vulnerability.objects.get(id=vuln_id)
        vuln.is_false_positive = not vuln.is_false_positive
        vuln.save()
        return vuln
