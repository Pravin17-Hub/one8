import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function GroupBuyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // Polling every 10 seconds
    return () => clearInterval(interval);
  }, [id]);

  useEffect(() => {
    if (!session) return;
    const updateCountdown = () => {
      const diff = new Date(session.expires_at).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, mins: 0, secs: 0 });
      } else {
        setTimeLeft({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          mins: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
          secs: Math.floor((diff % (1000 * 60)) / 1000)
        });
      }
    };
    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [session]);

  const fetchData = async () => {
    try {
      const res = await api.get(`/group-buy/${id}`);
      setSession(res.data);
    } catch (error) {
      console.error('Failed to fetch group buy details', error);
      if (error.response?.status === 404) navigate('/group-buy');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!user) {
      alert('Please log in to join a group buy.');
      navigate('/login');
      return;
    }
    setJoining(true);
    try {
      const res = await api.post(`/group-buy/${id}/join`);
      alert(res.data.message);
      fetchData();
    } catch (error) {
      console.error('Failed to join', error);
      alert(error.response?.data?.error || 'Failed to join group buy.');
    } finally {
      setJoining(false);
    }
  };

  if (loading && !session) {
    return <main className="flex-1 lg:ml-64 p-margin-mobile md:p-margin-desktop min-h-screen flex items-center justify-center"><span className="material-symbols-outlined animate-spin text-4xl text-secondary">autorenew</span></main>;
  }

  const isLive = new Date(session.expires_at).getTime() > Date.now() && session.status === 'ACTIVE';
  const progressPercent = Math.min(100, (session.current_quantity / session.target_quantity) * 100);
  const remainingSlots = Math.max(0, session.target_quantity - session.current_quantity);

  return (
    <main className="flex-1 lg:ml-64 p-margin-mobile md:p-margin-desktop min-h-[calc(100vh-72px)] pb-24">
      <Link to="/group-buy" className="flex items-center gap-2 text-on-surface-variant hover:text-on-surface mb-8 transition-colors">
        <span className="material-symbols-outlined">arrow_back</span>
        Back to Group Buys
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Image Section */}
        <div className="h-[400px] md:h-[600px] glass-card rounded-3xl overflow-hidden border border-outline-variant/30 relative bg-surface-container flex items-center justify-center">
          {session.status === 'ACTIVE' ? (
             <div className="absolute top-6 left-6 bg-secondary/90 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-2 shadow-lg border border-white/20 z-20">
               <span className="material-symbols-outlined text-sm text-on-secondary">groups</span>
               <span className="text-xs font-bold text-on-secondary tracking-wider uppercase">Active Session</span>
             </div>
          ) : (
             <div className="absolute top-6 left-6 bg-error/90 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-2 shadow-lg border border-white/20 z-20">
               <span className="text-xs font-bold text-white tracking-wider uppercase">Ended</span>
             </div>
          )}
          {session.image_url ? (
            <img src={session.image_url} alt={session.title} className="w-full h-full object-contain mix-blend-multiply" />
          ) : (
            <span className="material-symbols-outlined text-[120px] text-on-surface-variant/40">image</span>
          )}
        </div>

        {/* Details Section */}
        <div className="flex flex-col">
          <h1 className="text-display-sm font-display-sm text-on-surface mb-4">{session.title}</h1>
          <p className="text-body-lg leading-relaxed whitespace-pre-wrap text-on-surface-variant mb-8">
            {session.description}
          </p>

          <div className="glass-card rounded-3xl p-6 md:p-8 border border-secondary/20 mb-8">
            <div className="flex flex-col md:flex-row justify-between mb-8 gap-6">
              <div>
                <p className="text-label-md text-on-surface-variant uppercase tracking-wider mb-2 font-bold">Group Buy Price</p>
                <div className="flex items-center gap-3">
                  <p className="text-display-sm font-bold text-secondary">₹{parseFloat(session.discount_price).toFixed(2)}</p>
                  <p className="text-title-lg text-on-surface-variant line-through">₹{parseFloat(session.original_price).toFixed(2)}</p>
                </div>
              </div>
              <div className="text-left md:text-right">
                <p className="text-label-sm text-on-surface-variant uppercase tracking-wider mb-2">Time Remaining</p>
                <div className="flex items-center gap-2 text-headline-md font-bold text-on-surface">
                  {timeLeft.days > 0 && <><span className="bg-surface-container-high px-3 py-1 rounded-lg border border-outline-variant/30">{String(timeLeft.days).padStart(2, '0')}d</span> :</>}
                  <span className="bg-surface-container-high px-3 py-1 rounded-lg border border-outline-variant/30">{String(timeLeft.hours).padStart(2, '0')}</span>:
                  <span className="bg-surface-container-high px-3 py-1 rounded-lg border border-outline-variant/30">{String(timeLeft.mins).padStart(2, '0')}</span>:
                  <span className="bg-surface-container-high px-3 py-1 rounded-lg border border-outline-variant/30">{String(timeLeft.secs).padStart(2, '0')}</span>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <div className="flex justify-between items-end mb-2">
                <span className="text-label-md font-bold text-on-surface">{session.current_quantity} joined</span>
                <span className="text-label-sm text-on-surface-variant">Target: {session.target_quantity}</span>
              </div>
              <div className="w-full h-4 bg-surface-container-high rounded-full overflow-hidden border border-outline-variant/30">
                <div 
                  className="h-full bg-secondary transition-all duration-1000 ease-out"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
              {remainingSlots > 0 && remainingSlots <= 5 && isLive && (
                <p className="text-label-sm text-error font-bold mt-3 text-right">Only {remainingSlots} spots left!</p>
              )}
            </div>

            {isLive ? (
              <button 
                onClick={handleJoin}
                disabled={joining || session.user_joined}
                className="w-full bg-secondary hover:bg-secondary/90 text-on-secondary font-bold py-4 px-8 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 text-title-md"
              >
                {joining ? (
                  <span className="material-symbols-outlined animate-spin">autorenew</span>
                ) : session.user_joined ? (
                  <>
                    <span className="material-symbols-outlined">check_circle</span>
                    You've Joined!
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined">group_add</span>
                    Join Group Buy
                  </>
                )}
              </button>
            ) : (
              <div className="bg-surface-container-high border border-outline-variant/50 text-on-surface-variant p-4 rounded-xl text-center font-bold">
                This session has ended.
              </div>
            )}
          </div>

          {session.recent_participants && session.recent_participants.length > 0 && (
            <div className="glass-card rounded-2xl border border-outline-variant/30 overflow-hidden">
              <div className="bg-surface-container-high px-6 py-4 border-b border-outline-variant/30 flex items-center gap-2">
                <span className="material-symbols-outlined text-on-surface-variant">history</span>
                <h2 className="text-title-md font-bold text-on-surface">Recent Participants</h2>
              </div>
              <ul className="divide-y divide-outline-variant/20 max-h-[300px] overflow-y-auto">
                {session.recent_participants.map((p, i) => (
                  <li key={i} className="flex justify-between items-center px-6 py-4">
                    <span className="text-body-md text-on-surface">
                      {p.first_name} {p.last_name?.charAt(0)}.
                    </span>
                    <span className="text-label-sm text-on-surface-variant">{new Date(p.joined_at).toLocaleString()}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
