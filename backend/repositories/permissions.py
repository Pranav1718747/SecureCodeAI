"""Permissions for Repositories app."""

from rest_framework.permissions import BasePermission

# We can reuse IsOrgMember from accounts.permissions
# But we may define repo-specific ones here.
