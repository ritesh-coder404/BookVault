import React, { useState, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { BookOpen, Mail, Lock, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Cloudflare Turnstile CAPTCHA (optional — skipped gracefully if site key not set)
let Turnstile = null;
const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || '';
if (TURNSTILE_SITE_KEY) {
  // Dynamic import only when key is configured
  import('@marsidev/react-turnstile').then((mod) => {
    Turnstile = mod.Turnstile;
  });
}

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [captchaToken, setCaptchaToken] = useState('');
  const captchaRef = useRef(null);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    // CAPTCHA check: if Turnstile is configured and token not received, block submission
    if (TURNSTILE_SITE_KEY && !captchaToken) {
      setErrorMsg('Please complete the CAPTCHA verification before signing in.');
      return;
    }

    setLoading(true);

    try {
      await login(email.trim(), password);
      navigate(from, { replace: true });
    } catch (err) {
      console.error('Login error:', err);
      setErrorMsg(err.message || 'Invalid email or password. Please verify and try again.');
      // Reset CAPTCHA on failure
      if (captchaRef.current?.reset) captchaRef.current.reset();
      setCaptchaToken('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-16rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200/80 shadow-xl">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white mx-auto shadow-md shadow-indigo-200">
            <BookOpen className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Welcome Back
          </h2>
          <p className="text-xs text-slate-500">
            Sign in to access your cart, orders, and saved books
          </p>
        </div>

        {/* Error notification */}
        {errorMsg && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2.5 text-xs text-rose-700">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="reader@bookstore.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-800"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Password
              </label>
            </div>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-800"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          {/* Cloudflare Turnstile CAPTCHA — rendered only if site key is configured */}
          {TURNSTILE_SITE_KEY && (
            <div className="flex justify-center pt-1">
              {/* Rendered dynamically via script tag pattern supported by @marsidev/react-turnstile */}
              <TurnstileWidget
                siteKey={TURNSTILE_SITE_KEY}
                onSuccess={setCaptchaToken}
                onExpire={() => setCaptchaToken('')}
                onError={() => setCaptchaToken('')}
                captchaRef={captchaRef}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold text-sm rounded-xl shadow-md transition active:scale-98"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Forgot password & register */}
        <div className="text-center space-y-2 pt-2 border-t border-slate-100">
          <p className="text-xs text-slate-500">
            <Link to="/register?forgot=1" className="font-semibold text-slate-600 hover:text-indigo-600 transition">
              Forgot Password?
            </Link>
          </p>
          <p className="text-xs text-slate-500">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-bold text-indigo-600 hover:text-indigo-700 transition">
              Create an Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

// Internal Turnstile wrapper — lazy loaded only when key is present
function TurnstileWidget({ siteKey, onSuccess, onExpire, onError, captchaRef }) {
  const [TurnstileComp, setComp] = React.useState(null);

  React.useEffect(() => {
    import('@marsidev/react-turnstile').then((mod) => {
      setComp(() => mod.Turnstile);
    });
  }, []);

  if (!TurnstileComp) {
    return (
      <div className="w-[300px] h-[65px] bg-slate-100 border border-slate-200 rounded-lg flex items-center justify-center text-xs text-slate-400 animate-pulse">
        Loading CAPTCHA...
      </div>
    );
  }

  return (
    <TurnstileComp
      ref={captchaRef}
      siteKey={siteKey}
      onSuccess={onSuccess}
      onExpire={onExpire}
      onError={onError}
    />
  );
}
