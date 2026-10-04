import React, { useState, useEffect } from 'react';
import { Users, Search, Mail, Calendar, ShieldCheck, UserCheck } from 'lucide-react';
import { supabase, isSupabaseConfigured, localStore } from '../lib/supabase';
import Loading from '../components/Loading';

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchCustomers = async () => {
      setLoading(true);
      try {
        if (isSupabaseConfigured && supabase) {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });

          if (error) throw error;
          setCustomers(data || []);
        } else {
          setCustomers(localStore.getCustomers());
        }
      } catch (err) {
        console.error('Error fetching admin customers:', err);
        setCustomers(localStore.getCustomers());
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  const filteredCustomers = customers.filter((c) => {
    const term = searchTerm.toLowerCase().trim();
    return (
      !term ||
      c.name?.toLowerCase().includes(term) ||
      c.email?.toLowerCase().includes(term) ||
      c.role?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          Registered Users & Profiles
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Directory of registered customer and administrator accounts
        </p>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between gap-4">
        <div className="w-full sm:w-80 relative">
          <input
            type="text"
            placeholder="Search by name, email, role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>
        <span className="text-xs text-slate-500 font-semibold">
          Total: {filteredCustomers.length} Accounts
        </span>
      </div>

      {/* Table */}
      {loading ? (
        <Loading text="Loading user profiles..." />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-6">User</th>
                  <th className="py-3 px-6">Email Address</th>
                  <th className="py-3 px-6">Role</th>
                  <th className="py-3 px-6">Member Since</th>
                  <th className="py-3 px-6 text-right">Account Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      No accounts found.
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-3.5 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs border border-indigo-200">
                            {customer.name ? customer.name.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <span className="font-bold text-slate-800">
                            {customer.name}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-6 font-medium text-slate-600">
                        {customer.email}
                      </td>

                      <td className="py-3.5 px-6">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          customer.role === 'admin'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {customer.role || 'customer'}
                        </span>
                      </td>

                      <td className="py-3.5 px-6 text-slate-500">
                        {customer.created_at
                          ? new Date(customer.created_at).toLocaleDateString()
                          : 'Recent'}
                      </td>

                      <td className="py-3.5 px-6 text-right">
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                          <UserCheck className="w-3.5 h-3.5" />
                          Active
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
