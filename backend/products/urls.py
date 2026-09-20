from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CategoryViewSet, BrandViewSet, ProductViewSet, InventoryViewSet, delete_product_view

router = DefaultRouter()
router.register('categories', CategoryViewSet, basename='category')
router.register('brands', BrandViewSet, basename='brand')
router.register('inventory', InventoryViewSet, basename='inventory')
router.register('', ProductViewSet, basename='product')

urlpatterns = [
    path('<str:product_id>/delete/', delete_product_view, name='product-delete'),
    path('', include(router.urls)),
]
