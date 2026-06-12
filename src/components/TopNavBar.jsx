import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useNotifications } from '../context/NotificationContext';

export default function TopNavBar() {
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, loading, logout, isAuthenticated } = useAuth();
  const { wishlist, toggleWishlist } = useWishlist();
  const { notifications, markAllAsRead } = useNotifications();
  const [showWishlist, setShowWishlist] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();

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
              placeholder="Search products, brands, or ask AI..."
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
          {!loading && !isAuthenticated && (
            <div className="flex items-center gap-2 md:gap-4 ml-2">
              <Link
                to="/login"
                className="text-body-md font-bold text-on-surface hover:text-primary border border-outline-variant/50 rounded-full px-5 py-2 hover:border-primary transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="bg-primary text-on-primary text-body-md font-bold px-5 py-2 rounded-full hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
              >
                Register
              </Link>
            </div>
          )}
          {/* Wishlist Icon and Dropdown */}
          <div className="relative">
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
            className="p-2 hover:bg-surface-variant/50 rounded-full transition-colors relative flex items-center justify-center"
          >
            <span className="material-symbols-outlined">shopping_cart</span>
            <span className="absolute top-1 right-1 w-2 h-2 bg-tertiary rounded-full"></span>
          </Link>

          {/* Notifications Icon and Dropdown */}
          <div className="relative">
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
                className="hidden md:block p-2 hover:bg-surface-variant/50 rounded-full transition-colors"
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
                Logout
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
    </header>
  );
}
