import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const { user, refreshUser, logout } = useAuth();
  const [formData, setFormData] = useState({ firstName: '', lastName: '', phone: '' });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/auth/profile');
        setFormData({
          firstName: res.data.first_name || '',
          lastName: res.data.last_name || '',
          phone: res.data.phone || ''
        });
      } catch (error) {
        console.error('Failed to load profile', error);
      } finally {
        setLoading(false);
      }
    };
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setMessage('');
    try {
      await api.put('/auth/profile', formData);
      setMessage('Profile updated successfully!');
    } catch (error) {
      setMessage('Failed to update profile.');
    } finally {
      setUpdating(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (loading) return <main className="flex-1 lg:ml-64 min-h-screen flex items-center justify-center"><span className="material-symbols-outlined animate-spin text-4xl text-primary">autorenew</span></main>;

  return (
    <main className="flex-1 lg:ml-64 p-margin-mobile md:p-margin-desktop min-h-[calc(100vh-72px)]">
      <h1 className="text-headline-lg font-headline-lg text-on-surface mb-8">My Account</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-card p-8 rounded-2xl flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full bg-surface-container border-2 border-primary flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-4xl text-primary">person</span>
            </div>
            <h2 className="text-title-lg font-title-lg text-on-surface">{formData.firstName} {formData.lastName}</h2>
            <p className="text-body-md text-on-surface-variant mb-4">{user?.email}</p>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary/20 text-primary uppercase tracking-wider">{user?.role}</span>
          </div>

          <div className="glass-card p-6 rounded-2xl space-y-2">
            <button onClick={() => navigate('/orders')} className="w-full text-left px-4 py-3 rounded-lg hover:bg-white/5 transition-colors text-on-surface flex items-center gap-3">
              <span className="material-symbols-outlined text-on-surface-variant">shopping_bag</span>
              Order History
            </button>
            <button onClick={handleLogout} className="w-full text-left px-4 py-3 rounded-lg hover:bg-error/10 transition-colors text-error flex items-center gap-3">
              <span className="material-symbols-outlined">logout</span>
              Log Out
            </button>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="glass-card p-8 rounded-2xl">
            <h2 className="text-title-lg font-title-lg text-on-surface mb-6 border-b border-white/10 pb-4">Personal Information</h2>
            
            {message && (
              <div className={`p-4 rounded-lg mb-6 text-sm ${message.includes('success') ? 'bg-secondary/20 text-secondary' : 'bg-error/20 text-error'}`}>
                {message}
              </div>
            )}

            <form onSubmit={handleUpdate} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-label-md text-on-surface-variant mb-2">First Name</label>
                  <input type="text" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} className="w-full bg-surface-container border border-white/10 rounded-lg p-3 text-on-surface outline-none focus:border-primary transition-colors" />
                </div>
                <div>
                  <label className="block text-label-md text-on-surface-variant mb-2">Last Name</label>
                  <input type="text" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} className="w-full bg-surface-container border border-white/10 rounded-lg p-3 text-on-surface outline-none focus:border-primary transition-colors" />
                </div>
              </div>
              
              <div>
                <label className="block text-label-md text-on-surface-variant mb-2">Phone Number</label>
                <input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-surface-container border border-white/10 rounded-lg p-3 text-on-surface outline-none focus:border-primary transition-colors" />
              </div>
              
              <div>
                <label className="block text-label-md text-on-surface-variant mb-2">Email Address (Read Only)</label>
                <input type="email" value={user?.email || ''} readOnly className="w-full bg-surface-container-high border border-white/5 rounded-lg p-3 text-on-surface-variant cursor-not-allowed outline-none" />
              </div>

              <div className="pt-4 flex justify-end">
                <button type="submit" disabled={updating} className="bg-primary hover:bg-primary/90 text-on-primary font-bold py-3 px-8 rounded-lg transition-colors flex items-center gap-2">
                  {updating ? <span className="material-symbols-outlined animate-spin">autorenew</span> : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
