import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function GroupBuy() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joiningId, setJoiningId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async (search = '') => {
    setLoading(true);
    try {
      let endpoint = '/group-buy';
      if (search) {
        endpoint += `?search=${encodeURIComponent(search)}`;
      }
      const res = await api.get(endpoint);
      setSessions(res.data);
    } catch (error) {
      console.error('Failed to fetch group buy sessions', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchSessions(searchQuery.trim());
  };

  const handleJoin = async (sessionId) => {
    if (!user) {
      alert('Please log in to join a group buy.');
      navigate('/login');
      return;
    }
    
    setJoiningId(sessionId);
    try {
      const res = await api.post(`/group-buy/${sessionId}/join`);
      alert(res.data.message);
      // Refresh data
      await fetchSessions(searchQuery.trim());
    } catch (error) {
      console.error('Join failed', error);
      alert(error.response?.data?.error || 'Failed to join group buy.');
    } finally {
      setJoiningId(null);
    }
  };

  if (loading) {
    return <main className="flex-1 lg:ml-64 p-margin-mobile md:p-margin-desktop min-h-screen flex items-center justify-center"><span className="material-symbols-outlined animate-spin text-4xl text-secondary">autorenew</span></main>;
  }

  return (
    <main className="flex-1 lg:ml-64 p-margin-mobile md:p-margin-desktop min-h-[calc(100vh-72px)]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4 border-b border-white/10 pb-8">
        <div>
           <div className="flex items-center gap-3 mb-2">
             <span className="material-symbols-outlined text-4xl text-secondary">groups</span>
             <h1 className="text-display-sm font-display-sm text-on-surface">Group Buy</h1>
           </div>
           <p className="text-body-lg text-on-surface-variant max-w-2xl">
             Team up with the community to hit target quantities and unlock massive wholesale discounts on premium products.
           </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <input 
            type="text" 
            placeholder="Search deals (typo protection active)..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface-container-high border border-outline-variant/50 rounded-full py-2.5 pl-11 pr-4 text-on-surface outline-none focus:border-secondary transition-colors text-body-sm font-semibold"
          />
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">search</span>
          <button type="submit" className="hidden">Search</button>
        </form>
      </div>

      {sessions.length === 0 ? (
        <div className="glass-card p-12 rounded-3xl text-center flex flex-col items-center">
          <span className="material-symbols-outlined text-[64px] text-on-surface-variant mb-4">event_busy</span>
          <h2 className="text-title-lg text-on-surface mb-2">
            {searchQuery ? 'No matching deals found' : 'No active deals right now'}
          </h2>
          <p className="text-body-md text-on-surface-variant">
            {searchQuery 
              ? `We couldn't find any active group buys matching "${searchQuery}".`
              : 'Check back later when sellers initiate new group buy sessions.'}
          </p>
          {searchQuery && (
            <button 
              type="button"
              onClick={() => { setSearchQuery(''); fetchSessions(''); }} 
              className="mt-6 text-secondary font-bold hover:underline"
            >
              Clear Search
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {sessions.map(session => {
            const progress = (session.current_quantity / session.target_quantity) * 100;
            const timeLeft = new Date(session.expires_at).getTime() - Date.now();
            const hoursLeft = Math.max(0, Math.floor(timeLeft / (1000 * 60 * 60)));
            const discountPercent = Math.round((1 - (session.discount_price / session.original_price)) * 100);

            return (
              <div 
                key={session.id} 
                onClick={() => navigate(`/group-buy/${session.id}`)}
                className="glass-card rounded-3xl overflow-hidden border border-white/10 hover:border-secondary/50 transition-colors group flex flex-col cursor-pointer"
              >
                <div className="h-48 bg-surface-container relative flex items-center justify-center overflow-hidden">
                  {session.image_url ? (
                    <img src={session.image_url} alt={session.title} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 mix-blend-multiply" />
                  ) : (
                    <span className="material-symbols-outlined text-6xl text-on-surface-variant/30 group-hover:scale-110 transition-transform duration-500">image</span>
                  )}
                  
                  <div className="absolute top-4 right-4 bg-error/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-white shadow-lg border border-white/20 animate-pulse">
                    Ends in {hoursLeft}h
                  </div>
                  <div className="absolute top-4 left-4 bg-secondary/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-secondary-container shadow-lg border border-white/20">
                    {discountPercent}% OFF
                  </div>
                </div>
                
                <div className="p-6 flex flex-col flex-1">
                  <h3 className="text-title-lg font-title-lg text-on-surface mb-2 line-clamp-1 group-hover:text-secondary transition-colors">{session.title}</h3>
                  <p className="text-body-sm text-on-surface-variant line-clamp-2 mb-6">{session.description}</p>
                  
                  <div className="mt-auto">
                    <div className="flex justify-between items-end mb-2">
                      <span className="text-label-md font-bold text-on-surface">{session.current_quantity} joined</span>
                      <span className="text-label-sm text-on-surface-variant">Target: {session.target_quantity}</span>
                    </div>
                    <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden mb-6 border border-white/5">
                      <div 
                        className="h-full bg-secondary transition-all duration-1000 ease-out"
                        style={{ width: `${Math.min(100, progress)}%` }}
                      ></div>
                    </div>

                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <p className="text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">Group Buy</p>
                        <p className="text-headline-md font-bold text-secondary">₹{parseFloat(session.discount_price).toFixed(2)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">Original</p>
                        <p className="text-title-md text-on-surface line-through">₹{parseFloat(session.original_price).toFixed(2)}</p>
                      </div>
                    </div>

                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/group-buy/${session.id}`);
                      }}
                      className="w-full bg-secondary hover:bg-secondary/90 text-on-secondary font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all"
                    >
                      <span className="material-symbols-outlined">group_add</span>
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
