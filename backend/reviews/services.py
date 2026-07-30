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
            from ai.agents.orchestrator import ScanOrchestrator
            from ai.agents.state import WorkflowState
            
            repo_url = scan.repository.clone_url or "local://stub"
            branch = scan.branch_name or scan.repository.default_branch
            
            state = WorkflowState(
                repository_id=scan.repository.id,
                repository_url=repo_url,
                branch=branch
            )
            
            orchestrator = ScanOrchestrator()
            final_state = orchestrator.run_scan(state)
            
            vulnerabilities = []
            for finding in final_state.findings:
                vuln = Vulnerability(
                    scan=scan,
                    cwe_id=getattr(finding, 'cwe_id', ''),
                    owasp_category=finding.owasp_category.value if hasattr(finding.owasp_category, 'value') else str(finding.owasp_category),
                    title=finding.vulnerability_type,
                    description=f"{finding.description}\n\nExplanation: {finding.explanation}",
                    severity=finding.severity.value if hasattr(finding.severity, 'value') else str(finding.severity),
                    confidence_score=finding.confidence,
                    file_path=finding.file_path,
                    line_start=finding.line_number,
                    line_end=finding.line_number,
                    snippet=finding.code_snippet
                )
                vulnerabilities.append(vuln)
                
            if vulnerabilities:
                Vulnerability.objects.bulk_create(vulnerabilities)
                
            scan.total_vulnerabilities = len(vulnerabilities)
            scan.status = 'COMPLETED'
            
        except Exception as e:
            logger.error("execute_scan.failed", scan_id=scan_id, error=str(e), traceback=traceback.format_exc())
            scan.status = 'FAILED'
            
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
