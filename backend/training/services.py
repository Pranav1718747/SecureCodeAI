"""Services for Training app."""

import boto3
import json
import os
import uuid
from .models import FeedbackEvent, FineTuningJob
from django.utils import timezone

class TrainingPipelineService:
    @staticmethod
    def generate_jsonl_dataset():
        """Queries ACCEPTED FeedbackEvents, builds JSONL, uploads to S3."""
        qs = FeedbackEvent.objects.filter(action='ACCEPTED').select_related('patch')
        
        dataset = []
        for event in qs:
            dataset.append({
                "instruction": "Fix this vulnerability:\n" + event.patch.vulnerability.snippet,
                "output": event.patch.diff_content
            })
            
        jsonl_data = "\n".join(json.dumps(d) for d in dataset)
        
        s3 = boto3.client('s3', region_name=os.getenv('AWS_REGION', 'us-east-1'))
        bucket_name = os.getenv('AWS_S3_BUCKET_NAME', 'securecode-ai-uploads')
        s3_key = f"datasets/train_{uuid.uuid4().hex[:8]}.jsonl"
        
        if os.getenv("ENABLE_REAL_AWS_TRAINING") == "true":
            s3.put_object(Bucket=bucket_name, Key=s3_key, Body=jsonl_data.encode('utf-8'))
        else:
            print(f"[Mock] Would have uploaded to {bucket_name}/{s3_key}")
            
        return f"s3://{bucket_name}/{s3_key}"

    @staticmethod
    def launch_sagemaker_job(dataset_s3_path: str, base_model: str):
        """Creates SageMaker training job, creates FineTuningJob record."""
        job_name = f"ft-job-{int(timezone.now().timestamp())}"
        job = FineTuningJob.objects.create(
            sagemaker_job_name=job_name,
            base_model=base_model,
            status='STARTING'
        )
        
        if os.getenv("ENABLE_REAL_AWS_TRAINING") == "true":
            sm_client = boto3.client('sagemaker', region_name=os.getenv('AWS_REGION', 'us-east-1'))
            sm_client.create_training_job(
                TrainingJobName=job_name,
                HyperParameters={"epochs": "3", "learning_rate": "2e-5"},
                InputDataConfig=[{"ChannelName": "train", "DataSource": {"S3DataSource": {"S3Uri": dataset_s3_path}}}],
                OutputDataConfig={"S3OutputPath": f"s3://{os.getenv('AWS_S3_BUCKET_NAME')}/output/"},
            )
        else:
            print(f"[Mock] Would have launched SageMaker job {job_name}")
            
        return job

    @staticmethod
    def poll_job_status(job_id: str):
        """Checks SageMaker API, updates DB record."""
        pass
