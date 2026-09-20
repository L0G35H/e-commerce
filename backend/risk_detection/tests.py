from django.test import TestCase
from django.contrib.auth import get_user_model
from orders.models import Order
from risk_detection.assessor import evaluate_order_risk

User = get_user_model()

class RiskDetectionTestCase(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='riskuser',
            email='risk@intellicart.com',
            password='password123'
        )

    def test_low_risk_evaluation(self):
        order = Order.objects.create(
            user=self.user,
            order_number='ORD-LOW-001',
            estimated_delivery='3 Days',
            subtotal=12000.0,
            discount=0.0,
            shipping=0.0,
            tax=960.0,
            total=12960.0,
            delivery_address={'pincode': '95131'}
        )
        assessment = evaluate_order_risk(order, failed_payment_attempts=0)
        self.assertEqual(assessment.risk_level, 'LOW')
        self.assertLess(assessment.risk_score, 40)

    def test_high_risk_evaluation(self):
        order = Order.objects.create(
            user=self.user,
            order_number='ORD-HIGH-001',
            estimated_delivery='3 Days',
            subtotal=180000.0,
            discount=0.0,
            shipping=0.0,
            tax=14400.0,
            total=194400.0,
            delivery_address={'pincode': '95131'}
        )
        assessment = evaluate_order_risk(order, failed_payment_attempts=3)
        self.assertEqual(assessment.risk_level, 'HIGH')
        self.assertGreaterEqual(assessment.risk_score, 70)
