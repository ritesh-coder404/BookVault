import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight, 
  ShoppingBag, 
  ArrowLeft,
  Truck,
  ShieldCheck,
  Tag,
  Check,
  X
} from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function Cart() {
  const { 
    cartItems, 
    updateQuantity, 
    removeFromCart, 
    clearCart, 
    subtotal, 
    deliveryFee, 
    discount,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    total 
  } = useCart();

  const navigate = useNavigate();
  const [couponInput, setCouponInput] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    await applyCoupon(couponInput.trim());
    setCouponLoading(false);
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-2xl mx-auto my-16 px-4 text-center">
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-12 shadow-xs space-y-5">
          <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
            <ShoppingBag className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-white">Your Cart is Empty</h2>
          <p className="text-slate-500 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
            Looks like you haven't added any books to your cart yet. Explore our 100+ titles!
          </p>
          <div className="pt-2">
            <Link
              to="/books"
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs sm:text-sm transition shadow-md active:scale-95"
            >
              <span>Explore Catalog</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 dark:bg-slate-950 transition-colors">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Shopping Cart ({cartItems.length} items)
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Review your selected books before proceeding to demo checkout
          </p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 px-3 py-1.5 rounded-lg transition"
        >
          Clear All Items
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Cart Items List */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {cartItems.map((item) => {
              const book = item.book;
              const itemTotal = Number(item.price) * item.quantity;
              const isAtMaxStock = item.quantity >= book.stock;

              return (
                <div key={book.id} className="p-5 sm:p-6 flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                  <Link
                    to={`/books/${book.id}`}
                    className="w-20 h-28 sm:w-24 sm:h-32 shrink-0 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden shadow-xs border border-slate-200 dark:border-slate-700 book-spine-effect"
                  >
                    <img
                      src={book.image_url || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800"}
                      alt={book.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform"
                    />
                  </Link>

                  <div className="flex-1 text-center sm:text-left space-y-1">
                    {book.category && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                        {book.category}
                      </span>
                    )}
                    <Link to={`/books/${book.id}`}>
                      <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base hover:text-indigo-600 transition-colors line-clamp-1">
                        {book.title}
                      </h3>
                    </Link>
                    <p className="text-xs text-slate-500 font-medium">by {book.author}</p>
                    <p className="text-sm font-extrabold text-slate-800 dark:text-slate-200 pt-1">
                      ₹{Number(item.price).toLocaleString('en-IN')} each
                    </p>
                  </div>

                  {/* Quantity controls */}
                  <div className="flex flex-col items-center gap-1">
                    <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 p-1">
                      <button
                        onClick={() => updateQuantity(book.id, item.quantity - 1)}
                        className="p-1 text-slate-600 dark:text-slate-300 hover:text-slate-900 rounded-lg hover:bg-white dark:hover:bg-slate-700 transition"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-3 text-xs font-bold text-slate-800 dark:text-white">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(book.id, item.quantity + 1)}
                        disabled={isAtMaxStock}
                        className="p-1 text-slate-600 dark:text-slate-300 hover:text-slate-900 disabled:opacity-40 rounded-lg hover:bg-white dark:hover:bg-slate-700 transition"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    {isAtMaxStock && (
                      <span className="text-[10px] text-amber-600 font-medium">
                        Max stock ({book.stock})
                      </span>
                    )}
                  </div>

                  {/* Subtotal & remove */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-4 pt-2 sm:pt-0">
                    <span className="text-base font-black text-slate-900 dark:text-white">
                      ₹{itemTotal.toLocaleString('en-IN')}
                    </span>
                    <button
                      onClick={() => removeFromCart(book.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-4 bg-slate-50/70 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <Link
              to="/books"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Continue Browsing Books
            </Link>
          </div>
        </div>

        {/* Order Summary & Coupon Column */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Coupon Input Box */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <Tag className="w-4 h-4 text-indigo-600" />
              Apply Discount Coupon
            </h3>

            {appliedCoupon ? (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <div>
                    <span className="font-mono font-bold text-emerald-800 dark:text-emerald-300">
                      {appliedCoupon.code}
                    </span>
                    <span className="text-[11px] text-emerald-600 block">
                      Saved ₹{Math.round(discount)}
                    </span>
                  </div>
                </div>
                <button
                  onClick={removeCoupon}
                  className="p-1 text-slate-400 hover:text-rose-600 transition"
                  title="Remove coupon"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. BOOK10, SAVE20"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-bold text-slate-800 dark:text-white uppercase focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  disabled={couponLoading || !couponInput.trim()}
                  className="px-4 py-2 bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 text-white rounded-xl text-xs font-bold disabled:opacity-40 transition"
                >
                  Apply
                </button>
              </form>
            )}
          </div>

          {/* Pricing Box */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-6">
            <h2 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
              Order Summary
            </h2>

            <div className="space-y-3 text-xs sm:text-sm">
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  ₹{subtotal.toLocaleString('en-IN')}
                </span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Coupon Discount ({appliedCoupon?.code})</span>
                  <span>-₹{Math.round(discount)}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span className="flex items-center gap-1">
                  <span>Delivery Fee</span>
                  {deliveryFee === 0 && (
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-1.5 py-0.5 rounded">
                      FREE
                    </span>
                  )}
                </span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {deliveryFee === 0 ? '₹0' : `₹${deliveryFee}`}
                </span>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 pt-3 flex justify-between text-base font-black text-slate-900 dark:text-white">
                <span>Total Amount</span>
                <span className="text-xl text-indigo-600 dark:text-indigo-400">
                  ₹{Math.round(total).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md transition active:scale-98"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2 text-[11px] text-slate-500">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Safe Demo Payment System</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Orders dispatched within 24 hours</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
