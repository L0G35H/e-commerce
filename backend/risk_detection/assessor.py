from django.utils import timezone
from datetime import timedelta
from orders.models import Order
from .models import RiskAssessment

def evaluate_order_risk(order: Order, failed_payment_attempts: int = 0) -> RiskAssessment:
    """
    Computes an explainable risk score (0-100) and risk level for a given order.
    """
    score = 0
    reasons = []

    # 1. Order Value Anomaly Check
    total_val = float(order.total)
    if total_val > 150000:
        score += 40
        reasons.append(f"Unusually high order value (₹{total_val:,.2f})")
    elif total_val > 50000:
        score += 25
        reasons.append(f"High order value threshold exceeded (₹{total_val:,.2f})")

    # 2. Failed Payment Attempts Check
    if failed_payment_attempts >= 3:
        score += 35
        reasons.append(f"Multiple failed payment attempts detected ({failed_payment_attempts} failures)")
    elif failed_payment_attempts >= 1:
        score += 15
        reasons.append(f"Payment retry occurred ({failed_payment_attempts} failed attempt)")

    # 3. Order Velocity Check (Frequency)
    one_hour_ago = timezone.now() - timedelta(hours=1)
    recent_order_count = Order.objects.filter(user=order.user, created_at__gte=one_hour_ago).count()
    if recent_order_count >= 3:
        score += 30
        reasons.append(f"Abnormal ordering velocity ({recent_order_count} orders placed in last 60 minutes)")

    # 4. Account Age Check
    user_age = (timezone.now() - order.user.date_joined).total_seconds() / 3600.0
    if user_age < 24:
        score += 20
        reasons.append("New account activity (< 24 hours old)")

    # 5. Delivery Pattern Check
    profile_pincode = getattr(getattr(order.user, 'profile', None), 'default_pincode', '')
    shipping_pincode = order.delivery_address.get('pincode', '')
    if profile_pincode and shipping_pincode and profile_pincode != shipping_pincode:
        score += 10
        reasons.append(f"Delivery address mismatch (Profile: {profile_pincode}, Order: {shipping_pincode})")

    # Cap score at 100
    score = min(score, 100)

    # Classify Risk Level
    if score >= 70:
        level = RiskAssessment.RiskLevel.HIGH
    elif score >= 40:
        level = RiskAssessment.RiskLevel.MEDIUM
    else:
        level = RiskAssessment.RiskLevel.LOW
        if not reasons:
            reasons.append("Standard verified transaction parameters")

    assessment, _ = RiskAssessment.objects.update_or_create(
        order=order,
        defaults={
            'risk_score': score,
            'risk_level': level,
            'risk_reasons': reasons
        }
    )
    return assessment
