import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from accounts.models import UserProfile, Address
from products.models import Category, Brand, Product, Inventory
from payments.models import Coupon
from orders.models import Order, OrderItem
from risk_detection.models import RiskAssessment
from risk_detection.assessor import evaluate_order_risk

User = get_user_model()

def seed_database():
    print("[+] Starting database seeding...")

    # 1. Admin User
    admin, created = User.objects.get_or_create(
        email='admin@intellicart.com',
        defaults={
            'username': 'admin',
            'first_name': 'System',
            'last_name': 'Administrator',
            'role': User.Role.ADMIN,
            'is_staff': True,
            'is_superuser': True
        }
    )
    if created:
        admin.set_password('admin123')
        admin.save()
        UserProfile.objects.get_or_create(user=admin)
        print("  - Admin account created (admin@intellicart.com / admin123)")

    # 2. Standard Customer User
    customer, created = User.objects.get_or_create(
        email='sarah.jenkins@example.com',
        defaults={
            'username': 'sarah_jenkins',
            'first_name': 'Sarah',
            'last_name': 'Jenkins',
            'role': User.Role.CUSTOMER,
            'phone_number': '+1 (555) 123-4567'
        }
    )
    if created:
        customer.set_password('customer123')
        customer.save()
        UserProfile.objects.get_or_create(user=customer, default_pincode='95131')
        Address.objects.create(
            user=customer,
            name='Sarah Jenkins',
            street='1234 Silicon Valley Blvd',
            suite='Apartment 4B',
            city='San Jose',
            state='CA',
            pincode='95131',
            country='United States',
            phone='+1 (555) 123-4567',
            is_default=True
        )
        print("  - Customer account created (sarah.jenkins@example.com / customer123)")

    # 3. Categories
    categories_data = [
        {'name': 'Laptops & Computers', 'slug': 'electronics', 'icon_name': 'Laptop'},
        {'name': 'Smartphones & Audio', 'slug': 'audio', 'icon_name': 'Headphones'},
        {'name': 'Accessories & Bags', 'slug': 'accessories', 'icon_name': 'Briefcase'},
        {'name': 'Home & Office', 'slug': 'home', 'icon_name': 'Home'},
    ]
    categories = {}
    for cat_data in categories_data:
        cat, _ = Category.objects.get_or_create(slug=cat_data['slug'], defaults={'name': cat_data['name'], 'icon_name': cat_data['icon_name']})
        categories[cat_data['slug']] = cat
    print("  - Categories seeded")

    # 4. Brands
    brands_data = ['Quantum', 'Sony', 'TechCraft', 'ErgoStudio', 'ProMedia', 'AuraSound', 'VisionCraft']
    brands = {}
    for brand_name in brands_data:
        brand, _ = Brand.objects.get_or_create(slug=brand_name.lower(), defaults={'name': brand_name})
        brands[brand_name] = brand
    print("  - Brands seeded")

    # 5. Products
    products_list = [
        {
            'name': 'QuantumBook Pro 14" M3 Ultra',
            'slug': 'quantumbook-pro-14',
            'sku': 'QBP-14-M3',
            'brand': brands['Quantum'],
            'category': categories['electronics'],
            'subcategory': 'Laptops',
            'price': 169999.00,
            'original_price': 189999.00,
            'discount_percent': 10,
            'rating': 4.9,
            'review_count': 142,
            'image': 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80',
            'gallery': [
                'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=800&q=80'
            ],
            'description': 'Next-generation liquid retina XDR laptop with 18GB unified memory and active cooling chassis for computational tasks.',
            'badge': 'Top Rated',
            'in_stock': True,
            'stock_count': 35,
            'is_featured': True,
            'specs': {'Processor': '12-core CPU M3', 'RAM': '18GB Unified', 'Storage': '1TB SSD', 'Display': '14.2" Liquid Retina XDR'},
            'colors': [{'name': 'Space Gray', 'hex': '#374151'}, {'name': 'Silver', 'hex': '#e5e7eb'}]
        },
        {
            'name': 'Sony WH-1000XM5 Noise Canceling Headphones',
            'slug': 'sony-wh1000xm5',
            'sku': 'SNY-WH-1000XM5',
            'brand': brands['Sony'],
            'category': categories['audio'],
            'subcategory': 'Headphones',
            'price': 29990.00,
            'original_price': 34990.00,
            'discount_percent': 14,
            'rating': 4.8,
            'review_count': 320,
            'image': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
            'description': 'Industry-leading noise canceling wireless headphones with dual processors and 8 microphones for crisp voice calls.',
            'badge': 'Best Seller',
            'in_stock': True,
            'stock_count': 50,
            'is_featured': True,
            'specs': {'Battery Life': '30 Hours', 'Driver': '30mm Precise Audio', 'Weight': '250g', 'Bluetooth': 'v5.2'},
            'colors': [{'name': 'Silver', 'hex': '#d1d5db'}, {'name': 'Black', 'hex': '#111827'}]
        },
        {
            'name': 'ErgoMouse Pro Ergonomic Wireless',
            'slug': 'ergomouse-pro',
            'sku': 'ERG-MSE-PRO',
            'brand': brands['ErgoStudio'],
            'category': categories['accessories'],
            'subcategory': 'Mice',
            'price': 6490.00,
            'original_price': 7990.00,
            'discount_percent': 18,
            'rating': 4.6,
            'review_count': 88,
            'image': 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80',
            'description': 'Precision ergonomic mouse designed to reduce muscle strain by 10% with hyper-fast electromagnetic scrolling.',
            'badge': 'Ergonomic Choice',
            'in_stock': True,
            'stock_count': 80,
            'is_featured': False,
            'specs': {'DPI': '8000 Sensor', 'Connectivity': 'Bluetooth / Logi Bolt', 'Battery': 'Rechargeable 70 Days'}
        },
        {
            'name': 'VisionCraft 32" 4K HDR Studio Monitor',
            'slug': 'visioncraft-32-4k',
            'sku': 'VCN-32-4K',
            'brand': brands['VisionCraft'],
            'category': categories['electronics'],
            'subcategory': 'Monitors',
            'price': 69999.00,
            'original_price': 79999.00,
            'discount_percent': 12,
            'rating': 4.9,
            'review_count': 95,
            'image': 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80',
            'description': '32-inch 4K IPS display with 99% DCI-P3 color gamut, 90W USB-C power delivery, and ergonomic height adjustable stand.',
            'badge': 'Pro Display',
            'in_stock': True,
            'stock_count': 20,
            'is_featured': True,
            'specs': {'Resolution': '3840 x 2160', 'Refresh Rate': '144Hz', 'Ports': 'Thunderbolt 4, HDMI 2.1, DP 1.4'}
        }
    ]

    for p_data in products_list:
        p, _ = Product.objects.get_or_create(sku=p_data['sku'], defaults=p_data)
        Inventory.objects.get_or_create(product=p, defaults={'stock_quantity': p_data['stock_count']})
    print("  - Products & Inventory seeded")

    # 6. Coupons
    Coupon.objects.get_or_create(code='INTELLI10', defaults={'discount_percentage': 10, 'max_discount_amount': 500, 'min_purchase_amount': 1000})
    Coupon.objects.get_or_create(code='CARNIVAL20', defaults={'discount_percentage': 20, 'max_discount_amount': 1500, 'min_purchase_amount': 2000})
    print("  - Coupons seeded")

    # 7. Sample Orders & Risk Assessments
    order1, created1 = Order.objects.get_or_create(
        order_number='ORD-98234102',
        defaults={
            'user': customer,
            'estimated_delivery': 'Delivered on Oct 24, 2025',
            'subtotal': 169999.00,
            'discount': 10000.00,
            'shipping': 0.00,
            'tax': 12800.00,
            'total': 172799.00,
            'status': Order.Status.DELIVERED,
            'tracking_number': 'TRK-882390192',
            'carrier': 'IntelliExpress Global',
            'delivery_address': {
                'name': 'Sarah Jenkins',
                'street': '1234 Silicon Valley Blvd',
                'suite': 'Apartment 4B',
                'city': 'San Jose',
                'state': 'CA',
                'pincode': '95131',
                'phone': '+1 (555) 123-4567'
            },
            'delivery_type': 'Standard',
            'payment_method': 'card',
            'timeline': [
                {'status': 'Order Placed', 'date': 'Oct 20, 2025', 'completed': True},
                {'status': 'Confirmed', 'date': 'Oct 20, 2025', 'completed': True},
                {'status': 'Shipped', 'date': 'Oct 22, 2025', 'completed': True},
                {'status': 'Delivered', 'date': 'Oct 24, 2025', 'completed': True}
            ]
        }
    )
    if created1:
        p1 = Product.objects.get(sku='QBP-14-M3')
        OrderItem.objects.create(
            order=order1,
            product=p1,
            product_name=p1.name,
            product_image=p1.image,
            quantity=1,
            selected_color='Space Gray',
            selected_memory='18GB',
            selected_storage='1TB SSD',
            price=p1.price
        )
        evaluate_order_risk(order1)

    print("  - Sample orders & risk evaluation seeded")
    print("[SUCCESS] Database seeding complete!")

if __name__ == '__main__':
    seed_database()
