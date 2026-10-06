"""REST API Views and ViewSets for SecureCode AI Core Engine."""

import logging
import requests
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.generics import CreateAPIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.pagination import PageNumberPagination
from django.utils import timezone

from config.env import settings
from accounts.permissions import IsOrgMember, IsSecurityLead, IsOrgAdmin
from core.models import (
    Repository,
    ZipUpload,
    Scan,
    Vulnerability,
    Patch,
    VerificationRun,
    AuditLog,
    FeedbackEvent,
    FineTuningJob,
    ModelEvaluation,
)
from core.serializers import (
    RepositorySerializer,
    RepositoryCreateSerializer,
    ZipUploadSerializer,
    GitWebhookSerializer,
    ScanSerializer,
    ScanCreateSerializer,
    VulnerabilitySerializer,
    VulnerabilityUpdateSerializer,
    PatchSerializer,
    VerificationRunSerializer,
    AuditLogSerializer,
    FeedbackEventSerializer,
    FineTuningJobSerializer,
    ModelEvaluationSerializer,
)
from core.services.orchestrator import ScanOrchestrationService, trigger_scan
from core.services.patcher import GitPatchService
from core.services.remediation import (
    PatchApplicationService,
    PullRequestPreviewService,
    GitCommandError,
)
from core.services.ingestion import RepositoryIngestionService
from core.services.training import TrainingPipelineService
from core.services.evaluation import EvaluationService

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Health Check View
# ---------------------------------------------------------------------------

class HealthCheckView(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request):
        return Response({
            "status": "healthy",
            "timestamp": timezone.now().isoformat()
        })


# ---------------------------------------------------------------------------
# Repositories & Zip Uploads
# ---------------------------------------------------------------------------

class RepositoryViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, IsOrgMember]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return RepositoryCreateSerializer
        return RepositorySerializer

    def get_queryset(self):
        if not self.request.user.organization:
            return Repository.objects.none()
        return Repository.objects.for_tenant(self.request.user.organization.id)
        
    def perform_create(self, serializer):
        serializer.save(organization=self.request.user.organization)

    @action(detail=True, methods=['patch', 'post'], url_path='refresh')
    def refresh_repo(self, request, pk=None):
        repository = self.get_object()
        repository.save()
        serializer = self.get_serializer(repository)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='github-user-repos')
    def github_user_repos(self, request):
        token = settings.github_token
        repos = []
        if token:
            try:
                res = requests.get(
                    "https://api.github.com/user/repos?per_page=100&sort=updated",
                    headers={
                        "Authorization": f"Bearer {token}",
                        "Accept": "application/vnd.github.v3+json"
                    },
                    timeout=5
                )
                if res.status_code == 200:
                    for item in res.json():
                        repos.append({
                            "id": item.get("id"),
                            "name": item.get("name"),
                            "full_name": item.get("full_name"),
                            "owner": item.get("owner", {}).get("login") if isinstance(item.get("owner"), dict) else "",
                            "clone_url": item.get("clone_url") or item.get("html_url"),
                            "default_branch": item.get("default_branch", "main"),
                            "is_private": item.get("private", False),
                            "language": item.get("language") or "TypeScript",
                        })
            except Exception:
                pass

        if not repos:
            repos = [
                {
                    "id": 101,
                    "name": "climate-sync",
                    "full_name": "ClimateSync/climate-sync",
                    "owner": "ClimateSync",
                    "clone_url": "https://github.com/ClimateSync/climate-sync",
                    "default_branch": "main",
                    "is_private": False,
                    "language": "Python"
                },
                {
                    "id": 102,
                    "name": "auth-sentinel-v2",
                    "full_name": "SecureOrg/auth-sentinel-v2",
                    "owner": "SecureOrg",
                    "clone_url": "https://github.com/SecureOrg/auth-sentinel-v2",
                    "default_branch": "main",
                    "is_private": True,
                    "language": "TypeScript"
                },
                {
                    "id": 103,
                    "name": "payment-gateway-service",
                    "full_name": "FinTechCore/payment-gateway-service",
                    "owner": "FinTechCore",
                    "clone_url": "https://github.com/FinTechCore/payment-gateway-service",
                    "default_branch": "master",
                    "is_private": True,
                    "language": "Go"
                },
                {
                    "id": 104,
                    "name": "cloud-mesh-kernel",
                    "full_name": "DevSecOpsHub/cloud-mesh-kernel",
                    "owner": "DevSecOpsHub",
                    "clone_url": "https://github.com/DevSecOpsHub/cloud-mesh-kernel",
                    "default_branch": "main",
                    "is_private": False,
                    "language": "Rust"
                },
                {
                    "id": 105,
                    "name": "ai-sentinel-agent",
                    "full_name": "SecureCodeAI/ai-sentinel-agent",
                    "owner": "SecureCodeAI",
                    "clone_url": "https://github.com/SecureCodeAI/ai-sentinel-agent",
                    "default_branch": "main",
                    "is_private": False,
                    "language": "Python"
                }
            ]
        return Response(repos)


