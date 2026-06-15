import React from 'react';

export default function TermsOfService() {
  return (
    <main className="flex-1 lg:ml-64 p-margin-mobile md:p-margin-desktop min-h-screen pb-20">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-display-md font-display-md text-on-surface mb-8">Terms of Service</h1>
        <div className="glass-card rounded-3xl p-8 md:p-12 space-y-6 border border-white/10 shadow-xl">
          <section className="space-y-4">
            <h2 className="text-headline-md font-headline-md text-primary font-bold">1. Agreement to Terms</h2>
            <p className="text-body-md text-on-surface-variant leading-relaxed">
              By accessing the One8 AI Marketplace platform, you agree to comply with and be bound by these Terms of Service. If you do not agree, you must cease platform access immediately.
            </p>
          </section>

          <section className="space-y-4 pt-6 border-t border-white/5">
            <h2 className="text-headline-md font-headline-md text-primary font-bold">2. Auction Punishments</h2>
            <p className="text-body-md text-on-surface-variant leading-relaxed">
              Users participating in Live Auctions agree to complete transactions immediately upon winning. Defaulters who fail to complete payment within 24 hours will face a <strong>30-point deduction</strong> to their Trust Score. Accounts with a Trust Score below 50 will be subject to <strong>immediate suspension</strong>.
            </p>
          </section>

          <section className="space-y-4 pt-6 border-t border-white/5">
            <h2 className="text-headline-md font-headline-md text-primary font-bold">3. Marketplace Transactions</h2>
            <p className="text-body-md text-on-surface-variant leading-relaxed">
              One8 facilitates smart commerce but does not act as the direct seller for individual merchant items. We verify quality controls, but transaction values are bound to the merchant and buyer.
            </p>
          </section>

          <section className="space-y-4 pt-6 border-t border-white/5">
            <h2 className="text-headline-md font-headline-md text-primary font-bold">4. User Accounts</h2>
            <p className="text-body-md text-on-surface-variant leading-relaxed">
              Users are responsible for maintaining session security, password vaults, and OTP-linked credentials. One8 holds rights to lock/suspend accounts violating community guidelines.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
