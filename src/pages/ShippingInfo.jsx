import React from 'react';

export default function ShippingInfo() {
  return (
    <main className="flex-1 lg:ml-64 p-margin-mobile md:p-margin-desktop min-h-screen pb-20">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-display-md font-display-md text-on-surface mb-8">Shipping & Delivery</h1>
        <div className="glass-card rounded-3xl p-8 md:p-12 space-y-6 border border-white/10 shadow-xl">
          <section className="space-y-4">
            <h2 className="text-headline-md font-headline-md text-primary font-bold">Fast, Reliable Curation Dispatch</h2>
            <p className="text-body-lg text-on-surface-variant leading-relaxed">
              We process and dispatch luxury items through our verified carrier network to make sure they reach you securely. Every shipment is fully insured.
            </p>
          </section>

          <section className="space-y-4 pt-6 border-t border-white/5">
            <h2 className="text-title-lg font-title-lg text-on-surface font-semibold">Delivery Timelines</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-surface-container rounded-xl">
                <h3 className="font-bold text-primary mb-1">Standard Shipping</h3>
                <p className="text-body-sm text-on-surface-variant">3 to 5 business days. Free for all orders above ₹4,999.</p>
              </div>
              <div className="p-4 bg-surface-container rounded-xl">
                <h3 className="font-bold text-secondary mb-1">Express Delivery</h3>
                <p className="text-body-sm text-on-surface-variant">1 to 2 business days. Available on checkouts for Select postcodes.</p>
              </div>
            </div>
          </section>

          <section className="space-y-4 pt-6 border-t border-white/5">
            <h2 className="text-title-lg font-title-lg text-on-surface font-semibold">Verification Hold</h2>
            <p className="text-body-md text-on-surface-variant leading-relaxed">
              For exclusive auction items, shipping may undergo a 24-hour verification inspection to guarantee description accuracy and condition validation prior to carrier pickup.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
