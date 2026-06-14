import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function ProductListing() {
  const [products, setProducts] = useState([]);
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const searchParam = searchParams.get('search') || '';
  const categoryParam = searchParams.get('category_id') ? parseInt(searchParams.get('category_id')) : null;

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    setSearchQuery(searchParam);
    setSelectedCategory(categoryParam);
    fetchProducts(searchParam, categoryParam);
  }, [searchParam, categoryParam]);

  const handleAddToCartDirect = async (productId, e) => {
    e.stopPropagation();
    if (!user) {
      alert('Please log in to add items to your cart.');
      navigate('/login');
      return;
    }
    try {
      await api.post('/cart/add', { productId, quantity: 1 });
      navigate('/cart');
    } catch (error) {
      console.error('Failed to add to cart', error);
      alert('Failed to add to cart. Please try again.');
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/products/categories');
      setCategories(res.data);
    } catch (error) {
      console.error('Failed to load categories', error);
    }
  };

  const fetchProducts = async (search = '', categoryId = selectedCategory) => {
  setLoading(true);

  try {
    let endpoint = '/products?';

    if (search) endpoint += `search=${encodeURIComponent(search)}&`;
    if (categoryId) endpoint += `category_id=${categoryId}&`;

    const res = await api.get(endpoint);

    console.log("COUNT:", res.data.length);
    console.log("DATA:", res.data);

    setProducts(res.data);
  } catch (error) {
    console.error('Failed to load products', error);
  } finally {
    setLoading(false);
  }
};
const handleCategoryClick = (categoryId) => {
  const newCat = selectedCategory === categoryId ? null : categoryId;
  const params = new URLSearchParams();
  if (searchQuery.trim()) params.set('search', searchQuery.trim());
  if (newCat) params.set('category_id', newCat);
  navigate(`/products?${params.toString()}`);
};

const handleSearch = (e) => {
  e.preventDefault();

  const params = new URLSearchParams();

  if (searchQuery.trim()) {
    params.set('search', searchQuery.trim());
  }

  if (selectedCategory) {
    params.set('category_id', selectedCategory);
  }

  navigate(`/products?${params.toString()}`);
};

return (
    <main className="flex-1 lg:ml-64 p-margin-mobile md:p-margin-desktop min-h-screen flex flex-col">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <h1 className="text-headline-lg font-headline-lg text-on-surface">Discover Products</h1>
        
        <form onSubmit={handleSearch} className="relative w-full md:w-96">
          <input 
            type="text" 
            placeholder="Search AI, gadgets, fashion..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface-container-high border border-outline-variant/50 rounded-full py-3 pl-12 pr-4 text-on-surface outline-none focus:border-primary transition-colors"
          />
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
          <button type="submit" className="hidden">Search</button>
        </form>
      </div>

      {categories.length > 0 && (
        <div className="flex gap-3 overflow-x-auto pb-4 mb-6 hide-scrollbar">
          <button
            onClick={() => handleCategoryClick(null)}
            className={`px-4 py-2 rounded-full whitespace-nowrap font-bold transition-colors text-sm ${selectedCategory === null ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface-variant border border-outline-variant/30 hover:border-outline-variant/60'}`}
          >
            All Products
          </button>
          {categories.map(c => (
            <button
              key={c.id}
              onClick={() => handleCategoryClick(c.id)}
              className={`px-4 py-2 rounded-full whitespace-nowrap font-bold transition-colors text-sm ${selectedCategory === c.id ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface-variant border border-outline-variant/30 hover:border-outline-variant/60'}`}
            >
              {c.name}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <span className="material-symbols-outlined animate-spin text-4xl text-primary">autorenew</span>
        </div>
      ) : products.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-12 glass-card rounded-3xl">
          <span className="material-symbols-outlined text-[64px] text-on-surface-variant mb-4">search_off</span>
          <h2 className="text-title-lg text-on-surface mb-2">No products found</h2>
          <p className="text-body-md text-on-surface-variant">Try adjusting your search or browse our categories.</p>
          {searchQuery && (
            <button onClick={() => { setSearchQuery(''); fetchProducts(''); }} className="mt-6 text-primary font-bold hover:underline">
              Clear Search
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map(product => (
            <div 
              key={product.id} 
              onClick={() => navigate(`/product/${product.id}`)}
              className="glass-card rounded-2xl overflow-hidden cursor-pointer group hover:border-primary/50 transition-all duration-300 flex flex-col"
            >
              <div className="h-48 bg-surface-container relative overflow-hidden flex items-center justify-center">
                {product.image_url ? (
                  <img src={product.image_url} alt={product.title} className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <span className="material-symbols-outlined text-[64px] text-on-surface-variant/30 group-hover:scale-110 transition-transform duration-500">image</span>
                )}
                {product.stock_quantity <= 0 && (
                   <div className="absolute top-2 right-2 bg-error/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-white">Out of Stock</div>
                )}
              </div>
              <div className="p-5 flex flex-col flex-1">
                <h3 className="text-title-md font-title-md text-on-surface mb-1 line-clamp-1">{product.title}</h3>
                <p className="text-body-sm text-on-surface-variant line-clamp-2 mb-4 flex-1">{product.description}</p>
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-title-lg font-bold text-primary">₹{product.price}</span>
                  <button 
                    onClick={(e) => handleAddToCartDirect(product.id, e)}
                    disabled={product.stock_quantity <= 0}
                    className="w-10 h-10 rounded-full bg-surface-container-high border border-outline-variant/30 flex items-center justify-center text-on-surface hover:bg-primary hover:text-on-primary hover:border-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="material-symbols-outlined text-[20px]">shopping_cart</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
