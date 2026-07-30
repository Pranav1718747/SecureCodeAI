"""Global exception handler for SecureCode AI.

Formats all exceptions into a standardized envelope.
"""

from rest_framework.views import exception_handler
from rest_framework.response import Response
from django.utils import timezone
from django.core.exceptions import PermissionDenied, ValidationError as DjangoValidationError
from django.http import Http404
from rest_framework.exceptions import ValidationError as DRFValidationError
from common.exceptions import SecureCodeBaseException
import logging

logger = logging.getLogger(__name__)

def custom_exception_handler(exc, context):
    """
    Custom exception handler mapping exceptions to standardized envelope.
    """
    # Call DRF's default exception handler first,
    # to get the standard error response.
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
        
        # Format validation details
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
        # Fallback for other DRF exceptions
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
