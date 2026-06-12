// Reusable empty state component generator for scaffolded pages
import React from 'react';

const createPlaceholderPage = (title, icon) => {
  return function PlaceholderPage() {
    return (
      <main className="flex-1 lg:ml-64 p-margin-mobile md:p-margin-desktop min-h-screen flex items-center justify-center">
        <div className="glass-card p-12 rounded-3xl text-center max-w-lg w-full">
          <span className="material-symbols-outlined text-[64px] text-primary mb-6">{icon}</span>
          <h1 className="text-headline-lg font-headline-lg text-on-surface mb-4">{title}</h1>
          <p className="text-body-md text-on-surface-variant">This page is under construction and will be connected to the backend API soon.</p>
        </div>
      </main>
    );
  };
};

export const SellerDashboard = createPlaceholderPage('Seller Dashboard', 'storefront');
export const AdminDashboard = createPlaceholderPage('Admin Dashboard', 'admin_panel_settings');
export const AIShoppingAssistant = createPlaceholderPage('AI Assistant', 'smart_toy');
export const GroupBuy = createPlaceholderPage('Group Buy', 'group');
export const Auctions = createPlaceholderPage('Auctions', 'gavel');
export const LocalSellers = createPlaceholderPage('Local Sellers', 'location_on');
