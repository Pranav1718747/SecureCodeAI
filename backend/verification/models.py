"""Models for Verification app."""

from django.db import models
from common.models import TimeStampedModel
from patches.models import Patch


class VerificationRun(TimeStampedModel):
    patch = models.ForeignKey(Patch, on_delete=models.CASCADE, related_name='verification_runs')
    sast_tool = models.CharField(
        max_length=20,
        choices=[
            ('BANDIT', 'Bandit'),
            ('SEMGREP', 'Semgrep'),
            ('PYTEST', 'Pytest'),
            ('SYNTAX_CHECK', 'Syntax Check')
        ]
    )
    passed = models.BooleanField(default=False)
    execution_time_seconds = models.FloatField(default=0.0)
    exit_code = models.IntegerField(default=0)
    stdout_log = models.TextField(null=True, blank=True)
    stderr_log = models.TextField(null=True, blank=True)
    security_score = models.IntegerField(default=0)
    executed_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        status = "PASSED" if self.passed else "FAILED"
        return f"{self.sast_tool} run for patch {self.patch.id} - {status}"
