"""Serializers for Evaluation app."""

from rest_framework import serializers
from .models import ModelEvaluation

class ModelEvaluationSerializer(serializers.ModelSerializer):
    class Meta:
        model = ModelEvaluation
        fields = '__all__'
