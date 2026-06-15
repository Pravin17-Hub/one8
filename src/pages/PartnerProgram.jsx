import React from 'react';

export default function PartnerProgram() {
  return (
    <main className="flex-1 lg:ml-64 p-margin-mobile md:p-margin-desktop min-h-screen pb-20">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-display-md font-display-md text-on-surface mb-8">One8 Partner Program</h1>
        <div className="glass-card rounded-3xl p-8 md:p-12 space-y-6 border border-white/10 shadow-xl">
          <section className="space-y-4">
            <h2 className="text-headline-md font-headline-md text-secondary font-bold">Collaborate & Grow</h2>
            <p className="text-body-lg text-on-surface-variant leading-relaxed">
              Are you a premium local seller, elite manufacturer, or brand influencer? Join the One8 Partner Program to showcase your collection to millions of high-intent buyers looking for active luxury gear.
            </p>
          </section>

          <section className="space-y-4 pt-6 border-t border-white/5">
            <h2 className="text-title-lg font-title-lg text-on-surface font-semibold">Program Benefits</h2>
            <ul className="list-disc pl-6 space-y-3 text-body-md text-on-surface-variant">
              <li><strong>Reduced Commissions:</strong> Keep more of your revenue with our partner-first low commission model.</li>
              <li><strong>AI Assisted Curation:</strong> Benefit from our search algorithms matching your inventory with local buyers.</li>
              <li><strong>Priority Fulfilment:</strong> Access One8 express dispatch corridors to guarantee ultra-fast delivery.</li>
              <li><strong>Co-branding Promotions:</strong> Exclusive display tags and seasonal sales highlighting certified partners.</li>
            </ul>
          </section>

          <section className="p-6 bg-surface-container rounded-2xl border border-white/5 text-center space-y-4">
            <h3 className="text-title-md font-bold text-on-surface">Ready to launch your shop?</h3>
            <p className="text-body-sm text-on-surface-variant">Click register, select "Seller" role, and set up your store configuration in seconds.</p>
          </section>
        </div>
      </div>
    </main>
  );
}
