# permissions.py
from rest_framework import permissions

class IsOrganization(permissions.BasePermission):
    """
    Allows access only to users associated with an Organization.
    """

    def has_permission(self, request, view):
        # Check if user is authenticated first
        if not request.user.is_authenticated:
            return False
        
        # Check if user has an organization
        try:
            # If it's a direct foreign key relationship
            if hasattr(request.user, 'organization'):
                # Check if it's a related manager or direct reference
                if hasattr(request.user.organization, 'exists'):
                    # It's a related manager - check if any organizations exist
                    return request.user.organization.exists()
                else:
                    # It's a direct foreign key - check if it's not None
                    return request.user.organization is not None
            return False
        except Exception:
            return False