"""Views for Monitoring app."""

from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import AuditLog
from .serializers import AuditLogSerializer
from accounts.permissions import IsOrgAdmin

class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated, IsOrgAdmin]
    serializer_class = AuditLogSerializer

    def get_queryset(self):
        if not self.request.user.organization:
            return AuditLog.objects.none()
        return AuditLog.objects.filter(organization=self.request.user.organization)
