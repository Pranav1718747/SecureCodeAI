"""Views for Evaluation app."""

from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from .models import ModelEvaluation
from .serializers import ModelEvaluationSerializer
from accounts.permissions import IsOrgAdmin

class ModelEvaluationViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated, IsOrgAdmin]
    serializer_class = ModelEvaluationSerializer
    queryset = ModelEvaluation.objects.all()

    @action(detail=False, methods=['post'])
    def run(self, request):
        from .services import EvaluationService
        model_id = request.data.get('model_id')
        benchmark_name = request.data.get('benchmark_name', 'CyberSecEval-Basic')
        
        if not model_id:
            from rest_framework.response import Response
            from rest_framework import status
            return Response({"error": "model_id is required"}, status=status.HTTP_400_BAD_REQUEST)
            
        evaluation = EvaluationService.run_benchmarks(model_id, benchmark_name)
        return Response(ModelEvaluationSerializer(evaluation).data, status=201)
