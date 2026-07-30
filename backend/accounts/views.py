"""Views for Accounts app."""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from .models import Organization, User, APIKey
from .serializers import (
    OrganizationSerializer, UserSerializer, UserRegistrationSerializer, 
    APIKeySerializer, CustomTokenObtainPairSerializer
)
from .permissions import IsOrgAdmin, IsOrgMember
from .services import APIKeyService


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class OrganizationViewSet(viewsets.ModelViewSet):
    serializer_class = OrganizationSerializer
    permission_classes = [IsAuthenticated, IsOrgAdmin]

    def get_queryset(self):
        # Only return the user's organization
        if not self.request.user.organization:
            return Organization.objects.none()
        return Organization.objects.filter(id=self.request.user.organization.id)


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def get_permissions(self):
        if self.action == 'create_enterprise_user':
            return [AllowAny()]
        return [IsAuthenticated(), IsOrgAdmin()]

    def get_queryset(self):
        if not self.request.user.organization:
            return User.objects.none()
        return User.objects.filter(organization=self.request.user.organization)

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def create_enterprise_user(self, request):
        """Public endpoint for initial enterprise registration."""
        serializer = UserRegistrationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)


class APIKeyViewSet(viewsets.ModelViewSet):
    serializer_class = APIKeySerializer
    permission_classes = [IsAuthenticated, IsOrgAdmin]

    def get_queryset(self):
        if not self.request.user.organization:
            return APIKey.objects.none()
        return APIKey.objects.filter(organization=self.request.user.organization)

    def create(self, request, *args, **kwargs):
        name = request.data.get('name')
        scopes = request.data.get('scopes', ["repo:read", "scan:write"])
        
        if not name:
            return Response({"error": "Name is required"}, status=status.HTTP_400_BAD_REQUEST)
            
        api_key, raw_key = APIKeyService.generate_key(
            org=request.user.organization,
            user=request.user,
            name=name,
            scopes=scopes
        )
        
        data = self.get_serializer(api_key).data
        data['raw_key'] = raw_key  # Only time it will ever be shown
        return Response(data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def revoke(self, request, pk=None):
        api_key = self.get_object()
        api_key.is_revoked = True
        api_key.save()
        return Response({"status": "revoked"})
