import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function BudgetBuilder() {
  const [budget, setBudget] = useState('');
  const [itemInput, setItemInput] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [cartAdding, setCartAdding] = useState(false);
  
  const { user } = useAuth();
  const navigate = useNavigate();

  const presets = [
    {
      name: 'Gamer Setup',
      icon: 'sports_esports',
      items: ['PlayStation', 'Keyboard', 'Headphones']
    },
    {
      name: 'WFH Office',
      icon: 'desktop_windows',
      items: ['Keyboard', 'Mouse', 'Headphones']
    },
    {
      name: 'Home Theater',
      icon: 'movie',
      items: ['Projector', 'Headphones']
    }
  ];

  const handleAddItem = (e) => {
    e.preventDefault();
    if (!itemInput.trim()) return;
    const parts = itemInput
      .split(',')
      .map(item => item.trim())
      .filter(item => item.length > 0);

    const newItems = parts.filter(item => !items.includes(item));

    if (newItems.length > 0) {
      setItems([...items, ...newItems]);
      setItemInput('');
      setError('');
    } else {
      setItemInput('');
    }
  };

  const handleRemoveItem = (indexToRemove) => {
    setItems(items.filter((_, idx) => idx !== indexToRemove));
  };

  const applyPreset = (presetItems) => {
    setItems(presetItems);
    setResults(null);
    setError('');
  };

  const handleGenerate = async () => {
    setError('');
    if (!budget || isNaN(budget) || parseFloat(budget) <= 0) {
      setError('Please enter a valid budget amount.');
      return;
    }
    if (items.length === 0) {
      setError('Please add at least one product name to your shopping list.');
      return;
    }

    setLoading(true);
    setResults(null);
    try {
      const res = await api.post('/products/budget-combo', {
        budget: parseFloat(budget),
        items: items
      });
      setResults(res.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to suggest a budget combination.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddComboToCart = async () => {
    if (!user) {
      alert('Please log in to add items to your cart.');
      navigate('/login');
      return;
    }

    if (!results || results.combo.length === 0) return;

    setCartAdding(true);
    try {
      // Add each product in the combo to the cart
      await Promise.all(
        results.combo.map((item) =>
          api.post('/cart/add', {
            productId: item.product.id,
            quantity: 1
          })
        )
      );
      navigate('/cart');
    } catch (err) {
      console.error('Failed to add combo to cart', err);
      alert('Failed to add combo to cart. Please try again.');
    } finally {
      setCartAdding(false);
    }
  };

  const budgetUsedPercent = results
    ? Math.min(100, Math.round((results.total_price / results.budget) * 100))
    : 0;

  // Filter matched products vs skipped items
  const matchedCombo = results ? results.combo : [];
  const matchedItemQueries = matchedCombo.map(item => item.itemQuery);
  const skippedItems = results
    ? results.original_items.filter(item => !matchedItemQueries.includes(item))
    : [];

  return (
    <main className="flex-1 lg:ml-64 p-margin-mobile md:p-margin-desktop min-h-screen pb-24">
      {/* Title Header */}
      <div className="mb-12">
        <h1 className="text-display-sm font-display-sm text-on-surface mb-2 flex items-center gap-3">
          <span className="material-symbols-outlined text-[40px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
            account_balance_wallet
          </span>
          AI Budget Combo Builder
        </h1>
        <p className="text-body-lg text-on-surface-variant">
          Enter your total budget and desired shopping items, and let our algorithm build the highest quality combination.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
        {/* Input Panel */}
        <div className="xl:col-span-1 glass-card p-6 rounded-3xl border border-white/10 space-y-6">
          <h2 className="text-title-lg font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary">tune</span>
            Configure Combo
          </h2>

          {/* Budget Input */}
          <div className="space-y-2">
            <label className="text-label-md text-on-surface-variant font-bold block">Total Budget</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold">₹</span>
              <input
                type="number"
                placeholder="e.g. 50000"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full bg-surface-container-high border border-outline-variant/50 rounded-xl py-3 pl-10 pr-4 text-title-md text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all font-semibold"
              />
            </div>
          </div>

          {/* Item Add Input */}
          <div className="space-y-2">
            <label className="text-label-md text-on-surface-variant font-bold block">Desired Items</label>
            <form onSubmit={handleAddItem} className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. Keyboard, Headphone..."
                value={itemInput}
                onChange={(e) => setItemInput(e.target.value)}
                className="flex-1 bg-surface-container-high border border-outline-variant/50 rounded-xl py-3 px-4 text-body-md text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all"
              />
              <button
                type="submit"
                className="bg-primary hover:bg-primary/95 text-on-primary font-bold px-4 rounded-xl flex items-center justify-center transition-colors"
              >
                <span className="material-symbols-outlined">add</span>
              </button>
            </form>
          </div>

          {/* Items Tags List */}
          <div className="space-y-2">
            <span className="text-label-sm text-on-surface-variant font-bold block">Your Shopping List:</span>
            {items.length === 0 ? (
              <p className="text-body-md text-on-surface-variant/40 italic p-3 bg-surface-container-high/40 rounded-xl text-center">
                List is empty. Add items above or try a preset below.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2 p-2 bg-surface-container-high/40 rounded-xl min-h-[50px]">
                {items.map((item, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 bg-secondary/15 text-secondary border border-secondary/20 px-3 py-1 rounded-full text-xs font-bold transition-all animate-fade-in"
                  >
                    {item}
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      className="hover:text-error transition-colors flex items-center"
                    >
                      <span className="material-symbols-outlined text-[14px]">close</span>
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Presets */}
          <div className="space-y-3 pt-2">
            <span className="text-label-sm text-on-surface-variant font-bold block">Quick Presets:</span>
            <div className="grid grid-cols-3 gap-2">
              {presets.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => applyPreset(preset.items)}
                  className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border border-outline-variant/30 bg-surface-container-high/50 hover:bg-surface-container-high hover:border-primary/45 transition-all group text-center"
                >
                  <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors">
                    {preset.icon}
                  </span>
                  <span className="text-[10px] font-bold text-on-surface truncate w-full">
                    {preset.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="bg-error/15 border border-error/30 text-error px-4 py-3 rounded-xl text-sm font-semibold">
              {error}
            </div>
          )}

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/90 text-on-primary font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 text-title-md mt-6 shadow-[0_4px_12px_rgba(255,200,60,0.2)]"
          >
            {loading ? (
              <>
                <span className="material-symbols-outlined animate-spin">autorenew</span>
                Analyzing Combo...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined">psychology</span>
                Build Best Combo
              </>
            )}
          </button>
        </div>

        {/* Results Panel */}
        <div className="xl:col-span-2 space-y-6">
          {loading && (
            <div className="glass-card p-12 rounded-3xl border border-white/10 flex flex-col items-center justify-center min-h-[400px] text-center space-y-4">
              <span className="material-symbols-outlined animate-spin text-[64px] text-primary">psychology</span>
              <h3 className="text-title-lg font-bold text-on-surface">AI Engine Running</h3>
              <p className="text-body-md text-on-surface-variant max-w-md">
                Searching product catalog for active matches, scoring quality metrics, and solving knapsack boundaries to maximize value...
              </p>
            </div>
          )}

          {!loading && !results && (
            <div className="glass-card p-12 rounded-3xl border border-white/10 flex flex-col items-center justify-center min-h-[400px] text-center space-y-4">
              <span className="material-symbols-outlined text-[80px] text-on-surface-variant/40">shopping_bag</span>
              <h3 className="text-title-lg font-bold text-on-surface">No Combination Yet</h3>
              <p className="text-body-md text-on-surface-variant max-w-md">
                Configure your budget and list of desired items on the left side, then click "Build Best Combo" to see suggestions.
              </p>
            </div>
          )}

          {!loading && results && (
            <div className="space-y-6">
              {/* Summary Dashboard */}
              <div className="glass-card p-6 rounded-3xl border border-white/10 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                {/* Circular Chart/Progress */}
                <div className="col-span-1 flex flex-col items-center justify-center text-center p-2 border-b md:border-b-0 md:border-r border-outline-variant/30">
                  <div className="relative w-28 h-28 flex items-center justify-center mb-2">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="56"
                        cy="56"
                        r="48"
                        className="stroke-surface-container-high fill-none"
                        strokeWidth="8"
                      />
                      <circle
                        cx="56"
                        cy="56"
                        r="48"
                        className="stroke-primary fill-none transition-all duration-1000"
                        strokeWidth="8"
                        strokeDasharray={2 * Math.PI * 48}
                        strokeDashoffset={2 * Math.PI * 48 * (1 - budgetUsedPercent / 100)}
                      />
                    </svg>
                    <span className="absolute text-title-lg font-bold text-on-surface">
                      {budgetUsedPercent}%
                    </span>
                  </div>
                  <span className="text-label-sm text-on-surface-variant font-bold uppercase tracking-wider">
                    Budget Utilised
                  </span>
                </div>

                {/* Financial Summary */}
                <div className="col-span-1 md:col-span-2 space-y-4 px-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-label-sm text-on-surface-variant uppercase tracking-wider block">Target Budget</span>
                      <span className="text-title-lg font-bold text-on-surface">₹{results.budget.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-label-sm text-on-surface-variant uppercase tracking-wider block">Combo Cost</span>
                      <span className="text-title-lg font-bold text-primary">₹{results.total_price.toLocaleString()}</span>
                    </div>
                  </div>
                  
                  {/* Progress Info Banner */}
                  <div className="bg-primary/10 border border-primary/20 text-primary text-xs px-3 py-2 rounded-lg flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">info</span>
                    Successfully matched {results.matched_count} of {results.original_items.length} items.
                  </div>
                </div>
              </div>

              {/* Matched Products List */}
              <div className="space-y-4">
                <h3 className="text-title-lg font-bold text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#10B981]">check_circle</span>
                  Matched Combo Items
                </h3>

                {matchedCombo.length === 0 ? (
                  <div className="glass-card p-8 rounded-2xl text-center text-on-surface-variant italic">
                    Could not match any products under your budget constraint. Try increasing your budget.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {matchedCombo.map((item, idx) => {
                      const prod = item.product;
                      return (
                        <div
                          key={idx}
                          className="glass-card p-5 rounded-2xl border border-white/5 flex flex-col sm:flex-row items-center gap-6 hover:shadow-lg transition-shadow duration-300"
                        >
                          {/* Image */}
                          <div className="w-24 h-24 rounded-xl overflow-hidden bg-surface-container flex items-center justify-center shrink-0 border border-outline-variant/20">
                            {prod.image_url ? (
                              <img src={prod.image_url} alt={prod.title} className="w-full h-full object-contain mix-blend-multiply" />
                            ) : (
                              <span className="material-symbols-outlined text-4xl text-on-surface-variant/40">image</span>
                            )}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0 space-y-1.5 text-center sm:text-left">
                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                              <span className="px-2.5 py-0.5 bg-secondary/15 text-secondary text-[10px] font-bold rounded-full uppercase">
                                Requested: "{item.itemQuery}"
                              </span>
                              <span className="px-2.5 py-0.5 bg-surface-variant text-on-surface-variant text-[10px] font-bold rounded-full">
                                {prod.category_name}
                              </span>
                            </div>
                            <h4 className="text-title-md font-bold text-on-surface truncate">{prod.title}</h4>
                            <p className="text-body-sm text-on-surface-variant line-clamp-1">{prod.description}</p>
                          </div>

                          {/* Price & Rating */}
                          <div className="text-center sm:text-right shrink-0 space-y-2">
                            <span className="text-title-md font-bold text-primary block">₹{parseFloat(prod.price).toLocaleString()}</span>
                            <div className="flex items-center justify-center sm:justify-end gap-3 text-xs">
                              {prod.rating && (
                                <span className="flex items-center gap-0.5 text-[#F59E0B] font-bold">
                                  <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                  {parseFloat(prod.rating).toFixed(1)}
                                </span>
                              )}
                              {prod.ai_match_score && (
                                <span className="flex items-center gap-0.5 text-primary font-bold">
                                  <span className="material-symbols-outlined text-[14px]">psychology</span>
                                  {prod.ai_match_score}%
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Skipped Items (if any) */}
              {skippedItems.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-title-lg font-bold text-on-surface flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#F59E0B]">warning</span>
                    Skipped Items (Exceeded Budget)
                  </h3>
                  <div className="bg-surface-container border border-outline-variant/30 p-4 rounded-2xl flex flex-wrap gap-2">
                    {skippedItems.map((item, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center bg-outline-variant/15 text-on-surface-variant border border-outline-variant/30 px-3 py-1 rounded-full text-xs font-bold line-through"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                  <p className="text-body-sm text-on-surface-variant">
                    These items could not be included because doing so would exceed your total budget of ₹{results.budget.toLocaleString()}.
                  </p>
                </div>
              )}

              {/* Action Button */}
              {matchedCombo.length > 0 && (
                <button
                  onClick={handleAddComboToCart}
                  disabled={cartAdding}
                  className="w-full bg-secondary hover:bg-secondary/90 text-on-secondary font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 text-title-md shadow-lg"
                >
                  {cartAdding ? (
                    <>
                      <span className="material-symbols-outlined animate-spin">autorenew</span>
                      Adding Combo to Cart...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined">shopping_cart</span>
                      Add Complete Combo to Cart
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
