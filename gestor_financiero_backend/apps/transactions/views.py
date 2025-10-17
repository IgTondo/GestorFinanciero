# apps/transactions/views.py
from rest_framework import viewsets, permissions
from .models import Category
from .serializers import CategorySerializer
from apps.users.permissions import IsPremiumUser 
from django.db.models import Q

class CategoryViewSet(viewsets.ModelViewSet):
    serializer_class = CategorySerializer

    def get_permissions(self):
        """
        Define permisos diferentes para cada acción.
        - Todos pueden ver (GET).
        - Solo Premium pueden crear (POST), actualizar (PUT) o borrar (DELETE).
        """
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            self.permission_classes = [permissions.IsAuthenticated, IsPremiumUser]
        else:
            self.permission_classes = [permissions.IsAuthenticated]
        return super().get_permissions()

    def get_queryset(self):
        """
        Este queryset es clave: devuelve las categorías globales MÁS las 
        personalizadas de la cuenta del usuario.
        """
        # Asumimos que la URL es algo como /api/accounts/{account_id}/categories/
        account_id = self.kwargs.get('account_pk')
        # Filtramos por las cuentas a las que el usuario pertenece para seguridad
        user_accounts = self.request.user.accounts.all()
        target_account = user_accounts.filter(pk=account_id).first()

        if not target_account:
            return Category.objects.none() # Si no tiene acceso a la cuenta, no ve nada

        # Usamos Q objects para una consulta OR
        return Category.objects.filter(
            Q(account__isnull=True) | Q(account=target_account)
        )

    def perform_create(self, serializer):
        """
        Al crear una categoría, la asignamos a la cuenta correcta.
        """
        account_id = self.kwargs.get('account_pk')
        target_account = self.request.user.accounts.filter(pk=account_id).first()
        # La validación de permiso ya se hizo, aquí solo guardamos
        serializer.save(account=target_account)
        