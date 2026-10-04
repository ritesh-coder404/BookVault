import React from 'react';
import { Link } from 'react-router-dom';
import { Cookie, ArrowLeft, Check, X } from 'lucide-react';

const Section = ({ title, children }) => (
  <div className="space-y-2">
    <h2 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h2>
    <div className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed space-y-2">
      {children}
    </div>
  </div>
);

const CookieRow = ({ name, purpose, type, expires, used }) => (
  <tr className="border-b border-slate-100 dark:border-slate-800">
    <td className="py-3 pr-4 text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 align-top">{name}</td>
    <td className="py-3 pr-4 text-xs text-slate-600 dark:text-slate-400 align-top">{purpose}</td>
    <td className="py-3 pr-4 text-xs align-top">
      <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 font-semibold">{type}</span>
    </td>
    <td className="py-3 text-xs text-slate-500 align-top">{expires}</td>
  </tr>
);

export default function Cookies() {
  const clearConsent = () => {
    localStorage.removeItem('bookstore_cookie_consent');
    window.location.reload();
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Home
      </Link>

      <div className="flex items-center gap-3 mb-8">
        <div className="w-11 h-11 rounded-2xl bg-indigo-600 flex items-center justify-center text-white">
          <Cookie className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Cookie Policy
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">Last updated: January 2026</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-8 shadow-xs space-y-8">

        <Section title="1. What Are Cookies?">
          <p>
            Cookies are small text files stored in your browser when you visit a website. BookStore uses browser local storage (a similar technology) rather than traditional cookies for most functionality. This page explains both.
          </p>
        </Section>

        <Section title="2. What We Use">
          <p>
            BookStore uses only <strong className="text-slate-700 dark:text-slate-300">essential storage</strong> — data required for the platform to function correctly. We do <strong className="text-slate-700 dark:text-slate-300">not</strong> use advertising, tracking, or analytics cookies.
          </p>

          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 mt-4">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  <th className="py-3 px-4">Name / Key</th>
                  <th className="py-3 px-4">Purpose</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Expires</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 px-4">
                <CookieRow
                  name="sb-auth-token"
                  purpose="Supabase authentication session — keeps you logged in"
                  type="Essential"
                  expires="Session / 1 week"
                />
                <CookieRow
                  name="bookstore_cart"
                  purpose="Stores your shopping cart items between sessions"
                  type="Essential"
                  expires="Until cleared"
                />
                <CookieRow
                  name="bookstore_wishlist"
                  purpose="Offline wishlist fallback"
                  type="Essential"
                  expires="Until cleared"
                />
                <CookieRow
                  name="bookstore_recently_viewed"
                  purpose="Recently viewed books on the homepage"
                  type="Essential"
                  expires="Until cleared"
                />
                <CookieRow
                  name="bookstore_theme"
                  purpose="Remembers your light/dark mode preference"
                  type="Essential"
                  expires="Until cleared"
                />
                <CookieRow
                  name="bookstore_cookie_consent"
                  purpose="Remembers that you have acknowledged this cookie notice"
                  type="Essential"
                  expires="Until cleared"
                />
              </tbody>
            </table>
          </div>
        </Section>

        <Section title="3. What We Do NOT Use">
          <div className="space-y-2">
            {[
              'Google Analytics or similar analytics services',
              'Facebook Pixel or other advertising trackers',
              'Third-party marketing cookies',
              'Cross-site tracking technologies',
            ].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <X className="w-4 h-4 text-rose-500 shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 space-y-2">
            {[
              'All storage is essential for core platform functionality',
              'No data is sold or shared with advertisers',
              'All local storage data stays on your device',
            ].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </Section>

        <Section title="4. Managing Your Preferences">
          <p>
            Because we only use essential storage, there are no optional cookies to toggle. However, you can clear all BookStore local storage data at any time through your browser's developer tools or by using the button below.
          </p>
          <div className="pt-2">
            <button
              onClick={clearConsent}
              className="px-5 py-2.5 bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 dark:hover:bg-slate-600 text-white text-xs font-bold rounded-xl border border-slate-700 transition"
            >
              Reset Cookie Consent
            </button>
            <p className="text-xs text-slate-400 mt-2">This will reload the page and show the cookie notice again.</p>
          </div>
        </Section>

        <Section title="5. Third-Party Services">
          <p>
            BookStore uses <strong className="text-slate-700 dark:text-slate-300">Supabase</strong> for authentication and database services. Supabase may set essential session cookies required for login functionality. Please refer to{' '}
            <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
              Supabase's Privacy Policy
            </a>{' '}
            for details on their data handling.
          </p>
        </Section>

        <Section title="6. Contact Us">
          <p>
            If you have questions about our use of cookies or local storage, please contact us at{' '}
            <a href="mailto:support@bookstore.com" className="text-indigo-600 hover:underline">
              support@bookstore.com
            </a>.
          </p>
        </Section>
      </div>

      <div className="mt-8 flex gap-4 text-xs text-slate-500">
        <Link to="/terms" className="hover:text-indigo-600 transition">Terms & Conditions</Link>
        <Link to="/privacy" className="hover:text-indigo-600 transition">Privacy Policy</Link>
      </div>
    </div>
  );
}
