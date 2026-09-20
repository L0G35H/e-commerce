from django.urls import path
from .views import CartView, CartItemDetailView

urlpatterns = [
    path('', CartView.as_view(), name='cart_detail'),
    path('items/<int:pk>/', CartItemDetailView.as_view(), name='cart_item_detail'),
]
