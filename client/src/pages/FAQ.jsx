import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';

export default function FAQ() {
  const [openIdx, setOpenIdx] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const faqs = [
    {
      q: 'How does the 100+ book catalog work?',
      a: 'The BookVault platform features a seed of over 100 titles spanning software development, artificial intelligence, business, self-help, and literature, powered by Supabase PostgreSQL.',
    },
    {
      q: 'Is real money charged during checkout?',
      a: 'All payment flows on BookStore — including Online Payment and Cash on Delivery — are processed through our standard checkout. No real financial transaction is initiated on this platform.',
    },
    {
      q: 'How do I access the administrator portal?',
      a: 'The admin portal is available at /admin/login and is restricted to authorized administrators. If you are an admin, use your registered admin credentials to sign in.',
    },
    {
      q: 'How do discount coupons work?',
      a: 'During checkout or on the cart page, you can apply active promo codes such as BOOK10 (10% off), SAVE20 (20% off), or WELCOME50 (₹50 off). Discounts are validated against minimum purchase limits.',
    },
    {
      q: 'How does the 3D book preview work?',
      a: 'Our UI utilizes pure CSS 3D perspective transforms (rotateY, rotateX, and layered book-spine gradients) to create depth on hover, respecting user reduced-motion settings.',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 dark:bg-slate-950 transition-colors">
      <div className="text-center space-y-3">
        <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
          Support & Guidance
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          Frequently Asked Questions
        </h1>
        <p className="text-slate-500 text-xs sm:text-sm max-w-lg mx-auto">
          Everything you need to know about the BookVault 3D bookstore application
        </p>
      </div>

      {/* Accordion */}
      <div className="space-y-3">
        {faqs.map((faq, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div
              key={idx}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs"
            >
              <button
                onClick={() => setOpenIdx(isOpen ? null : idx)}
                className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-slate-900 dark:text-white text-sm"
              >
                <span>{faq.q}</span>
                {isOpen ? <ChevronUp className="w-4 h-4 text-indigo-600 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />}
              </button>
              {isOpen && (
                <div className="p-5 pt-0 text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed border-t border-slate-100 dark:border-slate-800">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Contact Form */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-8 shadow-xs space-y-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Still Have Questions? Send Us a Message
        </h2>

        {submitted ? (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center gap-3 text-emerald-700 dark:text-emerald-300 text-xs">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>Thank you! Your message has been received. Our team will get back to you shortly.</span>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSubmitted(true);
            }}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                required
                placeholder="Your Name"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-white"
              />
              <input
                type="email"
                required
                placeholder="Your Email"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-white"
              />
            </div>
            <textarea
              rows="3"
              required
              placeholder="How can we assist you with BookVault?"
              className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-white"
            />
            <button
              type="submit"
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Message</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
