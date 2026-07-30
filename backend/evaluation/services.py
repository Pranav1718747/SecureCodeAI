"""Services for Evaluation app."""

from .models import ModelEvaluation

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
    def compare_models(model_ids: list):
        # Stub
        pass
