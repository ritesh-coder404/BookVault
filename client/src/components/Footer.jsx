import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ShieldCheck, Mail, Phone } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-auto bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Info */}
          <div className="md:col-span-1 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md">
                <BookOpen className="w-5 h-5" />
              </div>
              <span className="text-xl font-extrabold tracking-tight text-white">
                BookStore
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed">
              Your modern destination for literary discoveries, bestsellers, and timeless classics. Powered by Supabase & React.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Mail className="w-3.5 h-3.5" />
              <span>support@bookstore.com</span>
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-200 mb-4">
              Shop
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/books" className="hover:text-white transition">Browse All Books</Link>
              </li>
              <li>
                <Link to="/books?category=Programming" className="hover:text-white transition">Programming</Link>
              </li>
              <li>
                <Link to="/books?category=Self-Help" className="hover:text-white transition">Self-Help</Link>
              </li>
              <li>
                <Link to="/books?category=Fiction" className="hover:text-white transition">Fiction</Link>
              </li>
              <li>
                <Link to="/books?category=Finance" className="hover:text-white transition">Finance</Link>
              </li>
              <li>
                <Link to="/wishlist" className="hover:text-white transition">My Wishlist</Link>
              </li>
            </ul>
          </div>

          {/* Help Links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-200 mb-4">
              Help & Support
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/faq" className="hover:text-white transition">FAQ & Help Center</Link>
              </li>
              <li>
                <Link to="/my-orders" className="hover:text-white transition">Track Your Order</Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-white transition">Shopping Cart</Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-white transition">Create Account</Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition">Sign In</Link>
              </li>
            </ul>
          </div>

          {/* Legal & Admin */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-200 mb-4">
              Legal
            </h4>
            <ul className="space-y-2.5 text-sm mb-6">
              <li>
                <Link to="/terms" className="hover:text-white transition">Terms & Conditions</Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-white transition">Privacy Policy</Link>
              </li>
              <li>
                <Link to="/cookies" className="hover:text-white transition">Cookie Policy</Link>
              </li>
            </ul>
            <div>
              <Link
                to="/admin/login"
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700 transition"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                Admin Portal
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} BookStore. All rights reserved.</p>
          <p>Made by Ritesh Thakur</p>
        </div>
      </div>
    </footer>
  );
}
