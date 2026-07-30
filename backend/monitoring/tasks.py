"""Tasks for Monitoring app."""
from celery import shared_task

@shared_task
def export_audit_logs_task(org_id):
    # Stub for export
    pass
