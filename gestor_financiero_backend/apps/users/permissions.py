# apps/users/permissions.py
from rest_framework import permissions

class IsPremiumUser(permissions.BasePermission):
    """
    Permiso personalizado para permitir acceso solo a usuarios Premium.
    """
    message = "Esta funcionalidad es exclusiva para usuarios Premium."

    def has_permission(self, request):
        return request.user and request.user.is_authenticated and request.user.role == 'PREMIUM'
    
class IsAccountOwner(permissions.BasePermission):
    """
    Permiso para permitir que solo el dueño de una cuenta la edite o elimine.
    """
    def has_object_permission(self, request, view, obj):
        # El permiso de lectura (GET) se concede a cualquier miembro.
        if request.method in permissions.SAFE_METHODS:
            return True

        # El permiso de escritura (PUT, PATCH, DELETE) solo se concede si el usuario es el dueño.
        return obj.owner == request.user