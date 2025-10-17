from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.conf import settings
from django.utils.translation import gettext_lazy as _


class CustomUserManager(BaseUserManager):
    def create_user(self, first_name, last_name, email, password, **extra_fields):
        if not email:
            raise ValueError(_("El email es obligatorio"))
        email = self.normalize_email(email)
        user = self.model(first_name=first_name, last_name=last_name, email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, first_name, last_name, email, password, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_active", True)

        if extra_fields.get("is_staff") is not True:
            raise ValueError(_("Superuser must have is_staff=True."))
        if extra_fields.get("is_superuser") is not True:
            raise ValueError(_("Superuser must have is_superuser=True."))
        return self.create_user(first_name, last_name, email, password, **extra_fields)
        

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

class Account(models.Model):
    name = models.CharField(max_length=100, help_text="Ej: Cuenta Personal, Hogar, Vacaciones", primary_key=True)
    members = models.ManyToManyField(
        settings.AUTH_USER_MODEL, 
        related_name="accounts",
        blank=True 
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name