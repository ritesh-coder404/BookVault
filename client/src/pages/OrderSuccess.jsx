import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CheckCircle, Package, ShoppingBag, ArrowRight } from 'lucide-react';

export default function OrderSuccess() {
  const location = useLocation();
  const state = location.state || {};
  const orderId = state.orderId || 'ORD-' + Math.floor(100000 + Math.random() * 900000);
  const total = state.total || 0;
  const paymentMethod = state.paymentMethod === 'DEMO_ONLINE' ? 'Demo Online Payment' : 'Cash on Delivery';
  const paymentStatus = state.paymentStatus || (state.paymentMethod === 'DEMO_ONLINE' ? 'PAID' : 'PENDING');
  const orderStatus = 'Pending';

  return (
    <div className="max-w-2xl mx-auto my-16 px-4">
      <div className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-12 shadow-lg text-center space-y-6">
        
        {/* Success Icon */}
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner animate-in zoom-in-75 duration-300">
          <CheckCircle className="w-12 h-12" />
        </div>

        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 px-3 py-1 bg-emerald-50 rounded-full">
            Confirmed
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-3">
            ✓ Order Placed Successfully
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Thank you for your order! We are preparing your book parcel with care.
          </p>
        </div>

        {/* Order Details Receipt Card */}
        <div className="bg-slate-50 border border-slate-200/70 rounded-2xl p-6 text-left space-y-3 text-sm">
          <div className="flex justify-between items-center border-b border-slate-200/60 pb-3">
            <span className="text-slate-500 font-medium">Order ID</span>
            <span className="font-mono font-bold text-slate-900 bg-white px-2.5 py-1 rounded-md border border-slate-200 text-xs">
              {orderId}
            </span>
          </div>

          <div className="flex justify-between items-center border-b border-slate-200/60 pb-3">
            <span className="text-slate-500 font-medium">Total Amount</span>
            <span className="text-base font-extrabold text-slate-900">
              ₹{Number(total).toLocaleString('en-IN')}
            </span>
          </div>

          <div className="flex justify-between items-center border-b border-slate-200/60 pb-3">
            <span className="text-slate-500 font-medium">Payment Mode</span>
            <div className="text-right">
              <span className="font-semibold text-slate-800 block">{paymentMethod}</span>
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                paymentStatus === 'PAID' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
              }`}>
                {paymentStatus}
              </span>
            </div>
          </div>

          <div className="flex justify-between items-center pt-1">
            <span className="text-slate-500 font-medium">Order Status</span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-md font-bold text-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping" />
              {orderStatus}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            to="/my-orders"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-md transition active:scale-95"
          >
            <Package className="w-4 h-4" />
            <span>View My Orders</span>
          </Link>

          <Link
            to="/books"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-xl transition"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Continue Shopping</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
