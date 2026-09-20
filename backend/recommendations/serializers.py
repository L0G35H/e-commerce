from rest_framework import serializers
from products.serializers import ProductSerializer
from .models import Recommendation, RecentlyViewed, UserInteraction

class RecommendationSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)

    class Meta:
        model = Recommendation
        fields = ['id', 'product', 'score', 'reason_type', 'reason_text', 'created_at']


class RecentlyViewedSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)

    class Meta:
        model = RecentlyViewed
        fields = ['id', 'product', 'viewed_at']
