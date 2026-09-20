import React, { useState } from 'react';
import { 
  Search, 
  ShoppingCart, 
  Heart, 
  MapPin, 
  ChevronDown, 
  User, 
  Bell, 
  Menu, 
  X,
  Sparkles,
  PackageCheck,
  LogOut,
  SlidersHorizontal,
  Headphones
} from 'lucide-react';
import { LOGO_URL, USER_AVATAR } from '../data/mockData';
import { ScreenType, Product } from '../types';

interface NavbarProps {
  currentScreen: ScreenType;
  onNavigate: (screen: ScreenType, categoryId?: string, productId?: string) => void;
  cartCount: number;
  wishlistCount: number;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  products: Product[];
  selectedLocation: string;
  onChangeLocation: () => void;
  isLoggedIn: boolean;
  onToggleLogin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentScreen,
  onNavigate,
  cartCount,
  wishlistCount,
  searchQuery,
  onSearchChange,
  products,
  selectedLocation,
  onChangeLocation,
  isLoggedIn,
  onToggleLogin,
}) => {
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const filteredSuggestions = searchQuery.trim()
    ? products.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5)
    : [];

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200/90 shadow-none">
      {/* Single Slim Top Utility Strip */}
      <div className="bg-slate-900/95 text-slate-300 border-b border-slate-800/90 text-[11px] tracking-wider py-1 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span className="font-normal text-slate-300">
              Festive Tech Carnival: <span className="text-white font-medium">Up to 40% OFF</span> on enterprise workstations & gear
            </span>
          </div>

          <div className="hidden md:flex items-center gap-5 text-slate-400">
            <button 
              onClick={() => onNavigate('order-tracking')} 
              className="hover:text-white transition flex items-center gap-1.5"
            >
              <PackageCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>Track Order</span>
            </button>

            <div className="h-3 w-[1px] bg-slate-700/80" />

            <div className="hover:text-white transition flex items-center gap-1.5 cursor-pointer">
              <Headphones className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>24x7 Customer Support</span>
            </div>

            <div className="h-3 w-[1px] bg-slate-700/80" />

            <div className="hover:text-white transition flex items-center gap-1.5 cursor-pointer text-slate-300 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span>IntelliClub Plus</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3">
        <div className="flex items-center justify-between gap-6 md:gap-10">
          
          {/* Brand Logo */}
          <button 
            id="brand-logo-btn"
            onClick={() => onNavigate('home')} 
            className="flex items-center gap-2.5 shrink-0 group text-left"
          >
            <img 
              src={LOGO_URL} 
              alt="IntelliCart Logo" 
              referrerPolicy="no-referrer"
              className="h-8 w-auto rounded-md shadow-2xs group-hover:opacity-90 transition-opacity" 
            />
            <div className="hidden sm:block">
              <div className="text-lg font-bold tracking-tight text-slate-900 flex items-center">
                Intelli<span className="text-blue-600 font-extrabold ml-0.5">Cart</span>
              </div>
              <p className="text-[9px] tracking-wider text-slate-400 uppercase font-medium">Enterprise Commerce</p>
            </div>
          </button>

          {/* Location selector */}
          <button 
            id="location-picker-btn"
            onClick={onChangeLocation}
            className="hidden lg:flex items-center gap-2 text-xs text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-50 border border-slate-200/80 transition"
          >
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <div className="text-left leading-tight">
              <span className="block text-[9px] text-slate-400 font-normal">Deliver to</span>
              <span className="font-medium truncate max-w-[105px] block text-slate-700">{selectedLocation}</span>
            </div>
            <ChevronDown className="w-3 h-3 text-slate-400 ml-0.5" />
          </button>

          {/* Search bar */}
          <div className="relative flex-1 max-w-2xl">
            <div className="relative flex items-center">
              <Search className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                id="global-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  onSearchChange(e.target.value);
                  setShowSearchSuggestions(true);
                }}
                onFocus={() => setShowSearchSuggestions(true)}
                placeholder="Search MacBook, Sony headphones, smartwatches, 4K monitors..."
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-sm text-slate-900 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition shadow-inner"
              />
              {searchQuery && (
                <button 
                  onClick={() => {
                    onSearchChange('');
                    setShowSearchSuggestions(false);
                  }}
                  className="absolute right-3.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Suggestions dropdown */}
            {showSearchSuggestions && filteredSuggestions.length > 0 && (
              <div 
                className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 overflow-hidden"
                onMouseLeave={() => setShowSearchSuggestions(false)}
              >
                <div className="px-4 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Product Matches ({filteredSuggestions.length})
                </div>
                {filteredSuggestions.map((item) => (
                  <button
                    key={item.id}
                    id={`search-item-${item.id}`}
                    onClick={() => {
                      onNavigate('product', undefined, item.id);
                      setShowSearchSuggestions(false);
                    }}
                    className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-blue-50/70 text-left transition"
                  >
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      referrerPolicy="no-referrer"
                      className="w-9 h-9 object-contain rounded bg-slate-50 p-1 border border-slate-100" 
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-slate-800 truncate">{item.name}</div>
                      <div className="text-xs text-slate-500">{item.brand} • <span className="text-blue-600 font-semibold">₹{item.price.toLocaleString('en-IN')}</span></div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-3 sm:gap-5 shrink-0">
            
            {/* Wishlist Button */}
            <button 
              id="nav-wishlist-btn"
              onClick={() => onNavigate('wishlist')}
              className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition"
              title="Saved items"
            >
              <Heart className="w-4 h-4" />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 bg-blue-600 text-white text-[9px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Cart Button */}
            <button 
              id="nav-cart-btn"
              onClick={() => onNavigate('cart')}
              className="relative flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-lg transition text-xs font-semibold shadow-xs"
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden sm:inline">Cart</span>
              <span className="bg-blue-800/80 text-white text-[11px] font-bold px-1.5 py-0.2 rounded min-w-[18px] text-center">
                {cartCount}
              </span>
            </button>

            {/* User Profile / Menu */}
            <div className="relative">
              {isLoggedIn ? (
                <button
                  id="user-profile-menu-btn"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-1 hover:bg-slate-50 rounded-lg border border-slate-200 transition"
                >
                  <img 
                    src={USER_AVATAR} 
                    alt="User" 
                    referrerPolicy="no-referrer"
                    className="w-7 h-7 rounded-full object-cover" 
                  />
                  <ChevronDown className="w-3 h-3 text-slate-400 pr-0.5 hidden sm:block" />
                </button>
              ) : (
                <button
                  id="nav-login-btn"
                  onClick={() => onNavigate('login')}
                  className="text-xs font-semibold text-slate-700 hover:text-blue-600 px-3.5 py-2 rounded-lg border border-slate-200 hover:border-slate-300 transition"
                >
                  Sign In
                </button>
              )}

              {/* User Dropdown */}
              {showUserMenu && isLoggedIn && (
                <div 
                  className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50"
                  onMouseLeave={() => setShowUserMenu(false)}
                >
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs text-slate-400">Signed in as</p>
                    <p className="text-sm font-semibold text-slate-900 truncate">Sarah Jenkins</p>
                    <p className="text-[11px] text-blue-600 font-medium">sarah.j@example.com</p>
                  </div>

                  <button
                    onClick={() => {
                      onNavigate('order-tracking');
                      setShowUserMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2.5"
                  >
                    <PackageCheck className="w-4 h-4 text-slate-500" />
                    Orders & Tracking
                  </button>

                  <button
                    onClick={() => {
                      onNavigate('recommendations');
                      setShowUserMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-xs text-blue-700 hover:bg-blue-50 flex items-center gap-2.5 font-medium"
                  >
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    AI Recommendations
                  </button>

                  <button
                    onClick={() => {
                      onNavigate('wishlist');
                      setShowUserMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2.5"
                  >
                    <Heart className="w-4 h-4 text-rose-500" />
                    Saved Wishlist
                  </button>

                  <button
                    onClick={() => {
                      onNavigate('profile');
                      setShowUserMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2.5"
                  >
                    <User className="w-4 h-4 text-slate-500" />
                    My Account & Addresses
                  </button>

                  <button
                    onClick={() => {
                      onNavigate('admin-dashboard');
                      setShowUserMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-xs text-purple-700 hover:bg-purple-50 flex items-center gap-2.5 font-bold border-t border-slate-100"
                  >
                    <SlidersHorizontal className="w-4 h-4 text-purple-600" />
                    Admin Control Center
                  </button>

                  <div className="border-t border-slate-100 mt-1"></div>

                  <button
                    onClick={() => {
                      onToggleLogin();
                      setShowUserMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 font-medium"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>

            {/* Mobile menu toggle */}
            <button
              id="mobile-nav-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>

        {/* Secondary Category Navigation Bar */}
        <div className="hidden md:flex items-center justify-between border-t border-slate-100 mt-2.5 pt-2 text-xs text-slate-600">
          <div className="flex items-center gap-8 sm:gap-10 overflow-x-auto no-scrollbar">
            <button 
              onClick={() => onNavigate('home')} 
              className={`py-1.5 tracking-wide font-normal transition-colors border-b-2 whitespace-nowrap ${
                currentScreen === 'home' 
                  ? 'text-blue-600 font-medium border-blue-600' 
                  : 'text-slate-600 hover:text-slate-900 border-transparent hover:border-slate-300'
              }`}
            >
              All Departments
            </button>
            <button 
              onClick={() => onNavigate('category', 'electronics')} 
              className="py-1.5 text-slate-600 hover:text-slate-900 tracking-wide font-normal transition-colors border-b-2 border-transparent hover:border-slate-300 whitespace-nowrap"
            >
              Laptops & Computers
            </button>
            <button 
              onClick={() => onNavigate('category', 'electronics')} 
              className="py-1.5 text-slate-600 hover:text-slate-900 tracking-wide font-normal transition-colors border-b-2 border-transparent hover:border-slate-300 whitespace-nowrap"
            >
              Smartphones & Audio
            </button>
            <button 
              onClick={() => onNavigate('category', 'accessories')} 
              className="py-1.5 text-slate-600 hover:text-slate-900 tracking-wide font-normal transition-colors border-b-2 border-transparent hover:border-slate-300 whitespace-nowrap"
            >
              Accessories & Bags
            </button>
            <button 
              onClick={() => onNavigate('category', 'home')} 
              className="py-1.5 text-slate-600 hover:text-slate-900 tracking-wide font-normal transition-colors border-b-2 border-transparent hover:border-slate-300 whitespace-nowrap"
            >
              Office & Home
            </button>
            <button 
              onClick={() => onNavigate('category', 'deals')} 
              className="py-1.5 text-blue-600 hover:text-blue-700 tracking-wide font-medium transition-colors border-b-2 border-transparent hover:border-blue-600 whitespace-nowrap"
            >
              Special Offers
            </button>
          </div>

          <div className="flex items-center gap-5 shrink-0 text-slate-500 text-xs tracking-wide">
            <span className="hover:text-slate-900 transition-colors cursor-pointer">Sell on IntelliCart</span>
            <div className="h-3 w-[1px] bg-slate-200" />
            <span className="hover:text-slate-900 transition-colors cursor-pointer">Gift Cards</span>
          </div>
        </div>

        {/* Mobile slide menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-100 mt-3 pt-3 space-y-2 text-sm text-slate-700">
            <button 
              onClick={() => { onNavigate('home'); setMobileMenuOpen(false); }}
              className="w-full text-left py-2 px-3 hover:bg-slate-50 rounded-lg font-semibold text-blue-600"
            >
              Home / Discovery
            </button>
            <button 
              onClick={() => { onNavigate('category', 'electronics'); setMobileMenuOpen(false); }}
              className="w-full text-left py-2 px-3 hover:bg-slate-50 rounded-lg"
            >
              Electronics & Laptops
            </button>
            <button 
              onClick={() => { onNavigate('category', 'accessories'); setMobileMenuOpen(false); }}
              className="w-full text-left py-2 px-3 hover:bg-slate-50 rounded-lg"
            >
              Accessories & Bags
            </button>
            <button 
              onClick={() => { onNavigate('category', 'home'); setMobileMenuOpen(false); }}
              className="w-full text-left py-2 px-3 hover:bg-slate-50 rounded-lg"
            >
              Home & Office
            </button>
            <button 
              onClick={() => { onNavigate('order-tracking'); setMobileMenuOpen(false); }}
              className="w-full text-left py-2 px-3 hover:bg-slate-50 rounded-lg"
            >
              Track Order Status
            </button>
            <button 
              onClick={() => { onNavigate('cart'); setMobileMenuOpen(false); }}
              className="w-full text-left py-2 px-3 hover:bg-slate-50 rounded-lg font-medium text-blue-700"
            >
              Shopping Cart ({cartCount})
            </button>
          </div>
        )}

      </div>
    </header>
  );
};
