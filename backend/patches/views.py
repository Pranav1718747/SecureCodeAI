"""Views for Patches app."""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Patch
from .serializers import PatchSerializer
from .services import GitPatchService
from accounts.permissions import IsOrgMember


class PatchViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, IsOrgMember]
    serializer_class = PatchSerializer

    def get_queryset(self):
        if not self.request.user.organization:
            return Patch.objects.none()
        return Patch.objects.filter(vulnerability__scan__repository__organization=self.request.user.organization)

    @action(detail=True, methods=['post'])
    def apply_pr(self, request, pk=None):
        patch = self.get_object()
        pr_url = GitPatchService.create_github_pull_request(patch, request.user)
        return Response({
            "patch_id": patch.id,
            "status": patch.status,
            "pull_request_url": pr_url,
            "opened_at": patch.updated_at
        }, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'])
    def generate(self, request):
        from reviews.models import Vulnerability
        from .tasks import generate_patch_task
        
        vuln_id = request.data.get('vulnerability_id')
        if not vuln_id:
            return Response({"error": "vulnerability_id is required"}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            vuln = Vulnerability.objects.get(id=vuln_id)
        except Vulnerability.DoesNotExist:
            return Response({"error": "Vulnerability not found"}, status=status.HTTP_404_NOT_FOUND)
            
        generate_patch_task.delay(vuln.id)
        return Response({"message": "Patch generation started in background"}, status=status.HTTP_202_ACCEPTED)
