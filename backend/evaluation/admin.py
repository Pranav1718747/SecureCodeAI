"""Admin for Evaluation app."""
from django.contrib import admin
from .models import ModelEvaluation

@admin.register(ModelEvaluation)
class ModelEvaluationAdmin(admin.ModelAdmin):
    list_display = ('model_identifier', 'benchmark_name', 'precision_score', 'recall_score', 'evaluated_at')
    list_filter = ('benchmark_name',)
