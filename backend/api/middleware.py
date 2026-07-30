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
            # This is a stub for the actual audit logger which will be implemented in Phase 9
            # to avoid circular dependencies early on.
            pass
        return response
