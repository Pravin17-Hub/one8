import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import gsap from 'gsap';
import ThreeDHeroVisualizer from '../components/ThreeDHeroVisualizer';
import { useLanguage } from '../context/LanguageContext';

export default function Home() {
  const [smartMatches, setSmartMatches] = useState([]);
  const [priceDrops, setPriceDrops] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const navigate = useNavigate();
  const homeRef = useRef(null);
  const { language, t } = useLanguage();

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const res = await api.get('/products?limit=24');
        const allProducts = res.data;
        const count = allProducts.length;
        
        if (count > 0) {
          const sortedByMatch = [...allProducts].sort((a, b) => b.ai_match_score - a.ai_match_score);
          setSmartMatches(sortedByMatch.slice(0, Math.min(4, count)));
          
          const pdStart = count >= 8 ? 4 : 0;
          const pdEnd = count >= 8 ? 8 : Math.min(4, count);
          setPriceDrops(allProducts.slice(pdStart, pdEnd));
          
          const sortedByRating = [...allProducts].sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
          const trStart = count >= 12 ? 8 : 0;
          const trEnd = count >= 12 ? 12 : Math.min(4, count);
          setTrendingProducts(sortedByRating.slice(trStart, trEnd));
        }
      } catch (error) {
        console.error('Failed to fetch home page products', error);
      }
    };
    fetchHomeData();
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Intro animations
      gsap.fromTo('.hero-badge-anim', 
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', delay: 0.1 }
      );
      gsap.fromTo('.hero-title-anim',
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 1, ease: 'power4.out', delay: 0.2 }
      );
      gsap.fromTo('.hero-desc-anim',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', delay: 0.4 }
      );
      gsap.fromTo('.hero-actions-anim',
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', delay: 0.5 }
      );
      gsap.fromTo('.hero-right-anim',
        { opacity: 0, scale: 0.85 },
        { opacity: 1, scale: 1, duration: 1.2, ease: 'back.out(1.5)', delay: 0.3 }
      );
      gsap.fromTo('.feature-card-anim',
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.15, delay: 0.6 }
      );
    }, homeRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (smartMatches.length > 0) {
      gsap.fromTo('.smart-match-card',
        { opacity: 0, y: 35, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: 'power2.out', stagger: 0.1 }
      );
    }
  }, [smartMatches]);

  useEffect(() => {
    if (priceDrops.length > 0) {
      gsap.fromTo('.price-drop-card',
        { opacity: 0, y: 35, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: 'power2.out', stagger: 0.1 }
      );
    }
  }, [priceDrops]);

  useEffect(() => {
    if (trendingProducts.length > 0) {
      gsap.fromTo('.trending-card',
        { opacity: 0, y: 35, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: 'power2.out', stagger: 0.1 }
      );
    }
  }, [trendingProducts]);

  return (
    <main ref={homeRef} className="flex-1 lg:ml-64 p-margin-mobile md:p-margin-desktop min-h-screen pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden glass-card rounded-3xl p-8 md:p-16 mb-16 border border-white/10 flex flex-col md:flex-row items-center gap-8 group">
        {/* Abstract Background Elements */}
        <div className="absolute top-[-50%] left-[-10%] w-96 h-96 bg-primary/20 blur-[120px] rounded-full pointer-events-none transition-transform duration-1000 group-hover:scale-110"></div>
        <div className="absolute bottom-[-50%] right-[-10%] w-96 h-96 bg-tertiary/20 blur-[120px] rounded-full pointer-events-none transition-transform duration-1000 group-hover:scale-110"></div>

        <div className="flex-1 relative z-10 text-center md:text-left">
          <span className="hero-badge-anim inline-block px-4 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-label-sm font-bold uppercase tracking-widest mb-6">
            {t('theFutureOfCommerce')}
          </span>
          <h1 className="hero-title-anim text-display-md md:text-display-lg font-display-md md:font-display-lg text-on-surface mb-6 leading-tight">
            {language === 'en' ? (
              <>Play with Passion, Shop with <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-tertiary">Intelligence</span></>
            ) : language === 'ta' ? (
              <>ஆர்வத்துடன் விளையாடுங்கள், புத்திசாலித்தனத்துடன் <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-tertiary">ஷாப்பிங் செய்யுங்கள்</span></>
            ) : language === 'hi' ? (
              <>जुनून के साथ खेलें, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-tertiary">समझदारी से खरीदारी करें</span></>
            ) : language === 'es' ? (
              <>Juega con Pasión, Compra con <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-tertiary">Inteligencia</span></>
            ) : (
              <>Jouez avec Passion, Achetez avec <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-tertiary">Intelligence</span></>
            )}
          </h1>
          <p className="hero-desc-anim text-body-lg text-on-surface-variant mb-8 max-w-xl mx-auto md:mx-0 italic font-light">
            {t('heroSubtitle')} <span className="block mt-2 font-bold not-italic text-sm text-primary">{t('brandAmbassador')}</span>
          </p>
          <div className="hero-actions-anim flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4">
            <button 
              onClick={() => navigate('/ai-assistant')}
              className="w-full sm:w-auto px-8 py-4 bg-primary hover:bg-primary/90 text-on-primary font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(255,200,60,0.3)] hover:shadow-[0_0_30px_rgba(255,200,60,0.5)] hover:-translate-y-1"
            >
              <span className="material-symbols-outlined">psychology</span>
              {t('askAiAssistant')}
            </button>
            <button 
              onClick={() => navigate('/products')}
              className="w-full sm:w-auto px-8 py-4 bg-surface-container-high hover:bg-white/10 text-on-surface font-bold rounded-xl border border-white/10 transition-all hover:-translate-y-1"
            >
              {t('browseCatalog')}
            </button>
          </div>
        </div>

        <div className="flex-1 relative z-10 flex justify-center mt-8 md:mt-0 hero-right-anim">
           <div className="relative w-72 h-72 md:w-96 md:h-96 flex items-center justify-center">
              {/* Three.js interactive visualizer */}
              <div className="absolute inset-0 z-0">
                 <ThreeDHeroVisualizer />
              </div>
              
              {/* Floating image container */}
              <div className="absolute w-40 h-40 md:w-52 md:h-52 rounded-full overflow-hidden bg-surface-container-high/40 flex items-center justify-center shadow-2xl border border-primary/20 z-10 hover:scale-110 transition-transform duration-500">
                 <img 
                   src="/one8/virat.jpg" 
                   alt="Virat Kohli" 
                   className="w-full h-full object-cover object-top scale-110 hover:scale-125 transition-transform duration-500" 
                 />
              </div>
              
              {/* Floating badges */}
              <div className="absolute top-4 right-0 glass-card px-4 py-2 rounded-full text-xs font-bold text-primary animate-bounce shadow-lg border border-white/10 z-20">
                 {t('priceDrops')}
              </div>
              <div className="absolute bottom-12 left-0 glass-card px-4 py-2 rounded-full text-xs font-bold text-secondary animate-pulse shadow-lg border border-white/10 z-20">
                 {t('aiSmartMatches')}
              </div>
           </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="mb-20">
        <div className="flex items-center justify-between mb-8">
           <h2 className="text-headline-md font-headline-md text-on-surface">{t('exploreModes')}</h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <FeatureCard 
            title={t('groupBuy')} 
            desc={t('groupBuyDesc')}
            icon="groups"
            color="text-secondary"
            bg="group-hover:bg-secondary/10"
            border="hover:border-secondary/50"
            onClick={() => navigate('/group-buy')}
          />
          <FeatureCard 
            title={t('liveAuctions')} 
            desc={t('liveAuctionsDesc')}
            icon="gavel"
            color="text-tertiary"
            bg="group-hover:bg-tertiary/10"
            border="hover:border-tertiary/50"
            onClick={() => navigate('/auctions')}
          />
          <FeatureCard 
            title={t('budgetBuilder')} 
            desc={t('budgetBuilderDesc')}
            icon="account_balance_wallet"
            color="text-primary"
            bg="group-hover:bg-primary/10"
            border="hover:border-primary/50"
            onClick={() => navigate('/budget-builder')}
          />
        </div>
      </section>

      {/* Smart Matches Section */}
      <section className="mb-16">
        <div className="flex items-center justify-between mb-8">
           <h2 className="text-headline-md font-headline-md text-on-surface flex items-center gap-2">
             <span className="material-symbols-outlined text-primary">psychology</span>
             {t('aiSmartMatches')}
           </h2>
           <button onClick={() => navigate('/products')} className="text-primary font-bold hover:underline flex items-center gap-1 text-sm uppercase tracking-wider">
             {t('viewAll')} <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
           </button>
        </div>

        {smartMatches.length === 0 ? (
           <div className="glass-card p-12 rounded-2xl flex items-center justify-center border border-white/5">
              <span className="material-symbols-outlined animate-spin text-primary text-3xl">autorenew</span>
           </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {smartMatches.map(product => (
              <div 
                key={product.id} 
                onClick={() => navigate(`/product/${product.id}`)}
                className="smart-match-card glass-card rounded-2xl overflow-hidden cursor-pointer group hover:border-primary/50 transition-all duration-300 flex flex-col h-full"
              >
                <div className="h-40 bg-surface-container relative overflow-hidden flex items-center justify-center">
                  <div className="absolute top-2 left-2 bg-primary/90 text-on-primary text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 shadow-sm border border-primary/20 z-10">
                    <span className="material-symbols-outlined text-[12px]">psychology</span>
                    {product.ai_match_score || 95}% {t('match')}
                  </div>
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.title} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <span className="material-symbols-outlined text-5xl text-on-surface-variant/30 group-hover:scale-110 transition-transform duration-500">image</span>
                  )}
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="text-title-sm font-title-sm text-on-surface mb-1 line-clamp-1">{product.title}</h3>
                  <div className="flex items-center justify-between mt-auto pt-4">
                    <span className="text-title-md font-bold text-primary">₹{product.price}</span>
                    <button 
                      onClick={(e) => { e.stopPropagation(); navigate(`/product/${product.id}`); }}
                      className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center hover:bg-primary hover:text-on-primary transition-colors"
                    >
                      <span className="material-symbols-outlined text-[16px]">add</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Price Drops Section */}
      <section className="mb-16">
        <div className="flex items-center justify-between mb-8">
           <h2 className="text-headline-md font-headline-md text-on-surface flex items-center gap-2">
             <span className="material-symbols-outlined text-error">sell</span>
             {t('priceDrops')}
           </h2>
           <button onClick={() => navigate('/products')} className="text-primary font-bold hover:underline flex items-center gap-1 text-sm uppercase tracking-wider">
             {t('viewAll')} <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
           </button>
        </div>

        {priceDrops.length === 0 ? (
           <div className="glass-card p-12 rounded-2xl flex items-center justify-center border border-white/5">
              <span className="material-symbols-outlined animate-spin text-primary text-3xl">autorenew</span>
           </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {priceDrops.map((product, idx) => {
              const discountPercent = 20 + (idx * 5); // 20%, 25%, 30%, 35%
              const originalPrice = parseFloat(product.price) / (1 - discountPercent / 100);
              return (
                <div 
                  key={product.id} 
                  onClick={() => navigate(`/product/${product.id}`)}
                  className="price-drop-card glass-card rounded-2xl overflow-hidden cursor-pointer group hover:border-primary/50 transition-all duration-300 flex flex-col h-full"
                >
                  <div className="h-40 bg-surface-container relative overflow-hidden flex items-center justify-center">
                    <div className="absolute top-2 left-2 bg-error text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm z-10">
                      {t('save')} {discountPercent}%
                    </div>
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.title} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <span className="material-symbols-outlined text-5xl text-on-surface-variant/30 group-hover:scale-110 transition-transform duration-500">image</span>
                    )}
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="text-title-sm font-title-sm text-on-surface mb-1 line-clamp-1">{product.title}</h3>
                    <div className="flex items-center justify-between mt-auto pt-4">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-title-md font-bold text-primary">₹{parseFloat(product.price).toFixed(0)}</span>
                        <span className="text-body-xs text-on-surface-variant line-through">₹{originalPrice.toFixed(0)}</span>
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); navigate(`/product/${product.id}`); }}
                        className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center hover:bg-primary hover:text-on-primary transition-colors"
                      >
                        <span className="material-symbols-outlined text-[16px]">add</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Trending Products Section */}
      <section>
        <div className="flex items-center justify-between mb-8">
           <h2 className="text-headline-md font-headline-md text-on-surface flex items-center gap-2">
             <span className="material-symbols-outlined text-[#F59E0B]">trending_up</span>
             {t('trendingNow')}
           </h2>
           <button onClick={() => navigate('/products')} className="text-primary font-bold hover:underline flex items-center gap-1 text-sm uppercase tracking-wider">
             {t('viewAll')} <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
           </button>
        </div>

        {trendingProducts.length === 0 ? (
           <div className="glass-card p-12 rounded-2xl flex items-center justify-center border border-white/5">
              <span className="material-symbols-outlined animate-spin text-primary text-3xl">autorenew</span>
           </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {trendingProducts.map(product => (
              <div 
                key={product.id} 
                onClick={() => navigate(`/product/${product.id}`)}
                className="trending-card glass-card rounded-2xl overflow-hidden cursor-pointer group hover:border-primary/50 transition-all duration-300 flex flex-col h-full"
              >
                <div className="h-40 bg-surface-container relative overflow-hidden flex items-center justify-center">
                  <div className="absolute top-2 left-2 bg-[#F59E0B]/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 shadow-sm z-10">
                    <span className="material-symbols-outlined text-[12px] fill-current">star</span>
                    {product.rating || '4.5'}
                  </div>
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.title} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <span className="material-symbols-outlined text-5xl text-on-surface-variant/30 group-hover:scale-110 transition-transform duration-500">image</span>
                  )}
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="text-title-sm font-title-sm text-on-surface mb-1 line-clamp-1">{product.title}</h3>
                  <div className="flex items-center justify-between mt-auto pt-4">
                    <span className="text-title-md font-bold text-primary">₹{product.price}</span>
                    <button 
                      onClick={(e) => { e.stopPropagation(); navigate(`/product/${product.id}`); }}
                      className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center hover:bg-primary hover:text-on-primary transition-colors"
                    >
                      <span className="material-symbols-outlined text-[16px]">add</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function FeatureCard({ title, desc, icon, color, bg, border, onClick }) {
  return (
    <div 
      onClick={onClick}
      className={`feature-card-anim glass-card p-6 rounded-3xl border border-white/10 cursor-pointer group transition-all duration-300 ${border} hover:-translate-y-1 relative overflow-hidden`}
    >
      <div className={`absolute -right-10 -top-10 w-40 h-40 rounded-full transition-colors duration-500 blur-2xl ${bg}`}></div>
      <div className="relative z-10">
        <div className={`w-14 h-14 rounded-2xl bg-surface-container-high border border-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 ${color}`}>
          <span className="material-symbols-outlined text-3xl">{icon}</span>
        </div>
        <h3 className="text-title-lg font-title-lg text-on-surface mb-2">{title}</h3>
        <p className="text-body-md text-on-surface-variant">{desc}</p>
      </div>
    </div>
  );
}
