# apps/transactions/views.py
from rest_framework import viewsets, permissions
from .models import Category, Transaction
from .serializers import CategorySerializer, TransactionSerializer
from apps.users.permissions import IsPremiumUser 
from django.db.models import Q
from django.shortcuts import get_object_or_404

class AccountNestedViewMixin:
    permission_classes = [permissions.IsAuthenticated]

    def get_account_object(self):
        """
        Obtiene el objeto Account basado en la URL y verifica que el usuario sea miembro.
        """
        # 1. Obtenemos el 'account_pk' de los kwargs de la URL
        account_pk = self.kwargs.get('account_pk')
        account = get_object_or_404(
            self.request.user.accounts.all(), 
            pk=account_pk
        )
        return account

class CategoryViewSet(viewsets.ModelViewSet, AccountNestedViewMixin):
    serializer_class = CategorySerializer

    def get_permissions(self):
        """
        Define permisos diferentes para cada acción.
        - Todos pueden ver (GET).
        - Solo Premium pueden crear (POST), actualizar (PUT) o borrar (DELETE).
        """
        permission_list = super().get_permissions()
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_list.append(IsPremiumUser())
        return permission_list

    def get_queryset(self):
        """
        Este queryset es clave: devuelve las categorías globales MÁS las 
        personalizadas de la cuenta del usuario.
        """
        # Asumimos que la URL es algo como /api/accounts/{account_id}/categories/
        account = self.get_account_object()
        if self.action in ['list', 'retrieve']:
            # Usamos Q objects para una consulta OR
            return Category.objects.filter(
                Q(account__isnull=True) | Q(account=account)
            ).order_by('name')
        return Category.objects.filter(account=account).order_by('name')

    def perform_create(self, serializer):
        """
        Al crear una categoría, la asignamos a la cuenta correcta.
        """
        account = self.get_account_object()
        # La validación de permiso ya se hizo, aquí solo guardamos
        serializer.save(account=account)
        
class TransactionViewSet(viewsets.ModelViewSet, AccountNestedViewMixin):
    """
    ViewSet para manejar el CRUD de Transacciones.
    """
    serializer_class = TransactionSerializer

    def get_queryset(self):
        """
        Esta consulta filtra las transacciones
        basadas en la cuenta de la URL.
        """
        # 1. Obtenemos la cuenta (la función helper ya valida el permiso)
        account = self.get_account_object()
        return Transaction.objects.filter(account=account).order_by('-date')
    
    def perform_create(self, serializer):
        """
        Inyecta la cuenta (obtenida de la URL) en la transacción
        antes de guardarla.
        """
        account = self.get_account_object()
        serializer.save(account=account)
        