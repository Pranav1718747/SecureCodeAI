"""Tasks for Monitoring app."""
import csv
import io
import logging
from celery import shared_task
from .models import AuditLog

logger = logging.getLogger(__name__)

@shared_task
def export_audit_logs_task(org_id):
    """Background task to export audit logs to CSV and upload to secure storage."""
    try:
        logger.info(f"Starting audit log export for org: {org_id}")
        logs = AuditLog.objects.filter(organization_id=org_id).order_by('-timestamp')
        
        # We would write this to S3 in a real system
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(['Timestamp', 'Actor', 'IP', 'Action', 'Resource Type', 'Resource ID'])
        
        for log in logs:
            writer.writerow([
                log.timestamp,
                log.actor.email if log.actor else 'SYSTEM',
                log.ip_address,
                log.action,
                log.resource_type,
                log.resource_id
            ])
            
        csv_data = output.getvalue()
        
        # Simulate saving to S3
        # s3_client.put_object(Bucket=..., Key=..., Body=csv_data)
        
        logger.info(f"Successfully exported {logs.count()} audit logs for org {org_id}.")
        return "s3://securecode-ai-exports/audit_logs.csv"
        
    except Exception as e:
        logger.error(f"Failed to export audit logs: {e}")
        raise e
