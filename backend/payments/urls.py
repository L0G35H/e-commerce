from django.urls import path
from .views import ValidateCouponView

urlpatterns = [
    path('validate-coupon/', ValidateCouponView.as_view(), name='validate_coupon'),
]
