# En un archivo "signals.py"
from django.db.models.signals import post_save
from django.dispatch import receiver
from apps.transactions.models import Transaction

@receiver(post_save, sender=Transaction)
def mi_oyente_de_reglas(sender, instance, created, **kwargs):
    # Aquí va nuestra lógica
    pass