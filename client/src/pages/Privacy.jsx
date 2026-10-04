import React from 'react';
import { Link } from 'react-router-dom';
import { Lock, ArrowLeft } from 'lucide-react';

const Section = ({ title, children }) => (
  <div className="space-y-2">
    <h2 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h2>
    <div className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed space-y-2">
      {children}
    </div>
  </div>
);

export default function Privacy() {
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
          <Lock className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">Last updated: January 2026</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-8 shadow-xs space-y-8">

        <Section title="1. Introduction">
          <p>
            BookStore ("we", "us", "our") is committed to protecting your personal information and your right to privacy. This Privacy Policy explains what information we collect, how we use it, and what rights you have over your data.
          </p>
          <p>
            By using BookStore, you agree to the collection and use of information in accordance with this policy.
          </p>
        </Section>

        <Section title="2. Information We Collect">
          <p>We collect the following types of information:</p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li><strong className="text-slate-700 dark:text-slate-300">Account Information:</strong> Email address and password (stored securely via Supabase Auth) when you register.</li>
            <li><strong className="text-slate-700 dark:text-slate-300">Profile Data:</strong> Your name and account preferences.</li>
            <li><strong className="text-slate-700 dark:text-slate-300">Order Data:</strong> Shipping address, mobile number, and order details when you make a purchase.</li>
            <li><strong className="text-slate-700 dark:text-slate-300">Reviews:</strong> Book reviews and ratings you submit on the platform.</li>
            <li><strong className="text-slate-700 dark:text-slate-300">Wishlist:</strong> Books you add to your wishlist.</li>
          </ul>
        </Section>

        <Section title="3. Authentication & Account Security">
          <p>
            Authentication is handled by Supabase, a trusted backend-as-a-service platform. Your password is never stored in plain text — it is securely hashed using industry-standard encryption.
          </p>
          <p>
            We do not store your payment card details. Payment processing does not transmit real financial information on this platform.
          </p>
        </Section>

        <Section title="4. How We Use Your Information">
          <p>We use the information we collect to:</p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>Provide and maintain our services</li>
            <li>Process orders and send confirmations</li>
            <li>Show you your order history, wishlist, and profile</li>
            <li>Respond to customer support inquiries</li>
            <li>Improve the functionality of BookStore</li>
          </ul>
          <p>We do not sell, rent, or share your personal data with third parties for marketing purposes.</p>
        </Section>

        <Section title="5. Data Storage">
          <p>
            Your account and order data is stored in Supabase's secure cloud infrastructure. Supabase complies with GDPR and standard data protection frameworks.
          </p>
          <p>
            Cart contents, recently viewed books, and certain UI preferences are stored in your browser's local storage. This data never leaves your device.
          </p>
        </Section>

        <Section title="6. Cookies & Local Storage">
          <p>
            BookStore uses essential browser local storage to maintain your session, cart, and preferences. We do not use advertising or third-party tracking cookies.
          </p>
          <p>
            For full details, please read our{' '}
            <Link to="/cookies" className="text-indigo-600 hover:underline">Cookie Policy</Link>.
          </p>
        </Section>

        <Section title="7. Data Retention">
          <p>
            We retain your account data for as long as your account is active. If you request deletion of your account, we will remove your personal data from our active databases within 30 days, subject to any legal obligations to retain records.
          </p>
        </Section>

        <Section title="8. Your Rights">
          <p>You have the right to:</p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>Access the personal data we hold about you</li>
            <li>Request correction of inaccurate data</li>
            <li>Request deletion of your account and data</li>
            <li>Withdraw consent at any time (where applicable)</li>
          </ul>
          <p>
            To exercise any of these rights, contact us at{' '}
            <a href="mailto:support@bookstore.com" className="text-indigo-600 hover:underline">
              support@bookstore.com
            </a>.
          </p>
        </Section>

        <Section title="9. Security">
          <p>
            We implement industry-standard security measures to protect your data, including encrypted storage, secure HTTPS transmission, and access-controlled databases.
          </p>
          <p>
            However, no method of electronic transmission or storage is 100% secure. We encourage you to use a strong, unique password for your account.
          </p>
        </Section>

        <Section title="10. Children's Privacy">
          <p>
            BookStore is not directed at children under 13. We do not knowingly collect personal information from children under 13. If you believe a child has provided us with personal information, please contact us immediately.
          </p>
        </Section>

        <Section title="11. Changes to This Policy">
          <p>
            We may update this Privacy Policy from time to time. We will notify you of significant changes by updating the "Last updated" date at the top. Continued use of the platform after changes constitutes acceptance.
          </p>
        </Section>

        <Section title="12. Contact Us">
          <p>
            If you have questions or concerns about this Privacy Policy, please contact us at{' '}
            <a href="mailto:support@bookstore.com" className="text-indigo-600 hover:underline">
              support@bookstore.com
            </a>.
          </p>
        </Section>
      </div>

      <div className="mt-8 flex gap-4 text-xs text-slate-500">
        <Link to="/terms" className="hover:text-indigo-600 transition">Terms & Conditions</Link>
        <Link to="/cookies" className="hover:text-indigo-600 transition">Cookie Policy</Link>
      </div>
    </div>
  );
}
