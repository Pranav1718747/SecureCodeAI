"""Serializers for Verification app."""

from rest_framework import serializers
from .models import VerificationRun


class VerificationRunSerializer(serializers.ModelSerializer):
    class Meta:
        model = VerificationRun
        fields = '__all__'
