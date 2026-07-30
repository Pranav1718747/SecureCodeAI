"""Permissions for Patches app."""

from rest_framework import permissions

class IsPatchOwnerOrReadOnly(permissions.BasePermission):
    """
    Object-level permission to only allow owners of the patch's organization to edit it.
    """

    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request,
        # so we'll always allow GET, HEAD or OPTIONS requests.
        if request.method in permissions.SAFE_METHODS:
            return request.user.organization == obj.vulnerability.scan.repository.organization

        # Write permissions are only allowed to the owner of the organization.
        return request.user.organization == obj.vulnerability.scan.repository.organization
