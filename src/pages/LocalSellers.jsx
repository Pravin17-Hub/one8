import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

export default function LocalSellers() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cityQuery, setCityQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchSellers();
  }, []);

  const fetchSellers = async (city = '') => {
    setLoading(true);
    try {
      const endpoint = city ? `/local-sellers?city=${encodeURIComponent(city)}` : '/local-sellers';
      const res = await api.get(endpoint);
      setStores(res.data);
    } catch (error) {
      console.error('Failed to load local sellers', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchSellers(cityQuery);
  };

  return (
    <main className="flex-1 lg:ml-64 p-margin-mobile md:p-margin-desktop min-h-[calc(100vh-72px)]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
        <div>
           <div className="flex items-center gap-3 mb-2">
             <span className="material-symbols-outlined text-4xl text-[#10B981]">store</span>
             <h1 className="text-display-sm font-display-sm text-on-surface">Local Discovery</h1>
           </div>
           <p className="text-body-lg text-on-surface-variant max-w-2xl">
             Find top-rated sellers in your neighborhood for same-day pickup and exclusive local deals.
           </p>
        </div>
        
        <form onSubmit={handleSearch} className="relative w-full md:w-96">
          <input 
            type="text" 
            placeholder="Enter your city (e.g. New York)" 
            value={cityQuery}
            onChange={(e) => setCityQuery(e.target.value)}
            className="w-full bg-surface-container-high border border-white/10 rounded-full py-4 pl-12 pr-32 text-on-surface outline-none focus:border-[#10B981] transition-colors shadow-lg"
          />
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">location_on</span>
          <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#10B981] hover:bg-[#059669] text-white px-4 py-2 rounded-full font-bold transition-colors">
            Find
          </button>
        </form>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center h-64">
          <span className="material-symbols-outlined animate-spin text-4xl text-[#10B981]">autorenew</span>
        </div>
      ) : stores.length === 0 ? (
        <div className="glass-card p-12 rounded-3xl text-center flex flex-col items-center border border-white/5">
          <span className="material-symbols-outlined text-[64px] text-on-surface-variant mb-4">location_off</span>
          <h2 className="text-title-lg text-on-surface mb-2">No local sellers found</h2>
          <p className="text-body-md text-on-surface-variant">We couldn't find any sellers in "{cityQuery}". Try another city.</p>
          {cityQuery && (
            <button onClick={() => { setCityQuery(''); fetchSellers(''); }} className="mt-6 text-[#10B981] font-bold hover:underline">
              View All Areas
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {stores.map(store => (
            <div key={store.id} className="glass-card rounded-3xl p-6 md:p-8 border border-white/10 hover:border-[#10B981]/50 transition-colors group">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-6 mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-surface-container border border-white/5 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-3xl text-on-surface-variant">storefront</span>
                  </div>
                  <div>
                    <h3 className="text-title-lg font-title-lg text-on-surface mb-1 flex items-center gap-2">
                       {store.name}
                       {store.rating >= 4.5 && <span className="material-symbols-outlined text-[#F59E0B] text-[20px]" title="Top Rated Seller">verified</span>}
                    </h3>
                    <p className="text-body-sm text-on-surface-variant flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">location_on</span>
                      {store.city}, {store.state}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 bg-surface-container-high px-4 py-2 rounded-full border border-white/5">
                  <span className="material-symbols-outlined text-[#F59E0B]">star</span>
                  <span className="font-bold text-on-surface">{store.rating}</span>
                </div>
              </div>

              <div>
                <h4 className="text-label-md text-on-surface-variant uppercase tracking-wider mb-4">Top Inventory Preview</h4>
                {store.preview_products && store.preview_products.length > 0 ? (
                  <div className="grid grid-cols-3 gap-4">
                    {store.preview_products.map(product => (
                      <div key={product.id} onClick={() => navigate(`/product/${product.id}`)} className="cursor-pointer group/item">
                        <div className="aspect-square bg-surface-container rounded-xl flex items-center justify-center border border-white/5 group-hover/item:border-[#10B981]/30 transition-colors mb-2 overflow-hidden">
                           <span className="material-symbols-outlined text-4xl text-on-surface-variant/30 group-hover/item:scale-110 transition-transform">image</span>
                        </div>
                        <p className="text-label-sm text-on-surface line-clamp-1 group-hover/item:text-[#10B981] transition-colors">{product.title}</p>
                        <p className="text-label-sm font-bold text-primary">₹{parseFloat(product.price).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-body-sm text-on-surface-variant italic">This store hasn't listed any items yet.</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
