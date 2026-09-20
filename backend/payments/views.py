from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Coupon
from .serializers import CouponSerializer

class ValidateCouponView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        code = request.data.get('code', '').strip().upper()
        try:
            coupon = Coupon.objects.get(code=code, is_active=True)
            serializer = CouponSerializer(coupon)
            return Response({'success': True, 'message': 'Coupon applied!', 'coupon': serializer.data})
        except Coupon.DoesNotExist:
            # Provide standard default coupons for demonstration
            if code in ['INTELLI10', 'CARNIVAL20', 'WELCOME15']:
                discount = 15 if code == 'WELCOME15' else (20 if code == 'CARNIVAL20' else 10)
                return Response({
                    'success': True,
                    'message': f'Promo code {code} applied successfully!',
                    'coupon': {
                        'code': code,
                        'discount_percentage': discount,
                        'max_discount_amount': 500.0,
                        'min_purchase_amount': 500.0,
                        'is_active': True
                    }
                })
            return Response({'success': False, 'message': 'Invalid or expired coupon code.'}, status=status.HTTP_400_BAD_REQUEST)
