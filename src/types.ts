export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  subcategory?: string;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  rating: number;
  reviewCount: number | string;
  image: string;
  gallery?: string[];
  description: string;
  badge?: string;
  inStock: boolean;
  stockCount?: number;
  specs?: Record<string, string>;
  colors?: { name: string; hex: string }[];
  memoryOptions?: string[];
  storageOptions?: string[];
}

export interface CartItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  selectedColor?: string;
  selectedMemory?: string;
  selectedStorage?: string;
  price: number;
}

export interface RiskAssessment {
  id: number;
  orderNumber: string;
  userEmail: string;
  orderTotal: number;
  riskScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  riskReasons: string[];
  reviewedByAdmin: boolean;
  adminNotes?: string;
  createdAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  date: string;
  estimatedDelivery: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  status: 'Order Placed' | 'Confirmed' | 'Packed' | 'Shipped' | 'Out for Delivery' | 'Delivered' | 'CANCELLED';
  trackingNumber: string;
  carrier: string;
  deliveryAddress: {
    name: string;
    street: string;
    suite?: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
    phone: string;
  };
  deliveryType: 'Standard' | 'Express';
  paymentMethod: string;
  timeline: {
    status: string;
    date: string;
    completed: boolean;
    current?: boolean;
    icon: string;
  }[];
  riskAssessment?: RiskAssessment;
}

export type ScreenType = 
  | 'home'
  | 'category'
  | 'product'
  | 'cart'
  | 'checkout'
  | 'order-success'
  | 'order-tracking'
  | 'wishlist'
  | 'profile'
  | 'notifications'
  | 'recommendations'
  | 'login'
  | 'register'
  | 'admin-dashboard'
  | 'admin-products'
  | 'admin-orders'
  | 'admin-risk'
  | 'admin-customers'
  | 'admin-reviews'
  | 'admin-analytics';
