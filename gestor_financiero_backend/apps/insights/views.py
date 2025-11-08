from rest_framework import viewsets, permissions
from .models import FinancialInsight
from .serializers import FinancialInsightSerializer

class InsightViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet de SOLO LECTURA para que un usuario pueda ver sus 
    propios consejos financieros.
    
    Permite:
    - GET /api/insights/ (Listar todos los consejos)
    - GET /api/insights/{id}/ (Ver un consejo específico)
    """
    serializer_class = FinancialInsightSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """
        ¡Esta es la consulta de seguridad clave!
        Garantiza que un usuario SOLO vea los consejos generados para él.
        """
        return FinancialInsight.objects.filter(user=self.request.user)