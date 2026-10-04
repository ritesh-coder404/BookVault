import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loading from './Loading';

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Loading text="Verifying authentication..." />;
  }

  if (!user) {
    // If route requires admin, redirect to admin login
    if (adminOnly) {
      return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }
    // Else redirect to regular customer login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (adminOnly && !isAdmin) {
    // Authenticated user is not an admin
    return (
      <div className="max-w-xl mx-auto my-16 p-8 bg-rose-50 border border-rose-200 rounded-2xl text-center shadow-sm">
        <h2 className="text-2xl font-bold text-rose-800 mb-2">Access Denied</h2>
        <p className="text-rose-600 mb-6">
          You do not have administrative privileges to access this page.
        </p>
        <div className="flex justify-center gap-4">
          <a
            href="/"
            className="px-5 py-2.5 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition"
          >
            Return to Store
          </a>
          <a
            href="/admin/login"
            className="px-5 py-2.5 bg-white border border-slate-300 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition"
          >
            Switch to Admin Account
          </a>
        </div>
      </div>
    );
  }

  return children;
}
