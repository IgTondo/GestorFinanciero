# apps/transactions/management/commands/seed_transactions.py

import random
from datetime import datetime, timedelta
from django.core.management.base import BaseCommand
from django.utils import timezone
from apps.users.models import CustomUser, Account
from apps.transactions.models import Transaction, Category
from apps.automation.models import TransactionType  # Ajusta si la importación es diferente
from decimal import Decimal

class Command(BaseCommand):
    help = 'Genera un historial de transacciones realistas para un usuario específico.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--email',
            type=str,
            help='El email del usuario para el cual generar transacciones.',
            required=True
        )

    def handle(self, *args, **options):
        email = options['email']
        
        # --- 1. Encontrar al Usuario y su Cuenta ---
        try:
            user = CustomUser.objects.get(email=email)
        except CustomUser.DoesNotExist:
            self.stderr.write(self.style.ERROR(f"Usuario con email '{email}' no encontrado."))
            return

        try:
            # Usamos la primera cuenta que encontremos del usuario (puedes ajustar esto)
            account = user.accounts.first()
            if not account:
                self.stderr.write(self.style.ERROR(f"El usuario '{email}' no tiene cuentas asociadas."))
                return
        except Account.DoesNotExist:
            self.stderr.write(self.style.ERROR(f"No se encontraron cuentas para el usuario '{email}'."))
            return

        self.stdout.write(self.style.SUCCESS(f"Usuario {user.email} y Cuenta '{account.name}' encontrados. Limpiando transacciones antiguas..."))
        
        # Limpiar transacciones existentes de esta cuenta para no duplicar
        Transaction.objects.filter(account=account).delete()

        # --- 2. Preparar Categorías ---
        cat_sueldo, _ = Category.objects.get_or_create(name='Sueldo', defaults={'account': None})
        cat_alquiler, _ = Category.objects.get_or_create(name='Alquiler', defaults={'account': None})
        cat_comida, _ = Category.objects.get_or_create(name='Comida', defaults={'account': None})
        cat_ocio, _ = Category.objects.get_or_create(name='Ocio', defaults={'account': None})
        cat_transporte, _ = Category.objects.get_or_create(name='Transporte', defaults={'account': None})

        transactions_to_create = []
        today = timezone.now().date()

        # --- 3. Generar Patrones Fijos (Sueldo y Alquiler) ---
        self.stdout.write("Generando ingresos y gastos fijos (últimos 3 meses)...")
        for i in range(3): # 3 meses de historial
            # Sueldo el día 1
            fecha_sueldo = (today - timedelta(days=i*30)).replace(day=1)
            transactions_to_create.append(
                Transaction(
                    account=account,
                    category=cat_sueldo,
                    amount=Decimal('50000.00'), # Monto de ejemplo
                    description="Ingreso de Sueldo",
                    date=fecha_sueldo,
                    transaction_type=TransactionType.INCOME,
                    created_by_rule=False
                )
            )
            
            # Alquiler el día 5
            fecha_alquiler = (today - timedelta(days=i*30)).replace(day=5)
            transactions_to_create.append(
                Transaction(
                    account=account,
                    category=cat_alquiler,
                    amount=Decimal('15000.00'), # Monto de ejemplo
                    description="Pago Alquiler",
                    date=fecha_alquiler,
                    transaction_type=TransactionType.EXPENSE,
                    created_by_rule=False
                )
            )

        # --- 4. Generar Patrones Variables (Gastos Diarios) ---
        self.stdout.write("Generando gastos diarios variables (últimos 90 días)...")
        for i in range(90): # 90 días de historial
            current_date = today - timedelta(days=i)
            
            # Generar entre 0 y 3 gastos diarios
            for _ in range(random.randint(0, 3)):
                cat = random.choice([cat_comida, cat_ocio, cat_transporte])
                if cat == cat_comida:
                    amount = Decimal(random.uniform(65.0, 500.0)).quantize(Decimal('0.01'))
                    desc = random.choice(["Almuerzo oficina", "Café", "Supermercado chico"])
                elif cat == cat_transporte:
                    amount = Decimal(random.uniform(50.0, 450.0)).quantize(Decimal('0.01'))
                    desc = random.choice(["Boleto", "Uber a casa", "Nafta"])
                else: # Ocio
                    amount = Decimal(random.uniform(150.0, 750.0)).quantize(Decimal('0.01'))
                    desc = random.choice(["Cine", "Salida con amigos", "Compra online"])
                
                transactions_to_create.append(
                    Transaction(
                        account=account,
                        category=cat,
                        amount=amount,
                        description=desc,
                        date=current_date,
                        transaction_type=TransactionType.EXPENSE,
                        created_by_rule=False
                    )
                )

        # --- 5. Guardar todo en la Base de Datos ---
        self.stdout.write(f"Creando {len(transactions_to_create)} transacciones en la base de datos...")
        Transaction.objects.bulk_create(transactions_to_create)
        
        self.stdout.write(self.style.SUCCESS("¡Historial de transacciones generado exitosamente!"))