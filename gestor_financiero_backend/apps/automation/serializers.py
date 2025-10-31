from rest_framework import serializers
from django.db.models import Q
from .models import EventRule
from apps.transactions.models import Category

class EventRuleSerializer(serializers.ModelSerializer):
    """
    Serializador para crear y gestionar las Reglas de Evento.
    """
    # Filtramos los campos de categoría para que solo muestren las
    # categorías relevantes para la cuenta (Globales + las de la cuenta).
    trigger_category = serializers.PrimaryKeyRelatedField(queryset=Category.objects.all())
    action_destination_category = serializers.PrimaryKeyRelatedField(queryset=Category.objects.all())

    class Meta:
        model = EventRule
        fields = [
            'id', 'name', 'is_active', 'trigger_category', 
            'trigger_transaction_type', 'action_type', 
            'action_destination_category', 'action_transaction_type',
            'action_description', 'action_fixed_amount', 'action_percentage'
        ]
        # Estos campos se inyectarán automáticamente desde la vista
        read_only_fields = ['account', 'created_by']

    def __init__(self, *args, **kwargs):
        """
        Filtra los querysets de categorías dinámicamente.
        """
        super().__init__(*args, **kwargs)
        
        # Obtenemos la vista para acceder a 'get_account_object()'
        view = self.context.get('view')
        if not view:
            return

        # Obtenemos la cuenta desde el helper de la vista
        account = view.get_account_object()
        
        # Filtramos las categorías
        valid_categories = Category.objects.filter(
            Q(account__isnull=True) | Q(account=account)
        ).distinct()
        
        self.fields['trigger_category'].queryset = valid_categories
        self.fields['action_destination_category'].queryset = valid_categories

    def validate(self, data):
        """
        Validación extra para la lógica de la regla.
        """
        if data.get('action_type') == 'FIXED' and not data.get('action_fixed_amount'):
            raise serializers.ValidationError("Debe proveer 'action_fixed_amount' para reglas de monto fijo.")
        
        if data.get('action_type') == 'PERCENTAGE' and not data.get('action_percentage'):
            raise serializers.ValidationError("Debe proveer 'action_percentage' para reglas de porcentaje.")

        return data
