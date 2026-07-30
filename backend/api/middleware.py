"""Middleware for API Gateway."""

import json
from django.utils.deprecation import MiddlewareMixin
from django.http import HttpResponseForbidden

class TenantContextMiddleware(MiddlewareMixin):
    """
    Extracts X-Tenant-ID header and attaches it to the request object.
    """
    def process_request(self, request):
        tenant_id = request.headers.get('X-Tenant-ID')
        # In a real app, we might want to validate this tenant UUID format
        request.tenant_org_id = tenant_id


class AuditLoggingMiddleware(MiddlewareMixin):
    """
    Captures non-safe method requests and logs them to the audit trail.
    """
    def process_response(self, request, response):
        if request.method not in ('GET', 'HEAD', 'OPTIONS'):
            if hasattr(request, 'user') and request.user.is_authenticated:
                from monitoring.services import AuditLoggerService
                try:
                    payload = None
                    if request.body:
                        try:
                            payload = json.loads(request.body)
                        except json.JSONDecodeError:
                            pass

                    # Avoid logging login/token requests with raw passwords
                    if 'password' in (payload or {}):
                        payload['password'] = '***'
                    
                    # Log the request
                    org = request.user.organization
                    ip = request.META.get('REMOTE_ADDR', '0.0.0.0')
                    AuditLoggerService.log_event(
                        org=org,
                        actor=request.user,
                        ip=ip,
                        action=f"{request.method} {request.path}",
                        resource_type="API_ENDPOINT",
                        resource_id=request.path,
                        payload=payload
                    )
                except Exception as e:
                    import logging
                    logging.getLogger(__name__).error(f"Failed to log audit event: {e}")
                    
        return response
