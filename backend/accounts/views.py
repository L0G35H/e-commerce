from rest_framework import status, generics, viewsets, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken, TokenError
from django.contrib.auth import get_user_model
from .models import Address, UserProfile
from .serializers import (
    UserSerializer, 
    RegisterSerializer, 
    AddressSerializer, 
    UserProfileSerializer,
    ChangePasswordSerializer
)
from .permissions import IsAdminOrStaffUser, admin_or_staff_required

User = get_user_model()

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        user_serializer = UserSerializer(self.user)
        data['user'] = user_serializer.data
        data['success'] = True
        return data

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class LogoutView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            if not refresh_token:
                return Response(
                    {'success': False, 'message': 'Refresh token is required.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response(
                {'success': True, 'message': 'Successfully logged out and token blacklisted.'},
                status=status.HTTP_200_OK
            )
        except TokenError as e:
            return Response(
                {'success': False, 'message': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {'success': False, 'message': 'An error occurred during logout.'},
                status=status.HTTP_400_BAD_REQUEST
            )


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        user_serializer = UserSerializer(user)
        refresh = RefreshToken.for_user(user)
        return Response({
            'success': True,
            'message': 'Registration successful.',
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': user_serializer.data
        }, status=status.HTTP_201_CREATED)


class UserProfileView(generics.RetrieveUpdateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user


class AddressViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = AddressSerializer

    def get_queryset(self):
        return Address.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ChangePasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = request.user
        if not user.check_password(serializer.validated_data['old_password']):
            return Response({'success': False, 'message': 'Incorrect current password.'}, status=status.HTTP_400_BAD_REQUEST)
        
        user.set_password(serializer.validated_data['new_password'])
        user.save()
        return Response({'success': True, 'message': 'Password updated successfully.'})


class AdminControlCenterView(APIView):
    """
    Dedicated endpoint for the Admin Control Center.
    Independently verifies user.is_staff, user.is_superuser, or user.role == 'ADMIN'.
    Returns 403 Permission Denied if a non-admin/customer tries to access directly.
    """
    permission_classes = [IsAdminOrStaffUser]

    def get(self, request):
        return Response({
            'success': True,
            'message': 'Welcome to the Admin Control Center.',
            'user': {
                'id': request.user.id,
                'email': request.user.email,
                'role': request.user.role,
                'is_staff': request.user.is_staff,
                'is_superuser': request.user.is_superuser,
                'is_admin': request.user.is_admin,
            },
            'sections': [
                {'name': 'Overview', 'url': '/api/v1/analytics/overview/'},
                {'name': 'Order Risk Monitor', 'url': '/api/v1/risk/assessments/'},
                {'name': 'Products & Inventory', 'url': '/api/v1/products/'},
                {'name': 'Order Processing', 'url': '/api/v1/orders/'},
            ]
        }, status=status.HTTP_200_OK)
