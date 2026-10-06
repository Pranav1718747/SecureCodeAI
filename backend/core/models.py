"""All domain models for SecureCode AI Core Engine."""

import uuid
from django.db import models
from accounts.models import Organization, User
from core.exceptions import ImmutableModelException


# ---------------------------------------------------------------------------
# Base Abstract Model
# ---------------------------------------------------------------------------

from core.base_models import TimeStampedModel


# ---------------------------------------------------------------------------
# Repositories & Zip Uploads
# ---------------------------------------------------------------------------

class RepositoryQuerySet(models.QuerySet):
    def for_tenant(self, org_id):
        return self.filter(organization_id=org_id)


class Repository(TimeStampedModel):
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='repositories')
    name = models.CharField(max_length=255)
    full_name = models.CharField(max_length=255)
    github_repo_id = models.BigIntegerField(null=True, blank=True, unique=True)
    clone_url = models.URLField(max_length=500, null=True, blank=True)
    default_branch = models.CharField(max_length=100, default='main')
    is_private = models.BooleanField(default=True)
    language = models.CharField(max_length=50, default='python')
    ast_index_status = models.CharField(
        max_length=20,
        default='NOT_INDEXED',
        choices=[
            ('NOT_INDEXED', 'Not Indexed'),
            ('INDEXING', 'Indexing'),
            ('INDEXED', 'Indexed'),
            ('FAILED', 'Failed')
        ]
    )

    objects = RepositoryQuerySet.as_manager()

    class Meta:
        unique_together = ('organization', 'name')
        verbose_name_plural = 'Repositories'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.organization.slug}/{self.name}"


class ZipUpload(TimeStampedModel):
    repository = models.ForeignKey(Repository, on_delete=models.CASCADE, related_name='zip_uploads')
    uploaded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    s3_object_key = models.CharField(max_length=1024, null=True, blank=True)
    file_size_bytes = models.BigIntegerField(null=True, blank=True)
    file_hash_sha256 = models.CharField(max_length=64, null=True, blank=True)
    status = models.CharField(
        max_length=20,
        default='PENDING',
        choices=[
            ('PENDING', 'Pending'),
            ('EXTRACTING', 'Extracting'),
            ('COMPLETED', 'Completed'),
            ('FAILED', 'Failed')
        ]
    )
    extracted_path = models.CharField(max_length=1024, null=True, blank=True)

    def __str__(self):
        return f"ZipUpload for {self.repository.name} ({self.status})"


# ---------------------------------------------------------------------------
# Scans, Vulnerabilities & Agent Logs
# ---------------------------------------------------------------------------

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


# ---------------------------------------------------------------------------
# Patches & Remediation
# ---------------------------------------------------------------------------

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
            ('PR_PREVIEW', 'PR Preview'),
            ('PR_OPENED', 'PR Opened'),
            ('ACCEPTED', 'Accepted'),
            ('REJECTED', 'Rejected')
        ]
    )
    pull_request_url = models.URLField(max_length=500, null=True, blank=True)
    ai_response_json = models.JSONField(null=True, blank=True)
    
    # Git Integration Fields
    branch_name = models.CharField(max_length=255, null=True, blank=True)
    commit_sha = models.CharField(max_length=40, null=True, blank=True)
    pr_preview_data = models.JSONField(null=True, blank=True)

    def __str__(self):
        return f"Patch for {self.vulnerability.title} ({self.status})"


# ---------------------------------------------------------------------------
# Sandbox Verification Runs
# ---------------------------------------------------------------------------

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


# ---------------------------------------------------------------------------
# Monitoring & Immutable Audit Logs
# ---------------------------------------------------------------------------

class AuditLog(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='audit_logs')
    actor = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    action = models.CharField(max_length=100)
    resource_type = models.CharField(max_length=100)
    resource_id = models.CharField(max_length=255)
    payload = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.action} on {self.resource_type} {self.resource_id} by {self.actor}"

    def save(self, *args, **kwargs):
        if not self._state.adding:
            raise ImmutableModelException()
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        raise ImmutableModelException()


# ---------------------------------------------------------------------------
# Training & Model Evaluations
# ---------------------------------------------------------------------------

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
