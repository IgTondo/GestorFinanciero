from django.db.models.signals import post_save
from django.dispatch import receiver
from apps.transactions.models import Transaction
from apps.automation.models import EventRule, ActionType, TransactionType
from decimal import Decimal

@receiver(post_save, sender=Transaction)
def execute_event_rules(sender, instance, created, **kwargs):
    """
    Esta función se ejecuta CADA VEZ que se guarda una Transaction.
    """
    # Solo actuar si la transacción es NUEVA (no en actualizaciones)
    if not created:
        return

    # Si esta transacción fue creada por otra regla, no hacer nada.
    #    Esto evita el bucle infinito.
    if instance.created_by_rule:
        return
    
    transaction = instance
    
    # Buscamos reglas activas en la misma cuenta que coincidan 
    # con la categoría y tipo de la transacción recién creada.
    matching_rules = EventRule.objects.filter(
        account=transaction.account,
        is_active=True,
        trigger_category=transaction.category,
        trigger_transaction_type=transaction.transaction_type
    )

    # --- 3. Ejecutar las Acciones ---
    
    # Usamos un 'set' para evitar crear transacciones duplicadas
    # si por error hubieran dos reglas idénticas.
    new_transactions_to_create = set()

    for rule in matching_rules:
        calculated_amount = Decimal('0.00')

        # Calcular el monto de la nueva transacción
        if rule.action_type == ActionType.FIXED:
            calculated_amount = rule.action_fixed_amount
        
        elif rule.action_type == ActionType.PERCENTAGE:
            # Nos aseguramos de que el porcentaje no sea nulo
            if rule.action_percentage:
                percentage = rule.action_percentage / Decimal('100.00')
                calculated_amount = transaction.amount * percentage

        # Si el monto es 0, no crear nada
        if not calculated_amount or calculated_amount <= 0:
            continue
            
        # Añadimos los datos de la nueva transacción a nuestro 'set'
        new_transactions_to_create.add(
            (
                rule.action_destination_category,
                calculated_amount.quantize(Decimal('0.01')), # Redondear a 2 decimales
                rule.action_transaction_type,
                rule.action_description or f"Auto: {rule.name}"
            )
        )

    # Creamos todas las nuevas transacciones de una vez
        description = rule.action_description or f"Transferencia: {rule.name}"
        calculated_amount = calculated_amount.quantize(Decimal('0.01'))

        # 1. Transacción de GASTO (Salida del origen)
        #    La categoría de origen es la misma que disparó la regla.
        # Transaction.objects.create(
        #     account=transaction.account,
        #     category=transaction.category, # <-- Categoría Origen (ej: "Sueldo")
        #     amount=calculated_amount,
        #     date=transaction.date,
        #     description=f"{description} (Salida)",
        #     transaction_type=TransactionType.EXPENSE, # <-- GASTO
        #     created_by_rule=True 
        # )
        
        # 2. Transacción de INGRESO (Entrada al destino)
        #    La categoría de destino es la definida en la regla.
        Transaction.objects.create(
            account=transaction.account,
            category=rule.action_destination_category, # <-- Categoría Destino (ej: "Ahorro")
            amount=calculated_amount,
            date=transaction.date,
            description=f"{description} (Entrada)",
            transaction_type=TransactionType.EXPENSE, # <-- INGRESO
            created_by_rule=True
        )


