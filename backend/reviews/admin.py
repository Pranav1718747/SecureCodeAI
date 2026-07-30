"""Admin interface for Reviews app."""

from django.contrib import admin
from .models import Scan, Vulnerability, AgentLog

@admin.register(Scan)
class ScanAdmin(admin.ModelAdmin):
    list_display = ('id', 'repository', 'status', 'started_at', 'total_vulnerabilities')
    list_filter = ('status', 'trigger_source')
    search_fields = ('repository__name',)

@admin.register(Vulnerability)
class VulnerabilityAdmin(admin.ModelAdmin):
    list_display = ('title', 'scan', 'severity', 'is_false_positive', 'created_at')
    list_filter = ('severity', 'is_false_positive', 'owasp_category')
    search_fields = ('title', 'file_path')

@admin.register(AgentLog)
class AgentLogAdmin(admin.ModelAdmin):
    list_display = ('agent_name', 'scan', 'step_index', 'created_at')
    list_filter = ('agent_name',)
