import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useNotifications } from '../context/NotificationContext';
import { useLanguage } from '../context/LanguageContext';

export default function TopNavBar() {
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, loading, logout, isAuthenticated } = useAuth();
  const { wishlist, toggleWishlist } = useWishlist();
  const { notifications, markAllAsRead } = useNotifications();
  const [showWishlist, setShowWishlist] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const unreadCount = notifications.filter(n => n.unread).length;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery(''); // Optional: clear after search
    }
  };

  const displayName = user
    ? [user.first_name, user.last_name].filter(Boolean).join(' ') || user.email
    : '';

  return (
    <header
      className={`fixed top-0 w-full z-50 flex flex-col backdrop-blur-xl border-b border-outline-variant/30 h-[72px] justify-center transition-all duration-300 ${
        scrolled ? 'shadow-md bg-surface/95' : 'bg-surface/80 shadow-sm'
      }`}
      id="global-header"
    >
      <div className="max-w-container-max mx-auto w-full px-margin-mobile md:px-margin-desktop flex items-center justify-between">
        <div className="flex items-center gap-unit-md">
          {/* Hamburger Menu Icon for Mobile */}
          <button 
            onClick={() => { setShowMobileMenu(!showMobileMenu); setShowMobileSearch(false); setShowWishlist(false); setShowNotifications(false); }} 
            className="lg:hidden p-2 text-on-surface hover:bg-surface-variant/50 rounded-full transition-colors flex items-center justify-center"
            aria-label="Toggle navigation drawer"
          >
            <span className="material-symbols-outlined">{showMobileMenu ? 'close' : 'menu'}</span>
          </button>

          <Link
            to="/"
            className="flex items-center gap-2 font-bold text-on-surface tracking-tight"
          >
            <img src="/one8/logo.jpg" alt="One8 Logo" className="h-14 w-auto rounded object-contain" />
          </Link>
        </div>
        <div className="hidden md:flex items-center gap-unit-lg flex-1 justify-start ml-8 max-w-2xl px-unit-lg">
          <form onSubmit={handleSearch} className="relative w-full group">
            <span className="material-symbols-outlined absolute left-unit-sm top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-secondary-fixed transition-colors">
              search
            </span>
            <input
              className="w-full bg-surface-container-high border border-outline-variant/50 rounded-full py-2 pl-10 pr-4 text-body-md font-body-md text-on-surface focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/50 transition-all placeholder:text-on-surface-variant/50"
              placeholder={t('searchPlaceholder')}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <span
              className="material-symbols-outlined absolute right-unit-sm top-1/2 -translate-y-1/2 text-primary cursor-pointer hover:text-tertiary transition-colors"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              mic
            </span>
          </form>
        </div>
        <div className="flex items-center gap-unit-sm md:gap-unit-md text-primary dark:text-primary-fixed-dim">
          {/* Mobile Search Toggle */}
          <button 
            onClick={() => { setShowMobileSearch(!showMobileSearch); setShowMobileMenu(false); setShowWishlist(false); setShowNotifications(false); }}
            className={`p-2 hover:bg-surface-variant/50 rounded-full transition-colors md:hidden flex items-center justify-center ${showMobileSearch ? 'text-primary' : 'text-on-surface'}`}
            aria-label="Search"
          >
            <span className="material-symbols-outlined">{showMobileSearch ? 'close' : 'search'}</span>
          </button>

          {/* Language Selector Dropdown */}
          <div className="relative" onMouseLeave={() => setShowLanguageDropdown(false)}>
            <button 
              onClick={() => { setShowLanguageDropdown(!showLanguageDropdown); setShowWishlist(false); setShowNotifications(false); }}
              className="p-2 hover:bg-surface-variant/50 rounded-full transition-colors relative flex items-center justify-center text-on-surface"
              aria-label="Select Language"
            >
              <span className="material-symbols-outlined">language</span>
              <span className="ml-1 text-xs font-bold uppercase">{language}</span>
            </button>

            {showLanguageDropdown && (
              <div className="absolute right-0 mt-2 w-40 bg-surface-container-high border border-outline-variant/30 rounded-2xl p-2 shadow-2xl z-50 text-on-surface animate-fade-in">
                <div className="flex flex-col gap-1">
                  {[
                    { code: 'en', label: 'English' },
                    { code: 'ta', label: 'தமிழ்' },
                    { code: 'hi', label: 'हिन्दी' },
                    { code: 'es', label: 'Español' },
                    { code: 'fr', label: 'Français' }
                  ].map((lang) => (
                    <button 
                      key={lang.code}
                      onClick={() => { setLanguage(lang.code); setShowLanguageDropdown(false); }}
                      className={`px-3 py-2 rounded-xl text-left text-body-sm font-semibold transition-colors flex items-center justify-between ${language === lang.code ? 'bg-primary/20 text-primary' : 'hover:bg-surface-variant/50'}`}
                    >
                      <span>{lang.label}</span>
                      {language === lang.code && <span className="material-symbols-outlined text-sm">check</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {!loading && !isAuthenticated && (
            <div className="flex items-center gap-2 md:gap-4 ml-2">
              <Link
                to="/login"
                className="text-body-md font-bold text-on-surface hover:text-primary border border-outline-variant/50 rounded-full px-5 py-2 hover:border-primary transition-colors"
              >
                {t('login')}
              </Link>
              <Link
                to="/register"
                className="bg-primary text-on-primary text-body-md font-bold px-5 py-2 rounded-full hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
              >
                {t('register')}
              </Link>
            </div>
          )}
          {/* Wishlist Icon and Dropdown */}
          <div className="relative" onMouseLeave={() => setShowWishlist(false)}>
            <button 
              onClick={() => { setShowWishlist(!showWishlist); setShowNotifications(false); }}
              className={`p-2 hover:bg-surface-variant/50 rounded-full transition-colors relative flex items-center justify-center ${showWishlist ? 'text-primary' : 'text-on-surface'}`}
            >
              <span className="material-symbols-outlined" style={wishlist.length > 0 ? { fontVariationSettings: "'FILL' 1" } : {}}>favorite</span>
              {wishlist.length > 0 && (
                <span className="absolute top-0 right-0 w-4.5 h-4.5 bg-primary text-on-primary text-[8px] font-bold rounded-full flex items-center justify-center px-1">
                  {wishlist.length}
                </span>
              )}
            </button>

            {showWishlist && (
              <div className="absolute right-0 mt-2 w-80 bg-surface-container-high border border-outline-variant/30 rounded-2xl p-4 shadow-2xl z-50 text-on-surface animate-fade-in">
                <div className="flex justify-between items-center pb-2 border-b border-outline-variant/30 mb-3">
                  <span className="font-bold text-body-md flex items-center gap-1.5 text-on-surface">
                    <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                    My Wishlist ({wishlist.length})
                  </span>
                </div>
                {wishlist.length === 0 ? (
                  <p className="text-body-sm text-on-surface-variant/50 italic py-4 text-center">Your wishlist is empty.</p>
                ) : (
                  <div className="max-h-60 overflow-y-auto space-y-3 pr-1 scrollbar-hide">
                    {wishlist.map((item) => (
                      <div key={item.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-surface-variant/30 transition-colors group">
                        <div className="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center shrink-0 overflow-hidden border border-outline-variant/20">
                          {item.image_url ? (
                            <img src={item.image_url} alt={item.title} className="w-full h-full object-contain" />
                          ) : (
                            <span className="material-symbols-outlined text-on-surface-variant/40">image</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                          <p className="text-body-sm font-semibold truncate group-hover:text-primary transition-colors">{item.title}</p>
                          <p className="text-label-sm text-primary font-bold">₹{parseFloat(item.price).toLocaleString()}</p>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <button
                            onClick={() => {
                              navigate(`/product/${item.id}`);
                              setShowWishlist(false);
                            }}
                            className="text-primary hover:text-primary/80 transition-colors p-1"
                            title="View product"
                          >
                            <span className="material-symbols-outlined text-[18px]">visibility</span>
                          </button>
                          <button
                            onClick={() => toggleWishlist(item)}
                            className="text-on-surface-variant hover:text-error transition-colors p-1"
                            title="Remove"
                          >
                            <span className="material-symbols-outlined text-[18px]">close</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <Link
            to="/cart"
            className="p-2 hover:bg-surface-variant/50 rounded-full transition-colors relative flex items-center justify-center text-on-surface"
          >
            <span className="material-symbols-outlined">shopping_cart</span>
            <span className="absolute top-1 right-1 w-2 h-2 bg-tertiary rounded-full"></span>
          </Link>

          {/* Notifications Icon and Dropdown */}
          <div className="relative" onMouseLeave={() => setShowNotifications(false)}>
            <button 
              onClick={() => { setShowNotifications(!showNotifications); setShowWishlist(false); }}
              className={`p-2 hover:bg-surface-variant/50 rounded-full transition-colors relative flex items-center justify-center ${showNotifications ? 'text-secondary' : 'text-on-surface'}`}
            >
              <span className="material-symbols-outlined">notifications</span>
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 w-4.5 h-4.5 bg-secondary text-on-secondary text-[8px] font-bold rounded-full flex items-center justify-center px-1">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-surface-container-high border border-outline-variant/30 rounded-2xl p-4 shadow-2xl z-50 text-on-surface animate-fade-in">
                <div className="flex justify-between items-center pb-2 border-b border-outline-variant/30 mb-3">
                  <span className="font-bold text-body-md flex items-center gap-1.5 text-on-surface">
                    <span className="material-symbols-outlined text-secondary text-sm">notifications</span>
                    Notifications {unreadCount > 0 && `(${unreadCount})`}
                  </span>
                  {notifications.length > 0 && (
                    <button 
                      onClick={markAllAsRead} 
                      className="text-[10px] text-secondary hover:underline font-bold"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                {notifications.length === 0 ? (
                  <p className="text-body-sm text-on-surface-variant/50 italic py-4 text-center">No new notifications.</p>
                ) : (
                  <div className="max-h-60 overflow-y-auto space-y-3 pr-1 scrollbar-hide text-left">
                    {notifications.map((n) => (
                      <div key={n.id} className={`p-2.5 rounded-xl transition-colors relative border ${n.unread ? 'bg-secondary/5 border-secondary/15' : 'bg-transparent border-transparent'}`}>
                        {n.unread && (
                          <span className="absolute top-3 right-3 w-1.5 h-1.5 bg-secondary rounded-full"></span>
                        )}
                        <p className="text-body-xs font-bold text-on-surface pr-3">{n.title}</p>
                        <p className="text-[11px] text-on-surface-variant mt-0.5 leading-snug">{n.message}</p>
                        <span className="text-[9px] text-on-surface-variant/50 block mt-1.5 font-medium">{n.time}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          {!loading && isAuthenticated ? (
            <div className="flex items-center gap-2 ml-2">
              <Link
                to="/orders"
                className="hidden md:block p-2 hover:bg-surface-variant/50 rounded-full transition-colors text-on-surface"
                title="Orders"
              >
                <span className="material-symbols-outlined">receipt_long</span>
              </Link>
              <Link
                to="/profile"
                className="hidden md:flex flex-col items-end text-right max-w-[140px]"
                title={displayName}
              >
                <span className="text-label-sm font-semibold text-on-surface truncate w-full">
                  {displayName}
                </span>
                <span className="text-label-sm text-on-surface-variant">{user.role}</span>
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="text-label-sm font-semibold text-on-surface-variant hover:text-error px-2 py-1 rounded transition-colors"
              >
                {t('logout')}
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="w-8 h-8 rounded-full bg-surface-container-high border border-outline-variant/50 overflow-hidden ml-2 flex items-center justify-center md:hidden"
              aria-label="Sign in"
            >
              <span className="material-symbols-outlined text-on-surface-variant text-lg">person</span>
            </Link>
          )}
        </div>
      </div>

      {/* Mobile Search Bar Collapsible */}
      {showMobileSearch && (
        <div className="absolute top-[72px] left-0 w-full bg-surface/95 backdrop-blur-xl border-b border-outline-variant/30 px-margin-mobile py-3 md:hidden z-40 shadow-md animate-fade-in">
          <form onSubmit={(e) => { handleSearch(e); setShowMobileSearch(false); }} className="relative w-full group">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
              search
            </span>
            <input
              className="w-full bg-surface-container-high border border-outline-variant/50 rounded-full py-2 pl-9 pr-4 text-body-md text-on-surface focus:outline-none focus:border-secondary transition-all"
              placeholder={t('searchPlaceholder')}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
          </form>
        </div>
      )}

      {/* Mobile Menu Drawer */}
      {showMobileMenu && (
        <div className="fixed inset-0 top-[72px] bg-black/60 backdrop-blur-sm z-40 lg:hidden" onClick={() => setShowMobileMenu(false)}>
          <div 
            className="w-72 h-[calc(100vh-72px)] bg-surface-container-low border-r border-white/10 p-6 flex flex-col justify-between shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-6">
              <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                <div className="w-10 h-10 rounded-full bg-surface-container border border-primary flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-primary">person</span>
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-body-md font-bold text-on-surface truncate">
                    {isAuthenticated ? displayName : 'Guest User'}
                  </h4>
                  <p className="text-label-sm text-on-surface-variant uppercase tracking-wider text-[10px]">
                    {isAuthenticated ? user.role : 'Browse Catalog'}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Link to="/" onClick={() => setShowMobileMenu(false)} className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-colors ${location.pathname === '/' ? 'bg-secondary text-on-secondary font-bold shadow-md' : 'text-on-surface-variant hover:bg-surface-variant/50 hover:text-on-surface'}`}>
                  <span className="material-symbols-outlined">home</span> {t('home')}
                </Link>
                <Link to="/products" onClick={() => setShowMobileMenu(false)} className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-colors ${location.pathname.startsWith('/products') ? 'bg-secondary text-on-secondary font-bold shadow-md' : 'text-on-surface-variant hover:bg-surface-variant/50 hover:text-on-surface'}`}>
                  <span className="material-symbols-outlined">grid_view</span> {t('categories')}
                </Link>
                <Link to="/group-buy" onClick={() => setShowMobileMenu(false)} className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-colors ${location.pathname.startsWith('/group-buy') ? 'bg-secondary text-on-secondary font-bold shadow-md' : 'text-on-surface-variant hover:bg-surface-variant/50 hover:text-on-surface'}`}>
                  <span className="material-symbols-outlined">group</span> {t('groupBuy')}
                </Link>
                <Link to="/auctions" onClick={() => setShowMobileMenu(false)} className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-colors ${location.pathname.startsWith('/auctions') ? 'bg-secondary text-on-secondary font-bold shadow-md' : 'text-on-surface-variant hover:bg-surface-variant/50 hover:text-on-surface'}`}>
                  <span className="material-symbols-outlined">gavel</span> {t('auctions')}
                </Link>
                <Link to="/budget-builder" onClick={() => setShowMobileMenu(false)} className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-colors ${location.pathname.startsWith('/budget-builder') ? 'bg-secondary text-on-secondary font-bold shadow-md' : 'text-on-surface-variant hover:bg-surface-variant/50 hover:text-on-surface'}`}>
                  <span className="material-symbols-outlined">account_balance_wallet</span> {t('budgetBuilder')}
                </Link>
                <Link to="/ai-assistant" onClick={() => setShowMobileMenu(false)} className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${location.pathname === '/ai-assistant' ? 'bg-primary text-on-primary font-bold shadow-md' : 'bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20'}`}>
                  <span className="material-symbols-outlined">smart_toy</span> {t('aiAssistant')}
                </Link>

                {isAuthenticated && (user.role === 'SELLER' || user.role === 'ADMIN') && (
                  <Link to="/seller/dashboard" onClick={() => setShowMobileMenu(false)} className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-colors ${location.pathname.startsWith('/seller/dashboard') ? 'bg-secondary text-on-secondary font-bold shadow-md' : 'text-secondary hover:bg-surface-variant/50'}`}>
                    <span className="material-symbols-outlined">add_business</span> {t('sellerDashboard')}
                  </Link>
                )}
                {isAuthenticated && user.role === 'ADMIN' && (
                  <Link to="/admin/dashboard" onClick={() => setShowMobileMenu(false)} className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-colors ${location.pathname.startsWith('/admin/dashboard') ? 'bg-error/20 text-error font-bold' : 'text-error hover:bg-error/10'}`}>
                    <span className="material-symbols-outlined">admin_panel_settings</span> {t('adminPanel')}
                  </Link>
                )}
              </div>
            </div>

            <div className="border-t border-white/10 pt-4 mt-auto space-y-2">
              {isAuthenticated ? (
                <>
                  <Link to="/profile" onClick={() => setShowMobileMenu(false)} className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-colors ${location.pathname === '/profile' ? 'bg-secondary text-on-secondary font-bold shadow-md' : 'text-on-surface hover:bg-surface-variant/50'}`}>
                    <span className="material-symbols-outlined">account_circle</span> {t('viewProfile')}
                  </Link>
                  <Link to="/orders" onClick={() => setShowMobileMenu(false)} className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-colors ${location.pathname === '/orders' ? 'bg-secondary text-on-secondary font-bold shadow-md' : 'text-on-surface hover:bg-surface-variant/50'}`}>
                    <span className="material-symbols-outlined">receipt_long</span> {t('myOrders')}
                  </Link>
                  <button onClick={() => { handleLogout(); setShowMobileMenu(false); }} className="w-full flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-error/10 text-error transition-colors text-left font-semibold">
                    <span className="material-symbols-outlined">logout</span> {t('logout')}
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link to="/login" onClick={() => setShowMobileMenu(false)} className="px-4 py-2 text-center rounded-full border border-outline-variant/50 hover:border-primary text-on-surface transition-colors text-sm font-bold">
                    Sign In
                  </Link>
                  <Link to="/register" onClick={() => setShowMobileMenu(false)} className="px-4 py-2 text-center rounded-full bg-primary hover:bg-primary/90 text-on-primary transition-colors text-sm font-bold">
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
