from django.db import models
from orders.models import Order

class RiskAssessment(models.Model):
    class RiskLevel(models.TextChoices):
        LOW = 'LOW', 'Low Risk'
        MEDIUM = 'MEDIUM', 'Medium Risk'
        HIGH = 'HIGH', 'High Risk'

    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='risk_assessment')
    risk_score = models.IntegerField(default=10)
    risk_level = models.CharField(max_length=20, choices=RiskLevel.choices, default=RiskLevel.LOW)
    risk_reasons = models.JSONField(default=list)
    reviewed_by_admin = models.BooleanField(default=False)
    admin_notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-risk_score']

    def __str__(self):
        return f"Risk {self.risk_level} ({self.risk_score}) for Order #{self.order.order_number}"
