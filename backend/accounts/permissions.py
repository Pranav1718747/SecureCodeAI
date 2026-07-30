"""Custom permissions for Accounts and global RBAC."""

from rest_framework.permissions import BasePermission
from django.utils import timezone


class IsOrgAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'ORG_ADMIN'


class IsSecurityLead(BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role in ['ORG_ADMIN', 'SECURITY_LEAD']


class IsOrgMember(BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.organization is not None

    def has_object_permission(self, request, view, obj):
        if hasattr(obj, 'organization'):
            return obj.organization == request.user.organization
        elif hasattr(obj, 'repository'):
            return obj.repository.organization == request.user.organization
        elif hasattr(obj, 'scan'):
            return obj.scan.repository.organization == request.user.organization
        return False


class HasAPIKeyScope(BasePermission):
    """
    To be used with APIKeyAuthentication.
    Validates if the provided key has the required scope.
    """
    def has_permission(self, request, view):
        required_scope = getattr(view, 'required_scope', None)
        if not required_scope:
            return True
        api_key = getattr(request, 'api_key', None)
        if api_key and required_scope in api_key.scopes:
            return True
        return False
