"""Models for Reviews app."""

from django.db import models
from common.models import TimeStampedModel
from repositories.models import Repository
from accounts.models import User


class Scan(TimeStampedModel):
    repository = models.ForeignKey(Repository, on_delete=models.CASCADE, related_name='scans')
    triggered_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    trigger_source = models.CharField(
        max_length=20,
        choices=[
            ('MANUAL', 'Manual'),
            ('WEBHOOK', 'Webhook'),
            ('API_KEY', 'API Key'),
            ('SCHEDULE', 'Schedule')
        ],
        default='MANUAL'
    )
    commit_hash = models.CharField(max_length=40, null=True, blank=True)
    branch_name = models.CharField(max_length=255, null=True, blank=True)
    status = models.CharField(
        max_length=20,
        default='QUEUED',
        choices=[
            ('QUEUED', 'Queued'),
            ('IN_PROGRESS', 'In Progress'),
            ('COMPLETED', 'Completed'),
            ('FAILED', 'Failed')
        ]
    )
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    total_vulnerabilities = models.IntegerField(default=0)
    error_message = models.TextField(null=True, blank=True)

    def __str__(self):
        return f"Scan {self.id} for {self.repository.name}"


class Vulnerability(TimeStampedModel):
    scan = models.ForeignKey(Scan, on_delete=models.CASCADE, related_name='vulnerabilities')
    cwe_id = models.CharField(max_length=20, null=True, blank=True)
    owasp_category = models.CharField(max_length=100, null=True, blank=True)
    title = models.CharField(max_length=255)
    description = models.TextField()
    severity = models.CharField(
        max_length=20,
        choices=[
            ('CRITICAL', 'Critical'),
            ('HIGH', 'High'),
            ('MEDIUM', 'Medium'),
            ('LOW', 'Low'),
            ('INFO', 'Info')
        ]
    )
    confidence_score = models.DecimalField(max_digits=5, decimal_places=4, default=0.0)
    file_path = models.CharField(max_length=1024)
    line_start = models.IntegerField()
    line_end = models.IntegerField()
    snippet = models.TextField()
    code_context = models.TextField(null=True, blank=True)
    language = models.CharField(max_length=50, null=True, blank=True)
    context_line_start = models.IntegerField(null=True, blank=True)
    is_false_positive = models.BooleanField(default=False)
    analysis_report = models.JSONField(null=True, blank=True)

    def __str__(self):
        return f"{self.severity} - {self.title} in {self.file_path}"


class AgentLog(TimeStampedModel):
    scan = models.ForeignKey(Scan, on_delete=models.CASCADE, related_name='agent_logs')
    agent_name = models.CharField(max_length=100)
    step_index = models.IntegerField()
    thought = models.TextField()
    input_tokens = models.IntegerField(default=0)
    output_tokens = models.IntegerField(default=0)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"{self.agent_name} Step {self.step_index} for Scan {self.scan.id}"
