from django.urls import path
from .views import (
    PersonalizedRecommendationsView, 
    LogInteractionView, 
    RecentlyViewedView, 
    SimilarProductsView
)

urlpatterns = [
    path('personalized/', PersonalizedRecommendationsView.as_view(), name='personalized_recs'),
    path('log/', LogInteractionView.as_view(), name='log_interaction'),
    path('recently-viewed/', RecentlyViewedView.as_view(), name='recently_viewed'),
    path('similar/<int:product_id>/', SimilarProductsView.as_view(), name='similar_products'),
]
