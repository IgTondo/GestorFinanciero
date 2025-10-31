from rest_framework import viewsets
from .models import EventRule
from .serializers import EventRuleSerializer
from apps.users.mixins import AccountNestedViewMixin
from apps.users.permissions import IsPremiumUser

class EventRuleViewSet(viewsets.ModelViewSet, AccountNestedViewMixin):
    """
    CRUD para Reglas de Evento (Automatizaciones)
    Anidado bajo /api/accounts/{account_pk}/event-rules/
    """
    serializer_class = EventRuleSerializer
    
    # ¡Importante! Solo los usuarios Premium pueden ver o gestionar reglas
    permission_classes = [IsPremiumUser]

    def get_queryset(self):
        """
        Devuelve solo las reglas de la cuenta especificada en la URL.
        """
        account = self.get_account_object()
        return EventRule.objects.filter(account=account).order_by('name')

    def perform_create(self, serializer):
        """
        Inyecta la cuenta (de la URL) y el creador (usuario logueado).
        """
        account = self.get_account_object()
        serializer.save(account=account, created_by=self.request.user)
