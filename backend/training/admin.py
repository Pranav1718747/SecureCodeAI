"""Admin interface for Training app."""

from django.contrib import admin
from .models import FeedbackEvent, FineTuningJob

@admin.register(FeedbackEvent)
class FeedbackEventAdmin(admin.ModelAdmin):
    list_display = ('patch', 'action', 'reviewed_by', 'created_at')
    list_filter = ('action',)

@admin.register(FineTuningJob)
class FineTuningJobAdmin(admin.ModelAdmin):
    list_display = ('sagemaker_job_name', 'status', 'started_at', 'finished_at')
    list_filter = ('status',)
