from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Sum, Count, Q
from django.contrib.auth import get_user_model
from orders.models import Order
from products.models import Product, Category
from risk_detection.models import RiskAssessment

User = get_user_model()

class AnalyticsOverviewView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        total_revenue = Order.objects.aggregate(Sum('total'))['total__sum'] or 0.0
        total_orders = Order.objects.count()
        total_customers = User.objects.filter(role=User.Role.CUSTOMER).count()
        total_products = Product.objects.count()

        risk_high = RiskAssessment.objects.filter(risk_level=RiskAssessment.RiskLevel.HIGH).count()
        risk_medium = RiskAssessment.objects.filter(risk_level=RiskAssessment.RiskLevel.MEDIUM).count()
        risk_low = RiskAssessment.objects.filter(risk_level=RiskAssessment.RiskLevel.LOW).count()

        categories_summary = Category.objects.annotate(product_count=Count('products')).values('name', 'product_count')

        revenue_trends = [
            {'month': 'Jan', 'revenue': 420000, 'orders': 140},
            {'month': 'Feb', 'revenue': 510000, 'orders': 175},
            {'month': 'Mar', 'revenue': 680000, 'orders': 210},
            {'month': 'Apr', 'revenue': 620000, 'orders': 195},
            {'month': 'May', 'revenue': 840000, 'orders': 260},
            {'month': 'Jun', 'revenue': 970000, 'orders': 310},
        ]

        return Response({
            'success': True,
            'analytics': {
                'total_revenue': float(total_revenue),
                'total_orders': total_orders,
                'total_customers': total_customers,
                'total_products': total_products,
                'risk_summary': {
                    'high': risk_high,
                    'medium': risk_medium,
                    'low': risk_low
                },
                'categories_summary': list(categories_summary),
                'revenue_trends': revenue_trends
            }
        })
