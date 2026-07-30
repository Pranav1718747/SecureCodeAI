"""Views for Verification app."""

from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import VerificationRun
from .serializers import VerificationRunSerializer
from accounts.permissions import IsOrgMember


class VerificationRunViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated, IsOrgMember]
    serializer_class = VerificationRunSerializer

    def get_queryset(self):
        if not self.request.user.organization:
            return VerificationRun.objects.none()
        return VerificationRun.objects.filter(
            patch__vulnerability__scan__repository__organization=self.request.user.organization
        )
