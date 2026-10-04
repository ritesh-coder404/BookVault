import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Search, 
  Filter, 
  ChevronDown, 
  ChevronUp, 
  MapPin, 
  Phone, 
  Mail, 
  AlertCircle, 
  CheckCircle2, 
  Calendar 
} from 'lucide-react';
import { supabase, isSupabaseConfigured, localStore } from '../lib/supabase';
import Loading from '../components/Loading';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);

  const fetchOrders = async () => {
    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase
          .from('orders')
          .select(`
            *,
            order_items (
              id,
              book_id,
              quantity,
              price,
              books (
                title,
                author,
                image_url
              )
            )
          `)
          .order('created_at', { ascending: false });

        if (error) throw error;

        const formatted = (data || []).map((ord) => ({
          ...ord,
          items: ord.order_items.map((oi) => ({
            id: oi.id,
            book_id: oi.book_id,
            quantity: oi.quantity,
            price: oi.price,
            book: oi.books,
          })),
        }));

        setOrders(formatted);
      } else {
        setOrders(localStore.getOrders());
      }
    } catch (err) {
      console.error('Error fetching admin orders:', err);
      setOrders(localStore.getOrders());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const showToast = (text, type = 'success') => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase
          .from('orders')
          .update({
            order_status: newStatus,
            updated_at: new Date().toISOString(),
          })
          .eq('id', orderId);
        if (error) throw error;
      } else {
        localStore.updateOrderStatus(orderId, newStatus);
      }

      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, order_status: newStatus } : o))
      );
      showToast(`Order status updated to "${newStatus}".`);
    } catch (err) {
      console.error('Update status error:', err);
      showToast(err.message || 'Failed to update order status', 'error');
    }
  };

  const toggleExpand = (orderId) => {
    setExpandedOrderId((prev) => (prev === orderId ? null : orderId));
  };

  const statusOptions = ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'];

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return 'bg-emerald-100 text-emerald-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'confirmed':
        return 'bg-indigo-100 text-indigo-800';
      case 'cancelled':
        return 'bg-rose-100 text-rose-800';
      default:
        return 'bg-amber-100 text-amber-800';
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchStatus =
      selectedStatus === 'All' ||
      o.order_status?.toLowerCase() === selectedStatus.toLowerCase();

    const term = searchTerm.toLowerCase().trim();
    const matchSearch =
      !term ||
      o.id?.toLowerCase().includes(term) ||
      o.shipping_name?.toLowerCase().includes(term) ||
      o.mobile?.includes(term) ||
      o.city?.toLowerCase().includes(term);

    return matchStatus && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMsg && (
        <div className={`p-4 rounded-2xl flex items-center gap-2 text-xs font-bold text-white shadow-lg animate-in slide-in-from-top-2 duration-200 ${
          toastMsg.type === 'error' ? 'bg-rose-600' : 'bg-emerald-600'
        }`}>
          {toastMsg.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
          <span>{toastMsg.text}</span>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          Customer Orders Management
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Review customer shipments, track payment states, and update fulfillment statuses
        </p>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="w-full sm:w-80 relative">
          <input
            type="text"
            placeholder="Search by order ID, customer, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-bold text-slate-500">Status Filter:</span>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-hidden"
          >
            <option value="All">All Statuses</option>
            {statusOptions.map((st) => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders Table */}
      {loading ? (
        <Loading text="Loading customer orders..." />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-6">Order ID</th>
                  <th className="py-3 px-6">Customer</th>
                  <th className="py-3 px-6">Date</th>
                  <th className="py-3 px-6">Amount</th>
                  <th className="py-3 px-6">Payment</th>
                  <th className="py-3 px-6">Order Status</th>
                  <th className="py-3 px-6 text-right">Update Status / Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      No matching orders found.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => {
                    const isExpanded = expandedOrderId === order.id;

                    return (
                      <React.Fragment key={order.id}>
                        <tr className="hover:bg-slate-50/60 transition">
                          <td className="py-3.5 px-6 font-mono font-bold text-slate-900">
                            {order.id}
                          </td>
                          <td className="py-3.5 px-6">
                            <span className="font-bold text-slate-800 block">
                              {order.shipping_name}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              {order.mobile}
                            </span>
                          </td>
                          <td className="py-3.5 px-6 text-slate-500">
                            {new Date(order.created_at).toLocaleDateString()}
                          </td>
                          <td className="py-3.5 px-6 font-extrabold text-slate-900">
                            ₹{Number(order.total_amount).toLocaleString('en-IN')}
                          </td>
                          <td className="py-3.5 px-6">
                            <div>
                              <span className="font-semibold text-slate-800 block">
                                {order.payment_method === 'DEMO_ONLINE' ? 'Demo Online' : 'COD'}
                              </span>
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                order.payment_status === 'PAID' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                              }`}>
                                {order.payment_status}
                              </span>
                            </div>
                          </td>
                          <td className="py-3.5 px-6">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${getStatusBadge(order.order_status)}`}>
                              {order.order_status}
                            </span>
                          </td>
                          <td className="py-3.5 px-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {/* Status Dropdown selector */}
                              <select
                                value={order.order_status}
                                onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-hidden"
                              >
                                {statusOptions.map((st) => (
                                  <option key={st} value={st}>{st}</option>
                                ))}
                              </select>

                              {/* Toggle items drawer */}
                              <button
                                onClick={() => toggleExpand(order.id)}
                                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
                                title="Expand Details"
                              >
                                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* Order Items Drawer */}
                        {isExpanded && (
                          <tr className="bg-slate-50/70 border-b border-slate-100">
                            <td colSpan={7} className="p-6">
                              <div className="space-y-4">
                                <div className="flex flex-col sm:flex-row justify-between gap-4 border-b border-slate-200/70 pb-3">
                                  <div className="flex items-start gap-2">
                                    <MapPin className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                                    <div>
                                      <p className="font-bold text-slate-800">
                                        Shipping: {order.shipping_name} ({order.mobile})
                                      </p>
                                      <p className="text-slate-500 text-xs mt-0.5">
                                        {order.address}, {order.city}, {order.state} - {order.pincode}
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                <div>
                                  <h5 className="font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-2">
                                    Ordered Books ({order.items?.length || 0})
                                  </h5>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                    {order.items?.map((it, idx) => (
                                      <div key={idx} className="bg-white p-3 rounded-xl border border-slate-200 flex items-center gap-3">
                                        <img
                                          src={it.book?.image_url || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800"}
                                          alt={it.book?.title}
                                          className="w-10 h-14 object-cover rounded bg-slate-100"
                                        />
                                        <div className="min-w-0">
                                          <p className="font-bold text-slate-800 truncate">{it.book?.title || 'Book'}</p>
                                          <p className="text-slate-500 text-[11px]">
                                            Qty: {it.quantity} × ₹{it.price}
                                          </p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
