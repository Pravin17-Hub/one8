import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get('/orders/my-orders');
        setOrders(res.data);
      } catch (error) {
        console.error('Failed to load orders', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) return <main className="flex-1 lg:ml-64 min-h-screen flex items-center justify-center"><span className="material-symbols-outlined animate-spin text-4xl text-primary">autorenew</span></main>;

  return (
    <main className="flex-1 lg:ml-64 p-margin-mobile md:p-margin-desktop min-h-[calc(100vh-72px)]">
      <h1 className="text-headline-lg font-headline-lg text-on-surface mb-8">Order History</h1>

      {orders.length === 0 ? (
        <div className="glass-card p-12 rounded-3xl text-center flex flex-col items-center">
          <span className="material-symbols-outlined text-[64px] text-on-surface-variant mb-4">inventory_2</span>
          <h2 className="text-title-lg text-on-surface mb-2">No orders yet</h2>
          <p className="text-body-md text-on-surface-variant mb-6">When you place an order, it will appear here.</p>
          <button onClick={() => navigate('/products')} className="bg-primary text-on-primary px-6 py-3 rounded-full font-bold">Start Shopping</button>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map(order => (
            <div key={order.id} className="glass-card p-6 rounded-2xl border border-white/10 hover:border-white/20 transition-colors">
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 border-b border-white/10 pb-4 mb-4">
                <div>
                  <p className="text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">Order Placed</p>
                  <p className="text-body-md text-on-surface">{new Date(order.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
                <div>
                  <p className="text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">Total</p>
                  <p className="text-title-md text-primary font-bold">₹{parseFloat(order.total_amount).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">Status</p>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    order.status === 'PAID' ? 'bg-[#10B981]/20 text-[#10B981]' : 
                    order.status === 'PENDING' ? 'bg-[#F59E0B]/20 text-[#F59E0B]' : 
                    'bg-surface-variant text-on-surface-variant'
                  }`}>
                    {order.status}
                  </span>
                </div>
                <div className="text-right">
                   <p className="text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">Order #</p>
                   <p className="text-body-sm font-mono text-on-surface">{order.id.slice(0, 8)}...</p>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                 <p className="text-body-sm text-on-surface-variant">View order details to track shipping status and items.</p>
                 <button onClick={() => navigate(`/orders/${order.id}`)} className="text-primary hover:text-primary/80 font-bold flex items-center gap-1">
                   Details <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                 </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
