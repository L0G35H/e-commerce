import uuid
from rest_framework import status, permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
from products.models import Product
from .models import Order, OrderItem
from .serializers import OrderSerializer

class OrderViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = OrderSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role == 'ADMIN' or user.is_staff:
            return Order.objects.all()
        return Order.objects.filter(user=user)

    def create(self, request, *args, **kwargs):
        data = request.data
        user = request.user
        
        items_data = data.get('items', [])
        if not items_data:
            return Response({'success': False, 'message': 'Cannot create an empty order.'}, status=status.HTTP_400_BAD_REQUEST)

        order_number = f"ORD-{uuid.uuid4().hex[:8].upper()}"
        tracking_number = f"TRK-{uuid.uuid4().hex[:10].upper()}"

        subtotal = float(data.get('subtotal', 0))
        discount = float(data.get('discount', 0))
        shipping = float(data.get('shipping', 15))
        tax = float(data.get('tax', subtotal * 0.08))
        total = subtotal - discount + shipping + tax

        delivery_address = data.get('delivery_address', {})
        delivery_type = data.get('delivery_type', 'Standard')
        payment_method = data.get('payment_method', 'card')

        initial_timeline = [
            {'status': 'Order Placed', 'date': timezone.now().strftime('%b %d, %Y - %I:%M %p'), 'completed': True, 'icon': 'Package'},
            {'status': 'Payment Verified', 'date': timezone.now().strftime('%b %d, %Y - %I:%M %p'), 'completed': True, 'icon': 'CheckCircle'},
            {'status': 'Processing', 'date': 'In progress', 'completed': False, 'current': True, 'icon': 'Clock'},
            {'status': 'Shipped', 'date': 'Pending', 'completed': False, 'icon': 'Truck'},
            {'status': 'Delivered', 'date': 'Estimated in 2-3 business days', 'completed': False, 'icon': 'Home'},
        ]

        order = Order.objects.create(
            user=user,
            order_number=order_number,
            estimated_delivery='3-5 Business Days',
            subtotal=subtotal,
            discount=discount,
            shipping=shipping,
            tax=tax,
            total=total,
            status=Order.Status.CONFIRMED,
            tracking_number=tracking_number,
            carrier='IntelliExpress Global',
            delivery_address=delivery_address,
            delivery_type=delivery_type,
            payment_method=payment_method,
            timeline=initial_timeline
        )

        for item_data in items_data:
            product_id = item_data.get('productId') or item_data.get('product_id')
            product = None
            if product_id:
                try:
                    product = Product.objects.get(id=product_id)
                except (Product.DoesNotExist, ValueError):
                    pass

            OrderItem.objects.create(
                order=order,
                product=product,
                product_name=item_data.get('name') or (product.name if product else 'Product'),
                product_image=item_data.get('image') or (product.image if product else ''),
                quantity=item_data.get('quantity', 1),
                selected_color=item_data.get('selectedColor', ''),
                selected_memory=item_data.get('selectedMemory', ''),
                selected_storage=item_data.get('selectedStorage', ''),
                price=item_data.get('price', product.price if product else 0)
            )

        # Trigger Order Risk Assessment
        try:
            from risk_detection.assessor import evaluate_order_risk
            evaluate_order_risk(order, failed_payment_attempts=data.get('failed_payment_attempts', 0))
        except Exception as e:
            print(f"Risk evaluation error: {e}")

        # Log purchase user interactions for recommendations
        try:
            from recommendations.engine import log_user_interaction
            for item in order.items.all():
                if item.product:
                    log_user_interaction(user, item.product, 'PURCHASE')
        except Exception as e:
            print(f"Interaction log error: {e}")

        serializer = self.get_serializer(order)
        return Response({'success': True, 'message': 'Order placed successfully', 'order': serializer.data}, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        order = self.get_object()
        if order.status in [Order.Status.SHIPPED, Order.Status.DELIVERED]:
            return Response({'success': False, 'message': 'Cannot cancel an order that has already been shipped.'}, status=status.HTTP_400_BAD_REQUEST)
        
        order.status = Order.Status.CANCELLED
        order.save()
        serializer = self.get_serializer(order)
        return Response({'success': True, 'message': 'Order cancelled.', 'order': serializer.data})
