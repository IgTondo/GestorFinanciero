from rest_framework import viewsets, permissions, generics, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import CustomUser, Account, Membership
from .serializers import UserSerializer, AccountSerializer, RegisterSerializer, MyTokenObtainPairSerializer, MembershipSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from .permissions import IsAccountOwner

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
    permission_classes = [permissions.IsAuthenticated, IsAccountOwner] 

    def get_queryset(self):
        # Filtramos para que un usuario solo vea las cuentas a las que pertenece
        return self.request.user.accounts.all().order_by("name")

    def perform_create(self, serializer):
        user = self.request.user
        
        # Al crear una nueva cuenta, añadimos al usuario actual como el primer miembro
        account = serializer.save(owner=user)
        Membership.objects.create(user=user, account=account)
        
    @action(detail=True, methods=['patch', 'get'], url_path='alias')
    def my_membership(self, request, pk=None):
        """
        Endpoint para que un usuario vea o actualice su alias en una cuenta.
        URL: PATCH /api/accounts/{id}/alias/
        """
        account = self.get_object()
        try:
            membership = Membership.objects.get(account=account, user=request.user)
        except Membership.DoesNotExist:
            return Response(
                {'error': 'No eres miembro de esta cuenta.'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        if request.method == 'GET':
            serializer = MembershipSerializer(membership)
            return Response(serializer.data)
        
        elif request.method == 'PATCH':
            serializer = MembershipSerializer(membership, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    @action(detail=True, methods=['get', 'post'], url_path='members')
    def members(self, request, pk=None):
        """
        Endpoint para listar o añadir miembros a una cuenta.
        - GET /api/accounts/{id}/members/ -> Lista los miembros.
        - POST /api/accounts/{id}/members/ -> Añade un miembro.
        """
        account = self.get_object()

        # Solo el dueño puede añadir nuevos miembros
        if request.method == 'POST' and account.owner != request.user:
            return Response(
                {'error': 'Solo el dueño puede añadir miembros.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if request.method == 'POST':
            email = request.data.get('email')
            if not email:
                return Response({'error': 'Email es requerido.'}, status=status.HTTP_400_BAD_REQUEST)
            
            try:
                user_to_add = CustomUser.objects.get(email=email)
                Membership.objects.create(user=user_to_add, account=account)
                return Response({'status': 'Miembro añadido.'}, status=status.HTTP_201_CREATED)
            except CustomUser.DoesNotExist:
                return Response({'error': 'Usuario no encontrado.'}, status=status.HTTP_404_NOT_FOUND)
            except Exception: # Por si ya es miembro
                return Response({'error': 'El usuario ya es miembro de esta cuenta.'}, status=status.HTTP_400_BAD_REQUEST)

        # Para el método GET, listamos todos los miembros
        members = account.members.all()
        serializer = UserSerializer(members, many=True)
        return Response(serializer.data)