from rest_framework import serializers
from .models import Transaction, Category
from apps.users.models import Account
from django.db.models import Q

class TransactionSerializer(serializers.ModelSerializer):
    account = serializers.PrimaryKeyRelatedField(read_only=True)
    category = serializers.PrimaryKeyRelatedField(queryset=Category.objects.all())
    class Meta:
        model = Transaction
        fields = ['id', 'amount', 'date', 'description', 'category', 'account', 'transaction_type', 'created_by_rule']
        read_only_fields = ['created_by_rule', 'account']
        
    def __init__(self, *args, **kwargs):
        """
        Filtra los querysets de 'account' y 'category' ANTES de la validación,
        asegurando que el usuario solo pueda seleccionar opciones válidas.
        """
        # Pasa primero por el __init__ del padre
        super().__init__(*args, **kwargs)
        
        # Obtenemos el usuario del contexto (pasado por el ViewSet)
        request = self.context.get('request')
        if not request:
            return

        user = request.user

        # 1. Filtrar el campo 'account'
        # El usuario solo puede elegir entre las cuentas de las que es miembro
        self.fields['account'].queryset = user.accounts.all()
        
        # 2. Filtrar el campo 'category'
        # El usuario solo puede elegir categorías globales (account=None)
        # O categorías que pertenezcan a las cuentas de las que es miembro
        user_accounts = self.fields['account'].queryset
        self.fields['category'].queryset = Category.objects.filter(
            Q(account__isnull=True) | Q(account__in=user_accounts)
        ).distinct()

    def validate(self, data):
        """
        Validación extra para asegurar que la categoría pertenece a la cuenta seleccionada.
        """
        account = self.context['view'].get_account_object()
        category = data.get('category')

        if category and category.account is not None and category.account != account:
            raise serializers.ValidationError(
                "Esta categoría no pertenece a la cuenta seleccionada."
            )
        
        return data
        
class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'account']