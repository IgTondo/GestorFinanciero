from rest_framework_nested import routers
from apps.users.urls import router as users_router # Importa el router padre
from .views import EventRuleViewSet, ScheduledRuleViewSet

# 1. Crea un router anidado "colgado" de 'accounts'
accounts_router = routers.NestedSimpleRouter(users_router, r'accounts', lookup='account')

# 2. Registra el ViewSet de reglas bajo el router de cuentas
accounts_router.register(
    r'event-rules', 
    EventRuleViewSet, 
    basename='account-event-rules'
)

accounts_router.register(
    r'scheduled-rules', 
    ScheduledRuleViewSet, 
    basename='account-scheduled-rules'
)

# 3. Define los urlpatterns
urlpatterns = accounts_router.urls
