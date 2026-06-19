import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t } = useLanguage();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      
      // Redirect based on role or to home
      if (user.role === 'SELLER') {
        navigate('/seller/dashboard');
      } else if (user.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const portalText = t('unifiedPortal');
  const colonIndex = portalText.indexOf(':');
  const boldPrefix = colonIndex !== -1 ? portalText.substring(0, colonIndex + 1) : '';
  const mainText = colonIndex !== -1 ? portalText.substring(colonIndex + 1) : portalText;

  return (
    <main className="flex-1 lg:ml-64 p-margin-mobile md:p-margin-desktop min-h-screen flex items-center justify-center">
      <div className="glass-card w-full max-w-md p-8 rounded-2xl border border-white/10 shadow-2xl">
        <h1 className="text-headline-lg font-headline-lg text-on-surface mb-2">{t('welcomeBack')}</h1>
        <p className="text-body-md text-on-surface-variant mb-4">{t('signInDesc')}</p>
        <div className="bg-secondary/10 border border-secondary/20 text-secondary text-xs px-3 py-2 rounded-lg mb-8 inline-flex items-center gap-2">
          <span className="material-symbols-outlined text-sm">switch_account</span>
          <span>
            {boldPrefix && <strong>{boldPrefix}</strong>}
            {mainText}
          </span>
        </div>
        
        {error && (
          <div className="bg-error/20 border border-error/50 text-error px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-label-md text-on-surface-variant mb-2 block">{t('email')}</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-surface-container-high border border-white/10 rounded-lg p-3 text-on-surface focus:border-secondary focus:ring-1 focus:ring-secondary/50 outline-none transition-all" 
              placeholder="name@example.com" 
            />
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-label-md text-on-surface-variant block">{t('password')}</label>
              <a href="#" className="text-label-md text-secondary hover:underline">{t('forgotPassword')}</a>
            </div>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-surface-container-high border border-white/10 rounded-lg p-3 text-on-surface focus:border-secondary focus:ring-1 focus:ring-secondary/50 outline-none transition-all" 
              placeholder="••••••••" 
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#F59E0B] hover:bg-[#D97706] text-[#261400] font-bold py-3 rounded-lg mt-6 transition-colors shadow-sm disabled:opacity-50 flex justify-center items-center"
          >
            {loading ? <span className="material-symbols-outlined animate-spin text-xl">autorenew</span> : t('login')}
          </button>
        </form>

        <p className="text-center text-body-md text-on-surface-variant mt-6">
          {t('dontHaveAccount')} <Link to="/register" className="text-secondary font-semibold hover:underline">{t('signUp')}</Link>
        </p>
      </div>
    </main>
  );
}
