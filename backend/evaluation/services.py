"""Services for Evaluation app."""

from .models import ModelEvaluation
from typing import List, Dict, Any

class EvaluationService:
    @staticmethod
    def run_benchmarks(model_id: str, benchmark_name: str):
        """Runs the BenchmarkRunner against a model."""
        from ai.evaluation.agent import BenchmarkRunner
        from django.utils import timezone
        import structlog
        
        logger = structlog.get_logger(__name__)
        logger.info("evaluation_service.run_benchmarks.started", model_id=model_id)
        
        runner = BenchmarkRunner()
        metrics = runner.run_benchmarks(model_id, benchmark_name)
        
        # Save metrics to database
        evaluation = ModelEvaluation.objects.create(
            model_id=model_id,
            benchmark_name=benchmark_name,
            pass_at_k=metrics.pass_at_k,
            precision=metrics.precision,
            recall=metrics.recall,
            f1_score=metrics.f1_score,
            status='COMPLETED',
            completed_at=timezone.now()
        )
        return evaluation

    @staticmethod
    def compare_models(model_ids: List[str], benchmark_name: str) -> Dict[str, Any]:
        """Compares multiple models on a given benchmark."""
        evaluations = ModelEvaluation.objects.filter(
            model_id__in=model_ids,
            benchmark_name=benchmark_name,
            status='COMPLETED'
        ).order_by('-f1_score')
        
        results = {
            'benchmark': benchmark_name,
            'models_compared': len(model_ids),
            'rankings': []
        }
        
        for eval_obj in evaluations:
            results['rankings'].append({
                'model_id': eval_obj.model_id,
                'f1_score': eval_obj.f1_score,
                'precision': eval_obj.precision,
                'recall': eval_obj.recall,
                'pass_at_k': eval_obj.pass_at_k,
                'evaluated_at': eval_obj.completed_at.isoformat() if eval_obj.completed_at else None
            })
            
        return results
