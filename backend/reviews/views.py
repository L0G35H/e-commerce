from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from .models import Review
from .serializers import ReviewSerializer

class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        queryset = Review.objects.all()
        product_id = self.request.query_params.get('product_id')
        if product_id:
            queryset = queryset.filter(product_id=product_id, status=Review.Status.APPROVED)
        return queryset

    def perform_create(self, serializer):
        review = serializer.save(user=self.request.user)
        # Update product review count & rating average
        product = review.product
        avg_rating = Review.objects.filter(product=product, status=Review.Status.APPROVED).aggregate(models.Avg('rating'))['rating__avg'] or 5.0
        product.rating = round(avg_rating, 1)
        product.review_count = Review.objects.filter(product=product, status=Review.Status.APPROVED).count()
        product.save()
