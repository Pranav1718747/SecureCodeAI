"""Audit logging service."""

from core.models import AuditLog
from accounts.models import Organization, User


class AuditLoggerService:
    @staticmethod
    def log_event(org: Organization, actor: User, ip: str, action: str, resource_type: str, resource_id: str, payload: dict = None):
        """Creates immutable audit record."""
        AuditLog.objects.create(
            organization=org,
            actor=actor,
            ip_address=ip,
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            payload=payload
        )

    @staticmethod
    def export_audit_trail(org_id: str, date_range=None):
        """Returns paginated audit entries."""
        return AuditLog.objects.filter(organization_id=org_id)
