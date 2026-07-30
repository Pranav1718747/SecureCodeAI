"""Models for Evaluation app."""

from django.db import models
from common.models import TimeStampedModel
from training.models import FineTuningJob


class ModelEvaluation(TimeStampedModel):
    fine_tuning_job = models.ForeignKey(FineTuningJob, on_delete=models.SET_NULL, null=True, blank=True)
    model_identifier = models.CharField(max_length=255)
    benchmark_name = models.CharField(max_length=100)
    precision_score = models.FloatField(default=0.0)
    recall_score = models.FloatField(default=0.0)
    pass_at_1_score = models.FloatField(default=0.0)
    false_positive_rate = models.FloatField(default=0.0)
    evaluated_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Eval for {self.model_identifier} on {self.benchmark_name}"
