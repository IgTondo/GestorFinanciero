from django.shortcuts import get_object_or_404
from rest_framework import permissions
from .models import Account

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