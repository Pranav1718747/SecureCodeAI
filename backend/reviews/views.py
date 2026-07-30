"""Views for Reviews app."""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Scan, Vulnerability
from .serializers import ScanSerializer, ScanCreateSerializer, VulnerabilitySerializer, VulnerabilityUpdateSerializer
from accounts.permissions import IsOrgMember, IsSecurityLead
from repositories.models import Repository
from .services import ScanOrchestrationService


class ScanViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, IsOrgMember]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return ScanCreateSerializer
        return ScanSerializer

    def get_queryset(self):
        if not self.request.user.organization:
            return Scan.objects.none()
        return Scan.objects.filter(repository__organization=self.request.user.organization)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        repo = serializer.validated_data['repository']
        if repo.organization != request.user.organization:
            return Response(status=status.HTTP_403_FORBIDDEN)
            
        scan = ScanOrchestrationService.trigger_scan(
            repo=repo,
            user=request.user,
            branch=serializer.validated_data.get('branch_name'),
            commit=serializer.validated_data.get('commit_hash')
        )
        
        return Response(ScanSerializer(scan).data, status=status.HTTP_201_CREATED)


class VulnerabilityViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, IsOrgMember]
    
    def get_serializer_class(self):
        if self.action in ['update', 'partial_update']:
            return VulnerabilityUpdateSerializer
        return VulnerabilitySerializer

    def get_queryset(self):
        if not self.request.user.organization:
            return Vulnerability.objects.none()
        
        qs = Vulnerability.objects.filter(scan__repository__organization=self.request.user.organization)
        
        # Filtering logic
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
