from django.urls import path, include
from apps.users.urls import router as users_router
from rest_framework_nested.routers import NestedSimpleRouter
from .views import CategoryViewSet, TransactionViewSet

accounts_router = NestedSimpleRouter(users_router, r'accounts', lookup='account')
accounts_router.register(r'transactions', TransactionViewSet, basename='account-transactions')
accounts_router.register(r'categories', CategoryViewSet, basename='account-categories')

urlpatterns = [
    path('', include(accounts_router.urls))
]