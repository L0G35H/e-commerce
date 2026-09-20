from rest_framework import serializers
from accounts.serializers import UserSerializer
from .models import Review

class ReviewSerializer(serializers.ModelSerializer):
    user_name = serializers.ReadOnlyField(source='user.get_full_name')
    user_email = serializers.ReadOnlyField(source='user.email')
    product_name = serializers.ReadOnlyField(source='product.name')

    class Meta:
        model = Review
        fields = ['id', 'user', 'user_name', 'user_email', 'product', 'product_name', 'rating', 'title', 'comment', 'verified_purchase', 'status', 'created_at']
        read_only_fields = ['id', 'user', 'verified_purchase', 'created_at']
