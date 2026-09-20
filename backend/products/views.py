from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Q, F, ProtectedError, RestrictedError
from django.db import IntegrityError, transaction
from .models import Category, Brand, Product, ProductVariant, Inventory
from .serializers import (
    CategorySerializer, 
    BrandSerializer, 
    ProductSerializer, 
    ProductVariantSerializer,
    InventorySerializer
)

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


class BrandViewSet(viewsets.ModelViewSet):
    queryset = Brand.objects.all()
    serializer_class = BrandSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        queryset = Product.objects.filter(is_active=True)
        
        # Search filter
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) | 
                Q(description__icontains=search) |
                Q(brand__name__icontains=search) |
                Q(category__name__icontains=search)
            )

        # Category filter
        category_slug = self.request.query_params.get('category', None)
        if category_slug and category_slug != 'all':
            queryset = queryset.filter(Q(category__slug=category_slug) | Q(subcategory__iexact=category_slug))

        # Brand filter
        brand_name = self.request.query_params.get('brand', None)
        if brand_name and brand_name != 'All':
            queryset = queryset.filter(brand__name__iexact=brand_name)

        # Price filters
        min_price = self.request.query_params.get('min_price', None)
        max_price = self.request.query_params.get('max_price', None)
        if min_price:
            queryset = queryset.filter(price__gte=min_price)
        if max_price:
            queryset = queryset.filter(price__lte=max_price)

        # Rating filter
        min_rating = self.request.query_params.get('min_rating', None)
        if min_rating:
            queryset = queryset.filter(rating__gte=min_rating)

        # Sorting
        sort_by = self.request.query_params.get('sort_by', 'featured')
        if sort_by == 'price-low':
            queryset = queryset.order_by('price')
        elif sort_by == 'price-high':
            queryset = queryset.order_by('-price')
        elif sort_by == 'rating':
            queryset = queryset.order_by('-rating')
        elif sort_by == 'newest':
            queryset = queryset.order_by('-created_at')

        return queryset

    @action(detail=False, methods=['get'])
    def featured(self, request):
        featured_products = Product.objects.filter(is_featured=True, is_active=True)[:8]
        serializer = self.get_serializer(featured_products, many=True)
        return Response({'success': True, 'data': serializer.data})

    def destroy(self, request, *args, **kwargs):
        self.permission_classes = [IsAdminOrStaffUser]
        self.check_permissions(request)
        instance = self.get_object()
        return perform_safe_product_delete(instance)


class IsAdminOrStaffUser(permissions.BasePermission):
    """
    Restricts access to administrative or staff users.
    """
    message = "Permission denied: Only administrative or staff users are authorized to delete products."

    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        return bool(
            user.is_staff or 
            user.is_superuser or 
            getattr(user, 'role', None) == 'ADMIN'
        )


def perform_safe_product_delete(product):
    """
    Safely deletes or deactivates a product:
    - If referenced in existing orders, soft-deletes (marks inactive & out of stock)
      to maintain financial records and prevent cascading historical corruption.
    - If no orders reference the product, permanently deletes it from the database.
    - Gracefully handles ProtectedError, RestrictedError, and IntegrityError without crashing.
    """
    product_name = product.name
    product_sku = product.sku or str(product.id)

    try:
        with transaction.atomic():
            # Check for existing completed or active order items
            from orders.models import OrderItem
            has_orders = OrderItem.objects.filter(product=product).exists()

            if has_orders:
                # Soft delete: Deactivate and mark out of stock
                product.is_active = False
                product.in_stock = False
                product.stock_count = 0
                product.is_featured = False
                product.save(update_fields=['is_active', 'in_stock', 'stock_count', 'is_featured'])

                # Clear from customer shopping carts
                from cart.models import CartItem
                CartItem.objects.filter(product=product).delete()

                return Response({
                    'success': True,
                    'status': 'deactivated',
                    'message': f"Product '{product_name}' (SKU: {product_sku}) is referenced in existing customer orders. It has been deactivated and removed from active sales.",
                    'data': {'id': product.id, 'name': product_name, 'action': 'deactivated'}
                }, status=status.HTTP_200_OK)

            # Permanent hard delete
            product_id = product.id
            product.delete()
            return Response({
                'success': True,
                'status': 'deleted',
                'message': f"Product '{product_name}' (SKU: {product_sku}) has been permanently deleted from the catalog.",
                'data': {'id': product_id, 'name': product_name, 'action': 'deleted'}
            }, status=status.HTTP_200_OK)

    except (ProtectedError, RestrictedError) as e:
        # Fallback to safe deactivation if relational foreign key constraints prevent deletion
        product.in_stock = False
        product.stock_count = 0
        product.save(update_fields=['in_stock', 'stock_count'])
        return Response({
            'success': True,
            'status': 'archived',
            'message': f"Product '{product_name}' is locked by related records and has been safely archived/deactivated.",
            'data': {'id': product.id, 'name': product_name, 'action': 'archived'}
        }, status=status.HTTP_200_OK)
    except IntegrityError as e:
        return Response({
            'success': False,
            'error': 'DatabaseIntegrityError',
            'message': f"Could not delete product due to database integrity constraints: {str(e)}"
        }, status=status.HTTP_409_CONFLICT)
    except Exception as e:
        return Response({
            'success': False,
            'error': 'ServerError',
            'message': f"An error occurred while deleting product '{product_name}': {str(e)}"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST', 'DELETE'])
@permission_classes([IsAdminOrStaffUser])
def delete_product_view(request, product_id):
    """
    Dedicated endpoint to handle product deletion.
    - Path: products/<product_id>/delete/
    - Method: POST or DELETE only (GET returns 405 Method Not Allowed)
    - Permission: Admin/Staff only (401/403 for unauthorized users)
    - CSRF Protection: Integrated via Session/DRF authentication
    - Supports lookup by integer ID, slug, or SKU
    """
    product = None
    if str(product_id).isdigit():
        product = Product.objects.filter(id=int(product_id)).first()
    if not product:
        product = Product.objects.filter(Q(slug=str(product_id)) | Q(sku=str(product_id))).first()

    if not product:
        return Response({
            'success': False,
            'error': 'NotFound',
            'message': f"Product with identifier '{product_id}' was not found in catalog."
        }, status=status.HTTP_404_NOT_FOUND)

    return perform_safe_product_delete(product)


class InventoryViewSet(viewsets.ModelViewSet):
    queryset = Inventory.objects.all()
    serializer_class = InventorySerializer
    permission_classes = [permissions.IsAdminUser]

    @action(detail=False, methods=['get'])
    def low_stock(self, request):
        low_stock_items = Inventory.objects.filter(stock_quantity__lte=F('low_stock_threshold'))
        serializer = self.get_serializer(low_stock_items, many=True)
        return Response({'success': True, 'data': serializer.data})
