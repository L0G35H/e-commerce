from rest_framework import status, permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from products.models import Product
from .models import Cart, CartItem
from .serializers import CartSerializer, CartItemSerializer

def get_or_create_user_cart(request):
    if request.user.is_authenticated:
        cart, _ = Cart.objects.get_or_create(user=request.user)
    else:
        session_key = request.session.session_key
        if not session_key:
            request.session.create()
            session_key = request.session.session_key
        cart, _ = Cart.objects.get_or_create(session_key=session_key)
    return cart

class CartView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        cart = get_or_create_user_cart(request)
        serializer = CartSerializer(cart)
        return Response({'success': True, 'cart': serializer.data})

    def post(self, request):
        cart = get_or_create_user_cart(request)
        product_id = request.data.get('product_id')
        quantity = int(request.data.get('quantity', 1))
        selected_color = request.data.get('selected_color', '')
        selected_memory = request.data.get('selected_memory', '')
        selected_storage = request.data.get('selected_storage', '')

        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return Response({'success': False, 'message': 'Product not found.'}, status=status.HTTP_404_NOT_FOUND)

        item, created = CartItem.objects.get_or_create(
            cart=cart,
            product=product,
            selected_color=selected_color,
            defaults={
                'quantity': quantity,
                'selected_memory': selected_memory,
                'selected_storage': selected_storage,
                'price': product.price
            }
        )
        if not created:
            item.quantity += quantity
            item.save()

        serializer = CartSerializer(cart)
        return Response({'success': True, 'message': 'Item added to cart', 'cart': serializer.data})


class CartItemDetailView(APIView):
    permission_classes = [permissions.AllowAny]

    def put(self, request, pk):
        cart = get_or_create_user_cart(request)
        try:
            item = CartItem.objects.get(id=pk, cart=cart)
        except CartItem.DoesNotExist:
            return Response({'success': False, 'message': 'Cart item not found.'}, status=status.HTTP_404_NOT_FOUND)

        quantity = request.data.get('quantity')
        if quantity is not None:
            if int(quantity) <= 0:
                item.delete()
            else:
                item.quantity = int(quantity)
                item.save()

        serializer = CartSerializer(cart)
        return Response({'success': True, 'cart': serializer.data})

    def delete(self, request, pk):
        cart = get_or_create_user_cart(request)
        try:
            item = CartItem.objects.get(id=pk, cart=cart)
            item.delete()
        except CartItem.DoesNotExist:
            pass

        serializer = CartSerializer(cart)
        return Response({'success': True, 'message': 'Item removed from cart.', 'cart': serializer.data})
