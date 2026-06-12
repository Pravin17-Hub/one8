import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function Auctions() {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bidAmounts, setBidAmounts] = useState({});
  const [biddingId, setBiddingId] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchAuctions();
    
    // In a real app we would use WebSockets here for live updates.
    // For now we'll just poll every 10 seconds.
    const interval = setInterval(fetchAuctions, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchAuctions = async () => {
    try {
      const res = await api.get('/auctions');
      setAuctions(res.data);
      
      // Initialize bid inputs if not already set
      setBidAmounts(prev => {
        const newBids = { ...prev };
        res.data.forEach(a => {
          if (!newBids[a.id]) {
             newBids[a.id] = (parseFloat(a.current_highest_bid) + 10).toFixed(2);
          }
        });
        return newBids;
      });
    } catch (error) {
      console.error('Failed to fetch auctions', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBid = async (auctionId, amount) => {
    if (!user) {
      alert('Please log in to place a bid.');
      navigate('/login');
      return;
    }

    setBiddingId(auctionId);
    try {
      const res = await api.post(`/auctions/${auctionId}/bid`, { bidAmount: amount });
      alert(res.data.message);
      
      // Optimistically update the UI before the next poll
      setAuctions(prev => prev.map(a => 
        a.id === auctionId ? { ...a, current_highest_bid: amount } : a
      ));
      setBidAmounts(prev => ({...prev, [auctionId]: (parseFloat(amount) + 10).toFixed(2)}));
      
    } catch (error) {
      console.error('Bid failed', error);
      alert(error.response?.data?.error || 'Failed to place bid.');
    } finally {
      setBiddingId(null);
    }
  };

  if (loading) {
    return <main className="flex-1 lg:ml-64 p-margin-mobile md:p-margin-desktop min-h-screen flex items-center justify-center"><span className="material-symbols-outlined animate-spin text-4xl text-tertiary">autorenew</span></main>;
  }

  return (
    <main className="flex-1 lg:ml-64 p-margin-mobile md:p-margin-desktop min-h-[calc(100vh-72px)]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4 border-b border-white/10 pb-8">
        <div>
           <div className="flex items-center gap-3 mb-2">
             <span className="material-symbols-outlined text-4xl text-tertiary">gavel</span>
             <h1 className="text-display-sm font-display-sm text-on-surface">Live Auctions</h1>
           </div>
           <p className="text-body-lg text-on-surface-variant max-w-2xl">
             Bid on exclusive, limited-edition drops in real time. The highest bidder takes it all.
           </p>
        </div>
      </div>

      {auctions.length === 0 ? (
        <div className="glass-card p-12 rounded-3xl text-center flex flex-col items-center">
          <span className="material-symbols-outlined text-[64px] text-on-surface-variant mb-4">event_busy</span>
          <h2 className="text-title-lg text-on-surface mb-2">The auction block is empty</h2>
          <p className="text-body-md text-on-surface-variant">Check back later for new exclusive drops.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {auctions.map(auction => {
            const timeLeft = new Date(auction.ends_at).getTime() - Date.now();
            const hoursLeft = Math.max(0, Math.floor(timeLeft / (1000 * 60 * 60)));
            const minsLeft = Math.max(0, Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60)));

            return (
                <div key={auction.id} onClick={() => navigate(`/auctions/${auction.id}`)} className="glass-card rounded-3xl overflow-hidden border border-white/10 hover:border-tertiary/50 transition-colors group flex flex-col relative cursor-pointer">
                
                <div className="h-64 bg-surface-container relative flex items-center justify-center overflow-hidden">
                   {/* Cool pulse effect for live auctions */}
                   <div className="absolute inset-0 bg-tertiary/5 animate-pulse"></div>
                   {auction.image_url ? (
                     <img src={auction.image_url} alt={auction.title} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 relative z-10 mix-blend-multiply" />
                   ) : (
                     <span className="material-symbols-outlined text-[80px] text-on-surface-variant/30 group-hover:scale-110 transition-transform duration-500 relative z-10">image</span>
                   )}
                   
                   <div className="absolute top-4 left-4 bg-tertiary/90 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-2 shadow-lg border border-white/20 z-20">
                     <span className="material-symbols-outlined text-sm text-tertiary-container animate-pulse">sensors</span>
                     <span className="text-xs font-bold text-tertiary-container tracking-wider uppercase">Live Now</span>
                   </div>
                   
                   <div className="absolute top-4 right-4 glass-card px-3 py-1 rounded-full text-xs font-bold text-on-surface shadow-lg border border-white/20 z-20 flex items-center gap-1">
                     <span className="material-symbols-outlined text-sm">schedule</span>
                     {hoursLeft}h {minsLeft}m
                   </div>
                </div>

                <div className="p-6 flex flex-col flex-1">
                  <h3 className="text-title-lg font-title-lg text-on-surface mb-2 line-clamp-1 group-hover:text-tertiary transition-colors">{auction.title}</h3>
                  <p className="text-body-sm text-on-surface-variant line-clamp-2 mb-6">{auction.description}</p>
                  
                  <div className="mt-auto bg-surface-container-high rounded-2xl p-4 border border-white/5">
                     <div className="flex justify-between items-center mb-4">
                       <div>
                         <p className="text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">Current Bid</p>
                         <p className="text-headline-md font-bold text-tertiary">₹{parseFloat(auction.current_highest_bid).toFixed(2)}</p>
                       </div>
                       <div className="text-right">
                         <p className="text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">Starting Price</p>
                         <p className="text-body-md text-on-surface">₹{parseFloat(auction.starting_price).toFixed(2)}</p>
                       </div>
                     </div>

                     <button 
                       onClick={(e) => {
                         e.stopPropagation();
                         navigate(`/auctions/${auction.id}`);
                       }}
                       className="w-full bg-tertiary hover:bg-tertiary/90 text-tertiary-container font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all"
                     >
                       <span className="material-symbols-outlined">gavel</span>
                       Join Auction
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
