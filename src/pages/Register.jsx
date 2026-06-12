import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'CUSTOMER'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }

    if (formData.password.length < 8) {
      return setError('Password must be at least 8 characters');
    }

    setLoading(true);

    try {
      const user = await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        accountType: formData.role.toLowerCase()
      });
      
      if (user.role === 'SELLER') {
        navigate('/seller/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex-1 lg:ml-64 p-margin-mobile md:p-margin-desktop min-h-screen flex items-center justify-center py-10">
      <div className="glass-card w-full max-w-lg p-8 rounded-2xl border border-white/10 shadow-2xl">
        <h1 className="text-headline-lg font-headline-lg text-on-surface mb-2">Create Account</h1>
        <p className="text-body-md text-on-surface-variant mb-8">Join One8 Marketplace to discover and sell premium goods</p>
        
        {error && (
          <div className="bg-error/20 border border-error/50 text-error px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-label-md text-on-surface-variant mb-2 block">First Name</label>
              <input 
                type="text" 
                name="firstName"
                required
                value={formData.firstName}
                onChange={handleChange}
                className="w-full bg-surface-container-high border border-white/10 rounded-lg p-3 text-on-surface focus:border-secondary focus:ring-1 focus:ring-secondary/50 outline-none transition-all" 
                placeholder="John" 
              />
            </div>
            <div>
              <label className="text-label-md text-on-surface-variant mb-2 block">Last Name</label>
              <input 
                type="text" 
                name="lastName"
                required
                value={formData.lastName}
                onChange={handleChange}
                className="w-full bg-surface-container-high border border-white/10 rounded-lg p-3 text-on-surface focus:border-secondary focus:ring-1 focus:ring-secondary/50 outline-none transition-all" 
                placeholder="Doe" 
              />
            </div>
          </div>
          
          <div>
            <label className="text-label-md text-on-surface-variant mb-2 block">Email Address</label>
            <input 
              type="email" 
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full bg-surface-container-high border border-white/10 rounded-lg p-3 text-on-surface focus:border-secondary focus:ring-1 focus:ring-secondary/50 outline-none transition-all" 
              placeholder="name@example.com" 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-label-md text-on-surface-variant mb-2 block">Password</label>
              <input 
                type="password" 
                name="password"
                required
                minLength="8"
                value={formData.password}
                onChange={handleChange}
                className="w-full bg-surface-container-high border border-white/10 rounded-lg p-3 text-on-surface focus:border-secondary focus:ring-1 focus:ring-secondary/50 outline-none transition-all" 
                placeholder="••••••••" 
              />
            </div>
            <div>
              <label className="text-label-md text-on-surface-variant mb-2 block">Confirm Password</label>
              <input 
                type="password" 
                name="confirmPassword"
                required
                minLength="8"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full bg-surface-container-high border border-white/10 rounded-lg p-3 text-on-surface focus:border-secondary focus:ring-1 focus:ring-secondary/50 outline-none transition-all" 
                placeholder="••••••••" 
              />
            </div>
          </div>

          <div>
             <label className="text-label-md text-on-surface-variant mb-2 block">I want to...</label>
             <div className="flex gap-4">
                <label className="flex-1 cursor-pointer">
                  <input type="radio" name="role" value="CUSTOMER" checked={formData.role === 'CUSTOMER'} onChange={handleChange} className="peer sr-only" />
                  <div className="text-center py-3 rounded-lg border border-white/10 text-on-surface-variant peer-checked:border-secondary peer-checked:text-secondary peer-checked:bg-secondary/10 transition-all">
                    Shop
                  </div>
                </label>
                <label className="flex-1 cursor-pointer">
                  <input type="radio" name="role" value="SELLER" checked={formData.role === 'SELLER'} onChange={handleChange} className="peer sr-only" />
                  <div className="text-center py-3 rounded-lg border border-white/10 text-on-surface-variant peer-checked:border-secondary peer-checked:text-secondary peer-checked:bg-secondary/10 transition-all">
                    Sell
                  </div>
                </label>
             </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#F59E0B] hover:bg-[#D97706] text-[#261400] font-bold py-3 rounded-lg mt-6 transition-colors shadow-sm disabled:opacity-50 flex justify-center items-center"
          >
            {loading ? <span className="material-symbols-outlined animate-spin text-xl">autorenew</span> : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-body-md text-on-surface-variant mt-6">
          Already have an account? <Link to="/login" className="text-secondary font-semibold hover:underline">Sign in</Link>
        </p>
      </div>
    </main>
  );
}
