from rest_framework import viewsets, permissions, generics
from .models import CustomUser, Account
from .serializers import UserSerializer, AccountSerializer, RegisterSerializer, MyTokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView

class RegisterView(generics.CreateAPIView):
    """
    Vista para el registro de nuevos usuarios.
    Accesible por cualquier usuario (autenticado o no).
    """
    queryset = CustomUser.objects.all()
    # El permiso AllowAny permite que cualquier usuario (incluso anónimo) acceda a esta vista.
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer
    
class LoginView(TokenObtainPairView):
    """
    Vista para el inicio de sesión de usuarios.
    """
    permission_classes = (permissions.AllowAny,)
    serializer_class = MyTokenObtainPairSerializer

class UserViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet para ver usuarios. No permitimos la creación/edición aquí
    para mantener la seguridad. El registro se manejará por separado.
    """
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]

class AccountViewSet(viewsets.ModelViewSet):
    """
    ViewSet para crear, ver y editar Cuentas.
    """
    serializer_class = AccountSerializer
    permission_classes = [permissions.IsAuthenticated] 

    def get_queryset(self):
        # Filtramos para que un usuario solo vea las cuentas a las que pertenece
        return self.request.user.accounts.all()

    def perform_create(self, serializer):
        # Al crear una nueva cuenta, añadimos al usuario actual como el primer miembro
        account = serializer.save()
        account.members.add(self.request.user)