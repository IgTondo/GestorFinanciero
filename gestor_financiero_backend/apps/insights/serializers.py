from rest_framework import serializers
from .models import FinancialInsight

class FinancialInsightSerializer(serializers.ModelSerializer):
    """
    Serializa los consejos (Insights) para mostrarlos en la API.
    """
    class Meta:
        model = FinancialInsight
        # Definimos los campos que el frontend podrá ver
        fields = [
            'id', 
            'title', 
            'message', 
            'generated_at', 
            'is_read'
        ]
        # El usuario no puede cambiar estos campos desde la API
        read_only_fields = fields