"""Models for Patches app."""

from django.db import models
from common.models import TimeStampedModel
from reviews.models import Vulnerability


class Patch(TimeStampedModel):
    vulnerability = models.ForeignKey(Vulnerability, on_delete=models.CASCADE, related_name='patches')
    suggested_by_agent = models.CharField(max_length=100)
    diff_content = models.TextField()
    explanation = models.TextField()
    status = models.CharField(
        max_length=20,
        default='GENERATED',
        choices=[
            ('GENERATED', 'Generated'),
            ('VERIFYING', 'Verifying'),
            ('VERIFIED', 'Verified'),
            ('PR_OPENED', 'PR Opened'),
            ('ACCEPTED', 'Accepted'),
            ('REJECTED', 'Rejected')
        ]
    )
    pull_request_url = models.URLField(max_length=500, null=True, blank=True)

    def __str__(self):
        return f"Patch for {self.vulnerability.title} ({self.status})"
