import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function SellerDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Product Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({ title: '', description: '', price: '', stock_quantity: 0, status: 'ACTIVE', category_id: '', image_url: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return navigate('/login');
    if (user.role !== 'SELLER' && user.role !== 'ADMIN') return navigate('/');

    fetchDashboardData();
  }, [user, navigate]);

  const fetchDashboardData = async () => {
    try {
      const results = await Promise.allSettled([
        api.get('/seller/stats'),
        api.get('/seller/products'),
        api.get('/seller/orders'),
        api.get('/products/categories')
      ]);

      if (results[0].status === 'fulfilled') {
        setStats(results[0].value.data);
      } else {
        console.error('Failed to fetch stats', results[0].reason);
      }

      if (results[1].status === 'fulfilled') {
        setProducts(results[1].value.data);
      } else {
        console.error('Failed to fetch products', results[1].reason);
      }

      if (results[2].status === 'fulfilled') {
        setOrders(results[2].value.data);
      } else {
        console.error('Failed to fetch orders', results[2].reason);
      }

      if (results[3].status === 'fulfilled') {
        setCategories(results[3].value.data);
      } else {
        console.error('Failed to fetch categories', results[3].reason);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data', error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({ 
        title: product.title, 
        description: product.description, 
        price: product.price, 
        stock_quantity: product.stock_quantity,
        status: product.status,
        category_id: product.category_id || '',
        image_url: product.image_url || ''
      });
    } else {
      setEditingProduct(null);
      setFormData({ title: '', description: '', price: '', stock_quantity: 0, status: 'ACTIVE', category_id: '', image_url: '' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingProduct) {
        await api.put(`/products/${editingProduct.id}`, formData);
      } else {
        await api.post('/products', formData);
      }
      await fetchDashboardData(); // Refresh the list
      closeModal();
    } catch (error) {
      console.error('Failed to save product', error);
      alert('Failed to save product. Check console.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      setProducts(products.filter(p => p.id !== id));
      // Refresh stats
      const statsRes = await api.get('/seller/stats');
      setStats(statsRes.data);
    } catch (error) {
      console.error('Failed to delete product', error);
      alert('Failed to delete product.');
    }
  };

  if (loading) return <main className="flex-1 lg:ml-64 min-h-screen flex items-center justify-center"><span className="material-symbols-outlined animate-spin text-4xl text-secondary">autorenew</span></main>;

  return (
    <main className="flex-1 lg:ml-64 p-margin-mobile md:p-margin-desktop min-h-[calc(100vh-72px)] flex flex-col relative">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-[32px] text-primary">storefront</span>
          <h1 className="text-headline-lg font-headline-lg text-on-surface">Seller Dashboard</h1>
        </div>
        <button onClick={() => openModal()} className="bg-primary hover:bg-primary/90 text-on-primary font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors">
          <span className="material-symbols-outlined text-sm">add</span> Add Product
        </button>
      </div>

      <div className="flex border-b border-white/10 mb-8">
        {['overview', 'products', 'orders'].map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-3 text-label-lg font-label-lg capitalize transition-colors ${activeTab === tab ? 'text-primary border-b-2 border-primary' : 'text-on-surface-variant hover:text-on-surface'}`}>
            {tab}
          </button>
        ))}
      </div>

      <div className="flex-1">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard title="Total Revenue" value={`₹${stats?.revenue?.toLocaleString(undefined, {minimumFractionDigits: 2})}`} icon="payments" color="text-[#10B981]" />
              <MetricCard title="Active Products" value={stats?.activeProducts} icon="inventory_2" color="text-secondary" />
              <MetricCard title="Total Orders" value={stats?.totalOrders} icon="shopping_bag" color="text-tertiary" />
              <MetricCard title="AI Match Score" value={`${stats?.matchScore}%`} icon="psychology" color="text-primary" />
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div className="glass-card rounded-2xl border border-white/10 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-high border-b border-white/10 text-label-md text-on-surface-variant uppercase tracking-wider">
                  <th className="p-4">Product Name</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Stock</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-4 text-body-md text-on-surface font-medium">{product.title}</td>
                    <td className="p-4 text-body-md text-on-surface-variant">₹{product.price}</td>
                    <td className="p-4 text-body-md text-on-surface-variant">{product.stock_quantity}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${product.status === 'ACTIVE' ? 'bg-secondary/20 text-secondary' : 'bg-error/20 text-error'}`}>
                        {product.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button onClick={() => openModal(product)} className="text-on-surface-variant hover:text-primary transition-colors mr-3" title="Edit Product">
                        <span className="material-symbols-outlined text-[20px]">edit</span>
                      </button>
                      <button onClick={() => handleDeleteProduct(product.id)} className="text-on-surface-variant hover:text-error transition-colors" title="Delete Product">
                        <span className="material-symbols-outlined text-[20px]">delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-6">
            {orders.length === 0 ? (
              <div className="glass-card p-8 rounded-2xl border border-white/10 text-center">
                <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-2">shopping_bag</span>
                <p className="text-on-surface-variant">No incoming orders yet.</p>
              </div>
            ) : (
              orders.map((order) => (
                <div key={order.id} className="glass-card p-6 rounded-2xl border border-white/10 flex flex-col md:flex-row md:items-start justify-between gap-6">
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-title-md font-bold text-on-surface">Order #{order.id.slice(0, 8)}</span>
                      <span className="text-body-sm text-on-surface-variant">| {new Date(order.date).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        order.status === 'PAID' || order.status === 'DELIVERED' || order.status === 'COMPLETED' ? 'bg-secondary/20 text-secondary' : 'bg-tertiary/20 text-tertiary'
                      }`}>{order.status}</span>
                    </div>

                    <div className="border-t border-white/10 pt-3">
                      <h4 className="text-label-lg text-primary mb-2">Items Ordered:</h4>
                      <div className="space-y-2">
                        {order.items && order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-body-md text-on-surface-variant">
                            <span>{item.title} (x{item.quantity})</span>
                            <span className="text-on-surface">₹{(parseFloat(item.price) * item.quantity).toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="border-t border-white/10 pt-3">
                      <h4 className="text-label-lg text-primary mb-1">Shipping Address:</h4>
                      <p className="text-body-md text-on-surface font-semibold">{order.shipping_name || order.customer}</p>
                      <p className="text-body-sm text-on-surface-variant">
                        {order.address_line_1}
                        {order.address_line_2 ? `, ${order.address_line_2}` : ''}
                        {`, ${order.city}, ${order.state} - ${order.postal_code}`}
                      </p>
                      {order.shipping_phone && (
                        <p className="text-body-sm text-on-surface-variant flex items-center gap-1 mt-1">
                          <span className="material-symbols-outlined text-xs">phone</span> {order.shipping_phone}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end justify-between self-stretch">
                    <div className="text-right">
                      <p className="text-label-md text-on-surface-variant">Total Amount</p>
                      <p className="text-headline-sm font-bold text-secondary">₹{parseFloat(order.total).toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Add/Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="glass-card w-full max-w-lg p-6 rounded-2xl border border-white/10 shadow-2xl relative">
            <button onClick={closeModal} className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface">
              <span className="material-symbols-outlined">close</span>
            </button>
            <h2 className="text-headline-sm text-on-surface mb-6">{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
            
            <form onSubmit={handleProductSubmit} className="space-y-4">
              <div>
                <label className="text-label-md text-on-surface-variant block mb-1">Title</label>
                <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-surface-container border border-white/10 rounded-lg p-3 text-on-surface outline-none" placeholder="e.g. Aura Studio Pro Max" />
              </div>
              <div>
                <label className="text-label-md text-on-surface-variant block mb-1">Description</label>
                <textarea required rows="3" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-surface-container border border-white/10 rounded-lg p-3 text-on-surface outline-none" placeholder="Detailed product description..."></textarea>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-label-md text-on-surface-variant block mb-1">Price (₹)</label>
                  <input type="number" step="0.01" required value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full bg-surface-container border border-white/10 rounded-lg p-3 text-on-surface outline-none" placeholder="99.99" />
                </div>
                <div>
                  <label className="text-label-md text-on-surface-variant block mb-1">Stock Quantity</label>
                  <input type="number" required value={formData.stock_quantity} onChange={e => setFormData({...formData, stock_quantity: e.target.value})} className="w-full bg-surface-container border border-white/10 rounded-lg p-3 text-on-surface outline-none" placeholder="10" />
                </div>
              </div>
              <div>
                <label className="text-label-md text-on-surface-variant block mb-1">Category</label>
                <select required value={formData.category_id} onChange={e => setFormData({...formData, category_id: e.target.value})} className="w-full bg-surface-container border border-white/10 rounded-lg p-3 text-on-surface outline-none">
                  <option value="" disabled>Select a Category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-label-md text-on-surface-variant block mb-1">Image URL</label>
                <input type="url" required value={formData.image_url} onChange={e => setFormData({...formData, image_url: e.target.value})} className="w-full bg-surface-container border border-white/10 rounded-lg p-3 text-on-surface outline-none" placeholder="e.g. https://example.com/product.jpg" />
              </div>
              {editingProduct && (
                <div>
                   <label className="text-label-md text-on-surface-variant block mb-1">Status</label>
                   <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full bg-surface-container border border-white/10 rounded-lg p-3 text-on-surface outline-none">
                     <option value="ACTIVE">ACTIVE</option>
                     <option value="DRAFT">DRAFT</option>
                     <option value="OUT_OF_STOCK">OUT OF STOCK</option>
                   </select>
                </div>
              )}
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={closeModal} className="px-4 py-2 text-on-surface-variant hover:text-on-surface">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="bg-primary hover:bg-primary/90 text-on-primary font-bold py-2 px-6 rounded-lg transition-colors flex items-center gap-2">
                  {isSubmitting ? <span className="material-symbols-outlined animate-spin text-sm">autorenew</span> : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

function MetricCard({ title, value, icon, color }) {
  return (
    <div className="glass-card p-6 rounded-2xl border border-white/10 flex items-center justify-between">
      <div>
        <p className="text-label-md text-on-surface-variant mb-1">{title}</p>
        <h3 className="text-headline-md font-headline-md text-on-surface">{value}</h3>
      </div>
      <div className={`w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center border border-white/5 ${color}`}>
        <span className="material-symbols-outlined text-[24px]">{icon}</span>
      </div>
    </div>
  );
}
