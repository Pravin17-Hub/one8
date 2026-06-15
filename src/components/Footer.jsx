import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <>
      <footer className="bg-surface-container-lowest dark:bg-surface-container-lowest border-t border-white/10 w-full py-unit-xl px-margin-mobile md:px-margin-desktop grid grid-cols-1 md:grid-cols-4 gap-gutter lg:ml-64 relative z-10 w-[calc(100%-16rem)] hidden lg:grid">
        <div className="col-span-1 md:col-span-1 space-y-4">
          <h2 className="text-headline-lg font-headline-lg text-primary font-bold">One8</h2>
          <p className="text-body-md font-body-md text-on-surface-variant max-w-xs">AI-Powered Luxury Marketplace. Curating the future of smart commerce.</p>
        </div>
        <div className="col-span-1 md:col-span-2 grid grid-cols-2 md:grid-cols-3 gap-8">
          <div className="space-y-3">
            <h3 className="text-label-md font-label-md text-on-surface font-semibold mb-4">Platform</h3>
            <Link className="block text-body-md font-body-md text-on-surface-variant hover:text-tertiary transition-colors" to="/about">About Us</Link>
            <Link className="block text-body-md font-body-md text-on-surface-variant hover:text-tertiary transition-colors" to="/partner-program">Partner Program</Link>
            <Link className="block text-body-md font-body-md text-primary font-semibold hover:text-tertiary transition-colors underline" to="/ai-assistant">AI Concierge</Link>
          </div>
          <div className="space-y-3">
            <h3 className="text-label-md font-label-md text-on-surface font-semibold mb-4">Support</h3>
            <Link className="block text-body-md font-body-md text-on-surface-variant hover:text-tertiary transition-colors" to="/shipping-info">Shipping Info</Link>
            <Link className="block text-body-md font-body-md text-on-surface-variant hover:text-tertiary transition-colors" to="/terms">Terms of Service</Link>
            <Link className="block text-body-md font-body-md text-on-surface-variant hover:text-tertiary transition-colors" to="/privacy">Privacy Policy</Link>
          </div>
        </div>
        <div className="col-span-1 border-t border-white/5 pt-6 md:border-none md:pt-0 flex items-end md:justify-end">
          <p className="text-label-sm font-label-sm text-on-surface-variant">© 2026 One8 AI Marketplace. All rights reserved.</p>
        </div>
      </footer>
      <footer className="bg-surface-container-lowest dark:bg-surface-container-lowest border-t border-white/10 w-full py-unit-xl px-margin-mobile grid grid-cols-1 gap-gutter lg:hidden">
        <div className="space-y-4 text-center">
          <h2 className="text-headline-lg font-headline-lg text-primary font-bold">One8</h2>
          <div className="flex flex-wrap justify-center gap-4 py-4">
            <Link className="text-label-sm font-label-sm text-on-surface-variant" to="/about">About Us</Link>
            <Link className="text-label-sm font-label-sm text-on-surface-variant" to="/terms">Terms of Service</Link>
            <Link className="text-label-sm font-label-sm text-on-surface-variant" to="/privacy">Privacy Policy</Link>
          </div>
          <p className="text-label-sm font-label-sm text-on-surface-variant">© 2026 One8 AI Marketplace. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
}

