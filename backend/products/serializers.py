from rest_framework import serializers
from .models import Category, Brand, Product, ProductVariant, Inventory

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'


class BrandSerializer(serializers.ModelSerializer):
    class Meta:
        model = Brand
        fields = '__all__'


class ProductVariantSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductVariant
        fields = '__all__'


class InventorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Inventory
        fields = '__all__'


class ProductSerializer(serializers.ModelSerializer):
    brand_name = serializers.ReadOnlyField(source='brand.name')
    category_name = serializers.ReadOnlyField(source='category.name')
    category_slug = serializers.ReadOnlyField(source='category.slug')

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'sku', 'brand', 'brand_name', 
            'category', 'category_name', 'category_slug', 'subcategory',
            'price', 'original_price', 'discount_percent', 'rating', 
            'review_count', 'image', 'gallery', 'description', 'badge', 
            'in_stock', 'stock_count', 'specs', 'colors', 'memory_options', 
            'storage_options', 'is_featured', 'is_active', 'created_at'
        ]
