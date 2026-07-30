"""Tasks for Training app."""

from celery import shared_task
from .services import TrainingPipelineService

@shared_task
def poll_sagemaker_jobs():
    """Periodic task to poll and update running SageMaker jobs."""
    # TrainingPipelineService.poll_job_status(...)
    pass
