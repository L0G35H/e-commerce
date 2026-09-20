from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from products.models import Product
from .models import Wishlist, WishlistItem
from .serializers import WishlistSerializer

class WishlistView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        wishlist, _ = Wishlist.objects.get_or_create(user=request.user)
        serializer = WishlistSerializer(wishlist)
        return Response({'success': True, 'wishlist': serializer.data})

    def post(self, request):
        wishlist, _ = Wishlist.objects.get_or_create(user=request.user)
        product_id = request.data.get('product_id')
        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return Response({'success': False, 'message': 'Product not found.'}, status=status.HTTP_404_NOT_FOUND)

        item, created = WishlistItem.objects.get_or_create(wishlist=wishlist, product=product)
        if not created:
            item.delete()
            message = 'Item removed from wishlist.'
        else:
            message = 'Item added to wishlist.'

        serializer = WishlistSerializer(wishlist)
        return Response({'success': True, 'message': message, 'wishlist': serializer.data})
