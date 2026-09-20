from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserProfileView, AddressViewSet

router = DefaultRouter()
router.register('addresses', AddressViewSet, basename='address')

urlpatterns = [
    path('profile/', UserProfileView.as_view(), name='user_profile'),
    path('', include(router.urls)),
]
