# apps/transactions/models.py
from django.db import models
from django.conf import settings
from apps.users.models import Account

class Category(models.Model):
    name = models.CharField(max_length=100)
    # Si es nulo, es una categoría global.
    account = models.ForeignKey(
        Account, 
        on_delete=models.CASCADE, 
        related_name='custom_categories',
        null=True, # Permite que sea nulo en la BD
        blank=True # Permite que esté vacío en formularios/admin
    )

    def __str__(self):
        return self.name

    class Meta:
        # Evita que se creen categorías con el mismo nombre para la misma cuenta
        unique_together = ('name', 'account')
        verbose_name_plural = "Categories"


class Transaction(models.Model):
    id = models.AutoField(primary_key=True)
    account = models.ForeignKey(Account, on_delete=models.CASCADE, related_name='transactions')
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.CharField(max_length=255)
    date = models.DateTimeField(auto_now_add=True)
    transaction_type = models.CharField(max_length=10, choices=[('INCOME', 'Ingreso'), ('EXPENSE', 'Egreso')])

    def __str__(self):
        return f"{self.description} - {self.amount}"