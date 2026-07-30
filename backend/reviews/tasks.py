"""Celery tasks for Reviews app."""

from celery import shared_task
from django.utils import timezone

@shared_task
def execute_langgraph_scan(scan_id):
    """Wraps ScanOrchestrationService.execute_scan."""
    # Delayed import to avoid circular dependency at module load
    from .services import ScanOrchestrationService
    ScanOrchestrationService.execute_scan(scan_id)

@shared_task
def watchdog_stuck_scans():
    """Periodic task marking IN_PROGRESS scans > 30min as FAILED."""
    from .models import Scan
    from datetime import timedelta
    
    thirty_mins_ago = timezone.now() - timedelta(minutes=30)
    Scan.objects.filter(status='IN_PROGRESS', started_at__lt=thirty_mins_ago).update(status='FAILED')
