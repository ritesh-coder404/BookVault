import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Package, 
  ChevronDown, 
  ChevronUp, 
  MapPin, 
  CreditCard, 
  Calendar, 
  ShoppingBag,
  ExternalLink 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase, isSupabaseConfigured, localStore } from '../lib/supabase';
import Loading from '../components/Loading';

export default function MyOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  useEffect(() => {
    const fetchUserOrders = async () => {
      setLoading(true);
      try {
        if (isSupabaseConfigured && supabase && user) {
          // Fetch orders for current authenticated user
          const { data: userOrders, error: orderErr } = await supabase
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
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

          if (orderErr) throw orderErr;

          // Format items structure
          const formatted = (userOrders || []).map((ord) => ({
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
          // Fallback local mock mode
          const localUserOrders = localStore.getUserOrders(user?.id || 'usr-demo-customer-1');
          setOrders(localUserOrders);
        }
      } catch (err) {
        console.error('Error fetching customer orders:', err);
        const localUserOrders = localStore.getUserOrders(user?.id || 'usr-demo-customer-1');
        setOrders(localUserOrders);
      } finally {
        setLoading(false);
      }
    };

    fetchUserOrders();
  }, [user]);

  const toggleExpand = (orderId) => {
    setExpandedOrderId((prev) => (prev === orderId ? null : orderId));
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'shipped':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'confirmed':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'cancelled':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      default:
        return 'bg-amber-100 text-amber-800 border-amber-200';
    }
  };

  if (loading) {
    return <Loading text="Loading your orders..." />;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          My Order History
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Track, inspect, and review your previous bookstore orders
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto shadow-xs space-y-4">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 mx-auto">
            <Package className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">No Orders Yet</h3>
          <p className="text-sm text-slate-500">
            You haven't placed any book orders yet. Start exploring our bestsellers!
          </p>
          <Link
            to="/books"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-xs font-semibold rounded-xl hover:bg-indigo-700 transition"
          >
            <ShoppingBag className="w-4 h-4" />
            Browse Catalog
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const isExpanded = expandedOrderId === order.id;
            const itemsCount = order.items?.reduce((sum, it) => sum + it.quantity, 0) || 0;

            return (
              <div
                key={order.id}
                className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden transition-all duration-200"
              >
                {/* Header Summary Row */}
                <div
                  onClick={() => toggleExpand(order.id)}
                  className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/60 transition"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-md">
                        {order.id}
                      </span>
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${getStatusBadge(order.order_status)}`}>
                        {order.order_status}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(order.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                      <span>•</span>
                      <span>{itemsCount} {itemsCount === 1 ? 'item' : 'items'}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <div className="text-left sm:text-right">
                      <span className="text-xs text-slate-400 block font-medium">Total</span>
                      <span className="text-lg font-black text-slate-900">
                        ₹{Number(order.total_amount).toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-indigo-600 hidden sm:inline">
                        {isExpanded ? 'Hide Details' : 'View Details'}
                      </span>
                      <div className="p-1 rounded-full bg-slate-100 text-slate-600">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded Details Drawer */}
                {isExpanded && (
                  <div className="border-t border-slate-100 p-5 sm:p-6 bg-slate-50/50 space-y-6 animate-in slide-in-from-top-2 duration-150">
                    
                    {/* Ordered Books list */}
                    <div>
                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                        Ordered Items
                      </h4>
                      <div className="space-y-3">
                        {order.items?.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between bg-white p-3 rounded-2xl border border-slate-200/70"
                          >
                            <div className="flex items-center gap-3">
                              <img
                                src={item.book?.image_url || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800"}
                                alt={item.book?.title || 'Book'}
                                className="w-12 h-16 object-cover rounded-lg bg-slate-100 border border-slate-200"
                              />
                              <div>
                                <h5 className="text-sm font-bold text-slate-900 line-clamp-1">
                                  {item.book?.title || 'Book Title'}
                                </h5>
                                <p className="text-xs text-slate-500">
                                  Qty: {item.quantity} × ₹{Number(item.price).toLocaleString('en-IN')}
                                </p>
                              </div>
                            </div>
                            <span className="text-sm font-extrabold text-slate-800">
                              ₹{(item.quantity * item.price).toLocaleString('en-IN')}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Metadata Grid: Shipping & Payment */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      
                      {/* Shipping Address */}
                      <div className="bg-white p-4 rounded-2xl border border-slate-200/70 space-y-2">
                        <span className="font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                          Delivery Address
                        </span>
                        <p className="font-semibold text-slate-900">{order.shipping_name}</p>
                        <p className="text-slate-600 leading-relaxed">
                          {order.address}, {order.city}, {order.state} - {order.pincode}
                        </p>
                        <p className="text-slate-500 font-medium">Contact: {order.mobile}</p>
                      </div>

                      {/* Payment Information */}
                      <div className="bg-white p-4 rounded-2xl border border-slate-200/70 space-y-2">
                        <span className="font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                          <CreditCard className="w-3.5 h-3.5 text-indigo-600" />
                          Payment & Tracking
                        </span>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Payment Mode:</span>
                          <span className="font-semibold text-slate-800">
                            {order.payment_method === 'DEMO_ONLINE' ? 'Demo Online Payment' : 'Cash on Delivery'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500">Payment Status:</span>
                          <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                            order.payment_status === 'PAID'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}>
                            {order.payment_status}
                          </span>
                        </div>
                        <div className="flex justify-between items-center pt-1 border-t border-slate-100">
                          <span className="text-slate-500">Order Status:</span>
                          <span className="font-bold text-indigo-700">{order.order_status}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
