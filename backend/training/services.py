"""Services for Training app."""

import logging
from typing import Dict, Any
from .models import FineTuningJob, FeedbackEvent

logger = logging.getLogger(__name__)

class TrainingPipelineService:
    @staticmethod
    def trigger_sagemaker_job(dataset_id: str, base_model: str) -> FineTuningJob:
        """
        Submits a QLoRA fine-tuning job to AWS SageMaker.
        """
        # Mocking the SageMaker API call
        logger.info(f"Triggering SageMaker training job for dataset {dataset_id} on base model {base_model}")
        job_name = f"securecode-finetune-{dataset_id}-{base_model.replace('.', '-')}"
        
        job = FineTuningJob.objects.create(
            sagemaker_job_name=job_name,
            base_model=base_model,
            status='STARTING'
        )
        return job

    @staticmethod
    def poll_job_status():
        """
        Polls AWS for the status of running jobs.
        """
        jobs = FineTuningJob.objects.filter(status__in=['STARTING', 'IN_PROGRESS'])
        for job in jobs:
            # Simulate state transition
            logger.info(f"Polling status for {job.sagemaker_job_name}...")
            if job.status == 'STARTING':
                job.status = 'IN_PROGRESS'
            elif job.status == 'IN_PROGRESS':
                # In real scenario, we'd check Boto3 sagemaker client
                # job.status = 'COMPLETED'
                pass
            job.save()

    @staticmethod
    def prepare_dataset() -> str:
        """
        Aggregates accepted patch feedbacks into a JSONL dataset and uploads to S3.
        """
        logger.info("Preparing dataset from patch feedback.")
        # Feedbacks where action == 'ACCEPTED'
        return "s3://securecode-ai-datasets/finetune_latest.jsonl"
