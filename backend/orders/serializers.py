from rest_framework import serializers
from .models import Order, OrderItem

class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = '__all__'


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    risk_assessment = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'date', 'estimated_delivery', 'items', 
            'subtotal', 'discount', 'shipping', 'tax', 'total', 'status', 
            'tracking_number', 'carrier', 'delivery_address', 'delivery_type', 
            'payment_method', 'timeline', 'risk_assessment', 'created_at'
        ]

    def get_risk_assessment(self, obj):
        if hasattr(obj, 'risk_assessment'):
            from risk_detection.serializers import RiskAssessmentSerializer
            return RiskAssessmentSerializer(obj.risk_assessment).data
        return None
