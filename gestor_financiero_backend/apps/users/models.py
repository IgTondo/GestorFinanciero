from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.conf import settings
from django.utils.translation import gettext_lazy as _


class CustomUserManager(BaseUserManager):
    def create_user(self, email, password, **extra_fields):
        if not email:
            raise ValueError(_("El email es obligatorio"))
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_active", True)

        if extra_fields.get("is_staff") is not True:
            raise ValueError(_("Superuser must have is_staff=True."))
        if extra_fields.get("is_superuser") is not True:
            raise ValueError(_("Superuser must have is_superuser=True."))
        return self.create_user(email, password, **extra_fields)
        

class CustomUser(AbstractUser):
    
    username = None
    email = models.EmailField(_('email address'), unique=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name']
    
    objects = CustomUserManager()
    
    class Role(models.TextChoices):
        NORMAL = "NORMAL", "Normal"
        PREMIUM = "PREMIUM", "Premium"

    role = models.CharField(max_length=10, choices=Role.choices, default=Role.NORMAL)
    def __str__(self):
        return self.email
    
class Membership(models.Model):
    """
    Modelo intermedio que conecta a un Usuario con una Cuenta.
    Aquí es donde guardamos el alias personalizado.
    """
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    account = models.ForeignKey('Account', on_delete=models.CASCADE)
    alias = models.CharField(max_length=100, blank=True, null=True, help_text="Apodo personal para esta cuenta")
    date_joined = models.DateTimeField(auto_now_add=True)

    class Meta:
        # Un usuario solo puede ser miembro de una cuenta una vez
        unique_together = ('user', 'account')

class Account(models.Model):
    name = models.CharField(max_length=100, help_text="Ej: Cuenta Personal, Hogar, Vacaciones")
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='owned_accounts' # Clave para acceder a las cuentas que posee un usuario
    )
    members = models.ManyToManyField(
        settings.AUTH_USER_MODEL, 
        related_name="accounts",
        blank=True,
        through="Membership"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "Cuenta"
        verbose_name_plural = "Cuentas"
        ordering = ['-created_at']
 
    def __str__(self):
        return self.name