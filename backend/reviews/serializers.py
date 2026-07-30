"""Serializers for Reviews app."""

from rest_framework import serializers
from .models import Scan, Vulnerability, AgentLog


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
