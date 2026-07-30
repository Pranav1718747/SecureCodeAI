"""Admin for Verification app."""

from django.contrib import admin
from .models import VerificationRun

@admin.register(VerificationRun)
class VerificationRunAdmin(admin.ModelAdmin):
    list_display = ('patch', 'sast_tool', 'passed', 'execution_time_seconds', 'executed_at')
    list_filter = ('sast_tool', 'passed')
