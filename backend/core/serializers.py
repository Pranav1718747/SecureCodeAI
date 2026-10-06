"""Serializers for SecureCode AI Core Engine."""

from rest_framework import serializers
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


# ---------------------------------------------------------------------------
# Repositories & Zip Uploads
# ---------------------------------------------------------------------------

class RepositorySerializer(serializers.ModelSerializer):
    owner = serializers.SerializerMethodField()

    class Meta:
        model = Repository
        fields = '__all__'
        read_only_fields = ['organization', 'ast_index_status', 'created_at']

    def get_owner(self, obj):
        if obj.full_name and '/' in obj.full_name:
            return obj.full_name.split('/')[0]
        return obj.organization.name if obj.organization else 'securecode-ai'


class RepositoryCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Repository
        fields = ['name', 'full_name', 'clone_url', 'default_branch', 'is_private', 'language']


class ZipUploadSerializer(serializers.ModelSerializer):
    file = serializers.FileField(write_only=True)

    class Meta:
        model = ZipUpload
        fields = ['id', 'repository', 'status', 's3_object_key', 'created_at', 'file']
        read_only_fields = ['id', 'status', 's3_object_key', 'created_at']


class GitWebhookSerializer(serializers.Serializer):
    """Minimal validation for incoming GitHub webhooks."""
    payload = serializers.JSONField()


# ---------------------------------------------------------------------------
# Scans, Vulnerabilities & Agent Logs
# ---------------------------------------------------------------------------

class ScanSerializer(serializers.ModelSerializer):
    class Meta:
        model = Scan
        fields = '__all__'
        read_only_fields = ['status', 'started_at', 'completed_at', 'total_vulnerabilities', 'created_at']


class ScanCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Scan
        fields = ['repository', 'branch_name', 'commit_hash']


class VulnerabilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Vulnerability
        fields = '__all__'


class VulnerabilityUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vulnerability
        fields = ['is_false_positive']


class AgentLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = AgentLog
        fields = '__all__'


# ---------------------------------------------------------------------------
# Patches & Remediation
# ---------------------------------------------------------------------------

class PatchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Patch
        fields = '__all__'
        read_only_fields = ['status', 'pull_request_url', 'created_at']


# ---------------------------------------------------------------------------
# Sandbox Verification
# ---------------------------------------------------------------------------

class VerificationRunSerializer(serializers.ModelSerializer):
    class Meta:
        model = VerificationRun
        fields = '__all__'


# ---------------------------------------------------------------------------
# Monitoring & Audit
# ---------------------------------------------------------------------------

class AuditLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = AuditLog
        fields = '__all__'


# ---------------------------------------------------------------------------
# Training & Model Evaluations
# ---------------------------------------------------------------------------

class FeedbackEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = FeedbackEvent
        fields = '__all__'
        read_only_fields = ['reviewed_by', 'created_at']


class FineTuningJobSerializer(serializers.ModelSerializer):
    class Meta:
        model = FineTuningJob
        fields = '__all__'


class ModelEvaluationSerializer(serializers.ModelSerializer):
    class Meta:
        model = ModelEvaluation
        fields = '__all__'
