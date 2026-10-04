import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Shield, 
  Calendar, 
  Package, 
  LogOut, 
  ShieldCheck 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user, profile, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        
        {/* Cover banner */}
        <div className="h-32 bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-800" />

        <div className="px-6 sm:px-10 pb-10">
          {/* Avatar and basic info */}
          <div className="relative -mt-16 flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4 pb-6 border-b border-slate-100">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 text-center sm:text-left">
              <div className="w-24 h-24 rounded-3xl bg-white p-1.5 shadow-xl">
                <div className="w-full h-full rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center text-3xl font-black border border-indigo-200">
                  {profile?.name ? profile.name.charAt(0).toUpperCase() : 'U'}
                </div>
              </div>
              <div className="mb-2">
                <h1 className="text-2xl font-black text-slate-900">
                  {profile?.name || user?.email?.split('@')[0]}
                </h1>
                <p className="text-sm text-slate-500 font-medium">{user?.email}</p>
              </div>
            </div>

            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
              isAdmin ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-slate-100 text-slate-700'
            }`}>
              {profile?.role || 'Customer'}
            </span>
          </div>

          {/* User Attributes Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-8">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60 flex items-center gap-3">
              <div className="p-2.5 bg-white text-indigo-600 rounded-xl shadow-xs">
                <User className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slate-400 block uppercase">
                  Full Name
                </span>
                <span className="text-sm font-bold text-slate-800">
                  {profile?.name || 'Not provided'}
                </span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60 flex items-center gap-3">
              <div className="p-2.5 bg-white text-indigo-600 rounded-xl shadow-xs">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slate-400 block uppercase">
                  Email Address
                </span>
                <span className="text-sm font-bold text-slate-800 truncate block">
                  {user?.email}
                </span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60 flex items-center gap-3">
              <div className="p-2.5 bg-white text-indigo-600 rounded-xl shadow-xs">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slate-400 block uppercase">
                  Account Type
                </span>
                <span className="text-sm font-bold text-slate-800 capitalize">
                  {profile?.role || 'Customer'} Account
                </span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60 flex items-center gap-3">
              <div className="p-2.5 bg-white text-indigo-600 rounded-xl shadow-xs">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slate-400 block uppercase">
                  Member Since
                </span>
                <span className="text-sm font-bold text-slate-800">
                  {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Active Reader'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-3">
              <Link
                to="/my-orders"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition shadow-xs"
              >
                <Package className="w-4 h-4" />
                View Order History
              </Link>

              {isAdmin && (
                <Link
                  to="/admin"
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-500 text-white rounded-xl text-xs font-bold hover:bg-amber-600 transition shadow-xs"
                >
                  <ShieldCheck className="w-4 h-4" />
                  Admin Dashboard
                </Link>
              )}
            </div>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-bold transition border border-rose-200"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
