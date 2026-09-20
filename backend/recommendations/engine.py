from django.db.models import Count, Sum, Q
from products.models import Product
from .models import UserInteraction, RecentlyViewed, Recommendation

INTERACTION_WEIGHTS = {
    UserInteraction.InteractionType.VIEW: 1.0,
    UserInteraction.InteractionType.SEARCH: 1.5,
    UserInteraction.InteractionType.WISHLIST: 2.5,
    UserInteraction.InteractionType.ADD_TO_CART: 3.5,
    UserInteraction.InteractionType.PURCHASE: 5.0,
    UserInteraction.InteractionType.RATING: 3.0,
}

def log_user_interaction(user, product, interaction_type):
    if not user.is_authenticated or not product:
        return None
    
    weight = INTERACTION_WEIGHTS.get(interaction_type, 1.0)
    interaction = UserInteraction.objects.create(
        user=user,
        product=product,
        interaction_type=interaction_type,
        weight=weight
    )

    if interaction_type == UserInteraction.InteractionType.VIEW:
        RecentlyViewed.objects.update_or_create(
            user=user,
            product=product,
            defaults={'viewed_at': interaction.created_at}
        )

    return interaction


def generate_recommendations_for_user(user):
    if not user.is_authenticated:
        return []

    # 1. Analyze user's category affinity
    user_interactions = UserInteraction.objects.filter(user=user)
    if not user_interactions.exists():
        # Fallback to overall popular products
        popular_products = Product.objects.all().order_by('-rating', '-review_count')[:6]
        recs = []
        for prod in popular_products:
            rec, _ = Recommendation.objects.update_or_create(
                user=user,
                product=prod,
                defaults={
                    'score': 0.90,
                    'reason_type': 'TRENDING',
                    'reason_text': 'Top rated & trending across IntelliCart'
                }
            )
            recs.append(rec)
        return recs

    # Aggregate weights by category
    category_scores = {}
    interacted_product_ids = set()
    for interaction in user_interactions:
        interacted_product_ids.add(interaction.product_id)
        cat_id = interaction.product.category_id
        category_scores[cat_id] = category_scores.get(cat_id, 0) + interaction.weight

    # Find top categories
    top_categories = sorted(category_scores.items(), key=lambda x: x[1], reverse=True)[:3]
    top_cat_ids = [cat[0] for cat in top_categories]

    # Find candidate products in top categories that the user hasn't purchased yet
    candidate_products = Product.objects.filter(category_id__in=top_cat_ids).exclude(
        id__in=UserInteraction.objects.filter(user=user, interaction_type='PURCHASE').values_list('product_id', flat=True)
    ).order_by('-rating', '-price')[:10]

    recs = []
    for idx, prod in enumerate(candidate_products):
        score = round(0.98 - (idx * 0.05), 2)
        reason_text = f"Because you showed interest in {prod.category.name}"
        rec, _ = Recommendation.objects.update_or_create(
            user=user,
            product=prod,
            defaults={
                'score': score,
                'reason_type': 'CATEGORY_PREFERENCE',
                'reason_text': reason_text
            }
        )
        recs.append(rec)

    return recs
