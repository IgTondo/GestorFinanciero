from django.contrib import admin
from .models import EventRule, ScheduledRule

# Register your models here.

admin.site.register(EventRule)
admin.site.register(ScheduledRule)
