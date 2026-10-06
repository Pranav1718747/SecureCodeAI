"""Authentication and permission classes for SecureCode AI Core."""

from rest_framework.authentication import BaseAuthentication
from rest_framework.permissions import BasePermission
from accounts.services import APIKeyService
from core.exceptions import InvalidAPIKeyException


class APIKeyAuthentication(BaseAuthentication):
    """Authenticates requests using X-SecureCode-Api-Key header."""
    
    def authenticate(self, request):
        api_key_header = request.headers.get('X-SecureCode-Api-Key')
        if not api_key_header:
            return None
            
        api_key_obj = APIKeyService.validate_key(api_key_header)
        request.api_key = api_key_obj
        return (api_key_obj.created_by, api_key_obj)


class HasAPIKeyScope(BasePermission):
    """Checks if the authenticated API Key has the required scope."""
    required_scope = None

    def has_permission(self, request, view):
        if not hasattr(request, 'api_key') or not request.api_key:
            return True
        if self.required_scope and self.required_scope not in request.api_key.scopes:
            return False
        return True
