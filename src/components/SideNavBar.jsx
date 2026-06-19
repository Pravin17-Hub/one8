import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function SideNavBar() {
  const location = useLocation();
  const { user } = useAuth();
  const { t } = useLanguage();

  const navItems = [
    { key: 'home', name: 'Home', icon: 'home', path: '/' },
    { key: 'categories', name: 'Categories', icon: 'grid_view', path: '/products' },
    { key: 'groupBuy', name: 'Group Buy', icon: 'group', path: '/group-buy' },
    { key: 'auctions', name: 'Auctions', icon: 'gavel', path: '/auctions' },
    { key: 'budgetBuilder', name: 'Budget Builder', icon: 'account_balance_wallet', path: '/budget-builder' },
  ];
  
  if (user && (user.role === 'SELLER' || user.role === 'ADMIN')) {
    navItems.push({ key: 'addProducts', name: 'Add Products', icon: 'add_business', path: '/seller/dashboard' });
  }
  if (user && user.role === 'ADMIN') {
    navItems.push({ key: 'adminPanel', name: 'Admin Panel', icon: 'admin_panel_settings', path: '/admin/dashboard' });
  }

  return (
    <nav className="hidden lg:flex flex-col py-6 bg-surface-container-low dark:bg-surface-container-low h-[calc(100vh-72px)] w-64 docked left-0 border-r border-white/5 shadow-xl fixed top-[72px] overflow-y-auto scrollbar-hide z-40">
      <div className="flex-1 px-4 space-y-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path === '/products' && location.pathname.startsWith('/products'));
          return (
            <Link 
              key={item.key}
              to={item.path}
              className={isActive 
                ? "bg-secondary text-on-secondary rounded-xl px-4 py-3 flex items-center gap-4 transition-transform shadow-md font-bold"
                : "text-on-surface-variant hover:bg-surface-variant/50 hover:text-on-surface rounded-xl px-4 py-3 flex items-center gap-4 transition-colors duration-200"}
            >
              <span className="material-symbols-outlined text-2xl" style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}>{item.icon}</span>
              <span className="text-body-md tracking-wide">{t(item.key)}</span>
            </Link>
          );
        })}
      </div>
      <div className="px-4 mt-auto pb-4">
        <Link to="/ai-assistant" className="w-full bg-primary/10 hover:bg-primary/20 border border-primary/30 rounded-xl py-3 px-4 flex items-center justify-center gap-2 transition-all group">
          <span className="material-symbols-outlined text-primary">smart_toy</span>
          <span className="text-body-md font-bold text-primary">{t('aiAssistant')}</span>
        </Link>
      </div>
    </nav>
  );
}
