from django.db import models
from django.conf import settings
from products.models import Product

class UserInteraction(models.Model):
    class InteractionType(models.TextChoices):
        SEARCH = 'SEARCH', 'Search'
        VIEW = 'VIEW', 'View'
        WISHLIST = 'WISHLIST', 'Wishlist'
        ADD_TO_CART = 'ADD_TO_CART', 'Add to Cart'
        PURCHASE = 'PURCHASE', 'Purchase'
        RATING = 'RATING', 'Rating'

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='interactions')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    interaction_type = models.CharField(max_length=20, choices=InteractionType.choices)
    weight = models.FloatField(default=1.0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.email} - {self.interaction_type} - {self.product.name}"


class RecentlyViewed(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='recently_viewed')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    viewed_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-viewed_at']
        unique_together = ('user', 'product')

    def __str__(self):
        return f"{self.user.email} viewed {self.product.name}"


class Recommendation(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='recommendations')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    score = models.FloatField(default=0.85)
    reason_type = models.CharField(max_length=50, default='RECOMMENDED_FOR_YOU')
    reason_text = models.CharField(max_length=255, default='Based on your recent browsing & category preferences')
    created_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-score']
        unique_together = ('user', 'product')

    def __str__(self):
        return f"Rec for {self.user.email}: {self.product.name} ({self.score})"
