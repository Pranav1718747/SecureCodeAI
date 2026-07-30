"""Views for Training app."""

from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from .models import FeedbackEvent, FineTuningJob
from .serializers import FeedbackEventSerializer, FineTuningJobSerializer
from accounts.permissions import IsOrgMember, IsSecurityLead
from .services import TrainingPipelineService


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
    # Only Org Admins / Global Admins should see this typically
    permission_classes = [IsAuthenticated, IsSecurityLead]
    serializer_class = FineTuningJobSerializer
    queryset = FineTuningJob.objects.all()

    @action(detail=False, methods=['post'])
    def trigger(self, request):
        dataset_path = TrainingPipelineService.generate_jsonl_dataset()
        job = TrainingPipelineService.launch_sagemaker_job(
            dataset_s3_path=dataset_path, 
            base_model="anthropic.claude-3-5-sonnet-20240620-v1:0"
        )
        return Response(FineTuningJobSerializer(job).data, status=status.HTTP_201_CREATED)
