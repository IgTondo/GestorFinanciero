from django.db import models

# Create your models here.

class Gasto(models.Model):
    descripcion = models.CharField(max_length=255)
    monto = models.DecimalField(max_digits=10, decimal_places=2)
    fecha = models.DateField(auto_now_add=True)
    categoria = models.CharField(max_length=50, blank=True, null=True)

    def __str__(self):
        return self.descripcion
