import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  PlusCircle, 
  Search, 
  Edit3, 
  Trash2, 
  Plus, 
  Minus, 
  BookOpen, 
  AlertCircle, 
  CheckCircle2, 
  ExternalLink 
} from 'lucide-react';
import { supabase, isSupabaseConfigured, localStore } from '../lib/supabase';
import Loading from '../components/Loading';

export default function AdminBooks() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [actionMsg, setActionMsg] = useState(null);

  const fetchBooks = async () => {
    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase
          .from('books')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) throw error;
        setBooks(data || []);
      } else {
        setBooks(localStore.getBooks());
      }
    } catch (err) {
      console.error('Error fetching admin books:', err);
      setBooks(localStore.getBooks());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const showMessage = (text, type = 'success') => {
    setActionMsg({ text, type });
    setTimeout(() => setActionMsg(null), 3000);
  };

  // Quick Stock update directly from table
  const handleUpdateStock = async (book, delta) => {
    const newStock = Math.max(0, book.stock + delta);
    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase
          .from('books')
          .update({ stock: newStock })
          .eq('id', book.id);
        if (error) throw error;
      } else {
        localStore.updateBook(book.id, { stock: newStock });
      }

      setBooks((prev) =>
        prev.map((b) => (b.id === book.id ? { ...b, stock: newStock } : b))
      );
      showMessage(`Stock for "${book.title}" updated to ${newStock}.`);
    } catch (err) {
      console.error('Stock update error:', err);
      showMessage(err.message || 'Failed to update stock', 'error');
    }
  };

  // Delete Book
  const handleDeleteBook = async (book) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${book.title}"? This action cannot be undone.`
    );
    if (!confirmed) return;

    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.from('books').delete().eq('id', book.id);
        if (error) throw error;
      } else {
        localStore.deleteBook(book.id);
      }

      setBooks((prev) => prev.filter((b) => b.id !== book.id));
      showMessage(`"${book.title}" has been deleted successfully.`);
    } catch (err) {
      console.error('Delete book error:', err);
      showMessage(err.message || 'Failed to delete book', 'error');
    }
  };

  const categories = ['All', ...Array.from(new Set(books.map((b) => b.category).filter(Boolean)))];

  const filteredBooks = books.filter((b) => {
    const matchCat = selectedCategory === 'All' || b.category?.toLowerCase() === selectedCategory.toLowerCase();
    const term = searchTerm.toLowerCase().trim();
    const matchSearch =
      !term ||
      b.title?.toLowerCase().includes(term) ||
      b.author?.toLowerCase().includes(term) ||
      b.category?.toLowerCase().includes(term);
    return matchCat && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Toast alert */}
      {actionMsg && (
        <div className={`p-4 rounded-2xl flex items-center gap-2 text-xs font-bold text-white shadow-lg animate-in slide-in-from-top-2 duration-200 ${
          actionMsg.type === 'error' ? 'bg-rose-600' : 'bg-emerald-600'
        }`}>
          {actionMsg.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
          <span>{actionMsg.text}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Book Inventory
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage books, monitor stock levels, and update catalog details
          </p>
        </div>

        <Link
          to="/admin/books/add"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition active:scale-95 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          Add New Book
        </Link>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="w-full sm:w-80 relative">
          <input
            type="text"
            placeholder="Search by title, author, category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-bold text-slate-500">Category:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-hidden"
          >
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <Loading text="Loading catalog inventory..." />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-6">Book</th>
                  <th className="py-3 px-6">Category</th>
                  <th className="py-3 px-6">Price</th>
                  <th className="py-3 px-6">Stock Status</th>
                  <th className="py-3 px-6">Quick Stock</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBooks.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No books found.
                    </td>
                  </tr>
                ) : (
                  filteredBooks.map((book) => {
                    const isOutOfStock = book.stock <= 0;
                    const isLowStock = book.stock > 0 && book.stock <= 5;

                    return (
                      <tr key={book.id} className="hover:bg-slate-50/60 transition">
                        <td className="py-3.5 px-6">
                          <div className="flex items-center gap-3">
                            <img
                              src={book.image_url || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800"}
                              alt={book.title}
                              className="w-10 h-14 object-cover rounded-lg bg-slate-100 shrink-0 border border-slate-200"
                            />
                            <div>
                              <Link
                                to={`/books/${book.id}`}
                                className="font-bold text-slate-900 hover:text-indigo-600 transition flex items-center gap-1"
                                target="_blank"
                                title="View on store"
                              >
                                <span>{book.title}</span>
                                <ExternalLink className="w-3 h-3 text-slate-400" />
                              </Link>
                              <span className="text-[11px] text-slate-400 block">
                                by {book.author}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-6">
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-semibold rounded-md text-[10px]">
                            {book.category}
                          </span>
                        </td>

                        <td className="py-3.5 px-6 font-bold text-slate-900">
                          ₹{Number(book.price).toLocaleString('en-IN')}
                        </td>

                        <td className="py-3.5 px-6">
                          {isOutOfStock ? (
                            <span className="px-2 py-0.5 bg-rose-100 text-rose-700 font-bold rounded-md text-[10px]">
                              Out of Stock (0)
                            </span>
                          ) : isLowStock ? (
                            <span className="px-2 py-0.5 bg-amber-100 text-amber-700 font-bold rounded-md text-[10px] animate-pulse">
                              Low Stock ({book.stock})
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 font-semibold rounded-md text-[10px]">
                              In Stock ({book.stock})
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-6">
                          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg p-1 w-max">
                            <button
                              onClick={() => handleUpdateStock(book, -1)}
                              disabled={book.stock <= 0}
                              className="p-1 hover:bg-white text-slate-600 rounded disabled:opacity-30"
                              title="Decrease stock"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-2 font-bold text-slate-800 text-[11px]">
                              {book.stock}
                            </span>
                            <button
                              onClick={() => handleUpdateStock(book, 1)}
                              className="p-1 hover:bg-white text-slate-600 rounded"
                              title="Increase stock"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </td>

                        <td className="py-3.5 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              to={`/admin/books/edit/${book.id}`}
                              className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                              title="Edit book"
                            >
                              <Edit3 className="w-4 h-4" />
                            </Link>

                            <button
                              onClick={() => handleDeleteBook(book)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                              title="Delete book"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
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
