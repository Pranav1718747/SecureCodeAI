"""Serializers for Training app."""

from rest_framework import serializers
from .models import FeedbackEvent, FineTuningJob


class FeedbackEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = FeedbackEvent
        fields = '__all__'
        read_only_fields = ['reviewed_by', 'created_at']


class FineTuningJobSerializer(serializers.ModelSerializer):
    class Meta:
        model = FineTuningJob
        fields = '__all__'
