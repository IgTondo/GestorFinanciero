from django.utils import timezone
from django.db.models import Sum, F, Q
from decimal import Decimal
from apps.automation.models import ScheduledRule, TransactionType, ActionType
from apps.transactions.models import Transaction

def run_scheduled_rules():
    """
    Esta es la función de tarea que django-q ejecutará.
    Busca y procesa todas las reglas programadas para el día actual.
    """
    
    # 1. Obtener el día actual y las reglas correspondientes
    today = timezone.now().day
    
    rules_to_run = ScheduledRule.objects.filter(
        is_active=True,
        schedule_day_of_month=today
    )
    
    print(f"[{timezone.now()}] Tarea 'run_scheduled_rules' iniciada...")
    print(f"Día actual: {today}. Reglas encontradas: {rules_to_run.count()}")

    executed_count = 0

    # 2. Iterar sobre cada regla y procesarla
    for rule in rules_to_run:
        calculated_amount = Decimal('0.00')

        # 3. Calcular el monto de la transferencia
        if rule.action_type == ActionType.FIXED:
            calculated_amount = rule.action_fixed_amount
        
        elif rule.action_type == ActionType.PERCENTAGE:
            # Si es porcentaje, calculamos el balance actual de la categoría origen
            if not rule.source_category or not rule.action_percentage:
                print(f"Regla '{rule.name}' (ID: {rule.id}) omitida: Falta categoría origen o porcentaje.")
                continue

            # Calcular balance: (Suma de Ingresos) - (Suma de Gastos) en la categoría origen
            balance_info = Transaction.objects.filter(
                account=rule.account,
                category=rule.source_category
            ).aggregate(
                income_total=Sum('amount', filter=Q(transaction_type=TransactionType.INCOME)),
                expense_total=Sum('amount', filter=Q(transaction_type=TransactionType.EXPENSE))
            )
            
            income = balance_info.get('income_total') or Decimal('0.00')
            expense = balance_info.get('expense_total') or Decimal('0.00')
            current_balance = income - expense
            
            if current_balance > 0:
                percentage = rule.action_percentage / Decimal('100.00')
                calculated_amount = current_balance * percentage

        # 4. Validar monto y crear las transacciones de transferencia
        if not calculated_amount or calculated_amount <= 0:
            print(f"Regla '{rule.name}' (ID: {rule.id}) omitida (monto 0 o negativo).")
            continue

        description = rule.action_description or f"Auto: {rule.name}"
        calculated_amount = calculated_amount.quantize(Decimal('0.01')) # Redondear a 2 decimales

        try:
            # Gasto (Salida de la categoría origen)
            Transaction.objects.create(
                account=rule.account,
                category=rule.source_category,
                amount=calculated_amount,
                date=timezone.now().date(),
                description=f"{description} (Salida)",
                transaction_type=TransactionType.EXPENSE,
                created_by_rule=True # Marcar como automática
            )
            
            # Ingreso (Entrada a la categoría destino)
            Transaction.objects.create(
                account=rule.account,
                category=rule.action_destination_category,
                amount=calculated_amount,
                date=timezone.now().date(),
                description=f"{description} (Entrada)",
                transaction_type=TransactionType.INCOME,
                created_by_rule=True # Marcar como automática
            )
            
            print(f"Regla '{rule.name}' (ID: {rule.id}) ejecutada exitosamente (Monto: {calculated_amount}).")
            executed_count += 1

        except Exception as e:
            # Registrar cualquier error inesperado
            print(f"ERROR al ejecutar regla '{rule.name}' (ID: {rule.id}): {e}")

    result_message = f"Procesadas {rules_to_run.count()} reglas. Ejecutadas exitosamente: {executed_count}."
    print(f"[{timezone.now()}] Tarea 'run_scheduled_rules' finalizada. {result_message}")
    return result_message

