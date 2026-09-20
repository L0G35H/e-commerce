import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  Search, 
  ShoppingCart, 
  Heart, 
  MapPin, 
  ChevronDown, 
  ChevronRight,
  User, 
  Bell, 
  Menu, 
  X,
  Sparkles,
  PackageCheck,
  LogOut,
  SlidersHorizontal,
  Star,
  ShieldCheck,
  Truck,
  RotateCcw,
  Headphones,
  Check,
  Plus,
  Minus,
  Trash2,
  Share2,
  Eye,
  ArrowRight,
  ArrowLeft,
  Copy,
  Lock,
  Mail,
  Key,
  CreditCard,
  Building,
  CheckCircle2,
  Clock,
  CircleDot,
  Radio,
  ExternalLink,
  Percent,
  Cpu,
  Layers,
  Zap,
  Info
} from 'lucide-react';
import { Navbar } from './components/Navbar';
import { PRODUCTS, CATEGORIES, INITIAL_CART, INITIAL_ORDERS, LOGO_URL, USER_AVATAR } from './data/mockData';
import { Product, CartItem, Order, ScreenType } from './types';

export default function App() {
  // Navigation & State
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('home');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('electronics');
  const [selectedProductId, setSelectedProductId] = useState<string>('quantumbook-pro-14');
  
  // Cart & Wishlist
  const [cart, setCart] = useState<CartItem[]>(INITIAL_CART);
  const [wishlist, setWishlist] = useState<string[]>(['quantumbook-pro-14', 'sony-wh1000xm5']);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [currentOrder, setCurrentOrder] = useState<Order>(INITIAL_ORDERS[0]);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<string>('All');
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('featured');
  const [selectedLocation, setSelectedLocation] = useState<string>('San Jose, 95131');
  const [showLocationModal, setShowLocationModal] = useState<boolean>(false);
  const [tempPincode, setTempPincode] = useState('');

  // User Auth
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Product Delete (Soft Delete)
  const [deleteModalProduct, setDeleteModalProduct] = useState<Product | null>(null);
  const [deletedProductIds, setDeletedProductIds] = useState<Set<string>>(new Set());

  // Product Details Screen State
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState('Space Gray');
  const [selectedMemory, setSelectedMemory] = useState('18GB');
  const [selectedStorage, setSelectedStorage] = useState('1TB SSD');
  const [pincodeCheck, setPincodeCheck] = useState('95131');
  const [pincodeChecked, setPincodeChecked] = useState(true);
  const [bundleAccessories, setBundleAccessories] = useState<{ [id: string]: boolean }>({
    'ergomouse-pro': true,
    'prodrive-2tb-ssd': true,
  });

  // Checkout State
  const [checkoutStep, setCheckoutStep] = useState<number>(1);
  const [deliveryType, setDeliveryType] = useState<'Standard' | 'Express'>('Standard');
  const [paymentMethod, setPaymentMethod] = useState<string>('card');
  const [savedAddress, setSavedAddress] = useState({
    name: 'Sarah Jenkins',
    street: '1234 Silicon Valley Blvd',
    suite: 'Apartment 4B',
    city: 'San Jose',
    state: 'CA',
    pincode: '95131',
    phone: '+1 (555) 123-4567',
    country: 'United States',
  });

  // Auth Form State
  const [authEmail, setAuthEmail] = useState('sarah.jenkins@example.com');
  const [authPassword, setAuthPassword] = useState('••••••••••••');
  const [authName, setAuthName] = useState('Sarah Jenkins');

  // Trigger Toast
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Handle Product Soft Delete
  const handleDeleteProduct = async (product: Product) => {
    try {
      const token = localStorage.getItem('intellicart_token');
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'}/products/${product.id}/delete/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
      });
      if (res.ok) {
        setDeletedProductIds(prev => new Set(prev).add(product.id));
        showToast(`"${product.name}" has been removed from the catalog`);
      } else {
        const data = await res.json().catch(() => null);
        showToast(data?.message || 'Failed to delete product. Please try again.');
      }
    } catch {
      // Fallback for demo/offline: still remove from UI
      setDeletedProductIds(prev => new Set(prev).add(product.id));
      showToast(`"${product.name}" has been removed from the catalog`);
    }
    setDeleteModalProduct(null);
  };

  // Products visible on storefront (excludes soft-deleted)
  const visibleProducts = PRODUCTS.filter(p => !deletedProductIds.has(p.id));

  // Switch Screen Helper
  const navigateTo = (screen: ScreenType, categoryId?: string, productId?: string) => {
    if (categoryId) setSelectedCategoryId(categoryId);
    if (productId) {
      setSelectedProductId(productId);
      setSelectedImageIndex(0);
    }
    setCurrentScreen(screen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Cart Handlers
  const addToCart = (product: Product, quantity = 1, options?: { color?: string; memory?: string; storage?: string }) => {
    const existingIndex = cart.findIndex(item => 
      item.productId === product.id && 
      item.selectedColor === (options?.color || selectedColor)
    );

    if (existingIndex > -1) {
      const updated = [...cart];
      updated[existingIndex].quantity += quantity;
      setCart(updated);
    } else {
      const newItem: CartItem = {
        id: `cart-${Date.now()}`,
        productId: product.id,
        product,
        quantity,
        selectedColor: options?.color || selectedColor,
        selectedMemory: options?.memory || selectedMemory,
        selectedStorage: options?.storage || selectedStorage,
        price: product.price,
      };
      setCart([...cart, newItem]);
    }
    showToast(`Added "${product.name.slice(0, 24)}..." to cart!`);
  };

  const updateCartQuantity = (cartItemId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === cartItemId) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : item;
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const removeFromCart = (cartItemId: string) => {
    setCart(prev => prev.filter(item => item.id !== cartItemId));
    showToast("Item removed from cart");
  };

  const toggleWishlist = (productId: string) => {
    if (wishlist.includes(productId)) {
      setWishlist(wishlist.filter(id => id !== productId));
      showToast("Removed from Wishlist");
    } else {
      setWishlist([...wishlist, productId]);
      showToast("Added to Wishlist ❤️");
    }
  };

  // Calculations
  const cartSubtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const cartDiscount = Math.round(cartSubtotal * 0.08); // 8% festive discount
  const cartShipping = cartSubtotal > 50000 || deliveryType === 'Standard' ? 0 : 499;
  const cartTax = Math.round((cartSubtotal - cartDiscount) * 0.05); // 5% GST
  const cartTotal = cartSubtotal - cartDiscount + cartShipping + cartTax;

  // Complete Order
  const handlePlaceOrder = () => {
    const newOrder: Order = {
      id: `ord-${Date.now().toString().slice(-9)}`,
      orderNumber: `ORD-${Math.floor(100000000 + Math.random() * 900000000)}`,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      estimatedDelivery: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      items: [...cart],
      subtotal: cartSubtotal,
      discount: cartDiscount,
      shipping: cartShipping,
      tax: cartTax,
      total: cartTotal,
      status: 'Order Placed',
      trackingNumber: `FX-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      carrier: 'FedEx Priority Air',
      deliveryAddress: { ...savedAddress },
      deliveryType: deliveryType,
      paymentMethod: paymentMethod === 'card' ? 'Visa •••• 4242' : paymentMethod === 'upi' ? 'UPI (GPay / PhonePe)' : 'IntelliCart Pay Later',
      timeline: [
        { status: 'Order Placed', date: 'Just now', completed: true, current: true, icon: 'receipt_long' },
        { status: 'Confirmed', date: 'Processing', completed: false, icon: 'check_circle' },
        { status: 'Packed', date: 'Pending', completed: false, icon: 'inventory_2' },
        { status: 'Shipped', date: 'Pending', completed: false, icon: 'local_shipping' },
        { status: 'Out for Delivery', date: 'Pending', completed: false, icon: 'directions_car' },
        { status: 'Delivered', date: 'Pending', completed: false, icon: 'home' },
      ]
    };

    setOrders([newOrder, ...orders]);
    setCurrentOrder(newOrder);
    setCart([]);
    navigateTo('order-success');

    // Fire celebratory confetti
    try {
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      // safe fallback
    }
  };

  // Selected Product for Details Screen
  const activeProduct = visibleProducts.find(p => p.id === selectedProductId) || visibleProducts[0];

  // Filtered Products for Catalog
  const filteredProducts = visibleProducts.filter(product => {
    const matchesCategory = selectedCategoryId === 'deals' 
      ? (product.discountPercent && product.discountPercent >= 10)
      : selectedCategoryId 
        ? product.category === selectedCategoryId || product.subcategory?.toLowerCase().includes(selectedCategoryId)
        : true;
    
    const matchesBrand = selectedBrand === 'All' || product.brand.toLowerCase() === selectedBrand.toLowerCase();
    
    let matchesPrice = true;
    if (selectedPriceRange === 'under-15k') matchesPrice = product.price < 15000;
    else if (selectedPriceRange === '15k-50k') matchesPrice = product.price >= 15000 && product.price <= 50000;
    else if (selectedPriceRange === '50k-100k') matchesPrice = product.price > 50000 && product.price <= 100000;
    else if (selectedPriceRange === 'above-100k') matchesPrice = product.price > 100000;

    const matchesSearch = searchQuery === '' || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesBrand && matchesPrice && matchesSearch;
  }).sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    if (sortBy === 'rating') return b.rating - a.rating;
    return 0; // featured
  });

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      
      {/* Clean Enterprise Navigation Link Bar */}
      <nav aria-label="Mockup Screen Switcher" className="bg-white/95 border-b border-slate-200/80 px-4 sm:px-8 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-6 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2 text-slate-400 text-[11px] font-semibold tracking-wider uppercase shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
            <span>Navigation:</span>
          </div>

          <div className="flex items-center gap-6 sm:gap-8 shrink-0">
            {[
              { id: 'home', label: 'Home' },
              { id: 'category', label: 'Catalog' },
              { id: 'product', label: 'Product Details' },
              { id: 'cart', label: `Cart (${cart.length})` },
              { id: 'checkout', label: 'Checkout' },
              { id: 'order-tracking', label: 'Track Order' },
              { id: 'order-success', label: 'Success' },
              { id: 'login', label: 'Sign In' },
              { id: 'register', label: 'Register' },
            ].map(tab => (
              <button
                key={tab.id}
                id={`switch-screen-${tab.id}`}
                onClick={() => navigateTo(tab.id as ScreenType)}
                className={`text-xs font-medium tracking-wide transition-colors py-1 border-b-2 whitespace-nowrap ${
                  currentScreen === tab.id 
                    ? 'text-blue-600 font-semibold border-blue-600' 
                    : 'text-slate-500 hover:text-slate-900 border-transparent hover:border-slate-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="hidden xl:flex items-center gap-2 text-slate-400 text-[11px] tracking-wider uppercase">
            <span>View: <strong className="text-slate-700 font-semibold capitalize">{currentScreen}</strong></span>
          </div>
        </div>
      </nav>

      {/* Main Navbar */}
      <Navbar 
        currentScreen={currentScreen}
        onNavigate={navigateTo}
        cartCount={cart.reduce((s, i) => s + i.quantity, 0)}
        wishlistCount={wishlist.length}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        products={PRODUCTS}
        selectedLocation={selectedLocation}
        onChangeLocation={() => setShowLocationModal(true)}
        isLoggedIn={isLoggedIn}
        onToggleLogin={() => setIsLoggedIn(!isLoggedIn)}
      />

      {/* Toast Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-medium px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 border border-slate-700 animate-bounce">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. HOME / DISCOVERY SCREEN                                                */}
      {/* ========================================================================= */}
      {currentScreen === 'home' && (
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 space-y-10">
          
          {/* Hero Bento Showcase Banner */}
          <section className="relative rounded-3xl bg-linear-to-br from-slate-900 via-[#131b2e] to-slate-900 text-white overflow-hidden p-6 sm:p-10 shadow-xl border border-slate-800">
            <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px] opacity-15"></div>
            
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              <div className="lg:col-span-7 space-y-5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5" /> Next-Generation Innovation
                </div>
                <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
                  Shop Smarter. <br />
                  <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 via-indigo-300 to-cyan-300">
                    Discover Without Limits.
                  </span>
                </h1>
                <p className="text-slate-300 text-sm sm:text-base max-w-xl leading-relaxed">
                  Experience intelligent commerce with curated tech hardware, curated audio acoustics, and flagship workspace equipment with guaranteed same-day dispatch.
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    id="hero-explore-btn"
                    onClick={() => navigateTo('category', 'electronics')}
                    className="h-12 px-6 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-full transition shadow-lg shadow-blue-600/30 inline-flex items-center justify-center gap-2 group border border-transparent"
                  >
                    Explore Electronics
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>

                  <button
                    id="hero-deals-btn"
                    onClick={() => navigateTo('category', 'deals')}
                    className="h-12 px-6 bg-white/10 hover:bg-white/15 text-white border border-white/20 text-sm font-semibold rounded-full transition inline-flex items-center justify-center gap-2"
                  >
                    <Percent className="w-4 h-4 text-amber-400" />
                    Festive 40% Deals
                  </button>
                </div>

                {/* Micro trust indicators */}
                <div className="grid grid-cols-3 gap-4 pt-8 mt-4 border-t border-slate-800/80 text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>100% Genuine Certified</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>Free Express Transit</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <RotateCcw className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>7-Day Easy Returns</span>
                  </div>
                </div>
              </div>

              {/* Hero Featured Card */}
              <div className="lg:col-span-5 relative">
                <div className="relative bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 shadow-2xl hover:border-blue-500/40 transition group">
                  <div className="absolute top-4 right-4 bg-blue-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                    Apex Series
                  </div>
                  
                  <div className="w-full h-52 flex items-center justify-center p-4">
                    <img 
                      src={PRODUCTS[0].image} 
                      alt={PRODUCTS[0].name}
                      referrerPolicy="no-referrer"
                      className="max-h-full object-contain group-hover:scale-105 transition-transform duration-500 drop-shadow-2xl" 
                    />
                  </div>

                  <div className="mt-4 space-y-2">
                    <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">{PRODUCTS[0].brand}</span>
                    <h3 className="text-lg font-bold text-white group-hover:text-blue-300 transition line-clamp-1">
                      {PRODUCTS[0].name}
                    </h3>
                    <p className="text-xs text-slate-300 line-clamp-2">{PRODUCTS[0].description}</p>
                    
                    <div className="flex items-center justify-between pt-3">
                      <div>
                        <span className="text-xl font-extrabold text-white">₹{PRODUCTS[0].price.toLocaleString('en-IN')}</span>
                        <span className="text-xs text-slate-400 line-through ml-2">₹{PRODUCTS[0].originalPrice?.toLocaleString('en-IN')}</span>
                      </div>
                      <button
                        onClick={() => navigateTo('product', undefined, PRODUCTS[0].id)}
                        className="bg-white text-slate-900 hover:bg-blue-50 text-xs font-bold px-4 py-2 rounded-full transition flex items-center gap-1"
                      >
                        View Specs
                      </button>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </section>

          {/* Category Quick Pills Carousel */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Explore by Category</h2>
                <p className="text-xs text-slate-500">Handpicked departments curated for professionals and enthusiasts</p>
              </div>
              <button 
                onClick={() => navigateTo('category')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                View All Categories <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  id={`cat-card-${cat.id}`}
                  onClick={() => navigateTo('category', cat.id)}
                  className="flex flex-col items-center justify-center p-4 bg-white hover:bg-blue-50/60 rounded-2xl border border-slate-200/80 hover:border-blue-300 transition text-center group shadow-xs hover:shadow-md"
                >
                  <div className="w-11 h-11 rounded-xl bg-slate-100 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center text-slate-700 transition mb-2">
                    <Zap className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-semibold text-slate-800 group-hover:text-blue-600 transition">
                    {cat.name}
                  </span>
                </button>
              ))}
            </div>
          </section>

          {/* Picked For You - Curated Grid */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  Picked For You <Sparkles className="w-4 h-4 text-amber-500" />
                </h2>
                <p className="text-xs text-slate-500">Trending flagship hardware based on popularity & customer ratings</p>
              </div>
              <button 
                onClick={() => navigateTo('category')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                Explore More <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {visibleProducts.slice(0, 8).map(product => (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-lg transition-all flex flex-col group"
                >
                  {/* Image & Badges */}
                  <div className="relative bg-slate-50 p-4 h-48 flex items-center justify-center overflow-hidden border-b border-slate-100">
                    {product.badge ? (
                      <span className={`absolute top-3 left-3 z-10 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-xs ${
                        product.badge.includes('%') || product.badge.toLowerCase().includes('sale')
                          ? 'bg-rose-600 text-white'
                          : 'bg-blue-600 text-white'
                      }`}>
                        {product.badge}
                      </span>
                    ) : product.discountPercent && product.discountPercent >= 10 ? (
                      <span className="absolute top-3 left-3 z-10 bg-rose-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-xs">
                        {product.discountPercent}% OFF
                      </span>
                    ) : null}

                    <button
                      onClick={() => toggleWishlist(product.id)}
                      className={`absolute top-3 right-3 z-10 p-2 rounded-full backdrop-blur-md transition-all duration-200 shadow-xs ${
                        wishlist.includes(product.id)
                          ? 'bg-rose-50 text-rose-500 hover:bg-rose-100'
                          : 'bg-white/90 text-slate-400 hover:text-rose-500 hover:bg-white'
                      }`}
                      aria-label="Toggle Wishlist"
                    >
                      <Heart 
                        className={`w-4 h-4 transition-transform active:scale-125 ${
                          wishlist.includes(product.id) ? 'fill-rose-500 text-rose-500' : 'fill-transparent text-slate-400'
                        }`} 
                      />
                    </button>
                    
                    <button 
                      onClick={() => navigateTo('product', undefined, product.id)}
                      className="w-full h-full flex items-center justify-center"
                    >
                      <img 
                        src={product.image} 
                        alt={product.name} 
                        referrerPolicy="no-referrer"
                        className="max-h-36 object-contain group-hover:scale-105 transition-transform duration-300"
                      />
                    </button>
                  </div>

                  {/* Info */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span className="font-semibold uppercase tracking-wider text-slate-500">{product.brand}</span>
                        <div className="flex items-center gap-1 text-amber-500 font-medium">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span>{product.rating}</span>
                          <span className="text-slate-400">({product.reviewCount})</span>
                        </div>
                      </div>

                      <button
                        onClick={() => navigateTo('product', undefined, product.id)}
                        className="text-left font-semibold text-sm text-slate-900 group-hover:text-blue-600 transition line-clamp-2"
                      >
                        {product.name}
                      </button>
                    </div>

                    {/* Price & Add to Cart */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <div className="text-base font-bold text-slate-900">
                          ₹{product.price.toLocaleString('en-IN')}
                        </div>
                        {product.originalPrice && (
                          <div className="text-[11px] text-slate-400 line-through">
                            ₹{product.originalPrice.toLocaleString('en-IN')}
                          </div>
                        )}
                      </div>

                      <button
                        id={`add-to-cart-${product.id}`}
                        onClick={() => addToCart(product)}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 shadow-xs"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        Add
                      </button>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Innovation & Trust Features Grid */}
          <section className="bg-slate-900 text-white rounded-3xl p-8 sm:p-10 shadow-lg space-y-6">
            <div className="max-w-2xl">
              <h3 className="text-2xl font-bold">Why Leading Professionals Choose IntelliCart</h3>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Every component, laptop, and acoustic device passes strict multi-point authenticity validation and warranty sealing.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <ShieldCheck className="w-7 h-7 text-blue-400" />
                <h4 className="font-semibold text-sm">Direct Brand Warranties</h4>
                <p className="text-xs text-slate-400">100% manufacturer warranty backed with official service center priority.</p>
              </div>

              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <Truck className="w-7 h-7 text-emerald-400" />
                <h4 className="font-semibold text-sm">Priority Courier Dispatch</h4>
                <p className="text-xs text-slate-400">Real-time GPS tracking and tamper-evident sealed packaging on every shipment.</p>
              </div>

              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <RotateCcw className="w-7 h-7 text-amber-400" />
                <h4 className="font-semibold text-sm">Hassle-Free 7-Day Exchange</h4>
                <p className="text-xs text-slate-400">Instant pick-up return with zero-question instant store refund credits.</p>
              </div>

              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <Headphones className="w-7 h-7 text-cyan-400" />
                <h4 className="font-semibold text-sm">Dedicated Tech Advisors</h4>
                <p className="text-xs text-slate-400">24/7 expert audio & hardware consultants ready to answer technical specs.</p>
              </div>
            </div>
          </section>

        </main>
      )}

      {/* ========================================================================= */}
      {/* 2. CATALOG / CATEGORY LISTING SCREEN                                      */}
      {/* ========================================================================= */}
      {currentScreen === 'category' && (
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6">
          
          {/* Breadcrumb Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                <button onClick={() => navigateTo('home')} className="hover:text-blue-600">Home</button>
                <span>/</span>
                <span className="text-slate-800 font-semibold capitalize">{selectedCategoryId}</span>
              </div>
              <h1 className="text-2xl font-extrabold text-slate-900 capitalize">
                {selectedCategoryId === 'deals' ? '🔥 Hot Festive Deals' : `${selectedCategoryId} Catalog`}
              </h1>
              <p className="text-xs text-slate-500">Showing {filteredProducts.length} high performance products</p>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500 font-medium">Sort by:</span>
              <select
                id="catalog-sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-xs font-semibold bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="featured">Featured & Popular</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Customer Rating</option>
              </select>
            </div>
          </div>

          {/* Main Grid with Sidebar Filters */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Sidebar Filters */}
            <aside className="lg:col-span-3 bg-white p-5 rounded-2xl border border-slate-200 space-y-6 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-blue-600" /> Filters
                </h3>
                <button 
                  onClick={() => {
                    setSelectedBrand('All');
                    setSelectedPriceRange('all');
                    setSortBy('featured');
                  }}
                  className="text-xs text-blue-600 hover:underline font-medium"
                >
                  Reset All
                </button>
              </div>

              {/* Department Group */}
              <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-100 space-y-2.5">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Department</span>
                <div className="space-y-1">
                  {CATEGORIES.map(c => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedCategoryId(c.id)}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition ${
                        selectedCategoryId === c.id 
                          ? 'bg-blue-600 text-white font-bold shadow-xs' 
                          : 'text-slate-600 hover:bg-white hover:text-slate-900'
                      }`}
                    >
                      <span>{c.name}</span>
                      {selectedCategoryId === c.id && <Check className="w-3.5 h-3.5 text-white" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Brand Filter */}
              <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-100 space-y-2.5">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Brand</span>
                <div className="space-y-1">
                  {['All', 'Apple', 'Sony', 'Samsung', 'Logitech', 'Dell', 'Keychron', 'Bellroy'].map(brand => (
                    <button
                      key={brand}
                      onClick={() => setSelectedBrand(brand)}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition ${
                        selectedBrand === brand 
                          ? 'bg-blue-600 text-white font-bold shadow-xs' 
                          : 'text-slate-600 hover:bg-white hover:text-slate-900'
                      }`}
                    >
                      <span>{brand}</span>
                      {selectedBrand === brand && <Check className="w-3.5 h-3.5 text-white" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range Filter */}
              <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-100 space-y-2.5">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Price Range</span>
                <div className="space-y-1">
                  {[
                    { id: 'all', label: 'All Prices' },
                    { id: 'under-15k', label: 'Under ₹15,000' },
                    { id: '15k-50k', label: '₹15,000 - ₹50,000' },
                    { id: '50k-100k', label: '₹50,000 - ₹1,00,000' },
                    { id: 'above-100k', label: 'Above ₹1,00,000' },
                  ].map(range => (
                    <button
                      key={range.id}
                      onClick={() => setSelectedPriceRange(range.id)}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition ${
                        selectedPriceRange === range.id 
                          ? 'bg-blue-600 text-white font-bold shadow-xs' 
                          : 'text-slate-600 hover:bg-white hover:text-slate-900'
                      }`}
                    >
                      <span>{range.label}</span>
                      {selectedPriceRange === range.id && <Check className="w-3.5 h-3.5 text-white" />}
                    </button>
                  ))}
                </div>
              </div>

            </aside>

            {/* Products Grid */}
            <div className="lg:col-span-9">
              {filteredProducts.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4">
                  <Info className="w-10 h-10 text-slate-400 mx-auto" />
                  <h3 className="text-base font-bold text-slate-800">No products match your selected filters</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">Try resetting some filters or selecting a different brand/category</p>
                  <button
                    onClick={() => {
                      setSelectedBrand('All');
                      setSelectedPriceRange('all');
                      setSelectedCategoryId('electronics');
                    }}
                    className="bg-blue-600 text-white text-xs font-semibold px-4 py-2 rounded-xl"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {filteredProducts.map(product => (
                    <div
                      key={product.id}
                      className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-lg transition-all flex flex-col group"
                    >
                      {/* Image & Badges */}
                      <div className="relative bg-slate-50 p-4 h-48 flex items-center justify-center overflow-hidden border-b border-slate-100">
                        {product.badge ? (
                          <span className={`absolute top-3 left-3 z-10 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-xs ${
                            product.badge.includes('%') || product.badge.toLowerCase().includes('sale')
                              ? 'bg-rose-600 text-white'
                              : 'bg-blue-600 text-white'
                          }`}>
                            {product.badge}
                          </span>
                        ) : product.discountPercent && product.discountPercent >= 10 ? (
                          <span className="absolute top-3 left-3 z-10 bg-rose-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-xs">
                            {product.discountPercent}% OFF
                          </span>
                        ) : null}

                        <button
                          onClick={() => toggleWishlist(product.id)}
                          className={`absolute top-3 right-3 z-10 p-2 rounded-full backdrop-blur-md transition-all duration-200 shadow-xs ${
                            wishlist.includes(product.id)
                              ? 'bg-rose-50 text-rose-500 hover:bg-rose-100'
                              : 'bg-white/90 text-slate-400 hover:text-rose-500 hover:bg-white'
                          }`}
                          aria-label="Toggle Wishlist"
                        >
                          <Heart 
                            className={`w-4 h-4 transition-transform active:scale-125 ${
                              wishlist.includes(product.id) ? 'fill-rose-500 text-rose-500' : 'fill-transparent text-slate-400'
                            }`} 
                          />
                        </button>
                        
                        <button 
                          onClick={() => navigateTo('product', undefined, product.id)}
                          className="w-full h-full flex items-center justify-center"
                        >
                          <img 
                            src={product.image} 
                            alt={product.name} 
                            referrerPolicy="no-referrer"
                            className="max-h-36 object-contain group-hover:scale-105 transition-transform duration-300"
                          />
                        </button>
                      </div>

                      {/* Info */}
                      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs text-slate-400">
                            <span className="font-semibold uppercase tracking-wider text-slate-500">{product.brand}</span>
                            <div className="flex items-center gap-1 text-amber-500 font-medium">
                              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                              <span>{product.rating}</span>
                              <span className="text-slate-400">({product.reviewCount})</span>
                            </div>
                          </div>

                          <button
                            onClick={() => navigateTo('product', undefined, product.id)}
                            className="text-left font-semibold text-sm text-slate-900 group-hover:text-blue-600 transition line-clamp-2"
                          >
                            {product.name}
                          </button>
                          
                          <p className="text-xs text-slate-500 line-clamp-2">
                            {product.description}
                          </p>
                        </div>

                        {/* Price & Add to Cart */}
                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                          <div>
                            <div className="text-base font-bold text-slate-900">
                              ₹{product.price.toLocaleString('en-IN')}
                            </div>
                            {product.originalPrice && (
                              <div className="text-[11px] text-slate-400 line-through">
                                ₹{product.originalPrice.toLocaleString('en-IN')}
                              </div>
                            )}
                          </div>

                          <button
                            id={`catalog-add-${product.id}`}
                            onClick={() => addToCart(product)}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 shadow-xs"
                          >
                            <ShoppingCart className="w-3.5 h-3.5" />
                            Add to Cart
                          </button>
                        </div>

                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </main>
      )}

      {/* ========================================================================= */}
      {/* 3. PRODUCT DETAILS SCREEN                                                 */}
      {/* ========================================================================= */}
      {currentScreen === 'product' && (
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 space-y-10">
          
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <button onClick={() => navigateTo('home')} className="hover:text-blue-600">Home</button>
            <span>/</span>
            <button onClick={() => navigateTo('category', activeProduct.category)} className="hover:text-blue-600 capitalize">
              {activeProduct.category}
            </button>
            <span>/</span>
            <span className="text-slate-800 font-semibold truncate max-w-xs sm:max-w-md">{activeProduct.name}</span>
          </div>

          {/* Product Overview Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Gallery Section */}
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 flex items-center justify-center h-[380px] sm:h-[440px] relative overflow-hidden shadow-xs">
                {activeProduct.badge && (
                  <span className={`absolute top-4 left-4 z-10 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-xs ${
                    activeProduct.badge.includes('%') || activeProduct.badge.toLowerCase().includes('sale')
                      ? 'bg-rose-600 text-white'
                      : 'bg-blue-600 text-white'
                  }`}>
                    {activeProduct.badge}
                  </span>
                )}
                
                <img 
                  src={(activeProduct.gallery && activeProduct.gallery[selectedImageIndex]) || activeProduct.image} 
                  alt={activeProduct.name}
                  referrerPolicy="no-referrer"
                  className="max-h-72 sm:max-h-88 w-auto object-contain transition-all duration-300 drop-shadow-md" 
                />
              </div>

              {/* Thumbnails Gallery Row */}
              {activeProduct.gallery && activeProduct.gallery.length > 1 && (
                <div className="flex items-center gap-3 overflow-x-auto p-1 scrollbar-none">
                  {activeProduct.gallery.map((imgUrl, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white p-2 border-2 transition-all duration-200 shrink-0 flex items-center justify-center ${
                        selectedImageIndex === idx 
                          ? 'border-blue-600 ring-2 ring-blue-500/20 shadow-xs' 
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <img 
                        src={imgUrl} 
                        alt="thumbnail" 
                        referrerPolicy="no-referrer"
                        className="max-h-full object-contain" 
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Configuration & Buy Box */}
            <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 space-y-6 shadow-sm">
              
              {/* Title & Hierarchy */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">{activeProduct.brand}</span>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <div className="flex items-center gap-1 text-amber-500 font-semibold">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{activeProduct.rating}</span>
                    </div>
                    <span className="text-slate-300">•</span>
                    <span className="text-slate-500 font-medium">{activeProduct.reviewCount} reviews</span>
                  </div>
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
                  {activeProduct.name}
                </h1>
                
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {activeProduct.description}
                </p>
              </div>

              {/* Unified Price & Delivery Cohesive Card */}
              <div className="bg-slate-50/80 rounded-2xl border border-slate-200/80 overflow-hidden divide-y divide-slate-200/70 shadow-2xs">
                {/* Price Section */}
                <div className="p-4 sm:p-5 flex items-center justify-between">
                  <div>
                    <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                      ₹{activeProduct.price.toLocaleString('en-IN')}
                    </div>
                    {activeProduct.originalPrice && (
                      <div className="text-xs text-slate-500 flex items-center gap-2 mt-1">
                        <span className="line-through text-slate-400">₹{activeProduct.originalPrice.toLocaleString('en-IN')}</span>
                        <span className="text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded-md text-[11px]">
                          Save ₹{(activeProduct.originalPrice - activeProduct.price).toLocaleString('en-IN')} ({activeProduct.discountPercent}% off)
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="text-right">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200/80 px-3 py-1 rounded-full shadow-2xs">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" /> In Stock ({activeProduct.stockCount || 12} left)
                    </span>
                  </div>
                </div>

                {/* Subordinate Delivery Checker */}
                <div className="p-4 sm:p-5 bg-white/50 space-y-2.5">
                  <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-blue-600" /> Check Delivery & Courier Speed
                  </span>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={pincodeCheck}
                      onChange={(e) => setPincodeCheck(e.target.value)}
                      placeholder="Enter pincode (e.g. 95131)"
                      className="flex-1 px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition shadow-2xs"
                    />
                    <button
                      onClick={() => {
                        setPincodeChecked(true);
                        showToast(`Delivery available to ${pincodeCheck} by tomorrow!`);
                      }}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition shadow-xs"
                    >
                      Check
                    </button>
                  </div>
                  {pincodeChecked && (
                    <p className="text-[11px] text-slate-600 font-medium flex items-center gap-1.5 pt-0.5">
                      <Check className="w-3.5 h-3.5 text-blue-600" /> Delivery by <strong className="text-slate-900 font-bold">Tomorrow, 4 PM</strong> <span className="text-slate-400">•</span> Free express transit eligible
                    </p>
                  )}
                </div>
              </div>

              {/* Color Selection */}
              {activeProduct.colors && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-800">Color:</span>
                    <span className="text-slate-500 font-medium">{selectedColor}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {activeProduct.colors.map(col => (
                      <button
                        key={col.name}
                        onClick={() => setSelectedColor(col.name)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 border transition ${
                          selectedColor === col.name 
                            ? 'border-blue-600 bg-blue-50 text-blue-700 ring-2 ring-blue-500/20' 
                            : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span className="w-3 h-3 rounded-full border border-slate-300" style={{ backgroundColor: col.hex }} />
                        {col.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Memory Options */}
              {activeProduct.memoryOptions && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-800">Unified Memory:</span>
                    <span className="text-slate-500 font-medium">{selectedMemory}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {activeProduct.memoryOptions.map(mem => (
                      <button
                        key={mem}
                        onClick={() => setSelectedMemory(mem)}
                        className={`py-2 rounded-xl text-xs font-semibold text-center border transition ${
                          selectedMemory === mem 
                            ? 'border-blue-600 bg-blue-50 text-blue-700 ring-2 ring-blue-500/20' 
                            : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {mem}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Storage Options */}
              {activeProduct.storageOptions && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-800">Storage:</span>
                    <span className="text-slate-500 font-medium">{selectedStorage}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {activeProduct.storageOptions.map(stor => (
                      <button
                        key={stor}
                        onClick={() => setSelectedStorage(stor)}
                        className={`py-2 rounded-xl text-xs font-semibold text-center border transition ${
                          selectedStorage === stor 
                            ? 'border-blue-600 bg-blue-50 text-blue-700 ring-2 ring-blue-500/20' 
                            : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {stor}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Differentiated Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  id="pdp-add-to-cart"
                  onClick={() => addToCart(activeProduct, 1, { color: selectedColor, memory: selectedMemory, storage: selectedStorage })}
                  className="flex-[1.4] bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm py-3.5 px-5 rounded-2xl transition shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 active:scale-[0.99]"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Add to Cart
                </button>
                
                <button
                  id="pdp-buy-now"
                  onClick={() => {
                    addToCart(activeProduct, 1, { color: selectedColor, memory: selectedMemory, storage: selectedStorage });
                    navigateTo('checkout');
                  }}
                  className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm py-3.5 px-4 rounded-2xl transition flex items-center justify-center gap-2 border border-slate-800 shadow-xs hover:border-slate-700 active:scale-[0.99]"
                >
                  <Zap className="w-4 h-4 text-blue-400" />
                  Instant Buy
                </button>
              </div>

            </div>

          </div>

          {/* Technical Specifications Section */}
          {activeProduct.specs && (
            <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 space-y-4 shadow-xs">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Cpu className="w-5 h-5 text-blue-600" /> Detailed Hardware Specifications
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Object.entries(activeProduct.specs).map(([label, val]) => (
                  <div key={label} className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex flex-col">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</span>
                    <span className="text-sm font-medium text-slate-800 mt-0.5">{val}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Frequently Bought Together Bundle */}
          <section className="bg-gradient-to-r from-blue-50/50 via-slate-50 to-indigo-50/40 p-6 sm:p-8 rounded-3xl border border-blue-100 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-5 h-5 text-blue-600" /> Frequently Bought Together Bundle
              </h3>
              <p className="text-xs text-slate-500">Power users combine this setup with ergonomic control and high-speed backup storage</p>
            </div>

            <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
              <div className="flex flex-wrap items-center gap-4">
                {/* Main item */}
                <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
                  <img src={activeProduct.image} alt={activeProduct.name} referrerPolicy="no-referrer" className="w-14 h-14 object-contain" />
                  <div>
                    <span className="text-xs font-bold text-slate-900 block truncate max-w-[140px]">{activeProduct.name}</span>
                    <span className="text-xs text-blue-600 font-extrabold">₹{activeProduct.price.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <Plus className="w-4 h-4 text-slate-400" />

                {/* Mouse item */}
                <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
                  <input 
                    type="checkbox" 
                    checked={bundleAccessories['ergomouse-pro']} 
                    onChange={(e) => setBundleAccessories({ ...bundleAccessories, 'ergomouse-pro': e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600"
                  />
                  <img src={PRODUCTS.find(p => p.id === 'ergomouse-pro')?.image} alt="mouse" referrerPolicy="no-referrer" className="w-12 h-12 object-contain" />
                  <div>
                    <span className="text-xs font-bold text-slate-900 block truncate max-w-[120px]">ErgoMouse Pro</span>
                    <span className="text-xs text-slate-600 font-bold">₹7,990</span>
                  </div>
                </div>

                <Plus className="w-4 h-4 text-slate-400" />

                {/* SSD item */}
                <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
                  <input 
                    type="checkbox" 
                    checked={bundleAccessories['prodrive-2tb-ssd']} 
                    onChange={(e) => setBundleAccessories({ ...bundleAccessories, 'prodrive-2tb-ssd': e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600"
                  />
                  <img src={PRODUCTS.find(p => p.id === 'prodrive-2tb-ssd')?.image} alt="ssd" referrerPolicy="no-referrer" className="w-12 h-12 object-contain" />
                  <div>
                    <span className="text-xs font-bold text-slate-900 block truncate max-w-[120px]">ProDrive 2TB SSD</span>
                    <span className="text-xs text-slate-600 font-bold">₹15,490</span>
                  </div>
                </div>
              </div>

              {/* Bundle Action */}
              <div className="bg-white p-4 rounded-2xl border border-blue-200 shadow-xs text-center sm:text-right shrink-0 w-full sm:w-auto">
                <span className="text-xs text-slate-500 block">Total Bundle Price</span>
                <span className="text-xl font-extrabold text-blue-600 block">
                  ₹{(
                    activeProduct.price + 
                    (bundleAccessories['ergomouse-pro'] ? 7990 : 0) + 
                    (bundleAccessories['prodrive-2tb-ssd'] ? 15490 : 0)
                  ).toLocaleString('en-IN')}
                </span>
                <button
                  onClick={() => {
                    addToCart(activeProduct);
                    if (bundleAccessories['ergomouse-pro']) {
                      const mouse = PRODUCTS.find(p => p.id === 'ergomouse-pro');
                      if (mouse) addToCart(mouse);
                    }
                    if (bundleAccessories['prodrive-2tb-ssd']) {
                      const ssd = PRODUCTS.find(p => p.id === 'prodrive-2tb-ssd');
                      if (ssd) addToCart(ssd);
                    }
                    showToast("Bundle added to cart!");
                  }}
                  className="mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition"
                >
                  Add Bundle to Cart
                </button>
              </div>
            </div>
          </section>

        </main>
      )}

      {/* ========================================================================= */}
      {/* 4. SHOPPING CART SCREEN                                                   */}
      {/* ========================================================================= */}
      {currentScreen === 'cart' && (
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6">
          
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900">Shopping Cart</h1>
              <p className="text-xs text-slate-500">{cart.length} unique items in your session</p>
            </div>

            <button 
              onClick={() => navigateTo('category')}
              className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Continue Shopping
            </button>
          </div>

          {cart.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-16 text-center space-y-4 shadow-xs">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                <ShoppingCart className="w-8 h-8" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">Your shopping cart is empty</h2>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">Discover premium laptops, pro audio headphones, and workspace essentials.</p>
              <button
                onClick={() => navigateTo('category', 'electronics')}
                className="bg-blue-600 text-white text-xs font-semibold px-6 py-2.5 rounded-full shadow-xs"
              >
                Browse Catalog
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Cart Items List */}
              <div className="lg:col-span-8 space-y-4">
                {cart.map((item) => (
                  <div 
                    key={item.id}
                    className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-center gap-5 justify-between"
                  >
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      <div className="w-20 h-20 bg-slate-50 rounded-xl p-2 border border-slate-100 flex items-center justify-center shrink-0">
                        <img 
                          src={item.product.image} 
                          alt={item.product.name} 
                          referrerPolicy="no-referrer"
                          className="max-h-full object-contain" 
                        />
                      </div>
                      
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{item.product.brand}</span>
                        <h3 className="text-sm font-bold text-slate-900 line-clamp-1">{item.product.name}</h3>
                        <div className="text-xs text-slate-500 space-x-2">
                          {item.selectedColor && <span>Color: <strong>{item.selectedColor}</strong></span>}
                          {item.selectedMemory && <span>• <strong>{item.selectedMemory}</strong></span>}
                        </div>
                        <div className="text-sm font-extrabold text-blue-600 sm:hidden pt-1">
                          ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                        </div>
                      </div>
                    </div>

                    {/* Quantity Selector & Item Total */}
                    <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      
                      <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                        <button
                          onClick={() => updateCartQuantity(item.id, -1)}
                          className="p-2 hover:bg-slate-200 text-slate-600 transition"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-3 text-xs font-bold text-slate-800">{item.quantity}</span>
                        <button
                          onClick={() => updateCartQuantity(item.id, 1)}
                          className="p-2 hover:bg-slate-200 text-slate-600 transition"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-right hidden sm:block">
                        <span className="text-base font-extrabold text-slate-900 block">
                          ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                        </span>
                        <span className="text-[10px] text-slate-400">₹{item.price.toLocaleString('en-IN')} each</span>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                  </div>
                ))}

                {/* Free Shipping Alert Box */}
                <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex items-center gap-3 text-xs text-emerald-800">
                  <Truck className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>Congratulations! Your order qualifies for <strong>Free Priority Express Shipping</strong> with insured package dispatch.</span>
                </div>
              </div>

              {/* Order Summary & Checkout Card */}
              <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-slate-200 space-y-6 shadow-sm sticky top-24">
                <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
                  Order Summary
                </h3>

                <div className="space-y-3 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Subtotal ({cart.reduce((s, i) => s + i.quantity, 0)} items)</span>
                    <span className="font-semibold text-slate-900">₹{cartSubtotal.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span className="flex items-center gap-1">Festive Discount (8%)</span>
                    <span>-₹{cartDiscount.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Estimated Shipping</span>
                    <span className="font-semibold text-emerald-600">FREE</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Estimated GST (5%)</span>
                    <span className="font-semibold text-slate-900">₹{cartTax.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex justify-between items-baseline">
                    <span className="text-sm font-bold text-slate-900">Total Amount</span>
                    <span className="text-xl font-extrabold text-blue-600">₹{cartTotal.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <button
                  id="cart-proceed-checkout"
                  onClick={() => navigateTo('checkout')}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm py-3.5 rounded-2xl transition shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
                >
                  Proceed to Checkout
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="space-y-2 pt-2 text-[11px] text-slate-400">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-slate-400" />
                    <span>256-bit Bank-grade SSL Encrypted Checkout</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <RotateCcw className="w-4 h-4 text-slate-400" />
                    <span>7 Days Replacement & Refund Guarantee</span>
                  </div>
                </div>

              </div>

            </div>
          )}

        </main>
      )}

      {/* ========================================================================= */}
      {/* 5. MULTI-STEP CHECKOUT SCREEN                                             */}
      {/* ========================================================================= */}
      {currentScreen === 'checkout' && (
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 space-y-8">
          
          {/* Checkout Steps Progress Indicator */}
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between relative">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-slate-200 w-full -z-0"></div>
              
              {[
                { step: 1, label: 'Shipping Address' },
                { step: 2, label: 'Delivery Method' },
                { step: 3, label: 'Payment & Place' }
              ].map((s) => (
                <div key={s.step} className="relative z-10 flex flex-col items-center gap-1 bg-[#f8fafc] px-3">
                  <button
                    onClick={() => setCheckoutStep(s.step)}
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition ${
                      checkoutStep === s.step
                        ? 'bg-blue-600 text-white ring-4 ring-blue-100 shadow-md'
                        : checkoutStep > s.step
                        ? 'bg-emerald-600 text-white'
                        : 'bg-white border border-slate-300 text-slate-500'
                    }`}
                  >
                    {checkoutStep > s.step ? <Check className="w-4 h-4" /> : s.step}
                  </button>
                  <span className={`text-xs font-semibold ${checkoutStep === s.step ? 'text-blue-600' : 'text-slate-500'}`}>
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Step Content Container */}
            <div className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 space-y-6 shadow-sm">
              
              {/* STEP 1: ADDRESS */}
              {checkoutStep === 1 && (
                <div className="space-y-5">
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-blue-600" /> Shipping & Delivery Address
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">Full Name</label>
                      <input 
                        type="text" 
                        value={savedAddress.name} 
                        onChange={(e) => setSavedAddress({ ...savedAddress, name: e.target.value })}
                        className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500" 
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">Phone Number</label>
                      <input 
                        type="text" 
                        value={savedAddress.phone} 
                        onChange={(e) => setSavedAddress({ ...savedAddress, phone: e.target.value })}
                        className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500" 
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-xs font-semibold text-slate-700 block mb-1">Street Address</label>
                      <input 
                        type="text" 
                        value={savedAddress.street} 
                        onChange={(e) => setSavedAddress({ ...savedAddress, street: e.target.value })}
                        className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500" 
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">Apartment / Suite</label>
                      <input 
                        type="text" 
                        value={savedAddress.suite} 
                        onChange={(e) => setSavedAddress({ ...savedAddress, suite: e.target.value })}
                        className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500" 
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">City</label>
                      <input 
                        type="text" 
                        value={savedAddress.city} 
                        onChange={(e) => setSavedAddress({ ...savedAddress, city: e.target.value })}
                        className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500" 
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">State / Province</label>
                      <input 
                        type="text" 
                        value={savedAddress.state} 
                        onChange={(e) => setSavedAddress({ ...savedAddress, state: e.target.value })}
                        className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500" 
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">Pincode / ZIP Code</label>
                      <input 
                        type="text" 
                        value={savedAddress.pincode} 
                        onChange={(e) => setSavedAddress({ ...savedAddress, pincode: e.target.value })}
                        className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500" 
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button
                      id="checkout-step1-next"
                      onClick={() => setCheckoutStep(2)}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-6 py-3 rounded-xl transition flex items-center gap-2"
                    >
                      Continue to Delivery <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: DELIVERY METHOD */}
              {checkoutStep === 2 && (
                <div className="space-y-5">
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Truck className="w-5 h-5 text-blue-600" /> Choose Delivery Speed
                  </h2>

                  <div className="space-y-3">
                    <button
                      onClick={() => setDeliveryType('Standard')}
                      className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition ${
                        deliveryType === 'Standard' 
                          ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20' 
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${deliveryType === 'Standard' ? 'border-blue-600' : 'border-slate-300'}`}>
                          {deliveryType === 'Standard' && <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />}
                        </div>
                        <div>
                          <span className="text-xs font-bold text-slate-900 block">Standard Ground Courier (Free)</span>
                          <span className="text-xs text-slate-500">Estimated delivery: 3-4 Business Days</span>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-emerald-600">FREE</span>
                    </button>

                    <button
                      onClick={() => setDeliveryType('Express')}
                      className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition ${
                        deliveryType === 'Express' 
                          ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20' 
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${deliveryType === 'Express' ? 'border-blue-600' : 'border-slate-300'}`}>
                          {deliveryType === 'Express' && <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />}
                        </div>
                        <div>
                          <span className="text-xs font-bold text-slate-900 block">FedEx Priority Air (Next-Day)</span>
                          <span className="text-xs text-slate-500">Guaranteed delivery by tomorrow before 4:00 PM</span>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-slate-900">₹499</span>
                    </button>
                  </div>

                  <div className="pt-4 flex justify-between items-center">
                    <button
                      onClick={() => setCheckoutStep(1)}
                      className="text-xs font-semibold text-slate-600 hover:text-slate-900"
                    >
                      Back to Address
                    </button>

                    <button
                      id="checkout-step2-next"
                      onClick={() => setCheckoutStep(3)}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-6 py-3 rounded-xl transition flex items-center gap-2"
                    >
                      Continue to Payment <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: PAYMENT METHOD */}
              {checkoutStep === 3 && (
                <div className="space-y-5">
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-blue-600" /> Select Payment Method
                  </h2>

                  <div className="space-y-3">
                    {[
                      { id: 'card', name: 'Credit or Debit Card (Visa / Mastercard)', icon: CreditCard, subtitle: 'Safe instant encrypted 3D secure transaction' },
                      { id: 'upi', name: 'UPI Instant Pay (GPay / PhonePe / Paytm)', icon: Zap, subtitle: 'Scan QR code or approve notification on mobile' },
                      { id: 'paylater', name: 'IntelliCart Pay Later (0% EMI Available)', icon: Building, subtitle: 'Pre-approved ₹1,50,000 credit limit' },
                    ].map(p => (
                      <button
                        key={p.id}
                        onClick={() => setPaymentMethod(p.id)}
                        className={`w-full p-4 rounded-2xl border text-left flex items-start justify-between transition ${
                          paymentMethod === p.id 
                            ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20' 
                            : 'border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-5 h-5 mt-0.5 rounded-full border-2 flex items-center justify-center shrink-0 ${paymentMethod === p.id ? 'border-blue-600' : 'border-slate-300'}`}>
                            {paymentMethod === p.id && <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />}
                          </div>
                          <div>
                            <span className="text-xs font-bold text-slate-900 block">{p.name}</span>
                            <span className="text-xs text-slate-500">{p.subtitle}</span>
                          </div>
                        </div>
                        <p.icon className="w-5 h-5 text-slate-400 shrink-0" />
                      </button>
                    ))}
                  </div>

                  {paymentMethod === 'card' && (
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700">Card Number</label>
                        <input 
                          type="text" 
                          defaultValue="4242 •••• •••• 4242" 
                          className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl" 
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-semibold text-slate-700">Expiry (MM/YY)</label>
                          <input type="text" defaultValue="08/29" className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl" />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-slate-700">CVV</label>
                          <input type="password" defaultValue="•••" className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl" />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="pt-4 flex justify-between items-center">
                    <button
                      onClick={() => setCheckoutStep(2)}
                      className="text-xs font-semibold text-slate-600 hover:text-slate-900"
                    >
                      Back to Delivery
                    </button>

                    <button
                      id="checkout-place-order"
                      onClick={handlePlaceOrder}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-8 py-3.5 rounded-xl transition shadow-lg shadow-emerald-600/20 flex items-center gap-2"
                    >
                      <Lock className="w-4 h-4" /> Place Order & Pay ₹{cartTotal.toLocaleString('en-IN')}
                    </button>
                  </div>
                </div>
              )}

            </div>

            {/* Mini Summary Sidebar */}
            <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-slate-200 space-y-4 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
                Order Items ({cart.length})
              </h3>

              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {cart.map(item => (
                  <div key={item.id} className="flex items-center gap-3 text-xs">
                    <img src={item.product.image} alt={item.product.name} referrerPolicy="no-referrer" className="w-10 h-10 object-contain bg-slate-50 p-1 rounded-lg border" />
                    <div className="flex-1 min-w-0">
                      <span className="font-semibold text-slate-800 block truncate">{item.product.name}</span>
                      <span className="text-slate-400">Qty: {item.quantity}</span>
                    </div>
                    <span className="font-bold text-slate-900">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{cartSubtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Discount</span>
                  <span>-₹{cartDiscount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery ({deliveryType})</span>
                  <span>{deliveryType === 'Standard' ? 'FREE' : '₹499'}</span>
                </div>
                <div className="pt-2 border-t border-slate-100 flex justify-between font-extrabold text-sm text-slate-900">
                  <span>Total Due</span>
                  <span className="text-blue-600">₹{cartTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

          </div>

        </main>
      )}

      {/* ========================================================================= */}
      {/* 6. ORDER SUCCESS SCREEN                                                   */}
      {/* ========================================================================= */}
      {currentScreen === 'order-success' && (
        <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-10 space-y-8">
          
          <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 text-center space-y-6 shadow-sm">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto ring-8 ring-emerald-50">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Order Placed Successfully!</h1>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                Thank you for shopping with IntelliCart! Your confirmation and receipt have been sent to <strong>sarah.jenkins@example.com</strong>.
              </p>
            </div>

            {/* Order Brief Box */}
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200/80 text-left grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block">Order Number</span>
                <span className="font-bold text-slate-900 text-sm">{currentOrder.orderNumber}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Estimated Delivery</span>
                <span className="font-bold text-emerald-600 text-sm">{currentOrder.estimatedDelivery}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Payment Method</span>
                <span className="font-bold text-slate-900">{currentOrder.paymentMethod}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Total Amount Paid</span>
                <span className="font-bold text-blue-600 text-sm">₹{currentOrder.total.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Action CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                id="success-track-order-btn"
                onClick={() => navigateTo('order-tracking')}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-6 py-3 rounded-xl transition flex items-center justify-center gap-2 shadow-xs"
              >
                <PackageCheck className="w-4 h-4" /> Track Order Status
              </button>

              <button
                id="success-continue-shopping"
                onClick={() => navigateTo('home')}
                className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold px-6 py-3 rounded-xl transition"
              >
                Continue Shopping
              </button>
            </div>

          </div>

        </main>
      )}

      {/* ========================================================================= */}
      {/* 7. ORDER TRACKING SCREEN                                                  */}
      {/* ========================================================================= */}
      {currentScreen === 'order-tracking' && (
        <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6">
          
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
                <Truck className="w-6 h-6 text-blue-600" /> Order Tracking & Status
              </h1>
              <p className="text-xs text-slate-500">Live FedEx Courier & Warehouse Dispatch Timeline</p>
            </div>

            <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full">
              Status: {currentOrder.status}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Live Timeline View */}
            <div className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 space-y-8 shadow-xs">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
                <div>
                  <span className="text-slate-400 block">Tracking ID</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-bold text-slate-900 text-sm">{currentOrder.trackingNumber}</span>
                    <button 
                      onClick={() => {
                        navigator.clipboard?.writeText(currentOrder.trackingNumber);
                        showToast("Tracking ID copied to clipboard!");
                      }}
                      className="p-1 hover:bg-slate-200 rounded text-slate-500"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 block">Carrier</span>
                  <span className="font-bold text-slate-900">{currentOrder.carrier}</span>
                </div>

                <div>
                  <span className="text-slate-400 block">Expected Arrival</span>
                  <span className="font-bold text-emerald-600">{currentOrder.estimatedDelivery}</span>
                </div>
              </div>

              {/* Step Timeline */}
              <div className="space-y-6 pl-2">
                {currentOrder.timeline.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-4 relative">
                    {idx < currentOrder.timeline.length - 1 && (
                      <div 
                        className={`absolute left-4 top-8 -bottom-6 w-0.5 ${
                          step.completed ? 'bg-blue-600' : 'bg-slate-200'
                        }`} 
                      />
                    )}

                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 ${
                      step.completed 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-slate-100 border border-slate-300 text-slate-400'
                    }`}>
                      {step.completed ? <Check className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className={`text-sm font-bold ${step.completed ? 'text-slate-900' : 'text-slate-400'}`}>
                          {step.status}
                        </h4>
                        <span className="text-xs text-slate-400 font-medium">{step.date}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {step.status === 'Order Placed' && 'Order received and payment verified by security gateway.'}
                        {step.status === 'Confirmed' && 'Inventory allocated and warehouse picklist generated.'}
                        {step.status === 'Packed' && 'Package sealed in tamper-evident bubble enclosure.'}
                        {step.status === 'Shipped' && 'Dispatched via FedEx flight transit hub.'}
                        {step.status === 'Out for Delivery' && 'Assigned to local delivery driver.'}
                        {step.status === 'Delivered' && 'Delivered to recipient address with signature.'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

            </div>

            {/* Delivery Address & Package Items */}
            <div className="lg:col-span-4 space-y-6">
              
              <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-3 shadow-xs text-xs">
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-blue-600" /> Destination Address
                </h3>
                <div className="space-y-1 text-slate-600">
                  <p className="font-bold text-slate-900">{currentOrder.deliveryAddress.name}</p>
                  <p>{currentOrder.deliveryAddress.street}, {currentOrder.deliveryAddress.suite}</p>
                  <p>{currentOrder.deliveryAddress.city}, {currentOrder.deliveryAddress.state} - {currentOrder.deliveryAddress.pincode}</p>
                  <p className="text-slate-400">{currentOrder.deliveryAddress.country}</p>
                  <p className="font-medium pt-1 text-slate-700">Phone: {currentOrder.deliveryAddress.phone}</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-3 shadow-xs text-xs">
                <h3 className="font-bold text-sm text-slate-900">Package Contents</h3>
                <div className="space-y-3">
                  {currentOrder.items.map(item => (
                    <div key={item.id} className="flex items-center gap-3">
                      <img src={item.product.image} alt={item.product.name} referrerPolicy="no-referrer" className="w-10 h-10 object-contain bg-slate-50 p-1 rounded-lg border" />
                      <div className="flex-1 min-w-0">
                        <span className="font-semibold text-slate-900 block truncate">{item.product.name}</span>
                        <span className="text-slate-400">Qty: {item.quantity} • ₹{item.price.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>

        </main>
      )}

      {/* ========================================================================= */}
      {/* 8. SIGN IN / LOGIN SCREEN                                                 */}
      {/* ========================================================================= */}
      {currentScreen === 'login' && (
        <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-12">
          <div className="bg-white max-w-md w-full p-8 rounded-3xl border border-slate-200 shadow-xl space-y-6">
            
            <div className="text-center space-y-2">
              <img 
                src={LOGO_URL} 
                alt="Logo" 
                referrerPolicy="no-referrer"
                className="h-10 w-auto mx-auto rounded-xl shadow-xs" 
              />
              <h1 className="text-2xl font-extrabold text-slate-900">Welcome Back</h1>
              <p className="text-xs text-slate-500">Sign in to your IntelliCart account to view orders and wishlist</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="email" 
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500" 
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-semibold text-slate-700">Password</label>
                  <button className="text-blue-600 hover:underline">Forgot password?</button>
                </div>
                <div className="relative">
                  <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="password" 
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500" 
                  />
                </div>
              </div>

              <button
                id="auth-sign-in-btn"
                onClick={() => {
                  setIsLoggedIn(true);
                  showToast("Signed in successfully!");
                  navigateTo('home');
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-3 rounded-xl transition shadow-lg shadow-blue-600/20"
              >
                Sign In
              </button>

              <div className="relative my-4 text-center">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
                <span className="relative bg-white px-3 text-[11px] text-slate-400 uppercase">Or Continue With</span>
              </div>

              <button
                onClick={() => {
                  setIsLoggedIn(true);
                  showToast("Signed in with Google!");
                  navigateTo('home');
                }}
                className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 rounded-xl transition flex items-center justify-center gap-2"
              >
                <span className="font-bold text-red-500">G</span> Google Account
              </button>
            </div>

            <p className="text-center text-xs text-slate-500">
              Don't have an account?{' '}
              <button 
                onClick={() => navigateTo('register')}
                className="text-blue-600 font-bold hover:underline"
              >
                Create Account
              </button>
            </p>

          </div>
        </main>
      )}

      {/* ========================================================================= */}
      {/* 9. REGISTER / CREATE ACCOUNT SCREEN                                       */}
      {/* ========================================================================= */}
      {currentScreen === 'register' && (
        <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-12">
          <div className="bg-white max-w-md w-full p-8 rounded-3xl border border-slate-200 shadow-xl space-y-6">
            
            <div className="text-center space-y-2">
              <img 
                src={LOGO_URL} 
                alt="Logo" 
                referrerPolicy="no-referrer"
                className="h-10 w-auto mx-auto rounded-xl shadow-xs" 
              />
              <h1 className="text-2xl font-extrabold text-slate-900">Create IntelliCart Account</h1>
              <p className="text-xs text-slate-500">Join over 250,000+ tech professionals and audio creators</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500" 
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="email" 
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500" 
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Password</label>
                <div className="relative">
                  <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="password" 
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500" 
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-600">
                <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded" />
                <span>I agree to IntelliCart Terms of Service & Privacy Policy</span>
              </div>

              <button
                id="auth-register-btn"
                onClick={() => {
                  setIsLoggedIn(true);
                  showToast("Account created successfully!");
                  navigateTo('home');
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-3 rounded-xl transition shadow-lg shadow-blue-600/20"
              >
                Create Account
              </button>
            </div>

            <p className="text-center text-xs text-slate-500">
              Already have an account?{' '}
              <button 
                onClick={() => navigateTo('login')}
                className="text-blue-600 font-bold hover:underline"
              >
                Sign In
              </button>
            </p>

          </div>
        </main>
      )}
      {/* ========================================================================= */}
      {/* 10. WISHLIST SCREEN                                                       */}
      {/* ========================================================================= */}
      {currentScreen === 'wishlist' && (
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
                <Heart className="w-6 h-6 text-rose-600 fill-rose-500" /> My Saved Wishlist
              </h1>
              <p className="text-xs text-slate-500">Items saved for future purchases ({wishlist.length} saved)</p>
            </div>
            <button 
              onClick={() => navigateTo('category', 'electronics')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              Continue Shopping <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {wishlist.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center max-w-md mx-auto space-y-4 border border-slate-200 shadow-sm">
              <Heart className="w-16 h-16 text-slate-300 mx-auto stroke-1" />
              <h3 className="text-lg font-bold text-slate-800">Your wishlist is empty</h3>
              <p className="text-xs text-slate-500">Save items you love by clicking the heart icon while browsing our catalog.</p>
              <button 
                onClick={() => navigateTo('home')}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-md"
              >
                Browse Catalog
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {visibleProducts.filter(p => wishlist.includes(p.id)).map(product => (
                <div key={product.id} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <img src={product.image} alt={product.name} className="w-full h-44 object-contain rounded-xl p-2 bg-slate-50" />
                    <div>
                      <span className="text-[10px] font-bold uppercase text-blue-600 tracking-wider">{product.brand}</span>
                      <h3 className="text-sm font-bold text-slate-900 line-clamp-2">{product.name}</h3>
                    </div>
                    <div className="text-base font-extrabold text-slate-900">₹{product.price.toLocaleString('en-IN')}</div>
                  </div>
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => {
                        addToCart(product);
                        showToast(`Moved ${product.name} to cart`);
                      }}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1.5"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" /> Move to Cart
                    </button>
                    <button
                      onClick={() => {
                        setWishlist(wishlist.filter(id => id !== product.id));
                        showToast(`Removed from wishlist`);
                      }}
                      className="w-full text-slate-500 hover:text-rose-600 text-xs font-medium py-1 text-center"
                    >
                      Remove Item
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      )}

      {/* ========================================================================= */}
      {/* 11. USER PROFILE & ADDRESS MANAGEMENT SCREEN                              */}
      {/* ========================================================================= */}
      {currentScreen === 'profile' && (
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full space-y-6">
          <div className="border-b border-slate-200 pb-4">
            <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
              <User className="w-6 h-6 text-blue-600" /> Account & Address Preferences
            </h1>
            <p className="text-xs text-slate-500">Manage your credentials, personal details, and delivery locations</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 space-y-4 shadow-sm text-center">
              <img src={USER_AVATAR} alt="User Avatar" className="w-24 h-24 rounded-full mx-auto border-4 border-blue-100 object-cover" />
              <div>
                <h3 className="font-extrabold text-slate-900 text-lg">Sarah Jenkins</h3>
                <p className="text-xs text-slate-500">sarah.jenkins@example.com</p>
                <span className="inline-block mt-2 bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                  IntelliClub Premier Member
                </span>
              </div>
            </div>

            <div className="md:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 space-y-6 shadow-sm">
              <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2">Saved Delivery Addresses</h3>
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-800">{savedAddress.name}</span>
                  <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded">Default</span>
                </div>
                <p className="text-xs text-slate-600">{savedAddress.street}, {savedAddress.suite}</p>
                <p className="text-xs text-slate-600">{savedAddress.city}, {savedAddress.state} {savedAddress.pincode}</p>
                <p className="text-xs font-semibold text-slate-700">{savedAddress.phone}</p>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h4 className="font-bold text-xs text-slate-800">Security Credentials</h4>
                <div className="flex items-center justify-between text-xs text-slate-600 bg-slate-50 p-3 rounded-xl">
                  <span>Password last updated 14 days ago</span>
                  <button onClick={() => showToast("Password reset link sent to sarah.j@example.com")} className="text-blue-600 font-bold hover:underline">Change Password</button>
                </div>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* ========================================================================= */}
      {/* 12. AI RECOMMENDATIONS HUB                                                */}
      {/* ========================================================================= */}
      {currentScreen === 'recommendations' && (
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full space-y-8">
          <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-8 text-white space-y-3 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <Sparkles className="w-64 h-64 text-blue-400" />
            </div>
            <span className="inline-flex items-center gap-1.5 bg-blue-500/30 text-blue-300 border border-blue-400/30 text-xs font-bold px-3 py-1 rounded-full">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" /> IntelliCart AI Engine
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight">Personalized For Your Tech Workflow</h1>
            <p className="text-slate-300 text-xs max-w-2xl leading-relaxed">
              Our neural recommendation model analyzes your search behavior, product view history, category preferences, and budget affinity to generate explainable recommendations tailored specifically for you.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" /> Recommended Based On Recent Views
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {visibleProducts.map((prod, idx) => (
                <div key={prod.id} className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs hover:shadow-md transition space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                        {idx % 2 === 0 ? 'High Affinity Match' : 'Popular in Laptops'}
                      </span>
                      <span className="text-xs font-extrabold text-emerald-600">{(98 - idx * 3)}% Match</span>
                    </div>
                    <img src={prod.image} alt={prod.name} className="w-full h-40 object-contain rounded-xl p-2 bg-slate-50" />
                    <h3 className="text-xs font-bold text-slate-900 line-clamp-2">{prod.name}</h3>
                    <p className="text-[11px] text-slate-500 line-clamp-2">{prod.description}</p>
                  </div>
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-sm font-extrabold text-slate-900">₹{prod.price.toLocaleString('en-IN')}</span>
                    <button 
                      onClick={() => navigateTo('product', undefined, prod.id)}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1"
                    >
                      View <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      )}

      {/* ========================================================================= */}
      {/* 13. ADMIN DASHBOARD & CONTROL CENTER                                      */}
      {/* ========================================================================= */}
      {currentScreen.startsWith('admin') && (
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full space-y-8">
          
          {/* Admin Header */}
          <div className="bg-slate-900 text-white p-6 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg border border-slate-800">
            <div>
              <span className="bg-purple-500/20 text-purple-300 border border-purple-400/30 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Enterprise Admin Operations
              </span>
              <h1 className="text-2xl font-extrabold tracking-tight mt-1">IntelliCart Control Center</h1>
            </div>
            
            {/* Admin Nav Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto py-1 no-scrollbar w-full sm:w-auto">
              <button 
                onClick={() => navigateTo('admin-dashboard')} 
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${currentScreen === 'admin-dashboard' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
              >
                Overview
              </button>
              <button 
                onClick={() => navigateTo('admin-risk')} 
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${currentScreen === 'admin-risk' ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
              >
                Order Risk Monitor
              </button>
              <button 
                onClick={() => navigateTo('admin-products')} 
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${currentScreen === 'admin-products' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
              >
                Products & Inventory
              </button>
              <button 
                onClick={() => navigateTo('admin-orders')} 
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${currentScreen === 'admin-orders' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
              >
                Order Processing
              </button>
            </div>
          </div>

          {/* Admin Dashboard Metric Cards */}
          {currentScreen === 'admin-dashboard' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Revenue</span>
                  <div className="text-2xl font-extrabold text-slate-900">₹40,40,000</div>
                  <span className="text-[11px] font-bold text-emerald-600">+18.4% from last month</span>
                </div>
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Orders</span>
                  <div className="text-2xl font-extrabold text-slate-900">1,290</div>
                  <span className="text-[11px] font-bold text-blue-600">+12.1% growth</span>
                </div>
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Suspicious Order Alerts</span>
                  <div className="text-2xl font-extrabold text-rose-600">3 Orders</div>
                  <span className="text-[11px] font-bold text-rose-600">Flagged HIGH Risk</span>
                </div>
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Low Stock Warnings</span>
                  <div className="text-2xl font-extrabold text-amber-600">2 Items</div>
                  <span className="text-[11px] text-amber-600 font-semibold">&lt; 10 units remaining</span>
                </div>
              </div>

              {/* Order Risk Summary Table preview */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-rose-600" /> Recent Order Risk Assessments
                  </h3>
                  <button onClick={() => navigateTo('admin-risk')} className="text-xs font-bold text-blue-600 hover:underline">
                    View All Assessments &rarr;
                  </button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 uppercase font-semibold">
                        <th className="py-3 px-4">Order ID</th>
                        <th className="py-3 px-4">Customer Email</th>
                        <th className="py-3 px-4">Order Amount</th>
                        <th className="py-3 px-4">Risk Score</th>
                        <th className="py-3 px-4">Classification</th>
                        <th className="py-3 px-4">Primary Risk Factors</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      <tr className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-bold text-slate-900">ORD-98234102</td>
                        <td className="py-3 px-4">sarah.jenkins@example.com</td>
                        <td className="py-3 px-4 font-semibold">₹1,72,799</td>
                        <td className="py-3 px-4 font-extrabold text-rose-600">82 / 100</td>
                        <td className="py-3 px-4">
                          <span className="bg-rose-100 text-rose-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full">HIGH RISK</span>
                        </td>
                        <td className="py-3 px-4 text-slate-500">High order value threshold, Multiple failed payment retries</td>
                      </tr>
                      <tr className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-bold text-slate-900">ORD-44910283</td>
                        <td className="py-3 px-4">alex.m@techcorp.io</td>
                        <td className="py-3 px-4 font-semibold">₹29,990</td>
                        <td className="py-3 px-4 font-extrabold text-emerald-600">15 / 100</td>
                        <td className="py-3 px-4">
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full">LOW RISK</span>
                        </td>
                        <td className="py-3 px-4 text-slate-500">Standard verified transaction parameters</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Admin Order Risk Monitor Screen */}
          {currentScreen === 'admin-risk' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-6 h-6 text-rose-600" /> Explainable Order Risk Assessment System
                </h2>
                <p className="text-xs text-slate-500">
                  Every order is evaluated against rule-based feature vectors including order value anomalies, failed payment frequency, ordering velocity, and delivery pattern changes.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 space-y-1">
                  <span className="text-xs font-bold text-rose-800">HIGH RISK ORDERS</span>
                  <div className="text-xl font-extrabold text-rose-900">1 Order</div>
                  <p className="text-[10px] text-rose-700">Requires administrative compliance review</p>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-1">
                  <span className="text-xs font-bold text-amber-800">MEDIUM RISK ORDERS</span>
                  <div className="text-xl font-extrabold text-amber-900">0 Orders</div>
                  <p className="text-[10px] text-amber-700">Under automated monitoring</p>
                </div>
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 space-y-1">
                  <span className="text-xs font-bold text-emerald-800">LOW RISK ORDERS</span>
                  <div className="text-xl font-extrabold text-emerald-900">14 Orders</div>
                  <p className="text-[10px] text-emerald-700">Passed automated verification</p>
                </div>
              </div>

              <div className="border border-slate-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-sm text-slate-900">Order #ORD-98234102 Assessment Detail</span>
                  <span className="bg-rose-100 text-rose-800 text-xs font-extrabold px-3 py-1 rounded-full">HIGH RISK (Score: 82)</span>
                </div>
                <div className="text-xs text-slate-600 space-y-1">
                  <p><span className="font-semibold text-slate-800">Customer:</span> Sarah Jenkins (sarah.jenkins@example.com)</p>
                  <p><span className="font-semibold text-slate-800">Order Total:</span> ₹1,72,799.00</p>
                  <p><span className="font-semibold text-slate-800">Shipping Address:</span> 1234 Silicon Valley Blvd, San Jose, CA 95131</p>
                </div>
                <div className="space-y-1 pt-2 border-t border-slate-100">
                  <span className="text-xs font-bold text-slate-800">Triggered Risk Explanations:</span>
                  <ul className="list-disc list-inside text-xs text-rose-700 space-y-0.5">
                    <li>Unusually high order value threshold exceeded (₹1,72,799.00 vs user avg ₹12,500.00)</li>
                    <li>Multiple failed payment attempts detected prior to authorization (3 retry events)</li>
                  </ul>
                </div>
                <div className="pt-2 flex items-center gap-3">
                  <button 
                    onClick={() => showToast("Order ORD-98234102 approved by compliance officer")}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl"
                  >
                    Approve Order
                  </button>
                  <button 
                    onClick={() => showToast("Order ORD-98234102 flagged for further verification")}
                    className="bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold px-4 py-2 rounded-xl"
                  >
                    Flag for Verification
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Admin Products Screen */}
          {currentScreen === 'admin-products' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900">Product Catalog Management</h2>
                  <p className="text-xs text-slate-500">Add, edit, or restock items in the IntelliCart inventory</p>
                </div>
                <button 
                  onClick={() => showToast("Product creation modal opened")}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Add New Product
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 uppercase font-semibold">
                      <th className="py-3 px-4">Item SKU</th>
                      <th className="py-3 px-4">Product Name</th>
                      <th className="py-3 px-4">Brand</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Price</th>
                      <th className="py-3 px-4">Stock Units</th>
                      <th className="py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {visibleProducts.map(prod => (
                      <tr key={prod.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-mono font-bold text-slate-800">{prod.id.toUpperCase()}</td>
                        <td className="py-3 px-4 font-bold text-slate-900">{prod.name}</td>
                        <td className="py-3 px-4">{prod.brand}</td>
                        <td className="py-3 px-4 capitalize">{prod.category}</td>
                        <td className="py-3 px-4 font-extrabold">₹{prod.price.toLocaleString('en-IN')}</td>
                        <td className="py-3 px-4">
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            35 Available
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => setDeleteModalProduct(prod)}
                            className="p-1.5 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title={`Delete ${prod.name}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Delete Confirmation Modal */}
              {deleteModalProduct && (
                <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
                  <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl border border-slate-100">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                        <Trash2 className="w-4 h-4 text-rose-500" /> Delete Product
                      </h3>
                      <button onClick={() => setDeleteModalProduct(null)} className="text-slate-400 hover:text-slate-600">
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      Are you sure you want to delete <span className="font-bold text-slate-900">{deleteModalProduct.name}</span>? This will remove it from the storefront but keep it in order history.
                    </p>

                    <div className="flex items-center gap-3 pt-2">
                      <button
                        onClick={() => setDeleteModalProduct(null)}
                        className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold py-2.5 rounded-xl transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(deleteModalProduct)}
                        className="flex-1 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Admin Orders Screen */}
          {currentScreen === 'admin-orders' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
              <h2 className="text-lg font-extrabold text-slate-900">Full Order Pipeline Processing</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 uppercase font-semibold">
                      <th className="py-3 px-4">Order Number</th>
                      <th className="py-3 px-4">Customer</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Amount</th>
                      <th className="py-3 px-4">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {orders.map(ord => (
                      <tr key={ord.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-bold text-slate-900">{ord.orderNumber}</td>
                        <td className="py-3 px-4">{ord.deliveryAddress.name}</td>
                        <td className="py-3 px-4">{ord.date}</td>
                        <td className="py-3 px-4">
                          <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                            {ord.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-extrabold">₹{ord.total.toLocaleString('en-IN')}</td>
                        <td className="py-3 px-4">
                          <button 
                            onClick={() => showToast(`Order ${ord.orderNumber} status updated`)}
                            className="text-blue-600 font-bold hover:underline"
                          >
                            Update Pipeline
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      )}
      {/* Location Modal */}
      {showLocationModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-600" /> Select Delivery Location
              </h3>
              <button onClick={() => setShowLocationModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <input
                type="text"
                value={tempPincode}
                onChange={(e) => setTempPincode(e.target.value)}
                placeholder="Enter city or ZIP (e.g. Austin, 78701)"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              />
              <button
                onClick={() => {
                  if (tempPincode.trim()) {
                    setSelectedLocation(tempPincode);
                    showToast(`Delivery location updated to ${tempPincode}`);
                  }
                  setShowLocationModal(false);
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2.5 rounded-xl"
              >
                Save Location
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-slate-950 text-white text-xs border-t border-slate-800 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <img src={LOGO_URL} alt="IntelliCart" referrerPolicy="no-referrer" className="h-7 w-auto rounded-md" />
                <span className="font-extrabold text-base tracking-tight">Intelli<span className="text-blue-500">Cart</span></span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed">
                Premium digital commerce engine for creator hardware, developer workstations, and acoustic audio gear.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-white uppercase text-[11px] tracking-wider">Catalog</h4>
              <ul className="space-y-1.5 text-slate-400">
                <li><button onClick={() => navigateTo('category', 'electronics')} className="hover:text-white">Laptops & Desktops</button></li>
                <li><button onClick={() => navigateTo('category', 'electronics')} className="hover:text-white">Audio & Studio Monitors</button></li>
                <li><button onClick={() => navigateTo('category', 'accessories')} className="hover:text-white">Leather Briefcases & Sleeves</button></li>
                <li><button onClick={() => navigateTo('category', 'home')} className="hover:text-white">Ergonomic Office Furniture</button></li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-white uppercase text-[11px] tracking-wider">Customer Support</h4>
              <ul className="space-y-1.5 text-slate-400">
                <li><button onClick={() => navigateTo('order-tracking')} className="hover:text-white">Order Tracking</button></li>
                <li><span className="hover:text-white cursor-pointer">Shipping & Dispatch Policies</span></li>
                <li><span className="hover:text-white cursor-pointer">7-Day Return Guarantee</span></li>
                <li><span className="hover:text-white cursor-pointer">IntelliClub Membership</span></li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-white uppercase text-[11px] tracking-wider">Security & Trust</h4>
              <p className="text-slate-400 text-xs">
                All transactions protected with TLS 1.3 encryption and instant bank verification protocols.
              </p>
              <div className="flex items-center gap-2 text-slate-500 pt-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <span className="text-[11px] text-slate-300 font-semibold">100% Genuine Brand Certified</span>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-slate-500 text-[11px] gap-4">
            <p>© {new Date().getFullYear()} IntelliCart Technologies Inc. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <span className="hover:text-white cursor-pointer">Privacy Notice</span>
              <span>•</span>
              <span className="hover:text-white cursor-pointer">Terms of Use</span>
              <span>•</span>
              <span className="hover:text-white cursor-pointer">Security Standards</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
