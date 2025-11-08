# apps/insights/models.py
from django.db import models
from django.conf import settings

class FinancialInsight(models.Model):
    """
    Almacena un consejo financiero (Insight) generado por el LLM
    para un usuario específico.
    """
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='insights',
        help_text="Usuario al que pertenece este consejo"
    )
    title = models.CharField(
        max_length=255,
        help_text="El título del consejo (ej: 'Oportunidad de Ahorro en Ocio')"
    )
    message = models.TextField(
        help_text="El consejo detallado generado por el LLM"
    )
    generated_at = models.DateTimeField(
        auto_now_add=True,
        help_text="Fecha y hora en que se generó el consejo"
    )
    is_read = models.BooleanField(
        default=False,
        help_text="Indica si el usuario ya vio este consejo"
    )

    class Meta:
        verbose_name = "Consejo Financiero"
        verbose_name_plural = "Consejos Financieros"
        ordering = ['-generated_at'] # Mostrar los más nuevos primero

    def __str__(self):
        return f"Consejo para {self.user.email} - {self.title}"