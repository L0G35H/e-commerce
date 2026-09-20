from rest_framework import serializers
from .models import RiskAssessment

class RiskAssessmentSerializer(serializers.ModelSerializer):
    order_number = serializers.ReadOnlyField(source='order.order_number')
    user_email = serializers.ReadOnlyField(source='order.user.email')
    order_total = serializers.ReadOnlyField(source='order.total')

    class Meta:
        model = RiskAssessment
        fields = [
            'id', 'order', 'order_number', 'user_email', 'order_total', 
            'risk_score', 'risk_level', 'risk_reasons', 'reviewed_by_admin', 
            'admin_notes', 'created_at'
        ]
