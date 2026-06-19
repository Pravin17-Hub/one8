import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { useLanguage } from '../context/LanguageContext';

export default function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { t } = useLanguage();

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await api.get('/cart');
        setCartItems(res.data);
      } catch (error) {
        console.error('Failed to load cart', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, []);

  const handleUpdateQuantity = async (cartId, newQuantity) => {
    if (newQuantity < 1) return handleRemoveItem(cartId);
    try {
      await api.put(`/cart/update/${cartId}`, { quantity: newQuantity });
      setCartItems(prev => prev.map(item => item.cart_id === cartId ? { ...item, quantity: newQuantity } : item));
    } catch (error) {
      console.error('Update failed', error);
    }
  };

  const handleRemoveItem = async (cartId) => {
    try {
      await api.delete(`/cart/remove/${cartId}`);
      setCartItems(prev => prev.filter(item => item.cart_id !== cartId));
    } catch (error) {
      console.error('Remove failed', error);
    }
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);

  if (loading) {
    return <main className="flex-1 lg:ml-64 p-margin-mobile md:p-margin-desktop min-h-screen flex items-center justify-center"><span className="material-symbols-outlined animate-spin text-4xl text-primary">autorenew</span></main>;
  }

  return (
    <main className="flex-1 lg:ml-64 p-margin-mobile md:p-margin-desktop min-h-screen">
      <h1 className="text-headline-lg font-headline-lg text-on-surface mb-8">{t('yourCart')}</h1>
      
      {cartItems.length === 0 ? (
        <div className="glass-card p-12 rounded-3xl text-center flex flex-col items-center">
          <span className="material-symbols-outlined text-[64px] text-on-surface-variant mb-4">remove_shopping_cart</span>
          <h2 className="text-title-lg text-on-surface mb-2">{t('cartIsEmpty')}</h2>
          <p className="text-body-md text-on-surface-variant mb-6">{t('cartEmptyDesc')}</p>
          <Link to="/products" className="bg-primary text-on-primary px-6 py-3 rounded-full font-bold">{t('startShopping')}</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div key={item.cart_id} className="glass-card p-4 rounded-2xl flex flex-col sm:flex-row gap-6 items-center">
                <div className="w-24 h-24 bg-surface-container rounded-xl flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-4xl text-on-surface-variant">image</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-title-md font-title-md text-on-surface">{item.title}</h3>
                  <p className="text-body-md text-primary font-bold mt-1">₹{item.price}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center bg-surface-container-high rounded-lg border border-white/10">
                    <button onClick={() => handleUpdateQuantity(item.cart_id, item.quantity - 1)} className="p-2 hover:text-primary"><span className="material-symbols-outlined text-[16px]">remove</span></button>
                    <span className="px-4 text-on-surface">{item.quantity}</span>
                    <button onClick={() => handleUpdateQuantity(item.cart_id, item.quantity + 1)} className="p-2 hover:text-primary"><span className="material-symbols-outlined text-[16px]">add</span></button>
                  </div>
                  <button onClick={() => handleRemoveItem(item.cart_id)} className="text-on-surface-variant hover:text-error p-2">
                    <span className="material-symbols-outlined">delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="lg:col-span-1">
            <div className="glass-card p-6 rounded-2xl sticky top-24">
              <h2 className="text-title-lg text-on-surface mb-6">{t('orderSummary')}</h2>
              <div className="space-y-4 text-body-md">
                <div className="flex justify-between text-on-surface-variant">
                  <span>{t('subtotal')}</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-on-surface-variant">
                  <span>{t('shipping')}</span>
                  <span>{t('calculatedAtCheckout')}</span>
                </div>
                <hr className="border-white/10" />
                <div className="flex justify-between text-title-md text-on-surface font-bold">
                  <span>{t('total')}</span>
                  <span className="text-primary">₹{subtotal.toFixed(2)}</span>
                </div>
              </div>
              <button 
                onClick={() => navigate('/checkout')} 
                className="w-full mt-8 bg-[#F59E0B] hover:bg-[#D97706] text-[#261400] font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all"
              >
                {t('proceedToCheckout')}
                <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
