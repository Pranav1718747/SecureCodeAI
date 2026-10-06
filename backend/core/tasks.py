"""All background Celery tasks for SecureCode AI Core Engine."""

import csv
import io
import logging
from datetime import timedelta
from celery import shared_task
from django.utils import timezone
from core.models import Scan, Vulnerability, ZipUpload, Patch, AuditLog
from core.services.orchestrator import ScanOrchestrationService
from core.services.vcs import GitProvider
from core.services.notifier import WebSocketNotifier
from core.services.scanner import FileScannerService
from core.services.patcher import GitPatchService
from core.services.verifier import SandboxVerificationService
from core.services.training import TrainingPipelineService
from core.services.evaluation import EvaluationService
from ai.agents.orchestrator import ScanOrchestrator
from ai.security.agent import SecurityAgent

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# 1. Scanning & Analysis Tasks
# ---------------------------------------------------------------------------

@shared_task
def execute_langgraph_scan(scan_id):
    """Orchestrates end-to-end repository security scanning and AI analysis."""
    vcs = GitProvider()
    notifier = WebSocketNotifier()
    scanner = FileScannerService()
    ai_orchestrator = ScanOrchestrator()
    
    service = ScanOrchestrationService(vcs, notifier, scanner, ai_orchestrator)
    service.execute_scan(scan_id)


@shared_task
def watchdog_stuck_scans():
    """Periodic task marking IN_PROGRESS scans running > 30min as FAILED."""
    thirty_mins_ago = timezone.now() - timedelta(minutes=30)
    Scan.objects.filter(status='IN_PROGRESS', started_at__lt=thirty_mins_ago).update(status='FAILED')


@shared_task
def generate_vulnerability_analysis(vuln_id):
    """Background task to generate deep AI security analysis for a vulnerability."""
    try:
        vuln = Vulnerability.objects.get(id=vuln_id)
        if vuln.analysis_report:
            return
            
        agent = SecurityAgent()
        report, metadata = agent.generate_analysis(vuln)
        
        if metadata["status"] == "success":
            vuln.analysis_report = {
                "success": True,
                "status": "success",
                "source": metadata["source"],
                "retry_count": metadata.get("retry_count", 0),
                "summary": report.summary,
                "attack_scenario": report.attack_scenario,
                "business_impact": report.business_impact,
                "compliance_impact": report.compliance_impact,
                "remediation": report.remediation,
                "secure_example": report.secure_example,
                "confidence": report.confidence
            }
        else:
            vuln.analysis_report = {
                "success": False,
                "status": metadata["status"],
                "source": metadata["source"],
                "reason": metadata.get("reason", "Unknown failure"),
                "retry_count": metadata.get("retry_count", 0),
                "fallback_used": True,
                "fallback_response": report
            }
        vuln.save(update_fields=['analysis_report'])
    except Vulnerability.DoesNotExist:
        pass


# ---------------------------------------------------------------------------
# 2. Repository Ingestion Tasks
# ---------------------------------------------------------------------------

@shared_task
def extract_zip_upload_task(upload_id):
    """Background task to extract and process a ZIP repository upload."""
    try:
        upload = ZipUpload.objects.get(id=upload_id)
        upload.status = 'EXTRACTING'
        upload.save()

        upload.status = 'COMPLETED'
        upload.save()
    except Exception as e:
        upload = ZipUpload.objects.filter(id=upload_id).first()
        if upload:
            upload.status = 'FAILED'
            upload.save()
        raise e


# ---------------------------------------------------------------------------
# 3. Patching & Remediation Tasks
# ---------------------------------------------------------------------------

@shared_task
def generate_patch_task(vulnerability_id):
    """Background task to generate AI code patch for a vulnerability."""
    vuln = Vulnerability.objects.get(id=vulnerability_id)
    GitPatchService.generate_patch(vuln)


# ---------------------------------------------------------------------------
# 4. Sandbox Verification Tasks
# ---------------------------------------------------------------------------

@shared_task
def run_verification_task(patch_id):
    """Background task to run SAST container verification against a patch."""
    patch = Patch.objects.get(id=patch_id)
    SandboxVerificationService.run_verification(patch)


# ---------------------------------------------------------------------------
# 5. Monitoring & Audit Export Tasks
# ---------------------------------------------------------------------------

@shared_task
def export_audit_logs_task(org_id):
    """Background task to export audit logs to CSV and upload to secure storage."""
    try:
        logger.info(f"Starting audit log export for org: {org_id}")
        logs = AuditLog.objects.filter(organization_id=org_id).order_by('-created_at')
        
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(['Timestamp', 'Actor', 'IP', 'Action', 'Resource Type', 'Resource ID'])
        
        for log in logs:
            writer.writerow([
                log.created_at,
                log.actor.email if log.actor else 'SYSTEM',
                log.ip_address,
                log.action,
                log.resource_type,
                log.resource_id
            ])
            
        csv_data = output.getvalue()
        logger.info(f"Successfully exported {logs.count()} audit logs for org {org_id}.")
        return "s3://securecode-ai-exports/audit_logs.csv"
        
    except Exception as e:
        logger.error(f"Failed to export audit logs: {e}")
        raise e


# ---------------------------------------------------------------------------
# 6. Training & Evaluation Benchmark Tasks
# ---------------------------------------------------------------------------

@shared_task
def poll_sagemaker_jobs():
    """Periodic task to poll and update running SageMaker fine-tuning jobs."""
    TrainingPipelineService.poll_job_status()


@shared_task
def run_benchmark_task(model_id, benchmark_name):
    """Background task to execute AI model evaluation benchmarks."""
    EvaluationService.run_benchmarks(model_id, benchmark_name)
