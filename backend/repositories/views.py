"""Views for Repositories app."""

from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.generics import CreateAPIView
from rest_framework.permissions import IsAuthenticated
from .models import Repository, ZipUpload
from .serializers import RepositorySerializer, RepositoryCreateSerializer, ZipUploadSerializer, GitWebhookSerializer
from accounts.permissions import IsOrgMember
from .services import RepositoryIngestionService


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
    """
    Handles incoming GitHub webhooks.
    """
    authentication_classes = []  # Handled via HMAC
    permission_classes = []

    def post(self, request, *args, **kwargs):
        serializer = GitWebhookSerializer(data={'payload': request.data})
        serializer.is_valid(raise_exception=True)
        
        event_type = request.headers.get('X-GitHub-Event', 'push')
        signature = request.headers.get('X-Hub-Signature-256', '')
        
        RepositoryIngestionService.process_github_webhook(request.data, event_type, signature)
        return Response({"status": "received"}, status=status.HTTP_202_ACCEPTED)