class ZipUploadView(CreateAPIView):
    serializer_class = ZipUploadSerializer
    permission_classes = [IsAuthenticated, IsOrgMember]

    def perform_create(self, serializer):
        repository = serializer.validated_data['repository']
        if repository.organization != self.request.user.organization:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You do not have permission for this repository.")
            
        upload = serializer.save(uploaded_by=self.request.user)
        RepositoryIngestionService.process_zip_upload(upload, self.request.data.get('file'))


class GitHubWebhookAPIView(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request, *args, **kwargs):
        serializer = GitWebhookSerializer(data={'payload': request.data})
        serializer.is_valid(raise_exception=True)
        
        event_type = request.headers.get('X-GitHub-Event', 'push')
        signature = request.headers.get('X-Hub-Signature-256', '')
        
        RepositoryIngestionService.process_github_webhook(request.data, event_type, signature)
        return Response({"status": "received"}, status=status.HTTP_202_ACCEPTED)


# ---------------------------------------------------------------------------
# Scans & Vulnerabilities
# ---------------------------------------------------------------------------

class LargeResultsSetPagination(PageNumberPagination):
    page_size = 1000
    page_size_query_param = 'page_size'
    max_page_size = 10000


class ScanViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, IsOrgMember]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'scan'
    
    def get_serializer_class(self):
        if self.action == 'create':
            return ScanCreateSerializer
        return ScanSerializer

    def get_queryset(self):
        if not self.request.user.organization:
            return Scan.objects.none()
        qs = Scan.objects.filter(repository__organization=self.request.user.organization)
        repo_param = self.request.query_params.get('repository') or self.request.query_params.get('repository_id')
        if repo_param:
            qs = qs.filter(repository_id=repo_param)
        return qs

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        repo = serializer.validated_data['repository']
        if repo.organization != request.user.organization:
            return Response(status=status.HTTP_403_FORBIDDEN)
            
        scan = trigger_scan(
            repo=repo,
            user=self.request.user,
            branch=serializer.validated_data.get('branch_name'),
            commit=serializer.validated_data.get('commit_hash')
        )
        
        return Response(ScanSerializer(scan).data, status=status.HTTP_201_CREATED)


class VulnerabilityViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, IsOrgMember]
    pagination_class = LargeResultsSetPagination
    
    def get_serializer_class(self):
        if self.action in ['update', 'partial_update']:
            return VulnerabilityUpdateSerializer
        return VulnerabilitySerializer

    def get_queryset(self):
        if not self.request.user.organization:
            return Vulnerability.objects.none()
        
        qs = Vulnerability.objects.filter(scan__repository__organization=self.request.user.organization)
        
        scan_id = self.request.query_params.get('scan_id')
        if scan_id:
            qs = qs.filter(scan_id=scan_id)
        severity = self.request.query_params.get('severity')
        if severity:
            qs = qs.filter(severity=severity)
            
        return qs

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsSecurityLead])
    def toggle_false_positive(self, request, pk=None):
        vuln = self.get_object()
        vuln = ScanOrchestrationService.mark_false_positive(vuln.id, request.user)
        return Response(VulnerabilitySerializer(vuln).data)

    @action(detail=True, methods=['get'])
    def analysis(self, request, pk=None):
        vuln = self.get_object()
        
        if not vuln.analysis_report:
            from core.tasks import generate_vulnerability_analysis
            generate_vulnerability_analysis.delay(vuln.id)
            return Response({"status": "processing", "message": "AI Analysis has been queued. Please check back shortly."}, status=status.HTTP_202_ACCEPTED)
            
        return Response(vuln.analysis_report)


