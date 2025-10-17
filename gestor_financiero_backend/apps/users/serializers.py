# apps/users/serializers.py
from rest_framework import serializers
from .models import CustomUser, Account
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'first_name', 'last_name']

class AccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = Account
        fields = ['id', 'name', 'owner', 'members', 'created_at']
        
    members = UserSerializer(many=True, read_only=True)
    owner = UserSerializer(read_only=True)
    
    def validate(self, data):
        """
        Verifica que el dueño no tenga ya una cuenta con el mismo nombre.
        """
        user = self.context['request'].user
        account_name = data.get('name')

        # La validación ahora usa la nueva relación 'owned_accounts'
        if user.owned_accounts.filter(name=account_name).exists():
            raise serializers.ValidationError(
                f"Ya eres dueño de una cuenta con el nombre '{account_name}'."
            )
        
        return data
        
class RegisterSerializer(serializers.ModelSerializer):
    password2 = serializers.CharField(write_only=True, style={'input_type': 'password'})
    
    # Añadimos campos para los tokens, pero serán de solo lectura.
    tokens = serializers.SerializerMethodField()
    
    class Meta:
        model = CustomUser
        fields = ['first_name', 'last_name', 'email', 'password', 'password2', 'tokens']
        extra_kwargs = {'password': {'write_only': True}}
        
    def get_tokens(self, user):
        """
        Crea y devuelve los tokens de acceso y refresco para un usuario.
        """
        tokens = RefreshToken.for_user(user)
        data = {
            'refresh': str(tokens),
            'access': str(tokens.access_token),
        }
        return data
        
    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Las contraseñas no coinciden"})
        return attrs

    def create(self, validated_data):
        validated_data.pop('tokens', None)
        
        user = CustomUser.objects.create_user(
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            email=validated_data['email'],
            password=validated_data['password'],
        )
        return user
    
class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['role'] = user.role
        token['first_name'] = user.first_name

        return token