from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from products.models import Product
from products.serializers import ProductSerializer
from .models import Recommendation, RecentlyViewed
from .serializers import RecommendationSerializer, RecentlyViewedSerializer
from .engine import generate_recommendations_for_user, log_user_interaction

class PersonalizedRecommendationsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        recs = generate_recommendations_for_user(request.user)
        serializer = RecommendationSerializer(recs, many=True)
        return Response({'success': True, 'recommendations': serializer.data})


class LogInteractionView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        product_id = request.data.get('product_id')
        interaction_type = request.data.get('interaction_type', 'VIEW')
        
        try:
            product = Product.objects.get(id=product_id)
            log_user_interaction(request.user, product, interaction_type)
            return Response({'success': True, 'message': 'Interaction logged.'})
        except Product.DoesNotExist:
            return Response({'success': False, 'message': 'Product not found.'}, status=status.HTTP_404_NOT_FOUND)


class RecentlyViewedView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        items = RecentlyViewed.objects.filter(user=request.user)[:10]
        serializer = RecentlyViewedSerializer(items, many=True)
        return Response({'success': True, 'items': serializer.data})


class SimilarProductsView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, product_id):
        try:
            target = Product.objects.get(id=product_id)
            similar = Product.objects.filter(
                category=target.category
            ).exclude(id=target.id).order_by('-rating')[:4]
            serializer = ProductSerializer(similar, many=True)
            return Response({'success': True, 'products': serializer.data})
        except Product.DoesNotExist:
            return Response({'success': False, 'message': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)
