from django.db import models
from django.conf import settings
from products.models import Product

class Review(models.Model):
    class Status(models.TextChoices):
        APPROVED = 'APPROVED', 'Approved'
        PENDING = 'PENDING', 'Pending'
        REJECTED = 'REJECTED', 'Rejected'

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='reviews')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='reviews')
    rating = models.IntegerField(default=5)
    title = models.CharField(max_length=200, blank=True, null=True)
    comment = models.TextField()
    verified_purchase = models.BooleanField(default=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.APPROVED)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Review by {self.user.email} for {self.product.name} ({self.rating} stars)"
