"""Serializers for Accounts app."""

from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.hashers import make_password
from django.utils.text import slugify
from .models import Organization, User, APIKey
from .services import UserService


class OrganizationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Organization
        fields = '__all__'


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'organization', 'role', 'is_active', 'created_at']
        read_only_fields = ['id', 'organization', 'role', 'is_active', 'created_at']


class UserRegistrationSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    first_name = serializers.CharField()
    last_name = serializers.CharField()
    org_name = serializers.CharField()

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already in use.")
        return value

    def create(self, validated_data):
        org_data = {'name': validated_data.pop('org_name')}
        return UserService.provision_enterprise_user(org_data, validated_data)


class APIKeySerializer(serializers.ModelSerializer):
    class Meta:
        model = APIKey
        fields = ['id', 'name', 'key_prefix', 'scopes', 'expires_at', 'is_revoked', 'created_at']
        read_only_fields = ['id', 'key_prefix', 'is_revoked', 'created_at']


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        data['user'] = {
            'id': str(self.user.id),
            'email': self.user.email,
            'role': self.user.role,
            'organization_id': str(self.user.organization.id) if self.user.organization else None,
        }
        return data
