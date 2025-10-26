from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from apps.users.models import Account
from apps.transactions.models import Category 

# Definimos las opciones fuera del modelo para poder reutilizarlas
class TransactionType(models.TextChoices):
    INCOME = 'INCOME', 'Ingreso'
    EXPENSE = 'EXPENSE', 'Gasto'

class ActionType(models.TextChoices):
    PERCENTAGE = 'PERCENTAGE', 'Porcentaje'
    FIXED = 'FIXED', 'Monto Fijo'


class EventRule(models.Model):
    
    # --- Configuración General ---
    account = models.ForeignKey(
        Account, 
        on_delete=models.CASCADE, 
        related_name='event_rules',
        help_text="Cuenta a la que pertenece esta regla."
    )
    name = models.CharField(
        max_length=100,
        help_text="Un nombre para que el usuario identifique la regla (ej: 'Ahorrar 20% del sueldo')."
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True,
        help_text="Usuario que creó la regla."
    )
    is_active = models.BooleanField(
        default=True,
        help_text="Activa o desactiva la regla. Si está inactiva, no se ejecutará."
    )

    # --- Disparador (Trigger): El "SI..." ---
    trigger_category = models.ForeignKey(
        Category, 
        on_delete=models.CASCADE, 
        related_name='trigger_rules',
        help_text="La regla se disparará cuando se cree una transacción en esta categoría."
    )
    trigger_transaction_type = models.CharField(
        max_length=10, 
        choices=TransactionType.choices,
        help_text="Tipo de transacción (Ingreso/Gasto) que disparará la regla."
    )

    # --- Acción (Action): El "ENTONCES..." ---
    action_type = models.CharField(
        max_length=20, 
        choices=ActionType.choices,
        help_text="Define si la acción moverá un monto fijo o un porcentaje."
    )
    action_destination_category = models.ForeignKey(
        Category, 
        on_delete=models.CASCADE, 
        related_name='action_rules',
        help_text="Categoría de destino para la nueva transacción creada por esta regla."
    )
    action_transaction_type = models.CharField(
        max_length=10,
        choices=TransactionType.choices,
        default=TransactionType.EXPENSE,
        help_text="La nueva transacción creada será un Ingreso o un Gasto."
    )
    action_description = models.CharField(
        max_length=255, 
        blank=True,
        help_text="Descripción para la nueva transacción (ej: 'Transferencia Ahorro')."
    )
    
    action_fixed_amount = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        null=True, 
        blank=True,
        help_text="Usar si el tipo de acción es 'Monto Fijo'."
    )
    action_percentage = models.DecimalField(
        max_digits=5, 
        decimal_places=2, 
        null=True, 
        blank=True,
        validators=[MinValueValidator(0.01), MaxValueValidator(100.00)],
        help_text="Usar si el tipo de acción es 'Porcentaje' (ej: 20.5 para 20.5%)."
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "Regla de Evento"
        verbose_name_plural = "Reglas de Evento"
