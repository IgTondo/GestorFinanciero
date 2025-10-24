from django.contrib import admin
from .models import Account, CustomUser, Membership

# Register your models here.
admin.site.register(Account)
admin.site.register(CustomUser)
admin.site.register(Membership)