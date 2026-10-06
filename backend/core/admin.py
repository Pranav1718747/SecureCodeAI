"""Django Admin configurations for SecureCode AI Core Engine."""

from django.contrib import admin
from core.models import (
    Repository,
    ZipUpload,
    Scan,
    Vulnerability,
    AgentLog,
    Patch,
    VerificationRun,
    AuditLog,
    FeedbackEvent,
    FineTuningJob,
    ModelEvaluation,
)


@admin.register(Repository)
class RepositoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'organization', 'language', 'ast_index_status', 'created_at')
    search_fields = ('name', 'full_name')
    list_filter = ('language', 'ast_index_status', 'is_private')


@admin.register(ZipUpload)
class ZipUploadAdmin(admin.ModelAdmin):
    list_display = ('repository', 'uploaded_by', 'status', 'created_at')
    list_filter = ('status',)


@admin.register(Scan)
class ScanAdmin(admin.ModelAdmin):
    list_display = ('id', 'repository', 'status', 'total_vulnerabilities', 'started_at', 'completed_at')
    list_filter = ('status', 'trigger_source')
    search_fields = ('id', 'repository__name')


@admin.register(Vulnerability)
class VulnerabilityAdmin(admin.ModelAdmin):
    list_display = ('title', 'scan', 'severity', 'file_path', 'line_start', 'is_false_positive')
    list_filter = ('severity', 'is_false_positive', 'owasp_category')
    search_fields = ('title', 'file_path', 'cwe_id')


@admin.register(AgentLog)
class AgentLogAdmin(admin.ModelAdmin):
    list_display = ('agent_name', 'scan', 'step_index', 'created_at')


@admin.register(Patch)
class PatchAdmin(admin.ModelAdmin):
    list_display = ('vulnerability', 'suggested_by_agent', 'status', 'created_at')
    list_filter = ('status',)


@admin.register(VerificationRun)
class VerificationRunAdmin(admin.ModelAdmin):
    list_display = ('patch', 'sast_tool', 'passed', 'execution_time_seconds', 'executed_at')
    list_filter = ('passed', 'sast_tool')


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ('action', 'organization', 'actor', 'ip_address', 'resource_type', 'created_at')
    search_fields = ('action', 'resource_id', 'actor__email')
    readonly_fields = [f.name for f in AuditLog._meta.fields]

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(FeedbackEvent)
class FeedbackEventAdmin(admin.ModelAdmin):
    list_display = ('patch', 'reviewed_by', 'action', 'created_at')
    list_filter = ('action',)


@admin.register(FineTuningJob)
class FineTuningJobAdmin(admin.ModelAdmin):
    list_display = ('sagemaker_job_name', 'base_model', 'status', 'started_at')
    list_filter = ('status',)


@admin.register(ModelEvaluation)
class ModelEvaluationAdmin(admin.ModelAdmin):
    list_display = ('model_identifier', 'benchmark_name', 'precision_score', 'recall_score', 'evaluated_at')
