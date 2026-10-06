"""Global custom exception hierarchy and DRF exception handler for SecureCode AI."""

import logging
from rest_framework.exceptions import APIException, ValidationError as DRFValidationError
from rest_framework import status
from rest_framework.views import exception_handler
from rest_framework.response import Response
from django.utils import timezone
from django.core.exceptions import PermissionDenied, ValidationError as DjangoValidationError
from django.http import Http404

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Base & Domain Exceptions
# ---------------------------------------------------------------------------

class SecureCodeBaseException(APIException):
    """Base exception class for all SecureCode AI domain errors."""

    status_code = status.HTTP_400_BAD_REQUEST
    default_code = "BAD_REQUEST"
    default_detail = "An unknown domain error occurred."

    def __init__(self, detail=None, code=None):
        if detail is not None:
            self.detail = detail
        else:
            self.detail = self.default_detail

        if code is not None:
            self.code = code
        else:
            self.code = self.default_code


class TenantAccessDeniedException(SecureCodeBaseException):
    """Raised when a user attempts to access resources belonging to a different organization."""

    status_code = status.HTTP_403_FORBIDDEN
    default_code = "TENANT_ACCESS_DENIED"
    default_detail = "You do not have permission to access resources in this tenant organization."


class InvalidAPIKeyException(SecureCodeBaseException):
    """Raised when an API key is missing, expired, revoked, or cryptographically invalid."""

    status_code = status.HTTP_401_UNAUTHORIZED
    default_code = "INVALID_API_KEY"
    default_detail = "The provided API key is invalid, expired, or has been revoked."


class ResourceNotFoundException(SecureCodeBaseException):
    """Raised when a requested domain entity (Repository, Scan, Vulnerability) cannot be found."""

    status_code = status.HTTP_404_NOT_FOUND
    default_code = "RESOURCE_NOT_FOUND"
    default_detail = "The requested resource could not be found."


class RateLimitExceededException(SecureCodeBaseException):
    """Raised when an API client exceeds the configured request limits for their tenant tier."""

    status_code = status.HTTP_429_TOO_MANY_REQUESTS
    default_code = "RATE_LIMIT_EXCEEDED"
    default_detail = "API rate limit exceeded. Please throttle your requests and try again later."


class ImmutableModelException(SecureCodeBaseException):
    """Audit logs cannot be modified or deleted once created."""
    
    default_code = "IMMUTABLE_MODEL"
    default_detail = "Audit logs cannot be modified or deleted once created."
    status_code = status.HTTP_403_FORBIDDEN


# ---------------------------------------------------------------------------
# Global DRF Exception Handler
# ---------------------------------------------------------------------------

def custom_exception_handler(exc, context):
    """Custom exception handler mapping exceptions to standardized envelope."""
    response = exception_handler(exc, context)

    request = context.get('request')
    path = request.path if request else "unknown"

    payload = {
        "error": {
            "timestamp": timezone.now().isoformat(),
            "path": path,
            "details": []
        }
    }

    if isinstance(exc, SecureCodeBaseException):
        payload["error"]["code"] = exc.code
        payload["error"]["message"] = exc.detail
        return Response(payload, status=exc.status_code)

    if isinstance(exc, (DRFValidationError, DjangoValidationError)):
        payload["error"]["code"] = "VALIDATION_ERROR"
        payload["error"]["message"] = "Invalid payload or validation failed."
        
        if response is not None and isinstance(response.data, dict):
            for field, errors in response.data.items():
                if isinstance(errors, list):
                    payload["error"]["details"].append({field: errors[0]})
                else:
                    payload["error"]["details"].append({field: str(errors)})
        return Response(payload, status=400)

    if isinstance(exc, Http404):
        payload["error"]["code"] = "RESOURCE_NOT_FOUND"
        payload["error"]["message"] = "The requested resource could not be found."
        return Response(payload, status=404)
        
    if isinstance(exc, PermissionDenied):
        payload["error"]["code"] = "PERMISSION_DENIED"
        payload["error"]["message"] = str(exc) or "You do not have permission to perform this action."
        return Response(payload, status=403)

    if response is not None:
        payload["error"]["code"] = getattr(exc, 'default_code', 'API_ERROR').upper()
        payload["error"]["message"] = str(exc)
        if isinstance(response.data, dict) and 'detail' in response.data:
             payload["error"]["message"] = response.data['detail']
        return Response(payload, status=response.status_code)

    # Unhandled server errors (500)
    logger.exception("Unhandled exception caught by API gateway.")
    payload["error"]["code"] = "INTERNAL_SYSTEM_ERROR"
    payload["error"]["message"] = "An unexpected error occurred."
    return Response(payload, status=500)
