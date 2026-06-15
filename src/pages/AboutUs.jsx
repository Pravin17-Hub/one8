import React from 'react';

export default function AboutUs() {
  return (
    <main className="flex-1 lg:ml-64 p-margin-mobile md:p-margin-desktop min-h-screen pb-20">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-display-md font-display-md text-on-surface mb-8">About One8 AI</h1>
        <div className="glass-card rounded-3xl p-8 md:p-12 space-y-6 border border-white/10 shadow-xl">
          <section className="space-y-4">
            <h2 className="text-headline-md font-headline-md text-primary font-bold">Our Story</h2>
            <p className="text-body-lg text-on-surface-variant leading-relaxed">
              Founded in <strong>2026</strong> by visionary entrepreneur <strong>Pravin</strong>, One8 AI Marketplace has redefined luxury commerce. We merge high-performance lifestyle products with next-generation artificial intelligence to deliver an unparalleled personal shopping experience.
            </p>
          </section>

          <section className="space-y-4 pt-6 border-t border-white/5">
            <h2 className="text-title-lg font-title-lg text-primary font-semibold">The Vision of founder Pravin</h2>
            <p className="text-body-md text-on-surface-variant leading-relaxed">
              "We believe that premium products deserve a premium experience. One8 AI wasn't just built as a store, but as an intelligent companion that guides every athlete, enthusiast, and trendsetter to exactly what they need, matching their exact style and budget constraint."
            </p>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
            <div className="p-6 bg-surface-container rounded-2xl border border-white/5">
              <span className="material-symbols-outlined text-3xl text-secondary mb-3">psychology</span>
              <h3 className="text-title-sm font-semibold mb-2">AI-Driven Match</h3>
              <p className="text-body-xs text-on-surface-variant">Our algorithms analyze specs to match you with gear that fits your style and budget perfectly.</p>
            </div>
            <div className="p-6 bg-surface-container rounded-2xl border border-white/5">
              <span className="material-symbols-outlined text-3xl text-tertiary mb-3">groups</span>
              <h3 className="text-title-sm font-semibold mb-2">Community Led</h3>
              <p className="text-body-xs text-on-surface-variant">Unlock custom wholesale prices via our Group Buy and dynamic Live Auctions systems.</p>
            </div>
            <div className="p-6 bg-surface-container rounded-2xl border border-white/5">
              <span className="material-symbols-outlined text-3xl text-primary mb-3">verified</span>
              <h3 className="text-title-sm font-semibold mb-2">100% Certified</h3>
              <p className="text-body-xs text-on-surface-variant">Every product is verified and guaranteed authentic by the One8 curation network.</p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
