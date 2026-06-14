import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

export default function Checkout() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const navigate = useNavigate();

  // Address form states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');

  // Payment states
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [upiId, setUpiId] = useState('');
  const [utrNumber, setUtrNumber] = useState('');
  const [paymentStep, setPaymentStep] = useState('');

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await api.get('/cart');
        if (res.data.length === 0) {
          navigate('/cart');
        } else {
          setCartItems(res.data);
        }
      } catch (error) {
        console.error('Failed to load checkout', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, [navigate]);

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !addressLine1.trim() || !city.trim() || !postalCode.trim()) {
      alert('Please fill out all required shipping address fields before placing an order.');
      return;
    }

    if (paymentMethod === 'card') {
      if (!cardName.trim() || !cardNumber.trim() || !cardExpiry.trim() || !cardCvv.trim()) {
        alert('Please fill out all credit/debit card information.');
        return;
      }
    } else if (paymentMethod === 'upi') {
      if (!upiId.trim() || !upiId.includes('@')) {
        alert('Please enter a valid UPI ID (e.g. user@bank).');
        return;
      }
    } else {
      if (!utrNumber.trim() || utrNumber.trim().length < 6) {
        alert('Please enter a valid UPI Ref/UTR transaction reference number.');
        return;
      }
    }
    
    setProcessing(true);
    setPaymentStep(paymentMethod === 'qr' ? 'Verifying transaction UTR reference...' : 'Verifying shipping address...');
    
    setTimeout(() => {
      setPaymentStep(paymentMethod === 'qr' ? 'Confirming bank settlement...' : 'Authorizing payment with bank...');
      
      setTimeout(() => {
        setPaymentStep('Securing transaction...');
        
        setTimeout(async () => {
          try {
            const res = await api.post('/orders/checkout', {
              shippingAddress: {
                firstName,
                lastName,
                addressLine1,
                city,
                postalCode
              }
            });
            alert(`Order Success! Your order ID is: ${res.data.orderId}`);
            navigate('/orders');
          } catch (error) {
            alert(error.response?.data?.error || 'Checkout failed.');
            console.error(error);
            setProcessing(false);
            setPaymentStep('');
          }
        }, 1000);
      }, 1000);
    }, 1000);
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);

  const payeeUpiId = 'one8store@okaxis'; 
  const payeeName = 'One8 Marketplace';
  const amountVal = subtotal.toFixed(2);
  const upiLink = `upi://pay?pa=${payeeUpiId}&pn=${encodeURIComponent(payeeName)}&am=${amountVal}&cu=INR&tn=${encodeURIComponent('One8 Order')}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiLink)}&color=0f172a&bgcolor=ffffff`;

  if (loading) return <main className="flex-1 lg:ml-64 min-h-screen flex items-center justify-center"><span className="material-symbols-outlined animate-spin text-4xl text-primary">autorenew</span></main>;

  return (
    <main className="flex-1 lg:ml-64 p-margin-mobile md:p-margin-desktop min-h-screen">
      <h1 className="text-headline-lg font-headline-lg text-on-surface mb-8">Secure Checkout</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          {/* Shipping Form Mock */}
          <div className="glass-card p-6 rounded-2xl">
            <h2 className="text-title-lg text-on-surface mb-4 flex items-center gap-2"><span className="material-symbols-outlined text-primary">local_shipping</span> Shipping Details</h2>
            <form className="space-y-4" onSubmit={handlePlaceOrder}>
              <div className="grid grid-cols-2 gap-4">
                <input 
                  type="text" 
                  placeholder="First Name" 
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full bg-surface-container border border-white/10 rounded-lg p-3 text-on-surface outline-none" 
                  required 
                />
                <input 
                  type="text" 
                  placeholder="Last Name" 
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full bg-surface-container border border-white/10 rounded-lg p-3 text-on-surface outline-none" 
                  required 
                />
              </div>
              <input 
                type="text" 
                placeholder="Address Line 1" 
                value={addressLine1}
                onChange={(e) => setAddressLine1(e.target.value)}
                className="w-full bg-surface-container border border-white/10 rounded-lg p-3 text-on-surface outline-none" 
                required 
              />
              <div className="grid grid-cols-2 gap-4">
                <input 
                  type="text" 
                  placeholder="City" 
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-surface-container border border-white/10 rounded-lg p-3 text-on-surface outline-none" 
                  required 
                />
                <input 
                  type="text" 
                  placeholder="Postal Code" 
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  className="w-full bg-surface-container border border-white/10 rounded-lg p-3 text-on-surface outline-none" 
                  required 
                />
              </div>
            </form>
          </div>

          {/* Payment Simulation Form */}
          <div className="glass-card p-6 rounded-2xl">
            <h2 className="text-title-lg text-on-surface mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">credit_card</span> Payment Information
            </h2>
            
            <div className="flex flex-wrap gap-3 mb-6">
              <button 
                type="button"
                onClick={() => setPaymentMethod('card')} 
                className={`flex-1 min-w-[80px] py-3 px-3 rounded-xl border font-bold transition-all flex items-center justify-center gap-1.5 text-xs sm:text-sm ${
                  paymentMethod === 'card' 
                    ? 'bg-primary text-on-primary border-primary font-bold shadow-lg shadow-primary/20' 
                    : 'bg-surface-container border-white/10 text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[16px] sm:text-[18px]">credit_card</span> Card
              </button>
              <button 
                type="button"
                onClick={() => setPaymentMethod('upi')} 
                className={`flex-1 min-w-[80px] py-3 px-3 rounded-xl border font-bold transition-all flex items-center justify-center gap-1.5 text-xs sm:text-sm ${
                  paymentMethod === 'upi' 
                    ? 'bg-primary text-on-primary border-primary font-bold shadow-lg shadow-primary/20' 
                    : 'bg-surface-container border-white/10 text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[16px] sm:text-[18px]">qr_code_2</span> UPI ID
              </button>
              <button 
                type="button"
                onClick={() => setPaymentMethod('qr')} 
                className={`flex-1 min-w-[80px] py-3 px-3 rounded-xl border font-bold transition-all flex items-center justify-center gap-1.5 text-xs sm:text-sm ${
                  paymentMethod === 'qr' 
                    ? 'bg-primary text-on-primary border-primary font-bold shadow-lg shadow-primary/20' 
                    : 'bg-surface-container border-white/10 text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[16px] sm:text-[18px]">qr_code</span> Pay via QR
              </button>
            </div>

            {paymentMethod === 'card' && (
              <div className="space-y-4">
                <div>
                  <label className="text-label-md text-on-surface-variant block mb-1">Cardholder Name</label>
                  <input 
                    type="text" 
                    placeholder="Virat Kohli" 
                    value={cardName}
                    onChange={e => setCardName(e.target.value)}
                    className="w-full bg-surface-container border border-white/10 rounded-lg p-3 text-on-surface outline-none" 
                    required={paymentMethod === 'card'}
                  />
                </div>
                <div>
                  <label className="text-label-md text-on-surface-variant block mb-1">Card Number</label>
                  <input 
                    type="text" 
                    maxLength="19" 
                    placeholder="4111 2222 3333 4444" 
                    value={cardNumber}
                    onChange={e => setCardNumber(e.target.value)}
                    className="w-full bg-surface-container border border-white/10 rounded-lg p-3 text-on-surface outline-none" 
                    required={paymentMethod === 'card'}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-label-md text-on-surface-variant block mb-1">Expiry (MM/YY)</label>
                    <input 
                      type="text" 
                      maxLength="5" 
                      placeholder="12/28" 
                      value={cardExpiry}
                      onChange={e => setCardExpiry(e.target.value)}
                      className="w-full bg-surface-container border border-white/10 rounded-lg p-3 text-on-surface outline-none" 
                      required={paymentMethod === 'card'}
                    />
                  </div>
                  <div>
                    <label className="text-label-md text-on-surface-variant block mb-1">CVV</label>
                    <input 
                      type="password" 
                      maxLength="3" 
                      placeholder="123" 
                      value={cardCvv}
                      onChange={e => setCardCvv(e.target.value)}
                      className="w-full bg-surface-container border border-white/10 rounded-lg p-3 text-on-surface outline-none" 
                      required={paymentMethod === 'card'}
                    />
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === 'upi' && (
              <div>
                <label className="text-label-md text-on-surface-variant block mb-1">UPI ID</label>
                <input 
                  type="text" 
                  placeholder="virat@paytm" 
                  value={upiId}
                  onChange={e => setUpiId(e.target.value)}
                  className="w-full bg-surface-container border border-white/10 rounded-lg p-3 text-on-surface outline-none" 
                  required={paymentMethod === 'upi'}
                />
              </div>
            )}

            {paymentMethod === 'qr' && (
              <div className="space-y-4 text-center">
                <p className="text-body-sm text-on-surface-variant">Scan QR Code using GPay, PhonePe, or Paytm</p>
                <div className="w-48 h-48 mx-auto bg-white p-3 rounded-xl border border-white/10 shadow-lg flex items-center justify-center">
                  <img 
                    src={qrCodeUrl} 
                    alt="UPI Payment QR Code" 
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="space-y-1">
                  <p className="text-label-sm text-secondary font-bold">UPI ID: {payeeUpiId}</p>
                  <p className="text-label-sm text-on-surface-variant font-mono">Amount: ₹{amountVal}</p>
                </div>
                <div className="text-left mt-4">
                  <label className="text-label-md text-on-surface-variant block mb-1">Transaction Ref/UTR Number</label>
                  <input 
                    type="text" 
                    placeholder="Enter 12-digit transaction ID" 
                    value={utrNumber}
                    onChange={e => setUtrNumber(e.target.value)}
                    className="w-full bg-surface-container border border-white/10 rounded-lg p-3 text-on-surface outline-none" 
                    required={paymentMethod === 'qr'}
                  />
                </div>
              </div>
            )}

            <div className="p-4 bg-surface-container border border-white/10 rounded-lg text-on-surface-variant flex items-center gap-3 mt-6">
               <span className="material-symbols-outlined text-secondary">lock</span>
               <p className="text-sm">Secure simulated payment gateway sandbox is active.</p>
            </div>
          </div>
        </div>

        <div>
          <div className="glass-card p-6 rounded-2xl sticky top-24">
            <h2 className="text-title-lg text-on-surface mb-6">Order Summary</h2>
            <div className="space-y-4 mb-6">
              {cartItems.map(item => (
                <div key={item.cart_id} className="flex justify-between text-body-md text-on-surface-variant">
                  <span>{item.quantity}x {item.title}</span>
                  <span>₹{(parseFloat(item.price) * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <hr className="border-white/10 mb-6" />
            <div className="flex justify-between text-title-md text-on-surface font-bold mb-8">
              <span>Total Pay</span>
              <span className="text-primary">₹{subtotal.toFixed(2)}</span>
            </div>
            
            <button 
              onClick={handlePlaceOrder}
              disabled={processing}
              className="w-full bg-[#10B981] hover:bg-[#059669] text-white font-bold py-4 rounded-xl flex flex-col items-center justify-center gap-1 transition-all disabled:opacity-50"
            >
              {processing ? (
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined animate-spin text-[18px]">autorenew</span>
                  <span>{paymentStep}</span>
                </div>
              ) : (
                <span>Place Order</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
