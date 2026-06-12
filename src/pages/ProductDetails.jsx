import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';

export default function ProductDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [metrics, setMetrics] = useState({ buyers: 0, comments: 0, rating: 0 });

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/products/${id}`);
        setProduct(res.data);
        setMetrics({
          buyers: Math.floor(Math.random() * 1000) + 50,
          comments: Math.floor(Math.random() * 300) + 10,
          rating: (Math.random() * 1 + 4).toFixed(1)
        });
        
        if (res.data.category_id) {
          const relRes = await api.get(`/products?category_id=${res.data.category_id}&limit=5`);
          setRelatedProducts(relRes.data.filter(p => p.id !== Number(id)).slice(0, 4));
        }
      } catch (error) {
        console.error('Failed to load product details', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) {
      alert('Please log in to add items to your cart.');
      navigate('/login');
      return;
    }
    
    setAddingToCart(true);
    try {
      await api.post('/cart/add', { productId: product.id, quantity });
      navigate('/cart');
    } catch (error) {
      console.error('Failed to add to cart', error);
      alert('Failed to add to cart. Please try again.');
    } finally {
      setAddingToCart(false);
    }
  };

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

  if (loading) {
    return (
      <main className="flex-1 lg:ml-64 min-h-screen flex items-center justify-center">
        <span className="material-symbols-outlined animate-spin text-4xl text-primary">autorenew</span>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="flex-1 lg:ml-64 p-margin-mobile md:p-margin-desktop min-h-screen flex items-center justify-center flex-col">
        <span className="material-symbols-outlined text-[64px] text-on-surface-variant mb-4">sentiment_dissatisfied</span>
        <h1 className="text-title-lg text-on-surface mb-4">Product Not Found</h1>
        <button onClick={() => navigate('/products')} className="text-primary hover:underline">Back to Catalog</button>
      </main>
    );
  }

  const isOutOfStock = product.stock_quantity <= 0;

  return (
    <main className="flex-1 lg:ml-64 p-margin-mobile md:p-margin-desktop min-h-screen">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-on-surface-variant hover:text-on-surface mb-8 transition-colors">
        <span className="material-symbols-outlined">arrow_back</span>
        Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Image Gallery Mock */}
        <div className="space-y-4">
          <div className="w-full h-[400px] md:h-[500px] glass-card rounded-3xl overflow-hidden border border-outline-variant/30 relative bg-surface-container flex items-center justify-center">
            {product.images && product.images.length > 0 ? (
              <img src={product.images[0].image_url} alt={product.title} className="w-full h-full object-contain mix-blend-multiply" />
            ) : (
              <span className="material-symbols-outlined text-[120px] text-on-surface-variant/40">inventory_2</span>
            )}
          </div>
          {product.images && product.images.length > 1 && (
            <div className="flex gap-4 overflow-x-auto pb-2">
              {product.images.slice(1).map((img, idx) => (
                <div key={idx} className="w-24 h-24 shrink-0 glass-card rounded-xl overflow-hidden cursor-pointer hover:border-primary/50 transition-colors border border-outline-variant/30">
                  <img src={img.image_url} alt={`${product.title} thumbnail`} className="w-full h-full object-contain mix-blend-multiply" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex flex-col">
          <div className="mb-2 flex items-center gap-3">
             {isOutOfStock ? (
               <span className="px-3 py-1 bg-error/20 text-error text-xs font-bold rounded-full uppercase tracking-wider">Out of Stock</span>
             ) : (
               <span className="px-3 py-1 bg-[#10B981]/20 text-[#10B981] text-xs font-bold rounded-full uppercase tracking-wider">In Stock</span>
             )}
             <span className="text-label-md text-on-surface-variant">Store ID: {product.store_id}</span>
          </div>
          
          <h1 className="text-display-sm font-display-sm text-on-surface mb-4">{product.title}</h1>
          <p className="text-headline-md font-bold text-primary mb-4">₹{product.price}</p>
          
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <div className="flex items-center gap-1 text-on-surface-variant bg-surface-variant/50 px-3 py-1.5 rounded-full border border-outline-variant/30">
              <span className="material-symbols-outlined text-sm">shopping_cart</span>
              <span className="text-sm font-medium">{metrics.buyers} Buyers</span>
            </div>
            <div className="flex items-center gap-1 text-on-surface-variant bg-surface-variant/50 px-3 py-1.5 rounded-full border border-outline-variant/30">
              <span className="material-symbols-outlined text-sm">chat_bubble</span>
              <span className="text-sm font-medium">{metrics.comments} Comments</span>
            </div>
            <div className="flex items-center gap-1 text-[#F59E0B] bg-[#F59E0B]/10 px-3 py-1.5 rounded-full border border-[#F59E0B]/20">
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              <span className="text-sm font-bold">{metrics.rating}</span>
            </div>
          </div>
          
          <div className="prose max-w-none mb-8 text-on-surface-variant">
            <p className="text-body-lg leading-relaxed whitespace-pre-wrap">
              {product.description}
            </p>
          </div>
          
          <div className="mt-auto glass-card p-6 rounded-2xl border border-outline-variant/30">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center justify-between bg-surface-container border border-outline-variant/30 rounded-xl px-2 shrink-0">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={isOutOfStock}
                  className="p-3 text-on-surface-variant hover:text-on-surface disabled:opacity-50"
                >
                  <span className="material-symbols-outlined">remove</span>
                </button>
                <span className="w-12 text-center text-title-md font-bold text-on-surface">{quantity}</span>
                <button 
                  onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                  disabled={isOutOfStock}
                  className="p-3 text-on-surface-variant hover:text-on-surface disabled:opacity-50"
                >
                  <span className="material-symbols-outlined">add</span>
                </button>
              </div>
              
              <button 
                onClick={handleAddToCart}
                disabled={isOutOfStock || addingToCart}
                className="flex-1 bg-primary hover:bg-primary/90 text-on-primary font-bold py-4 px-8 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {addingToCart ? (
                  <span className="material-symbols-outlined animate-spin">autorenew</span>
                ) : (
                  <>
                    <span className="material-symbols-outlined">shopping_cart</span>
                    Add to Cart
                  </>
                )}
              </button>

              {/* Wishlist Button */}
              {product && (
                <button
                  type="button"
                  onClick={() => toggleWishlist(product)}
                  className={`px-4 rounded-xl border flex items-center justify-center transition-all ${
                    isInWishlist(product.id)
                      ? 'border-primary/50 bg-primary/10 text-primary hover:bg-primary/20'
                      : 'border-outline-variant/30 hover:bg-surface-variant/30 text-on-surface'
                  }`}
                  title={isInWishlist(product.id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
                >
                  <span className="material-symbols-outlined" style={isInWishlist(product.id) ? { fontVariationSettings: "'FILL' 1" } : {}}>
                    favorite
                  </span>
                </button>
              )}
            </div>
            {!isOutOfStock && product.stock_quantity < 5 && (
              <p className="text-label-sm text-[#F59E0B] mt-4 text-center">Only {product.stock_quantity} left in stock - order soon.</p>
            )}
          </div>
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <div className="mt-16">
          <h2 className="text-headline-sm font-headline-sm text-on-surface mb-6 font-bold border-b border-outline-variant/30 pb-2">Related Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map(relProduct => {
              // Add random metrics for the related cards as well
              const relBuyers = Math.floor(Math.random() * 500) + 10;
              const relComments = Math.floor(Math.random() * 100) + 2;
              const relRating = (Math.random() * 1 + 4).toFixed(1);
              
              return (
                <div 
                  key={relProduct.id} 
                  onClick={() => navigate(`/product/${relProduct.id}`)}
                  className="glass-card rounded-2xl overflow-hidden cursor-pointer group hover:border-primary/50 transition-all duration-300 flex flex-col"
                >
                  <div className="h-48 bg-surface-container relative overflow-hidden flex items-center justify-center">
                    {relProduct.image_url ? (
                      <img src={relProduct.image_url} alt={relProduct.title} className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <span className="material-symbols-outlined text-[64px] text-on-surface-variant/30 group-hover:scale-110 transition-transform duration-500">image</span>
                    )}
                    {relProduct.stock_quantity <= 0 && (
                       <div className="absolute top-2 right-2 bg-error/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-white">Out of Stock</div>
                    )}
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="text-title-md font-title-md text-on-surface mb-1 line-clamp-1">{relProduct.title}</h3>
                    <div className="flex items-center gap-3 mt-1 mb-3 text-on-surface-variant">
                      <div className="flex items-center gap-1 text-[12px]">
                        <span className="material-symbols-outlined text-[14px]">shopping_cart</span>
                        {relBuyers}
                      </div>
                      <div className="flex items-center gap-1 text-[12px]">
                        <span className="material-symbols-outlined text-[14px]">chat_bubble</span>
                        {relComments}
                      </div>
                      <div className="flex items-center gap-1 text-[#F59E0B] text-[12px]">
                        <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                        {relRating}
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-auto">
                      <span className="text-title-lg font-bold text-primary">₹{relProduct.price}</span>
                      <button 
                        onClick={(e) => handleAddToCartDirect(relProduct.id, e)}
                        disabled={relProduct.stock_quantity <= 0}
                        className="w-10 h-10 rounded-full bg-surface-container-high border border-outline-variant/30 flex items-center justify-center text-on-surface hover:bg-primary hover:text-on-primary hover:border-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="material-symbols-outlined text-[20px]">shopping_cart</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </main>
  );
}
