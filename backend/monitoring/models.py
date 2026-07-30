"""Models for Monitoring app."""

import uuid
from django.db import models
from accounts.models import Organization, User
from common.exceptions import SecureCodeBaseException


class ImmutableModelException(SecureCodeBaseException):
    default_code = "IMMUTABLE_MODEL"
    default_detail = "Audit logs cannot be modified or deleted once created."
    status_code = 403


class AuditLog(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='audit_logs')
    actor = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    action = models.CharField(max_length=100)
    resource_type = models.CharField(max_length=100)
    resource_id = models.CharField(max_length=255)
    payload = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.action} on {self.resource_type} {self.resource_id} by {self.actor}"

    def save(self, *args, **kwargs):
        if not self._state.adding:
            raise ImmutableModelException()
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        raise ImmutableModelException()
