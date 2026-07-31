"""Serializers for Repositories app."""

from rest_framework import serializers
from .models import Repository, ZipUpload


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
    """Minimal validation for incoming GitHub webhooks"""
    payload = serializers.JSONField()
    # HMAC signature is validated in the view/service
