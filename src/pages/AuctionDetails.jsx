import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function AuctionDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [auction, setAuction] = useState(null);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bidAmount, setBidAmount] = useState('');
  const [placingBid, setPlacingBid] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ hours: 0, mins: 0, secs: 0 });

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000); // Polling every 5 seconds for live feel
    return () => clearInterval(interval);
  }, [id]);

  useEffect(() => {
    if (!auction) return;
    const updateCountdown = () => {
      const diff = new Date(auction.ends_at).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft({ hours: 0, mins: 0, secs: 0 });
      } else {
        setTimeLeft({
          hours: Math.floor(diff / (1000 * 60 * 60)),
          mins: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
          secs: Math.floor((diff % (1000 * 60)) / 1000)
        });
      }
    };
    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [auction]);

  const fetchData = async () => {
    try {
      const [auctionRes, bidsRes] = await Promise.all([
        api.get(`/auctions/${id}`),
        api.get(`/auctions/${id}/bids`)
      ]);
      setAuction(auctionRes.data);
      setBids(bidsRes.data);
      
      // Auto-set the input to current bid + 10 if it's empty or smaller
      setBidAmount(prev => {
        const nextMin = parseFloat(auctionRes.data.current_highest_bid) + 10;
        return (!prev || parseFloat(prev) < nextMin) ? nextMin.toFixed(2) : prev;
      });
    } catch (error) {
      console.error('Failed to fetch auction details', error);
      if (error.response?.status === 404) navigate('/auctions');
    } finally {
      setLoading(false);
    }
  };

  const handleBid = async () => {
    if (!user) {
      alert('Please log in to place a bid.');
      navigate('/login');
      return;
    }
    setPlacingBid(true);
    try {
      const res = await api.post(`/auctions/${id}/bid`, { bidAmount });
      alert(res.data.message);
      fetchData(); // Refresh immediately
    } catch (error) {
      console.error('Bid failed', error);
      alert(error.response?.data?.error || 'Failed to place bid.');
    } finally {
      setPlacingBid(false);
    }
  };

  if (loading && !auction) {
    return <main className="flex-1 lg:ml-64 p-margin-mobile md:p-margin-desktop min-h-screen flex items-center justify-center"><span className="material-symbols-outlined animate-spin text-4xl text-tertiary">autorenew</span></main>;
  }

  const isLive = new Date(auction.ends_at).getTime() > Date.now();

  return (
    <main className="flex-1 lg:ml-64 p-margin-mobile md:p-margin-desktop min-h-[calc(100vh-72px)] pb-24">
      <Link to="/auctions" className="flex items-center gap-2 text-on-surface-variant hover:text-on-surface mb-8 transition-colors">
        <span className="material-symbols-outlined">arrow_back</span>
        Back to Auctions
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Image Section */}
        <div className="h-[400px] md:h-[600px] glass-card rounded-3xl overflow-hidden border border-outline-variant/30 relative bg-surface-container flex items-center justify-center">
          {isLive && (
            <div className="absolute top-6 left-6 bg-tertiary/90 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-2 shadow-lg border border-tertiary/20 z-20">
              <span className="material-symbols-outlined text-sm text-tertiary-container animate-pulse">sensors</span>
              <span className="text-xs font-bold text-tertiary-container tracking-wider uppercase">Live</span>
            </div>
          )}
          {auction.image_url ? (
            <img src={auction.image_url} alt={auction.title} className="w-full h-full object-contain mix-blend-multiply" />
          ) : (
            <span className="material-symbols-outlined text-[120px] text-on-surface-variant/40">image</span>
          )}
        </div>

        {/* Details Section */}
        <div className="flex flex-col">
          <h1 className="text-display-sm font-display-sm text-on-surface mb-4">{auction.title}</h1>
          <p className="text-body-lg leading-relaxed whitespace-pre-wrap text-on-surface-variant mb-8">
            {auction.description}
          </p>

          <div className="glass-card rounded-3xl p-6 md:p-8 border border-tertiary/20 mb-8 relative overflow-hidden">
             {isLive && <div className="absolute inset-0 bg-tertiary/5 animate-pulse"></div>}
             <div className="relative z-10 flex flex-col md:flex-row justify-between md:items-end gap-6 mb-8">
               <div>
                 <p className="text-label-md text-on-surface-variant uppercase tracking-wider mb-2 font-bold">Current Highest Bid</p>
                 <p className="text-display-md font-bold text-tertiary">₹{parseFloat(auction.current_highest_bid).toFixed(2)}</p>
               </div>
               <div className="text-left md:text-right">
                 <p className="text-label-sm text-on-surface-variant uppercase tracking-wider mb-2">Time Remaining</p>
                 <div className="flex items-center gap-2 text-headline-md font-bold text-on-surface">
                   <span className="bg-surface-container-high px-3 py-1 rounded-lg border border-outline-variant/30">{String(timeLeft.hours).padStart(2, '0')}</span>:
                   <span className="bg-surface-container-high px-3 py-1 rounded-lg border border-outline-variant/30">{String(timeLeft.mins).padStart(2, '0')}</span>:
                   <span className="bg-surface-container-high px-3 py-1 rounded-lg border border-outline-variant/30">{String(timeLeft.secs).padStart(2, '0')}</span>
                 </div>
               </div>
             </div>

             {isLive ? (
               <div className="relative z-10">
                 <div className="flex gap-4">
                    <div className="relative flex-1">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold">₹</span>
                      <input 
                        type="number"
                        step="0.01"
                        value={bidAmount}
                        onChange={(e) => setBidAmount(e.target.value)}
                        className="w-full bg-surface-container-high border border-outline-variant/50 rounded-xl py-4 pl-10 pr-4 text-headline-sm text-on-surface outline-none focus:border-tertiary focus:ring-1 focus:ring-tertiary/50 transition-all font-bold"
                      />
                    </div>
                    <button 
                      onClick={handleBid}
                      disabled={placingBid}
                      className="bg-tertiary hover:bg-tertiary/90 text-tertiary-container font-bold px-8 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 text-title-md"
                    >
                      {placingBid ? <span className="material-symbols-outlined animate-spin">autorenew</span> : 'Place Bid'}
                    </button>
                 </div>
                 <p className="text-label-sm text-on-surface-variant mt-3 text-center">Enter ₹{((parseFloat(auction.current_highest_bid)) + 10).toFixed(2)} or more to outbid.</p>
               </div>
             ) : (
               <div className="bg-error/20 border border-error/30 text-error p-4 rounded-xl text-center font-bold relative z-10">
                 This auction has ended.
               </div>
             )}
          </div>

          <div className="glass-card rounded-2xl border border-outline-variant/30 overflow-hidden">
            <div className="bg-surface-container-high px-6 py-4 border-b border-outline-variant/30">
              <h2 className="text-title-md font-bold text-on-surface">Bid History</h2>
            </div>
            {bids.length === 0 ? (
              <p className="p-6 text-body-md text-on-surface-variant text-center">No bids yet. Be the first to bid!</p>
            ) : (
              <ul className="divide-y divide-outline-variant/20 max-h-[400px] overflow-y-auto">
                {bids.map((b, i) => (
                  <li key={b.id} className={`flex justify-between items-center px-6 py-4 ${i === 0 ? 'bg-tertiary/5' : ''}`}>
                    <div className="flex items-center gap-3">
                      {i === 0 && <span className="material-symbols-outlined text-tertiary text-[18px]">verified</span>}
                      <span className={`text-body-md ${i === 0 ? 'font-bold text-on-surface' : 'text-on-surface-variant'}`}>
                        {b.first_name} {b.last_name?.charAt(0)}.
                      </span>
                    </div>
                    <div className="text-right">
                      <span className={`font-bold ${i === 0 ? 'text-tertiary text-title-md' : 'text-on-surface'}`}>₹{parseFloat(b.bid_amount).toFixed(2)}</span>
                      <p className="text-label-sm text-on-surface-variant">{new Date(b.created_at).toLocaleTimeString()}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

        </div>
      </div>
    </main>
  );
}
