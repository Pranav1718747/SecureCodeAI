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
        
        vuln_id = request.data.get('vulnerability_id')
        if not vuln_id:
            return Response({"error": "vulnerability_id is required"}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            vuln = Vulnerability.objects.get(id=vuln_id)
        except Vulnerability.DoesNotExist:
            return Response({"error": "Vulnerability not found"}, status=status.HTTP_404_NOT_FOUND)
            
        # Check if patch already exists
        existing_patch = Patch.objects.filter(vulnerability=vuln).first()
        if existing_patch:
            # We still need to return the expected schema even if it exists
            return Response({
                "success": True,
                "patch_id": existing_patch.id,
                "explanation": existing_patch.explanation,
                "reasoning": existing_patch.ai_response_json.get("reasoning", "") if existing_patch.ai_response_json else "",
                "unified_diff": existing_patch.diff_content,
                "split_diff": existing_patch.diff_content,
                "patched_code": existing_patch.ai_response_json.get("patch", "") if existing_patch.ai_response_json else "",
                "fallback_patch": existing_patch.ai_response_json.get("fallback_fix", None) if existing_patch.ai_response_json else None,
                "confidence": existing_patch.ai_response_json.get("confidence", 0) if existing_patch.ai_response_json else 0,
                "validation": existing_patch.ai_response_json.get("validation", {}) if existing_patch.ai_response_json else {},
                "risk_reduction": "High"
            }, status=status.HTTP_200_OK)

        try:
            patch = GitPatchService.generate_patch(vuln)
            return Response({
                "success": True,
                "patch_id": patch.id,
                "explanation": patch.explanation,
                "reasoning": patch.ai_response_json.get("reasoning", ""),
                "unified_diff": patch.diff_content,
                "split_diff": patch.diff_content,
                "patched_code": patch.ai_response_json.get("patch", ""),
                "fallback_patch": patch.ai_response_json.get("fallback_fix", None),
                "confidence": patch.ai_response_json.get("confidence", 0),
                "validation": patch.ai_response_json.get("validation", {}),
                "risk_reduction": "High"
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            from ai.security.report_generator import generate_fallback_fix
            fallback = generate_fallback_fix(vuln)
            return Response({
                "success": False,
                "reason": str(e),
                "fallback_used": True,
                "fallback_response": fallback
            }, status=status.HTTP_201_CREATED)
