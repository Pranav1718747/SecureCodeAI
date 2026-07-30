"""Authentication classes for API Key support."""

from rest_framework.authentication import BaseAuthentication
from accounts.services import APIKeyService
from common.exceptions import InvalidAPIKeyException

class APIKeyAuthentication(BaseAuthentication):
    """
    Authenticates requests using X-SecureCode-Api-Key header.
    """
    def authenticate(self, request):
        api_key_header = request.headers.get('X-SecureCode-Api-Key')
        
        if not api_key_header:
            return None
            
        api_key_obj = APIKeyService.validate_key(api_key_header)
        
        # Attach the api key to the request for scope checking
        request.api_key = api_key_obj
        return (api_key_obj.created_by, api_key_obj)
