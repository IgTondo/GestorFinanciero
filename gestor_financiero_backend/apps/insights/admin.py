# apps/insights/admin.py
from django.contrib import admin
from .models import FinancialInsight

@admin.register(FinancialInsight)
class FinancialInsightAdmin(admin.ModelAdmin):
    list_display = ('user', 'title', 'generated_at', 'is_read')
    list_filter = ('is_read', 'generated_at')
    search_fields = ('user__email', 'title', 'message')
    readonly_fields = ('user', 'title', 'message', 'generated_at')