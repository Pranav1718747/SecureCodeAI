"""Global custom exception hierarchy for SecureCode AI.

WHY THIS EXISTS:
    To maintain a consistent API response format across all endpoints, SecureCode AI uses a unified
    exception hierarchy. Rather than allowing raw Django ORM errors or generic Python exceptions
    to reach the API layer, domain logic raises subclasses of `SecureCodeBaseException`.

HOW IT WORKS:
    The DRF custom exception handler (api.exceptions.custom_exception_handler) intercepts these
    exceptions and formats them into a strict envelope schema containing standard fields:
    code, message, timestamp, path, and details.

EXCEPTIONS DEFINED:
    - SecureCodeBaseException: Abstract base class for all domain errors.
    - TenantAccessDeniedException: 403 Forbidden for cross-tenant data access attempts.
    - InvalidAPIKeyException: 401 Unauthorized for malformed, expired, or revoked API keys.
    - ResourceNotFoundException: 404 Not Found for missing DB records requested by ID.
    - RateLimitExceededException: 429 Too Many Requests for API throttling.
"""

from rest_framework.exceptions import APIException
from rest_framework import status


class SecureCodeBaseException(APIException):
    """Base exception class for all SecureCode AI domain errors.

    Subclasses must define `status_code`, `default_code`, and `default_detail`.
    This maps seamlessly into DRF's exception handling framework while allowing
    us to attach our own semantic error codes (e.g., 'TENANT_ACCESS_DENIED').
    """

    status_code = status.HTTP_400_BAD_REQUEST
    default_code = "BAD_REQUEST"
    default_detail = "An unknown domain error occurred."

    def __init__(self, detail=None, code=None):
        """Initialize exception with optional custom detail message and code."""
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
