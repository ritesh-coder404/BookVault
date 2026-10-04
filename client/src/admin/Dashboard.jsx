import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  ShoppingBag, 
  Users, 
  IndianRupee, 
  ArrowRight, 
  PlusCircle, 
  AlertTriangle, 
  TrendingUp, 
  CheckCircle2, 
  Clock,
  PieChart,
  BarChart3
} from 'lucide-react';
import { supabase, isSupabaseConfigured, localStore } from '../lib/supabase';
import Loading from '../components/Loading';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBooks: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalSales: 0,
  });
  const [statusCounts, setStatusCounts] = useState({
    Pending: 0,
    Confirmed: 0,
    Shipped: 0,
    Delivered: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStockBooks, setLowStockBooks] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        if (isSupabaseConfigured && supabase) {
          const { data: books } = await supabase.from('books').select('*');
          const { data: orders } = await supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false });
          const { data: profiles } = await supabase.from('profiles').select('*');

          const sales = (orders || []).reduce((sum, ord) => sum + Number(ord.total_amount || 0), 0);
          const lowStock = (books || []).filter((b) => b.stock <= 5);

          const counts = { Pending: 0, Confirmed: 0, Shipped: 0, Delivered: 0 };
          (orders || []).forEach((o) => {
            if (counts[o.order_status] !== undefined) counts[o.order_status]++;
          });

          setStats({
            totalBooks: books?.length || 0,
            totalOrders: orders?.length || 0,
            totalCustomers: profiles?.filter((p) => p.role === 'customer').length || 0,
            totalSales: sales,
          });

          setStatusCounts(counts);
          setRecentOrders(orders?.slice(0, 5) || []);
          setLowStockBooks(lowStock);
        } else {
          const books = localStore.getBooks();
          const orders = localStore.getOrders();
          const customers = localStore.getCustomers();

          const sales = orders.reduce((sum, ord) => sum + Number(ord.total_amount || 0), 0);
          const lowStock = books.filter((b) => b.stock <= 5);

          const counts = { Pending: 0, Confirmed: 0, Shipped: 0, Delivered: 0 };
          orders.forEach((o) => {
            if (counts[o.order_status] !== undefined) counts[o.order_status]++;
          });

          setStats({
            totalBooks: books.length,
            totalOrders: orders.length,
            totalCustomers: customers.filter((c) => c.role === 'customer').length,
            totalSales: sales,
          });

          setStatusCounts(counts);
          setRecentOrders(orders.slice(0, 5));
          setLowStockBooks(lowStock);
        }
      } catch (err) {
        console.error('Error fetching admin dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <Loading text="Loading dashboard metrics..." />;
  }

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

  return (
    <div className="space-y-8">
      {/* Title & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Store Performance & Analytics
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Real-time sales revenue, inventory tracking, and fulfillment overview
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/books/add"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            Add New Book
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Gross Sales</span>
            <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">
              ₹{stats.totalSales.toLocaleString('en-IN')}
            </span>
            <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1 mt-1">
              <TrendingUp className="w-3.5 h-3.5" /> Live Sales
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
            <IndianRupee className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Orders</span>
            <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">
              {stats.totalOrders}
            </span>
            <span className="text-[11px] font-semibold text-indigo-600 flex items-center gap-1 mt-1">
              <Clock className="w-3.5 h-3.5" /> Customer Purchases
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Books in Catalog</span>
            <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">
              {stats.totalBooks}
            </span>
            <span className="text-[11px] font-semibold text-blue-600 flex items-center gap-1 mt-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> 100+ Seed Available
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950 text-blue-600 flex items-center justify-center">
            <BookOpen className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Customers</span>
            <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">
              {stats.totalCustomers}
            </span>
            <span className="text-[11px] font-semibold text-purple-600 flex items-center gap-1 mt-1">
              <Users className="w-3.5 h-3.5" /> Active Readers
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950 text-purple-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Visual Fulfillment Breakdown */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-600" />
            Order Fulfillment Pipeline
          </h2>
          <span className="text-xs text-slate-400">Status Distribution</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-2xl text-center">
            <span className="text-2xl font-black text-amber-700 dark:text-amber-400">{statusCounts.Pending}</span>
            <p className="text-xs font-bold text-amber-800 dark:text-amber-300 mt-1">Pending Orders</p>
          </div>

          <div className="p-4 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900 rounded-2xl text-center">
            <span className="text-2xl font-black text-indigo-700 dark:text-indigo-400">{statusCounts.Confirmed}</span>
            <p className="text-xs font-bold text-indigo-800 dark:text-indigo-300 mt-1">Confirmed</p>
          </div>

          <div className="p-4 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-2xl text-center">
            <span className="text-2xl font-black text-blue-700 dark:text-blue-400">{statusCounts.Shipped}</span>
            <p className="text-xs font-bold text-blue-800 dark:text-blue-300 mt-1">Shipped / In Transit</p>
          </div>

          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 rounded-2xl text-center">
            <span className="text-2xl font-black text-emerald-700 dark:text-emerald-400">{statusCounts.Delivered}</span>
            <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300 mt-1">Delivered</p>
          </div>
        </div>
      </div>

      {/* Low Stock Warning */}
      {lowStockBooks.length > 0 && (
        <div className="p-5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-900 dark:text-amber-200">
                Low Stock Alert: {lowStockBooks.length} book(s) need replenishment!
              </h4>
              <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                {lowStockBooks.slice(0, 3).map((b) => `${b.title} (${b.stock} left)`).join(', ')}
                {lowStockBooks.length > 3 && ` and ${lowStockBooks.length - 3} more...`}
              </p>
            </div>
          </div>
          <Link
            to="/admin/books"
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shrink-0 transition"
          >
            Manage Stock
          </Link>
        </div>
      )}

      {/* Recent Orders Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden space-y-4">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Recent Customer Orders</h2>
            <p className="text-xs text-slate-500 mt-0.5">Latest transactions and fulfillment statuses</p>
          </div>
          <Link
            to="/admin/orders"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
          >
            <span>View All Orders</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            No orders placed yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100 dark:border-slate-700">
                <tr>
                  <th className="py-3 px-6">Order ID</th>
                  <th className="py-3 px-6">Customer</th>
                  <th className="py-3 px-6">Date</th>
                  <th className="py-3 px-6">Amount</th>
                  <th className="py-3 px-6">Payment Mode</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {recentOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-6 font-mono font-bold text-slate-900 dark:text-white">
                      {ord.id}
                    </td>
                    <td className="py-3.5 px-6 font-semibold text-slate-800 dark:text-slate-200">
                      {ord.shipping_name}
                    </td>
                    <td className="py-3.5 px-6 text-slate-500">
                      {new Date(ord.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-6 font-bold text-slate-900 dark:text-white">
                      ₹{Number(ord.total_amount).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-6 text-slate-700 dark:text-slate-300">
                      {ord.payment_method === 'DEMO_ONLINE' ? 'Demo Online' : 'COD'}
                    </td>
                    <td className="py-3.5 px-6">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${getStatusBadge(ord.order_status)}`}>
                        {ord.order_status}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <Link
                        to="/admin/orders"
                        className="text-indigo-600 dark:text-indigo-400 hover:underline font-bold"
                      >
                        Manage →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
