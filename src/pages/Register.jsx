import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { useLanguage } from '../context/LanguageContext';

export default function Register() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'CUSTOMER'
  });
  
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpSentMessage, setOtpSentMessage] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { register } = useAuth();
  const { t } = useLanguage();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSendOtp = async () => {
    setError('');
    
    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }

    if (formData.password.length < 8) {
      return setError('Password must be at least 8 characters');
    }

    setSendingOtp(true);
    try {
      const res = await api.post('/auth/send-email-otp', { email: formData.email });
      setOtpSent(true);
      if (res.data.code) {
        setOtpSentMessage(`[Mock Verification Code: ${res.data.code}]`);
        setOtpCode(res.data.code);
      } else {
        setOtpSentMessage(t('checkInbox', 'Please check your email inbox.'));
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send verification OTP. Please try again.');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleRegister = async () => {
    setError('');
    if (!otpCode || otpCode.trim().length !== 6) {
      return setError('Please enter a valid 6-digit OTP code');
    }

    setLoading(true);

    try {
      const user = await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        accountType: formData.role.toLowerCase(),
        otpCode: otpCode.trim()
      });
      
      if (user.role === 'SELLER') {
        navigate('/seller/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please check your verification code and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!otpSent) {
      handleSendOtp();
    } else {
      handleRegister();
    }
  };

  return (
    <main className="flex-1 lg:ml-64 p-margin-mobile md:p-margin-desktop min-h-screen flex items-center justify-center py-10">
      <div className="glass-card w-full max-w-lg p-8 rounded-2xl border border-white/10 shadow-2xl">
        <h1 className="text-headline-lg font-headline-lg text-on-surface mb-2">{t('createAccount')}</h1>
        <p className="text-body-md text-on-surface-variant mb-8">{t('joinMarketplace')}</p>
        
        {error && (
          <div className="bg-error/20 border border-error/50 text-error px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-label-md text-on-surface-variant mb-2 block">{t('firstName')}</label>
              <input 
                type="text" 
                name="firstName"
                required
                disabled={otpSent}
                value={formData.firstName}
                onChange={handleChange}
                className="w-full bg-surface-container-high border border-white/10 rounded-lg p-3 text-on-surface focus:border-secondary focus:ring-1 focus:ring-secondary/50 outline-none transition-all disabled:opacity-60" 
                placeholder="John" 
              />
            </div>
            <div>
              <label className="text-label-md text-on-surface-variant mb-2 block">{t('lastName')}</label>
              <input 
                type="text" 
                name="lastName"
                required
                disabled={otpSent}
                value={formData.lastName}
                onChange={handleChange}
                className="w-full bg-surface-container-high border border-white/10 rounded-lg p-3 text-on-surface focus:border-secondary focus:ring-1 focus:ring-secondary/50 outline-none transition-all disabled:opacity-60" 
                placeholder="Doe" 
              />
            </div>
          </div>
          
          <div>
            <label className="text-label-md text-on-surface-variant mb-2 block">{t('email')}</label>
            <input 
              type="email" 
              name="email"
              required
              disabled={otpSent}
              value={formData.email}
              onChange={handleChange}
              className="w-full bg-surface-container-high border border-white/10 rounded-lg p-3 text-on-surface focus:border-secondary focus:ring-1 focus:ring-secondary/50 outline-none transition-all disabled:opacity-60" 
              placeholder="name@example.com" 
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-label-md text-on-surface-variant mb-2 block">{t('password')}</label>
              <input 
                type="password" 
                name="password"
                required
                disabled={otpSent}
                minLength="8"
                value={formData.password}
                onChange={handleChange}
                className="w-full bg-surface-container-high border border-white/10 rounded-lg p-3 text-on-surface focus:border-secondary focus:ring-1 focus:ring-secondary/50 outline-none transition-all disabled:opacity-60" 
                placeholder="••••••••" 
              />
            </div>
            <div>
              <label className="text-label-md text-on-surface-variant mb-2 block">{t('confirmPassword')}</label>
              <input 
                type="password" 
                name="confirmPassword"
                required
                disabled={otpSent}
                minLength="8"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full bg-surface-container-high border border-white/10 rounded-lg p-3 text-on-surface focus:border-secondary focus:ring-1 focus:ring-secondary/50 outline-none transition-all disabled:opacity-60" 
                placeholder="••••••••" 
              />
            </div>
          </div>

          <div>
             <label className="text-label-md text-on-surface-variant mb-2 block">{t('wantTo')}</label>
             <div className="flex gap-4">
                 <label className="flex-1 cursor-pointer">
                    <input type="radio" name="role" value="CUSTOMER" disabled={otpSent} checked={formData.role === 'CUSTOMER'} onChange={handleChange} className="peer sr-only" />
                    <div className="text-center py-3 rounded-lg border border-white/10 text-on-surface-variant peer-checked:border-secondary peer-checked:text-secondary peer-checked:bg-secondary/10 transition-all peer-disabled:opacity-60">
                      {t('shop')}
                    </div>
                 </label>
                 <label className="flex-1 cursor-pointer">
                    <input type="radio" name="role" value="SELLER" disabled={otpSent} checked={formData.role === 'SELLER'} onChange={handleChange} className="peer sr-only" />
                    <div className="text-center py-3 rounded-lg border border-white/10 text-on-surface-variant peer-checked:border-secondary peer-checked:text-secondary peer-checked:bg-secondary/10 transition-all peer-disabled:opacity-60">
                      {t('sell')}
                    </div>
                 </label>
             </div>
          </div>

          {otpSent && (
            <div className="bg-secondary/10 border border-secondary/30 rounded-xl p-4 mt-6 text-left">
              <p className="text-body-sm text-secondary font-bold mb-1">{t('verifyEmail')}</p>
              <p className="text-body-xs text-on-surface-variant mb-2">{t('otpSentText')} <strong className="text-on-surface">{formData.email}</strong>.</p>
              {otpSentMessage && <p className="text-body-xs text-secondary font-medium mb-3 italic">{otpSentMessage}</p>}
              
              <div>
                <label className="text-label-md text-on-surface-variant mb-2 block">{t('otpVerificationCode')}</label>
                <input 
                  type="text" 
                  name="otpCode"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  required
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  className="w-full bg-surface-container border border-white/10 rounded-lg p-3 text-on-surface focus:border-secondary focus:ring-1 focus:ring-secondary/50 outline-none transition-all text-center tracking-widest text-lg font-bold" 
                  placeholder="123456" 
                  maxLength="6"
                  pattern="\d{6}"
                />
              </div>
              
              <div className="flex justify-between items-center mt-3">
                <button 
                  type="button" 
                  onClick={handleSendOtp} 
                  disabled={sendingOtp}
                  className="text-body-xs text-secondary hover:underline font-semibold"
                >
                  {sendingOtp ? t('resending') : t('resendCode')}
                </button>
                <button 
                  type="button" 
                  onClick={() => setOtpSent(false)} 
                  className="text-body-xs text-on-surface-variant hover:text-on-surface hover:underline font-semibold"
                >
                  {t('changeEmail')}
                </button>
              </div>
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading || sendingOtp}
            className="w-full bg-[#F59E0B] hover:bg-[#D97706] text-[#261400] font-bold py-3 rounded-lg mt-6 transition-colors shadow-sm disabled:opacity-50 flex justify-center items-center"
          >
            {loading || sendingOtp ? <span className="material-symbols-outlined animate-spin text-xl">autorenew</span> : (otpSent ? t('verifyAndRegister') : t('sendVerificationOtp'))}
          </button>
        </form>

        <p className="text-center text-body-md text-on-surface-variant mt-6">
          {t('alreadyHaveAccount')} <Link to="/login" className="text-secondary font-semibold hover:underline">{t('login')}</Link>
        </p>
      </div>
    </main>
  );
}
