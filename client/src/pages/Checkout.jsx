import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  CreditCard, 
  Truck, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ArrowLeft,
  Tag
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { supabase, isSupabaseConfigured, localStore } from '../lib/supabase';

export default function Checkout() {
  const { user, profile } = useAuth();
  const { cartItems, subtotal, deliveryFee, discount, appliedCoupon, total, clearCart } = useCart();
  const navigate = useNavigate();

  // Form Fields
  const [shippingName, setShippingName] = useState(profile?.name || '');
  const [mobile, setMobile] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');

  // Payment Selection: 'DEMO_ONLINE' or 'COD'
  const [paymentMethod, setPaymentMethod] = useState('DEMO_ONLINE');

  // Processing & Modal States
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStage, setPaymentStage] = useState(null); // 'processing' | 'success' | null
  const [errorMsg, setErrorMsg] = useState('');

  if (cartItems.length === 0) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-center shadow-xs space-y-4">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">Your Cart is Empty</h2>
        <p className="text-xs sm:text-sm text-slate-500">Please add items to your cart before proceeding to checkout.</p>
        <Link
          to="/books"
          className="inline-block px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition"
        >
          Browse 100+ Books
        </Link>
      </div>
    );
  }

  const validateForm = () => {
    if (!shippingName.trim()) return "Please enter your full name.";
    if (!mobile.trim() || !/^\d{10}$/.test(mobile.trim())) {
      return "Please enter a valid 10-digit mobile number.";
    }
    if (!address.trim() || address.trim().length < 5) {
      return "Please enter a complete delivery address.";
    }
    if (!city.trim()) return "Please enter your city.";
    if (!state.trim()) return "Please enter your state.";
    if (!pincode.trim() || !/^\d{6}$/.test(pincode.trim())) {
      return "Please enter a valid 6-digit pincode.";
    }
    return null;
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const validationError = validateForm();
    if (validationError) {
      setErrorMsg(validationError);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    try {
      setIsProcessing(true);

      // Handle Demo Online Payment flow simulation
      if (paymentMethod === 'DEMO_ONLINE') {
        setPaymentStage('processing');
        await new Promise((resolve) => setTimeout(resolve, 1800));
        setPaymentStage('success');
        await new Promise((resolve) => setTimeout(resolve, 1200));
      }

      const orderData = {
        user_id: user?.id || null,
        total_amount: Math.round(total),
        discount_amount: Math.round(discount),
        coupon_code: appliedCoupon?.code || null,
        shipping_name: shippingName.trim(),
        mobile: mobile.trim(),
        address: address.trim(),
        city: city.trim(),
        state: state.trim(),
        pincode: pincode.trim(),
        payment_method: paymentMethod,
        payment_status: paymentMethod === 'DEMO_ONLINE' ? 'PAID' : 'PENDING',
        order_status: 'Pending',
      };

      const itemsToOrder = cartItems.map((item) => ({
        book_id: item.book.id,
        quantity: item.quantity,
        price: Number(item.price),
      }));

      let createdOrderId = null;
      let finalOrder = null;

      if (isSupabaseConfigured && supabase) {
        // 1. Verify stock from Supabase
        const bookIds = itemsToOrder.map((it) => it.book_id);
        const { data: dbBooks, error: fetchErr } = await supabase
          .from('books')
          .select('id, title, stock, price')
          .in('id', bookIds);

        if (fetchErr) throw fetchErr;

        for (const item of itemsToOrder) {
          const matched = dbBooks?.find((b) => b.id === item.book_id);
          if (!matched || matched.stock < item.quantity) {
            throw new Error(
              `Insufficient stock for "${matched?.title || 'book'}". Available: ${matched?.stock || 0}`
            );
          }
        }

        // 2. Insert into orders table
        const { data: newOrder, error: orderErr } = await supabase
          .from('orders')
          .insert([orderData])
          .select()
          .single();

        if (orderErr) throw orderErr;
        createdOrderId = newOrder.id;

        // 3. Insert order items
        const orderItemsData = itemsToOrder.map((it) => ({
          order_id: createdOrderId,
          book_id: it.book_id,
          quantity: it.quantity,
          price: it.price,
        }));

        const { error: itemsErr } = await supabase
          .from('order_items')
          .insert(orderItemsData);

        if (itemsErr) throw itemsErr;

        // 4. Update book stocks
        for (const item of itemsToOrder) {
          const matched = dbBooks?.find((b) => b.id === item.book_id);
          if (matched) {
            await supabase
              .from('books')
              .update({ stock: matched.stock - item.quantity })
              .eq('id', item.book_id);
          }
        }

        finalOrder = { ...newOrder, items: cartItems };
      } else {
        // Local Demo fallback
        finalOrder = localStore.createOrder(orderData, itemsToOrder);
        createdOrderId = finalOrder.id;
      }

      clearCart();

      navigate('/order-success', {
        state: {
          order: finalOrder,
          orderId: createdOrderId,
          total: Math.round(total),
          paymentMethod,
          paymentStatus: orderData.payment_status,
          couponCode: appliedCoupon?.code,
          discount: Math.round(discount),
        },
      });
    } catch (err) {
      console.error('Checkout error:', err);
      setErrorMsg(err.message || 'An error occurred while creating your order.');
    } finally {
      setIsProcessing(false);
      setPaymentStage(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 dark:bg-slate-950 transition-colors">
      <div>
        <Link
          to="/cart"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Cart
        </Link>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-2">
          Express Checkout
        </h1>
        <p className="text-slate-500 text-xs sm:text-sm mt-1">
          Complete delivery information and confirm payment method
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 rounded-2xl flex items-center gap-3 text-rose-700 dark:text-rose-300 text-xs">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Form: Address & Payment */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Section 1: Address */}
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Truck className="w-5 h-5 text-indigo-600" />
                Shipping & Delivery Address
              </h2>
              <span className="text-[11px] text-slate-400">All fields required</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="Rahul Sharma"
                  value={shippingName}
                  onChange={(e) => setShippingName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Mobile Number (10 digits)
                </label>
                <input
                  type="tel"
                  required
                  maxLength="10"
                  placeholder="9876543210"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Street Address / House / Flat
                </label>
                <input
                  type="text"
                  required
                  placeholder="Flat 402, Green Acres Apt, MG Road"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  City
                </label>
                <input
                  type="text"
                  required
                  placeholder="Bengaluru"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  State
                </label>
                <input
                  type="text"
                  required
                  placeholder="Karnataka"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Pincode (6 digits)
                </label>
                <input
                  type="text"
                  required
                  maxLength="6"
                  placeholder="560001"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Payment */}
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-indigo-600" />
              Select Payment Method
            </h2>

            <div className="space-y-3">
              <label
                className={`flex items-start p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
                  paymentMethod === 'DEMO_ONLINE'
                    ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30'
                    : 'border-slate-200 dark:border-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="DEMO_ONLINE"
                  checked={paymentMethod === 'DEMO_ONLINE'}
                  onChange={() => setPaymentMethod('DEMO_ONLINE')}
                  className="mt-1 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                />
                <div className="ml-3 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      Online Payment
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Instant Card/UPI gateway with animated processing confirmation.
                  </p>
                </div>
              </label>

              <label
                className={`flex items-start p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
                  paymentMethod === 'COD'
                    ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30'
                    : 'border-slate-200 dark:border-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="COD"
                  checked={paymentMethod === 'COD'}
                  onChange={() => setPaymentMethod('COD')}
                  className="mt-1 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                />
                <div className="ml-3 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      Cash on Delivery (COD)
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Pay cash upon physical parcel arrival at your doorstep. Order status will be Pending.
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Summary Column */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-6">
          <h2 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
            Review Order ({cartItems.length} items)
          </h2>

          <div className="max-h-60 overflow-y-auto space-y-3 divide-y divide-slate-100 dark:divide-slate-800 pr-1">
            {cartItems.map((item) => (
              <div key={item.book.id} className="pt-3 first:pt-0 flex items-center gap-3">
                <img
                  src={item.book.image_url || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800"}
                  alt={item.book.title}
                  className="w-10 h-14 object-cover rounded-lg bg-slate-100 shrink-0 border border-slate-200"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                    {item.book.title}
                  </h4>
                  <p className="text-[11px] text-slate-500">Qty: {item.quantity} × ₹{item.price}</p>
                </div>
                <span className="text-xs font-bold text-slate-900 dark:text-white shrink-0">
                  ₹{(item.quantity * item.price).toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-2.5 text-xs">
            <div className="flex justify-between text-slate-600 dark:text-slate-300">
              <span>Subtotal</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                ₹{subtotal.toLocaleString('en-IN')}
              </span>
            </div>

            {discount > 0 && (
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span>Coupon ({appliedCoupon?.code})</span>
                <span>-₹{Math.round(discount)}</span>
              </div>
            )}

            <div className="flex justify-between text-slate-600 dark:text-slate-300">
              <span>Delivery Fee</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
              </span>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800 pt-3 flex justify-between text-base font-black text-slate-900 dark:text-white">
              <span>Payable Amount</span>
              <span className="text-indigo-600 dark:text-indigo-400 text-xl">
                ₹{Math.round(total).toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isProcessing}
            className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm shadow-md transition active:scale-98"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing Order...</span>
              </>
            ) : (
              <span>Complete Order (₹{Math.round(total).toLocaleString('en-IN')})</span>
            )}
          </button>
        </div>
      </form>

      {/* DEMO PAYMENT MODAL */}
      {paymentStage && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl animate-in zoom-in-95 duration-200 space-y-5 border border-slate-200 dark:border-slate-800">
            {paymentStage === 'processing' ? (
              <>
                <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto" />
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Simulating Demo Gateway...
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Verifying mock authorization. Zero real money charged.
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-md animate-bounce">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-emerald-600">
                    Payment Successful ✓
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Demo payment approved. Generating order receipt...
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
