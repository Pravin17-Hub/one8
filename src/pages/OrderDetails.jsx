import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import api from '../utils/api';

const statusColors = {
  PENDING: 'bg-yellow-500/20 text-yellow-200',
  PAID: 'bg-tertiary/20 text-tertiary',
  SHIPPED: 'bg-secondary/20 text-secondary',
  DELIVERED: 'bg-primary/20 text-primary',
  CANCELLED: 'bg-error/20 text-error',
};

export default function OrderDetails() {
  const { id } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const orderPlaced = location.state?.orderPlaced;

  useEffect(() => {
    const loadOrder = async () => {
      try {
        const { data } = await api.get(`/orders/${id}`);
        setOrder(data);
      } catch (err) {
        setError(err.response?.data?.error || 'Order not found.');
      } finally {
        setLoading(false);
      }
    };
    loadOrder();
  }, [id]);

  if (loading) {
    return (
      <main className="flex-1 lg:ml-64 p-margin-mobile md:p-margin-desktop min-h-screen flex items-center justify-center">
        <p className="text-body-md text-on-surface-variant">Loading order...</p>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="flex-1 lg:ml-64 p-margin-mobile md:p-margin-desktop min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-body-md text-error mb-4">{error}</p>
          <Link to="/orders" className="text-secondary font-semibold hover:underline">
            Back to orders
          </Link>
        </div>
      </main>
    );
  }

  const addr = order.shipping_address;

  return (
    <main className="flex-1 lg:ml-64 p-margin-mobile md:p-margin-desktop min-h-screen pb-24">
      {orderPlaced && (
        <div className="mb-6 p-4 rounded-xl bg-tertiary-container/20 border border-tertiary/30 flex items-center gap-3">
          <span className="material-symbols-outlined text-tertiary">check_circle</span>
          <p className="text-body-md text-on-surface">Order placed successfully. Thank you for shopping with One8!</p>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <Link to="/orders" className="text-label-md text-secondary hover:underline mb-2 inline-block">
            ← Back to orders
          </Link>
          <h1 className="text-headline-lg font-headline-lg text-on-surface">
            Order #{order.id.slice(0, 8).toUpperCase()}
          </h1>
          <p className="text-body-md text-on-surface-variant mt-1">
            Placed {new Date(order.created_at).toLocaleString()}
          </p>
        </div>
        <div className="flex gap-3">
          <span
            className={`px-3 py-1 rounded-full text-label-sm font-semibold ${
              statusColors[order.status] || statusColors.PENDING
            }`}
          >
            {order.status}
          </span>
          <span className="px-3 py-1 rounded-full text-label-sm font-semibold bg-surface-container-high text-on-surface-variant">
            {order.payment_status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {order.items.map((item) => (
            <div key={item.id} className="glass-card rounded-xl p-4 flex gap-4 items-center">
              <div className="w-16 h-16 rounded-lg bg-surface-container-high flex-shrink-0 overflow-hidden flex items-center justify-center">
                {item.image_url ? (
                  <img src={item.image_url} alt={item.title} className="w-full h-full object-contain" />
                ) : (
                  <span className="material-symbols-outlined text-on-surface-variant">image</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                {item.product_id ? (
                  <Link
                    to={`/product/${item.product_id}`}
                    className="text-title-md font-semibold text-on-surface hover:text-secondary truncate block"
                  >
                    {item.title}
                  </Link>
                ) : (
                  <p className="text-title-md font-semibold text-on-surface">{item.title}</p>
                )}
                <p className="text-body-sm text-on-surface-variant mt-1">
                  ₹{parseFloat(item.price_at_time).toFixed(2)} × {item.quantity}
                </p>
              </div>
              <p className="text-title-md font-bold text-on-surface">
                ₹{(parseFloat(item.price_at_time) * item.quantity).toFixed(2)}
              </p>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <div className="glass-card rounded-2xl p-6">
            <h2 className="text-title-md font-semibold text-on-surface mb-4">Total</h2>
            <p className="text-display-sm font-bold text-primary mb-4">₹{parseFloat(order.total_amount).toFixed(2)}</p>
            {order.status === 'PENDING' && order.payment_status === 'PENDING' && (
              <Link
                to={`/checkout?order_id=${order.id}`}
                className="w-full bg-[#10B981] hover:bg-[#059669] text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all block text-center shadow-lg shadow-[#10B981]/20"
              >
                <span className="material-symbols-outlined text-[20px]">credit_card</span>
                <span>Proceed to Payment</span>
              </Link>
            )}
          </div>

          {addr && (
            <div className="glass-card rounded-2xl p-6">
              <h2 className="text-title-md font-semibold text-on-surface mb-4">Shipping To</h2>
              <p className="text-body-md text-on-surface font-medium">{addr.full_name}</p>
              <p className="text-body-sm text-on-surface-variant mt-2">
                {addr.address_line_1}
                {addr.address_line_2 && <><br />{addr.address_line_2}</>}
                <br />
                {addr.city}, {addr.state} {addr.postal_code}
                <br />
                {addr.country}
              </p>
              <p className="text-body-sm text-on-surface-variant mt-2">{addr.phone}</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
