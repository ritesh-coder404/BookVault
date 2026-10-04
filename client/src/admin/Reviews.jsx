import React, { useState, useEffect } from 'react';
import { MessageSquare, Star, Trash2, Search, AlertCircle, CheckCircle2 } from 'lucide-react';
import { supabase, isSupabaseConfigured, localStore } from '../lib/supabase';
import Loading from '../components/Loading';

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionMsg, setActionMsg] = useState(null);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase
          .from('reviews')
          .select(`
            *,
            books (title, author, image_url)
          `)
          .order('created_at', { ascending: false });

        if (error) throw error;
        const formatted = (data || []).map((r) => ({
          ...r,
          book: r.books,
        }));
        setReviews(formatted);
      } else {
        setReviews(localStore.getAllReviews());
      }
    } catch (err) {
      console.error('Error fetching admin reviews:', err);
      setReviews(localStore.getAllReviews());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const showMsg = (text, type = 'success') => {
    setActionMsg({ text, type });
    setTimeout(() => setActionMsg(null), 3000);
  };

  const handleDeleteReview = async (id) => {
    if (!window.confirm('Delete this customer review?')) return;

    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.from('reviews').delete().eq('id', id);
        if (error) throw error;
      } else {
        localStore.deleteReview(id);
      }
      setReviews((prev) => prev.filter((r) => r.id !== id));
      showMsg('Review deleted successfully.');
    } catch (err) {
      console.error('Delete review error:', err);
      showMsg('Failed to delete review', 'error');
    }
  };

  const filteredReviews = reviews.filter((r) => {
    const term = searchTerm.toLowerCase().trim();
    return (
      !term ||
      r.user_name?.toLowerCase().includes(term) ||
      r.book?.title?.toLowerCase().includes(term) ||
      r.review_text?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      {actionMsg && (
        <div className={`p-4 rounded-2xl flex items-center gap-2 text-xs font-bold text-white shadow-lg ${
          actionMsg.type === 'error' ? 'bg-rose-600' : 'bg-emerald-600'
        }`}>
          {actionMsg.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
          <span>{actionMsg.text}</span>
        </div>
      )}

      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          Review Moderation
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Monitor customer ratings, user feedback, and moderate submissions
        </p>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between gap-4">
        <div className="w-full sm:w-80 relative">
          <input
            type="text"
            placeholder="Search reviews by user, book, text..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>
        <span className="text-xs text-slate-500 font-semibold">
          Total Reviews: {filteredReviews.length}
        </span>
      </div>

      {loading ? (
        <Loading text="Loading customer reviews..." />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-6">Book</th>
                  <th className="py-3 px-6">Reviewer</th>
                  <th className="py-3 px-6">Rating</th>
                  <th className="py-3 px-6">Comment</th>
                  <th className="py-3 px-6">Date</th>
                  <th className="py-3 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredReviews.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No reviews found.
                    </td>
                  </tr>
                ) : (
                  filteredReviews.map((rev) => (
                    <tr key={rev.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-3.5 px-6 font-bold text-slate-800 max-w-xs truncate">
                        {rev.book?.title || 'Book Title'}
                      </td>
                      <td className="py-3.5 px-6 font-semibold text-slate-700">
                        {rev.user_name || 'Anonymous Reader'}
                      </td>
                      <td className="py-3.5 px-6">
                        <div className="flex items-center gap-1 text-amber-500 font-bold">
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                          <span>{rev.rating}/5</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-6 text-slate-600 max-w-sm">
                        <p className="line-clamp-2">{rev.review_text}</p>
                      </td>
                      <td className="py-3.5 px-6 text-slate-400">
                        {new Date(rev.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-6 text-right">
                        <button
                          onClick={() => handleDeleteReview(rev.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Delete review"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
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
