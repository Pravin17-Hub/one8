import React from 'react';

export default function PrivacyPolicy() {
  return (
    <main className="flex-1 lg:ml-64 p-margin-mobile md:p-margin-desktop min-h-screen pb-20">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-display-md font-display-md text-on-surface mb-8">Privacy Policy</h1>
        <div className="glass-card rounded-3xl p-8 md:p-12 space-y-6 border border-white/10 shadow-xl">
          <section className="space-y-4">
            <h2 className="text-headline-md font-headline-md text-primary font-bold">Data We Collect</h2>
            <p className="text-body-md text-on-surface-variant leading-relaxed">
              We collect information necessary to run AI-assisted commerce matching. This includes profile info, catalog searches, billing coordinates, and dynamic preferences to train the Budget backtracker.
            </p>
          </section>

          <section className="space-y-4 pt-6 border-t border-white/5">
            <h2 className="text-headline-md font-headline-md text-primary font-bold">Use of Data</h2>
            <p className="text-body-md text-on-surface-variant leading-relaxed">
              Your data is exclusively processed to suggest products, compute AI matching scores, verify payments, and enable merchant dispatch coordination. We never sell profile lists to third-party marketing companies.
            </p>
          </section>

          <section className="space-y-4 pt-6 border-t border-white/5">
            <h2 className="text-headline-md font-headline-md text-primary font-bold">OTP Authentication</h2>
            <p className="text-body-md text-on-surface-variant leading-relaxed">
              We process phone numbers for OTP SMS validation blocks. These values are cached temporarily to match dynamic signins and are deleted once the verification expires.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
