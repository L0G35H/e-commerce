from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RiskAssessmentViewSet

router = DefaultRouter()
router.register('', RiskAssessmentViewSet, basename='risk')

urlpatterns = [
    path('', include(router.urls)),
]