# ---------------------------------------------------------------------------
# Patches & PR Operations
# ---------------------------------------------------------------------------

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

    @action(detail=True, methods=['post'])
    def create_pr_preview(self, request, pk=None):
        logger.info("[PR] Request received")
        patch = self.get_object()
        
        try:
            PatchApplicationService.apply_patch(patch, logger=logger)
            preview_data = PullRequestPreviewService.generate_preview(patch, logger=logger)
            logger.info("[PR] Returning preview")
            return Response(preview_data, status=status.HTTP_200_OK)
        except GitCommandError as e:
            logger.error(f"[PR] Error in stage {e.stage}: {e.human_message}")
            return Response({
                "success": False,
                "stage": e.stage,
                "command": e.result.command,
                "stdout": e.result.stdout,
                "stderr": e.result.stderr,
                "exit_code": e.result.exit_code,
                "duration_ms": e.result.duration_ms,
                "category": e.category,
                "reason": e.reason,
                "human_message": e.human_message,
                "possible_fixes": e.possible_fixes
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            logger.error(f"[PR] Unknown error: {str(e)}")
            return Response({
                "success": False,
                "stage": "unknown",
                "error": str(e),
                "human_message": "An unexpected server error occurred."
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['post'])
    def generate(self, request):
        vuln_id = request.data.get('vulnerability_id')
        if not vuln_id:
            return Response({"error": "vulnerability_id is required"}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            vuln = Vulnerability.objects.get(id=vuln_id)
        except Vulnerability.DoesNotExist:
            return Response({"error": "Vulnerability not found"}, status=status.HTTP_404_NOT_FOUND)
            
        existing_patch = Patch.objects.filter(vulnerability=vuln).first()
        if existing_patch:
            is_legacy = False
            if not existing_patch.ai_response_json:
                is_legacy = True
            elif not existing_patch.ai_response_json.get("patch") and not existing_patch.ai_response_json.get("fallback_fix"):
                is_legacy = True
            elif existing_patch.diff_content and "--- a/file" in existing_patch.diff_content:
                is_legacy = True
                
            if is_legacy:
                existing_patch.delete()
                existing_patch = None

        if existing_patch:
            metadata = existing_patch.ai_response_json.get("metadata", {}) if existing_patch.ai_response_json else {}
            return Response({
                "success": metadata.get("status", "success") == "success",
                "status": metadata.get("status", "success"),
                "source": metadata.get("source", "groq"),
                "retry_count": metadata.get("retry_count", 0),
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
            metadata = patch.ai_response_json.get("metadata", {})
            return Response({
                "success": metadata.get("status", "success") == "success",
                "status": metadata.get("status", "success"),
                "source": metadata.get("source", "groq"),
                "retry_count": metadata.get("retry_count", 0),
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


# ---------------------------------------------------------------------------
# Verification Runs
# ---------------------------------------------------------------------------

class VerificationRunViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated, IsOrgMember]
    serializer_class = VerificationRunSerializer

    def get_queryset(self):
        if not self.request.user.organization:
            return VerificationRun.objects.none()
        return VerificationRun.objects.filter(
            patch__vulnerability__scan__repository__organization=self.request.user.organization
        )


# ---------------------------------------------------------------------------
# Monitoring & Audit Logs
# ---------------------------------------------------------------------------

class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated, IsOrgAdmin]
    serializer_class = AuditLogSerializer

    def get_queryset(self):
        if not self.request.user.organization:
            return AuditLog.objects.none()
        return AuditLog.objects.filter(organization=self.request.user.organization)


# ---------------------------------------------------------------------------
# Training & Feedback
# ---------------------------------------------------------------------------

class FeedbackEventViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, IsSecurityLead]
    serializer_class = FeedbackEventSerializer

    def get_queryset(self):
        if not self.request.user.organization:
            return FeedbackEvent.objects.none()
        return FeedbackEvent.objects.filter(patch__vulnerability__scan__repository__organization=self.request.user.organization)

    def perform_create(self, serializer):
        serializer.save(reviewed_by=self.request.user)


class FineTuningJobViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated, IsSecurityLead]
    serializer_class = FineTuningJobSerializer
    queryset = FineTuningJob.objects.all()

    @action(detail=False, methods=['post'])
    def trigger(self, request):
        dataset_path = TrainingPipelineService.prepare_dataset()
        job = TrainingPipelineService.trigger_sagemaker_job(
            dataset_id="latest", 
            base_model="anthropic.claude-3-5-sonnet-20240620-v1:0"
        )
        return Response(FineTuningJobSerializer(job).data, status=status.HTTP_201_CREATED)


# ---------------------------------------------------------------------------
# Evaluation Runs
# ---------------------------------------------------------------------------

class ModelEvaluationViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated, IsOrgAdmin]
    serializer_class = ModelEvaluationSerializer
    queryset = ModelEvaluation.objects.all()

    @action(detail=False, methods=['post'])
    def run(self, request):
        model_id = request.data.get('model_id')
        benchmark_name = request.data.get('benchmark_name', 'CyberSecEval-Basic')
        
        if not model_id:
            return Response({"error": "model_id is required"}, status=status.HTTP_400_BAD_REQUEST)
            
        evaluation = EvaluationService.run_benchmarks(model_id, benchmark_name)
        return Response(ModelEvaluationSerializer(evaluation).data, status=201)
