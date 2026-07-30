"""Tasks for Evaluation app."""
from celery import shared_task

@shared_task
def run_benchmark_task(model_id, benchmark_name):
    from .services import EvaluationService
    EvaluationService.run_benchmarks(model_id, benchmark_name)
