import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <>
      <footer className="bg-surface-container-lowest dark:bg-surface-container-lowest border-t border-white/10 w-full py-unit-xl px-margin-mobile md:px-margin-desktop grid grid-cols-1 md:grid-cols-4 gap-gutter lg:ml-64 relative z-10 w-[calc(100%-16rem)] hidden lg:grid">
        <div className="col-span-1 md:col-span-1 space-y-4">
          <h2 className="text-headline-lg font-headline-lg text-primary font-bold">One8</h2>
          <p className="text-body-md font-body-md text-on-surface-variant max-w-xs">{t('footerDesc')}</p>
        </div>
        <div className="col-span-1 md:col-span-2 grid grid-cols-2 md:grid-cols-3 gap-8">
          <div className="space-y-3">
            <h3 className="text-label-md font-label-md text-on-surface font-semibold mb-4">{t('platform', 'Platform')}</h3>
            <Link className="block text-body-md font-body-md text-on-surface-variant hover:text-tertiary transition-colors" to="/about">{t('aboutUs')}</Link>
            <Link className="block text-body-md font-body-md text-on-surface-variant hover:text-tertiary transition-colors" to="/partner-program">{t('partner')}</Link>
            <Link className="block text-body-md font-body-md text-primary font-semibold hover:text-tertiary transition-colors underline" to="/ai-assistant">{t('aiAssistant')}</Link>
          </div>
          <div className="space-y-3">
            <h3 className="text-label-md font-label-md text-on-surface font-semibold mb-4">{t('support', 'Support')}</h3>
            <Link className="block text-body-md font-body-md text-on-surface-variant hover:text-tertiary transition-colors" to="/shipping-info">{t('shipping')}</Link>
            <Link className="block text-body-md font-body-md text-on-surface-variant hover:text-tertiary transition-colors" to="/terms">{t('terms')}</Link>
            <Link className="block text-body-md font-body-md text-on-surface-variant hover:text-tertiary transition-colors" to="/privacy">{t('privacy')}</Link>
          </div>
        </div>
        <div className="col-span-1 border-t border-white/5 pt-6 md:border-none md:pt-0 flex items-end md:justify-end">
          <p className="text-label-sm font-label-sm text-on-surface-variant">{t('footerRights')}</p>
        </div>
      </footer>
      <footer className="bg-surface-container-lowest dark:bg-surface-container-lowest border-t border-white/10 w-full py-unit-xl px-margin-mobile grid grid-cols-1 gap-gutter lg:hidden">
        <div className="space-y-4 text-center">
          <h2 className="text-headline-lg font-headline-lg text-primary font-bold">One8</h2>
          <div className="flex flex-wrap justify-center gap-4 py-4">
            <Link className="text-label-sm font-label-sm text-on-surface-variant" to="/about">{t('aboutUs')}</Link>
            <Link className="text-label-sm font-label-sm text-on-surface-variant" to="/terms">{t('terms')}</Link>
            <Link className="text-label-sm font-label-sm text-on-surface-variant" to="/privacy">{t('privacy')}</Link>
          </div>
          <p className="text-label-sm font-label-sm text-on-surface-variant">{t('footerRights')}</p>
        </div>
      </footer>
    </>
  );
}

