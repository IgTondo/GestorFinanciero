# apps/users/permissions.py
from rest_framework import permissions

class IsPremiumUser(permissions.BasePermission):
    """
    Permiso personalizado para permitir acceso solo a usuarios Premium.
    """
    message = "Esta funcionalidad es exclusiva para usuarios Premium."

    def has_permission(self, request):
        return request.user and request.user.is_authenticated and request.user.role == 'PREMIUM'