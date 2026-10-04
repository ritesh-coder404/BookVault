import React, { useState, useEffect } from 'react';
import { Tag, PlusCircle, Trash2, CheckCircle2, AlertCircle, ToggleLeft, ToggleRight, X } from 'lucide-react';
import { supabase, isSupabaseConfigured, localStore } from '../lib/supabase';
import Loading from '../components/Loading';

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);

  // New Coupon Form
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState('PERCENTAGE');
  const [discountValue, setDiscountValue] = useState('');
  const [minOrder, setMinOrder] = useState('300');
  const [maxDiscount, setMaxDiscount] = useState('200');

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase
          .from('coupons')
          .select('*')
          .order('code', { ascending: true });
        if (error) throw error;
        setCoupons(data || []);
      } else {
        setCoupons(localStore.getCoupons());
      }
    } catch (err) {
      console.error('Error fetching admin coupons:', err);
      setCoupons(localStore.getCoupons());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const showToast = (text, type = 'success') => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleToggleActive = async (cpn) => {
    const nextState = !cpn.active;
    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase
          .from('coupons')
          .update({ active: nextState })
          .eq('id', cpn.id);
        if (error) throw error;
      } else {
        localStore.toggleCoupon(cpn.id);
      }

      setCoupons((prev) =>
        prev.map((c) => (c.id === cpn.id ? { ...c, active: nextState } : c))
      );
      showToast(`Coupon ${cpn.code} is now ${nextState ? 'Active' : 'Disabled'}.`);
    } catch (err) {
      console.error('Toggle coupon error:', err);
      showToast(err.message || 'Failed to update coupon', 'error');
    }
  };

  const handleDeleteCoupon = async (id, cpnCode) => {
    if (!window.confirm(`Delete coupon "${cpnCode}"?`)) return;

    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.from('coupons').delete().eq('id', id);
        if (error) throw error;
      } else {
        localStore.deleteCoupon(id);
      }
      setCoupons((prev) => prev.filter((c) => c.id !== id));
      showToast(`Coupon "${cpnCode}" deleted.`);
    } catch (err) {
      console.error('Delete coupon error:', err);
      showToast('Failed to delete coupon', 'error');
    }
  };

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    if (!code.trim() || !discountValue) return;

    const newCoupon = {
      code: code.trim().toUpperCase(),
      discount_type: discountType,
      discount_value: Number(discountValue),
      min_order_amount: Number(minOrder) || 0,
      max_discount: maxDiscount ? Number(maxDiscount) : null,
      active: true,
    };

    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase
          .from('coupons')
          .insert([newCoupon])
          .select()
          .single();
        if (error) throw error;
        setCoupons((prev) => [data, ...prev]);
      } else {
        const created = localStore.addCoupon(newCoupon);
        setCoupons((prev) => [created, ...prev]);
      }

      showToast(`Coupon "${newCoupon.code}" created successfully!`);
      setShowModal(false);
      setCode('');
      setDiscountValue('');
    } catch (err) {
      console.error('Create coupon error:', err);
      showToast(err.message || 'Failed to create coupon', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {toastMsg && (
        <div className={`p-4 rounded-2xl flex items-center gap-2 text-xs font-bold text-white shadow-lg ${
          toastMsg.type === 'error' ? 'bg-rose-600' : 'bg-emerald-600'
        }`}>
          {toastMsg.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
          <span>{toastMsg.text}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Discount Coupons
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Create and manage promotional voucher codes for customer checkout
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition active:scale-95"
        >
          <PlusCircle className="w-4 h-4" />
          Create New Coupon
        </button>
      </div>

      {loading ? (
        <Loading text="Loading discount coupons..." />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-6">Promo Code</th>
                  <th className="py-3 px-6">Discount Type</th>
                  <th className="py-3 px-6">Discount Value</th>
                  <th className="py-3 px-6">Min Order</th>
                  <th className="py-3 px-6">Max Cap</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {coupons.map((c) => (
                  <tr key={c.id || c.code} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 px-6 font-mono font-black text-indigo-600 text-sm">
                      {c.code}
                    </td>
                    <td className="py-3.5 px-6 font-semibold text-slate-700 capitalize">
                      {c.discount_type?.toLowerCase()}
                    </td>
                    <td className="py-3.5 px-6 font-black text-slate-900">
                      {c.discount_type === 'PERCENTAGE' ? `${c.discount_value}%` : `₹${c.discount_value}`}
                    </td>
                    <td className="py-3.5 px-6 text-slate-600">
                      ₹{c.min_order_amount || 0}
                    </td>
                    <td className="py-3.5 px-6 text-slate-600">
                      {c.max_discount ? `₹${c.max_discount}` : 'No limit'}
                    </td>
                    <td className="py-3.5 px-6">
                      <button
                        onClick={() => handleToggleActive(c)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-bold text-[10px] transition ${
                          c.active
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {c.active ? 'Active' : 'Disabled'}
                      </button>
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <button
                        onClick={() => handleDeleteCoupon(c.id, c.code)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE COUPON MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900">Create New Coupon</h3>
              <button onClick={() => setShowModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCoupon} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Coupon Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FLASH30"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 uppercase font-mono font-bold focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Discount Type</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-hidden"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Fixed Amount (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Discount Value *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 15"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Min Order Amount (₹)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="300"
                    value={minOrder}
                    onChange={(e) => setMinOrder(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Max Cap (₹, optional)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="250"
                    value={maxDiscount}
                    onChange={(e) => setMaxDiscount(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 border border-slate-300 font-bold rounded-xl text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 font-bold rounded-xl text-white shadow-md"
                >
                  Save Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
