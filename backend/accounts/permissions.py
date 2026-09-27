from functools import wraps
from rest_framework import permissions
from django.http import JsonResponse
from django.core.exceptions import PermissionDenied


def is_admin_or_staff(user):
    """
    Check if the user is authenticated and is an administrator or staff member.
    Validates:
    - user.role == 'ADMIN' (User.Role.ADMIN)
    - user.is_staff
    - user.is_superuser
    - user.is_admin property
    """
    if not user or not user.is_authenticated:
        return False
    return bool(
        getattr(user, 'is_staff', False) or 
        getattr(user, 'is_superuser', False) or 
        getattr(user, 'role', None) == 'ADMIN' or
        getattr(user, 'is_admin', False)
    )


class IsAdminOrStaffUser(permissions.BasePermission):
    """
    DRF permission class that restricts access strictly to admin or staff users.
    Returns HTTP 403 Forbidden with a clear permission denied message if non-admin.
    """
    message = "Permission denied: Administrator or staff privileges are required to access this resource."

    def has_permission(self, request, view):
        return is_admin_or_staff(request.user)


def admin_or_staff_required(view_func):
    """
    View decorator for regular Django views or API views that verifies the authenticated
    user has admin or staff permissions.
    Returns HTTP 401 if unauthenticated, or HTTP 403 if authenticated but not admin/staff.
    """
    @wraps(view_func)
    def _wrapped_view(request, *args, **kwargs):
        if not getattr(request, 'user', None) or not request.user.is_authenticated:
            return JsonResponse({
                'success': False,
                'detail': 'Authentication credentials were not provided.'
            }, status=401)
        if not is_admin_or_staff(request.user):
            return JsonResponse({
                'success': False,
                'detail': 'Permission denied: Administrator or staff privileges are required to access this resource.'
            }, status=403)
        return view_func(request, *args, **kwargs)
    return _wrapped_view
