import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, ArrowLeft } from 'lucide-react';

const Section = ({ title, children }) => (
  <div className="space-y-2">
    <h2 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h2>
    <div className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed space-y-2">
      {children}
    </div>
  </div>
);

export default function Terms() {
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
          <FileText className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Terms & Conditions
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">Last updated: January 2026</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-8 shadow-xs space-y-8">

        <Section title="1. Acceptance of Terms">
          <p>
            By accessing or using BookStore ("the Platform", "we", "us"), you agree to be bound by these Terms & Conditions. If you do not agree to these terms, please do not use our platform.
          </p>
          <p>
            These terms apply to all visitors, registered users, and customers of BookStore.
          </p>
        </Section>

        <Section title="2. Account Usage">
          <p>
            To access certain features (cart, checkout, order tracking), you must create an account. You are responsible for maintaining the confidentiality of your login credentials.
          </p>
          <p>
            You agree not to share your account credentials with others and to notify us immediately of any unauthorized use of your account.
          </p>
          <p>
            We reserve the right to suspend or terminate accounts that violate these terms, engage in fraudulent activity, or misuse the platform.
          </p>
        </Section>

        <Section title="3. Book Purchases & Orders">
          <p>
            All orders placed through BookStore are subject to product availability. We reserve the right to cancel orders if a product is out of stock or if pricing errors occur.
          </p>
          <p>
            Once an order is confirmed, you will receive an order confirmation. Order status can be tracked from the "My Orders" section of your account.
          </p>
        </Section>

        <Section title="4. Pricing & Payment">
          <p>
            All prices displayed on BookStore are in Indian Rupees (₹) and are inclusive of applicable taxes unless stated otherwise.
          </p>
          <p>
            We accept online payment via our integrated payment gateway and Cash on Delivery (COD). Payment details are processed securely. We do not store your card or banking information on our servers.
          </p>
          <p>
            Prices are subject to change without notice. The price at the time of placing an order is the price you will be charged.
          </p>
        </Section>

        <Section title="5. Product Availability">
          <p>
            Book availability is displayed on each product page. While we strive to maintain accurate stock levels, inventory may occasionally be unavailable due to high demand or supplier delays.
          </p>
          <p>
            In the event that a purchased item is unavailable, we will notify you and process a full refund.
          </p>
        </Section>

        <Section title="6. Delivery & Shipping">
          <p>
            Free delivery is available on orders above ₹499. Standard delivery timelines are 3–7 business days depending on your location.
          </p>
          <p>
            BookStore is not responsible for delays caused by courier services, natural events, or incorrect delivery addresses provided by the customer.
          </p>
        </Section>

        <Section title="7. Cancellations & Returns">
          <p>
            Orders may be cancelled before they are shipped. Once shipped, cancellation is not possible.
          </p>
          <p>
            Returns are accepted for damaged or incorrect items within 7 days of delivery. Please contact our support team with photographic evidence for return requests.
          </p>
        </Section>

        <Section title="8. Coupons & Discounts">
          <p>
            Promotional coupon codes are valid for single use per account unless stated otherwise. Coupons cannot be combined with other offers and are non-transferable.
          </p>
          <p>
            BookStore reserves the right to modify, disable, or expire coupon codes at any time without prior notice.
          </p>
        </Section>

        <Section title="9. User Responsibilities">
          <p>You agree not to:</p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>Use the platform for any unlawful purpose</li>
            <li>Attempt to gain unauthorized access to our systems</li>
            <li>Submit false or misleading information</li>
            <li>Post offensive, defamatory, or harmful reviews</li>
            <li>Scrape or systematically download content from our platform</li>
          </ul>
        </Section>

        <Section title="10. Intellectual Property">
          <p>
            All content on this platform — including text, images, logos, and design — is the property of BookStore or its licensors. You may not reproduce, distribute, or use our content without written permission.
          </p>
        </Section>

        <Section title="11. Limitation of Liability">
          <p>
            BookStore is provided on an "as is" basis. We do not guarantee uninterrupted availability of the platform. To the maximum extent permitted by law, BookStore shall not be liable for any indirect, incidental, or consequential damages arising from your use of the platform.
          </p>
        </Section>

        <Section title="12. Changes to Terms">
          <p>
            We reserve the right to update these Terms & Conditions at any time. Continued use of the platform after any changes constitutes acceptance of the revised terms. We encourage you to review this page periodically.
          </p>
        </Section>

        <Section title="13. Contact Us">
          <p>
            If you have questions about these Terms & Conditions, please contact us at{' '}
            <a href="mailto:support@bookstore.com" className="text-indigo-600 hover:underline">
              support@bookstore.com
            </a>.
          </p>
        </Section>
      </div>

      <div className="mt-8 flex gap-4 text-xs text-slate-500">
        <Link to="/privacy" className="hover:text-indigo-600 transition">Privacy Policy</Link>
        <Link to="/cookies" className="hover:text-indigo-600 transition">Cookie Policy</Link>
      </div>
    </div>
  );
}
