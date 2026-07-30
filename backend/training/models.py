"""Models for Training app."""

from django.db import models
from common.models import TimeStampedModel
from patches.models import Patch
from accounts.models import User


class FeedbackEvent(TimeStampedModel):
    patch = models.ForeignKey(Patch, on_delete=models.CASCADE, related_name='feedback_events')
    reviewed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    action = models.CharField(
        max_length=20,
        choices=[
            ('ACCEPTED', 'Accepted'),
            ('REJECTED', 'Rejected'),
            ('MODIFIED', 'Modified')
        ]
    )
    user_comments = models.TextField(null=True, blank=True)
    modified_diff = models.TextField(null=True, blank=True)

    def __str__(self):
        return f"{self.action} on Patch {self.patch.id}"


class FineTuningJob(TimeStampedModel):
    sagemaker_job_name = models.CharField(max_length=255, unique=True)
    base_model = models.CharField(max_length=255)
    output_adapter_s3_path = models.CharField(max_length=1024, null=True, blank=True)
    status = models.CharField(
        max_length=20,
        default='STARTING',
        choices=[
            ('STARTING', 'Starting'),
            ('IN_PROGRESS', 'In Progress'),
            ('COMPLETED', 'Completed'),
            ('FAILED', 'Failed'),
            ('STOPPED', 'Stopped')
        ]
    )
    training_loss = models.FloatField(null=True, blank=True)
    epochs = models.IntegerField(default=3)
    learning_rate = models.FloatField(default=2e-5)
    started_at = models.DateTimeField(null=True, blank=True)
    finished_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Fine-Tuning Job: {self.sagemaker_job_name} ({self.status})"
