import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [products, setProducts] = useState([]);
  const [auctions, setAuctions] = useState([]);
  const [groupBuys, setGroupBuys] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals & Forms State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({ title: '', description: '', price: '', stock_quantity: 0, status: 'ACTIVE', category_id: '', image_url: '' });
  const [isSubmittingProduct, setIsSubmittingProduct] = useState(false);
  
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const [isAuctionModalOpen, setIsAuctionModalOpen] = useState(false);
  const [auctionForm, setAuctionForm] = useState({ product_id: '', starting_price: '', ends_at: '' });
  const [isSubmittingAuction, setIsSubmittingAuction] = useState(false);

  const [isGroupBuyModalOpen, setIsGroupBuyModalOpen] = useState(false);
  const [groupBuyForm, setGroupBuyForm] = useState({ product_id: '', target_quantity: '', discount_price: '', expires_at: '' });
  const [isSubmittingGroupBuy, setIsSubmittingGroupBuy] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return navigate('/login');
    const user = JSON.parse(userStr);
    if (user.role !== 'ADMIN') return navigate('/');

    fetchAdminData();
  }, [navigate]);

  const fetchAdminData = async () => {
    try {
      const results = await Promise.allSettled([
        api.get('/admin/stats'),
        api.get('/admin/users'),
        api.get('/admin/system-health'),
        api.get('/products?limit=100'),
        api.get('/admin/auctions'),
        api.get('/admin/group-buys'),
        api.get('/products/categories')
      ]);

      if (results[0].status === 'fulfilled') setStats(results[0].value.data);
      if (results[1].status === 'fulfilled') setUsers(results[1].value.data);
      if (results[2].status === 'fulfilled') setLogs(results[2].value.data);
      if (results[3].status === 'fulfilled') setProducts(results[3].value.data);
      if (results[4].status === 'fulfilled') setAuctions(results[4].value.data);
      if (results[5].status === 'fulfilled') setGroupBuys(results[5].value.data);
      if (results[6].status === 'fulfilled') setCategories(results[6].value.data);

    } catch (error) {
      console.error('Failed to fetch admin data', error);
    } finally {
      setLoading(false);
    }
  };

  // Product Actions
  const openProductModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setProductForm({
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
      setProductForm({ title: '', description: '', price: '', stock_quantity: 0, status: 'ACTIVE', category_id: '', image_url: '' });
    }
    setIsAddingCategory(false);
    setNewCategoryName('');
    setIsProductModalOpen(true);
  };

  const closeProductModal = () => {
    setIsProductModalOpen(false);
    setEditingProduct(null);
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setIsSubmittingProduct(true);
    try {
      if (editingProduct) {
        await api.put(`/products/${editingProduct.id}`, productForm);
      } else {
        await api.post('/products', productForm);
      }
      await fetchAdminData();
      closeProductModal();
    } catch (error) {
      console.error('Failed to save product', error);
      alert('Failed to save product.');
    } finally {
      setIsSubmittingProduct(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      await fetchAdminData();
    } catch (error) {
      console.error('Failed to delete product', error);
      alert('Failed to delete product.');
    }
  };

  const handleAddCategorySubmit = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    try {
      const res = await api.post('/products/categories', { name: newCategoryName.trim() });
      const catRes = await api.get('/products/categories');
      setCategories(catRes.data);
      setProductForm({ ...productForm, category_id: res.data.id });
      setIsAddingCategory(false);
      setNewCategoryName('');
    } catch (error) {
      console.error('Failed to create category', error);
      alert('Failed to create category.');
    }
  };

  // Auction Actions
  const handleCreateAuction = async (e) => {
    e.preventDefault();
    setIsSubmittingAuction(true);
    try {
      await api.post('/auctions', auctionForm);
      await fetchAdminData();
      setIsAuctionModalOpen(false);
      setAuctionForm({ product_id: '', starting_price: '', ends_at: '' });
    } catch (error) {
      console.error('Failed to create auction', error);
      alert('Failed to create auction.');
    } finally {
      setIsSubmittingAuction(false);
    }
  };

  const handleCompleteAuction = async (id) => {
    if (!window.confirm('Are you sure you want to complete this auction?')) return;
    try {
      await api.post(`/auctions/${id}/complete`);
      await fetchAdminData();
    } catch (error) {
      console.error('Failed to complete auction', error);
      alert('Failed to complete auction.');
    }
  };

  // Group Buy Actions
  const handleCreateGroupBuy = async (e) => {
    e.preventDefault();
    setIsSubmittingGroupBuy(true);
    try {
      await api.post('/group-buy', groupBuyForm);
      await fetchAdminData();
      setIsGroupBuyModalOpen(false);
      setGroupBuyForm({ product_id: '', target_quantity: '', discount_price: '', expires_at: '' });
    } catch (error) {
      console.error('Failed to create group buy', error);
      alert('Failed to create group buy.');
    } finally {
      setIsSubmittingGroupBuy(false);
    }
  };

  const handleCompleteGroupBuy = async (id, forceSuccess = false) => {
    if (!window.confirm('Are you sure you want to end this group buy session?')) return;
    try {
      await api.post(`/group-buy/${id}/complete`, { forceSuccess });
      await fetchAdminData();
    } catch (error) {
      console.error('Failed to complete group buy', error);
      alert('Failed to complete group buy.');
    }
  };

  if (loading) {
    return (
      <main className="flex-1 lg:ml-64 p-margin-mobile md:p-margin-desktop min-h-[calc(100vh-72px)] flex items-center justify-center">
        <span className="material-symbols-outlined animate-spin text-4xl text-primary">autorenew</span>
      </main>
    );
  }

  return (
    <main className="flex-1 lg:ml-64 p-margin-mobile md:p-margin-desktop min-h-[calc(100vh-72px)] flex flex-col relative">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-[32px] text-error">admin_panel_settings</span>
          <h1 className="text-headline-lg font-headline-lg text-on-surface">Platform Administration</h1>
        </div>
        
        {activeTab === 'products' && (
          <button onClick={() => openProductModal()} className="bg-primary hover:bg-primary/90 text-on-primary font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors">
            <span className="material-symbols-outlined text-sm">add</span> Add Product
          </button>
        )}
        {activeTab === 'auctions' && (
          <button onClick={() => setIsAuctionModalOpen(true)} className="bg-primary hover:bg-primary/90 text-on-primary font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors">
            <span className="material-symbols-outlined text-sm">add</span> Create Auction
          </button>
        )}
        {activeTab === 'group buys' && (
          <button onClick={() => setIsGroupBuyModalOpen(true)} className="bg-primary hover:bg-primary/90 text-on-primary font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors">
            <span className="material-symbols-outlined text-sm">add</span> Create Group Buy
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10 mb-8 overflow-x-auto scrollbar-hide">
        {['overview', 'users', 'products', 'auctions', 'group buys', 'system logs'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 text-label-lg font-label-lg capitalize transition-colors whitespace-nowrap ${
              activeTab === tab
                ? 'text-error border-b-2 border-error font-bold'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard title="Total Platform Revenue" value={`₹${stats?.platformRevenue?.toLocaleString(undefined, {minimumFractionDigits: 2})}`} icon="payments" color="text-[#10B981]" />
              <MetricCard title="Total Users" value={stats?.totalUsers?.toLocaleString()} icon="group" color="text-secondary" />
              <MetricCard title="Active Stores" value={stats?.totalStores?.toLocaleString()} icon="storefront" color="text-tertiary" />
              <MetricCard title="Global AI Accuracy" value={`${stats?.globalAiAccuracy}%`} icon="psychology" color="text-primary" />
            </div>

            <div className="glass-card p-6 rounded-2xl border border-white/10">
              <h3 className="text-title-lg font-title-lg text-on-surface mb-4">Platform Growth</h3>
              <div className="h-64 flex items-center justify-center bg-surface-container-high rounded-xl border border-white/5">
                 <p className="text-on-surface-variant text-label-md">Interactive charts will be rendered here.</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="glass-card rounded-2xl border border-white/10 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-high border-b border-white/10 text-label-md text-on-surface-variant uppercase tracking-wider">
                  <th className="p-4">User ID</th>
                  <th className="p-4">Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-4 text-body-sm text-on-surface-variant font-mono">{u.id.slice(0, 8)}...</td>
                    <td className="p-4 text-body-md text-on-surface font-medium">{u.first_name} {u.last_name}</td>
                    <td className="p-4 text-body-md text-on-surface-variant">{u.email}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${u.role === 'ADMIN' ? 'bg-error/20 text-error' : u.role === 'SELLER' ? 'bg-secondary/20 text-secondary' : 'bg-surface-variant text-on-surface-variant'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4 text-body-sm text-on-surface-variant">{new Date(u.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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
                    <td className="p-4 text-body-md text-on-surface font-medium">
                      <Link to={`/product/${product.id}`} className="hover:text-primary transition-colors hover:underline">
                        {product.title}
                      </Link>
                    </td>
                    <td className="p-4 text-body-md text-on-surface-variant">₹{parseFloat(product.price).toLocaleString()}</td>
                    <td className="p-4 text-body-md text-on-surface-variant">{product.stock_quantity}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${product.status === 'ACTIVE' ? 'bg-secondary/20 text-secondary' : 'bg-error/20 text-error'}`}>
                        {product.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button onClick={() => openProductModal(product)} className="text-on-surface-variant hover:text-primary transition-colors mr-3" title="Edit Product">
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

        {activeTab === 'auctions' && (
          <div className="glass-card rounded-2xl border border-white/10 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-high border-b border-white/10 text-label-md text-on-surface-variant uppercase tracking-wider">
                  <th className="p-4">Product Name</th>
                  <th className="p-4">Starting Price</th>
                  <th className="p-4">Highest Bid</th>
                  <th className="p-4">Ends At</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {auctions.map((auc) => (
                  <tr key={auc.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-4 text-body-md text-on-surface font-medium">{auc.title}</td>
                    <td className="p-4 text-body-md text-on-surface-variant">₹{parseFloat(auc.starting_price).toLocaleString()}</td>
                    <td className="p-4 text-body-md text-on-surface-variant">₹{parseFloat(auc.current_highest_bid).toLocaleString()}</td>
                    <td className="p-4 text-body-sm text-on-surface-variant">{new Date(auc.ends_at).toLocaleString()}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${auc.status === 'ACTIVE' ? 'bg-secondary/20 text-secondary' : 'bg-error/20 text-error'}`}>
                        {auc.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {auc.status === 'ACTIVE' && (
                        <button onClick={() => handleCompleteAuction(auc.id)} className="bg-error/20 hover:bg-error/30 text-error px-3 py-1 rounded-lg text-xs font-bold transition-colors">
                          Complete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'group buys' && (
          <div className="glass-card rounded-2xl border border-white/10 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-high border-b border-white/10 text-label-md text-on-surface-variant uppercase tracking-wider">
                  <th className="p-4">Product Name</th>
                  <th className="p-4">Target Qty</th>
                  <th className="p-4">Current Qty</th>
                  <th className="p-4">Discount Price</th>
                  <th className="p-4">Expires At</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {groupBuys.map((gb) => (
                  <tr key={gb.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-4 text-body-md text-on-surface font-medium">{gb.title}</td>
                    <td className="p-4 text-body-md text-on-surface-variant">{gb.target_quantity}</td>
                    <td className="p-4 text-body-md text-on-surface-variant">{gb.current_quantity}</td>
                    <td className="p-4 text-body-md text-on-surface-variant">₹{parseFloat(gb.discount_price).toLocaleString()}</td>
                    <td className="p-4 text-body-sm text-on-surface-variant">{new Date(gb.expires_at).toLocaleString()}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${gb.status === 'ACTIVE' ? 'bg-secondary/20 text-secondary' : gb.status === 'COMPLETED' ? 'bg-[#10B981]/20 text-[#10B981]' : 'bg-error/20 text-error'}`}>
                        {gb.status}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      {gb.status === 'ACTIVE' && (
                        <>
                          <button onClick={() => handleCompleteGroupBuy(gb.id, true)} className="bg-[#10B981]/20 hover:bg-[#10B981]/30 text-[#10B981] px-3 py-1 rounded-lg text-xs font-bold transition-colors">
                            Succeed
                          </button>
                          <button onClick={() => handleCompleteGroupBuy(gb.id, false)} className="bg-error/20 hover:bg-error/30 text-error px-3 py-1 rounded-lg text-xs font-bold transition-colors">
                            Fail
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'system logs' && (
          <div className="glass-card rounded-2xl border border-white/10 overflow-hidden bg-black/50 font-mono">
             <div className="bg-surface-container-high p-3 border-b border-white/10 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-error"></div>
                <div className="w-3 h-3 rounded-full bg-[#F59E0B]"></div>
                <div className="w-3 h-3 rounded-full bg-[#10B981]"></div>
                <span className="ml-2 text-label-sm text-on-surface-variant">terminal - one8_system_logs</span>
             </div>
             <div className="p-4 space-y-2 max-h-[500px] overflow-y-auto text-sm">
                {logs.map(log => (
                  <div key={log.id} className="flex gap-4">
                     <span className="text-on-surface-variant/50">{new Date(log.timestamp).toLocaleTimeString()}</span>
                     <span className={`${log.type === 'INFO' ? 'text-blue-400' : log.type === 'WARNING' ? 'text-[#F59E0B]' : 'text-error'} font-bold w-16`}>[{log.type}]</span>
                     <span className="text-on-surface/80">{log.message}</span>
                  </div>
                ))}
                <div className="flex gap-4 pt-2">
                     <span className="text-on-surface-variant/50">{new Date().toLocaleTimeString()}</span>
                     <span className="text-[#10B981] font-bold w-16">[{'READY'}]</span>
                     <span className="text-on-surface/80 animate-pulse">_</span>
                </div>
             </div>
          </div>
        )}
      </div>

      {/* Product Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card border border-white/10 rounded-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-headline-md font-headline-md text-on-surface mb-6">
              {editingProduct ? 'Edit Product' : 'Add Product'}
            </h3>
            
            <form onSubmit={handleProductSubmit} className="space-y-4">
              <div>
                <label className="text-label-md text-on-surface-variant block mb-1">Product Title</label>
                <input required value={productForm.title} onChange={e => setProductForm({...productForm, title: e.target.value})} className="w-full bg-surface-container border border-white/10 rounded-lg p-3 text-on-surface outline-none" placeholder="e.g. Aura Studio Pro Max" />
              </div>
              <div>
                <label className="text-label-md text-on-surface-variant block mb-1">Description</label>
                <textarea required rows="3" value={productForm.description} onChange={e => setProductForm({...productForm, description: e.target.value})} className="w-full bg-surface-container border border-white/10 rounded-lg p-3 text-on-surface outline-none" placeholder="Detailed product description..."></textarea>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-label-md text-on-surface-variant block mb-1">Price (₹)</label>
                  <input type="number" step="0.01" required value={productForm.price} onChange={e => setProductForm({...productForm, price: e.target.value})} className="w-full bg-surface-container border border-white/10 rounded-lg p-3 text-on-surface outline-none" placeholder="99.99" />
                </div>
                <div>
                  <label className="text-label-md text-on-surface-variant block mb-1">Stock Quantity</label>
                  <input type="number" required value={productForm.stock_quantity} onChange={e => setProductForm({...productForm, stock_quantity: e.target.value})} className="w-full bg-surface-container border border-white/10 rounded-lg p-3 text-on-surface outline-none" placeholder="10" />
                </div>
              </div>
              
              <div>
                <label className="text-label-md text-on-surface-variant block mb-1">Category</label>
                <div className="flex gap-2">
                  <select required={!isAddingCategory} value={productForm.category_id} onChange={e => {
                    if (e.target.value === 'NEW') {
                      setIsAddingCategory(true);
                      setProductForm({...productForm, category_id: ''});
                    } else {
                      setProductForm({...productForm, category_id: e.target.value});
                    }
                  }} className="flex-1 bg-surface-container border border-white/10 rounded-lg p-3 text-on-surface outline-none">
                    <option value="" disabled>Select a Category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                    <option value="NEW">+ Add New Category</option>
                  </select>
                  {isAddingCategory && (
                    <button type="button" onClick={() => setIsAddingCategory(false)} className="px-3 border border-white/10 rounded-lg text-on-surface-variant hover:text-on-surface">
                      Cancel
                    </button>
                  )}
                </div>
                {isAddingCategory && (
                  <div className="mt-2 flex gap-2">
                    <input type="text" value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} className="flex-1 bg-surface-container border border-white/10 rounded-lg p-3 text-on-surface outline-none" placeholder="Enter new category name..." />
                    <button type="button" onClick={handleAddCategorySubmit} className="bg-secondary text-on-secondary px-4 py-2 rounded-lg font-bold text-sm">
                      Add
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="text-label-md text-on-surface-variant block mb-1">Image URL</label>
                <input type="url" required value={productForm.image_url} onChange={e => setProductForm({...productForm, image_url: e.target.value})} className="w-full bg-surface-container border border-white/10 rounded-lg p-3 text-on-surface outline-none" placeholder="e.g. https://example.com/product.jpg" />
              </div>
              {editingProduct && (
                <div>
                   <label className="text-label-md text-on-surface-variant block mb-1">Status</label>
                   <select value={productForm.status} onChange={e => setProductForm({...productForm, status: e.target.value})} className="w-full bg-surface-container border border-white/10 rounded-lg p-3 text-on-surface outline-none">
                     <option value="ACTIVE">ACTIVE</option>
                     <option value="DRAFT">DRAFT</option>
                     <option value="OUT_OF_STOCK">OUT OF STOCK</option>
                   </select>
                </div>
              )}
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={closeProductModal} className="px-4 py-2 text-on-surface-variant hover:text-on-surface">Cancel</button>
                <button type="submit" disabled={isSubmittingProduct} className="bg-primary hover:bg-primary/90 text-on-primary font-bold py-2 px-6 rounded-lg transition-colors flex items-center gap-2">
                  {isSubmittingProduct ? <span className="material-symbols-outlined animate-spin text-sm">autorenew</span> : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Auction Modal */}
      {isAuctionModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card border border-white/10 rounded-2xl w-full max-w-md p-6">
            <h3 className="text-headline-md font-headline-md text-on-surface mb-6">Create New Auction</h3>
            
            <form onSubmit={handleCreateAuction} className="space-y-4">
              <div>
                <label className="text-label-md text-on-surface-variant block mb-1">Product</label>
                <select required value={auctionForm.product_id} onChange={e => setAuctionForm({...auctionForm, product_id: e.target.value})} className="w-full bg-surface-container border border-white/10 rounded-lg p-3 text-on-surface outline-none">
                  <option value="" disabled>Select Product</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.title} (₹{parseFloat(p.price).toLocaleString()})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-label-md text-on-surface-variant block mb-1">Starting Price (₹)</label>
                <input type="number" step="0.01" required value={auctionForm.starting_price} onChange={e => setAuctionForm({...auctionForm, starting_price: e.target.value})} className="w-full bg-surface-container border border-white/10 rounded-lg p-3 text-on-surface outline-none" placeholder="100.00" />
              </div>
              <div>
                <label className="text-label-md text-on-surface-variant block mb-1">Ends At</label>
                <input type="datetime-local" required value={auctionForm.ends_at} onChange={e => setAuctionForm({...auctionForm, ends_at: e.target.value})} className="w-full bg-surface-container border border-white/10 rounded-lg p-3 text-on-surface outline-none" />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setIsAuctionModalOpen(false)} className="px-4 py-2 text-on-surface-variant hover:text-on-surface">Cancel</button>
                <button type="submit" disabled={isSubmittingAuction} className="bg-primary hover:bg-primary/90 text-on-primary font-bold py-2 px-6 rounded-lg transition-colors flex items-center gap-2">
                  {isSubmittingAuction ? <span className="material-symbols-outlined animate-spin text-sm">autorenew</span> : 'Start Auction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Group Buy Modal */}
      {isGroupBuyModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card border border-white/10 rounded-2xl w-full max-w-md p-6">
            <h3 className="text-headline-md font-headline-md text-on-surface mb-6">Create Group Buy Session</h3>
            
            <form onSubmit={handleCreateGroupBuy} className="space-y-4">
              <div>
                <label className="text-label-md text-on-surface-variant block mb-1">Product</label>
                <select required value={groupBuyForm.product_id} onChange={e => setGroupBuyForm({...groupBuyForm, product_id: e.target.value})} className="w-full bg-surface-container border border-white/10 rounded-lg p-3 text-on-surface outline-none">
                  <option value="" disabled>Select Product</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.title} (₹{parseFloat(p.price).toLocaleString()})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-label-md text-on-surface-variant block mb-1">Target Qty</label>
                  <input type="number" required value={groupBuyForm.target_quantity} onChange={e => setGroupBuyForm({...groupBuyForm, target_quantity: e.target.value})} className="w-full bg-surface-container border border-white/10 rounded-lg p-3 text-on-surface outline-none" placeholder="10" />
                </div>
                <div>
                  <label className="text-label-md text-on-surface-variant block mb-1">Discount Price (₹)</label>
                  <input type="number" step="0.01" required value={groupBuyForm.discount_price} onChange={e => setGroupBuyForm({...groupBuyForm, discount_price: e.target.value})} className="w-full bg-surface-container border border-white/10 rounded-lg p-3 text-on-surface outline-none" placeholder="80.00" />
                </div>
              </div>
              <div>
                <label className="text-label-md text-on-surface-variant block mb-1">Expires At</label>
                <input type="datetime-local" required value={groupBuyForm.expires_at} onChange={e => setGroupBuyForm({...groupBuyForm, expires_at: e.target.value})} className="w-full bg-surface-container border border-white/10 rounded-lg p-3 text-on-surface outline-none" />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setIsGroupBuyModalOpen(false)} className="px-4 py-2 text-on-surface-variant hover:text-on-surface">Cancel</button>
                <button type="submit" disabled={isSubmittingGroupBuy} className="bg-primary hover:bg-primary/90 text-on-primary font-bold py-2 px-6 rounded-lg transition-colors flex items-center gap-2">
                  {isSubmittingGroupBuy ? <span className="material-symbols-outlined animate-spin text-sm">autorenew</span> : 'Start Group Buy'}
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
