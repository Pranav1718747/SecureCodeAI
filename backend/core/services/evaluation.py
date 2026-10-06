"""Evaluation and benchmarking service."""

from typing import List, Dict, Any
from core.models import ModelEvaluation


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
        
        evaluation = ModelEvaluation.objects.create(
            model_identifier=model_id,
            benchmark_name=benchmark_name,
            pass_at_1_score=getattr(metrics, 'pass_at_k', getattr(metrics, 'pass_at_1_score', 0.0)),
            precision_score=getattr(metrics, 'precision', getattr(metrics, 'precision_score', 0.0)),
            recall_score=getattr(metrics, 'recall', getattr(metrics, 'recall_score', 0.0)),
            false_positive_rate=getattr(metrics, 'false_positive_rate', 0.0),
        )
        return evaluation

    @staticmethod
    def compare_models(model_ids: List[str], benchmark_name: str) -> Dict[str, Any]:
        """Compares multiple models on a given benchmark."""
        evaluations = ModelEvaluation.objects.filter(
            model_identifier__in=model_ids,
            benchmark_name=benchmark_name,
        ).order_by('-precision_score')
        
        results = {
            'benchmark': benchmark_name,
            'models_compared': len(model_ids),
            'rankings': []
        }
        
        for eval_obj in evaluations:
            results['rankings'].append({
                'model_id': eval_obj.model_identifier,
                'precision': eval_obj.precision_score,
                'recall': eval_obj.recall_score,
                'pass_at_1': eval_obj.pass_at_1_score,
                'evaluated_at': eval_obj.evaluated_at.isoformat() if eval_obj.evaluated_at else None
            })
            
        return results
