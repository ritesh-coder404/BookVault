import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, X, Cookie, Settings } from 'lucide-react';

const CONSENT_KEY = 'bookstore_cookie_consent';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(CONSENT_KEY);
    if (!saved) {
      // Small delay for a polished entrance
      const t = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(t);
    }
  }, []);

  const accept = () => {
    localStorage.setItem(CONSENT_KEY, 'accepted');
    setVisible(false);
  };

  const managePreferences = () => {
    localStorage.setItem(CONSENT_KEY, 'accepted');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6 pointer-events-none">
      <div className="max-w-4xl mx-auto bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-5 sm:p-6 pointer-events-auto animate-slide-up">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-600/30 flex items-center justify-center text-indigo-400 shrink-0">
            <Cookie className="w-5 h-5" />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-white mb-1">
              We use cookies & local storage
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              We use essential cookies and browser local storage to keep you signed in, remember your cart, and save your preferences. We do not use tracking or advertising cookies.{' '}
              <Link to="/cookies" className="text-indigo-400 hover:text-indigo-300 underline transition" onClick={accept}>
                Learn more in our Cookie Policy
              </Link>
              .
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={accept}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition active:scale-95 flex items-center gap-2"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Accept All
              </button>
              <button
                onClick={managePreferences}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold rounded-xl border border-slate-700 transition active:scale-95 flex items-center gap-2"
              >
                <Settings className="w-3.5 h-3.5" />
                Manage Preferences
              </button>
              <Link
                to="/privacy"
                className="text-xs text-slate-500 hover:text-slate-300 transition"
                onClick={accept}
              >
                Privacy Policy
              </Link>
            </div>
          </div>

          <button
            onClick={accept}
            className="text-slate-500 hover:text-white transition p-1 shrink-0"
            aria-label="Dismiss cookie banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
