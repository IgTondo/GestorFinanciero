from django.contrib import admin
from .models import Category, Transaction
from apps.users.models import Account, CustomUser
# Register your models here.

admin.site.register(Category)
admin.site.register(Transaction)