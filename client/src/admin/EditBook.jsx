import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Image as ImageIcon 
} from 'lucide-react';
import { supabase, isSupabaseConfigured, localStore } from '../lib/supabase';
import Loading from '../components/Loading';

export default function EditBook() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const categories = [
    'Technology',
    'Fiction',
    'Self-Help',
    'Finance',
    'Productivity',
    'History',
    'Science',
    'Biography',
  ];

  useEffect(() => {
    const fetchBook = async () => {
      setLoading(true);
      try {
        if (isSupabaseConfigured && supabase) {
          const { data, error } = await supabase
            .from('books')
            .select('*')
            .eq('id', id)
            .single();

          if (error) throw error;
          if (data) {
            setTitle(data.title);
            setAuthor(data.author);
            setCategory(data.category);
            setPrice(data.price);
            setStock(data.stock);
            setDescription(data.description || '');
            setImageUrl(data.image_url || '');
            setPreviewUrl(data.image_url || '');
          }
        } else {
          const book = localStore.getBookById(id);
          if (book) {
            setTitle(book.title);
            setAuthor(book.author);
            setCategory(book.category);
            setPrice(book.price);
            setStock(book.stock);
            setDescription(book.description || '');
            setImageUrl(book.image_url || '');
            setPreviewUrl(book.image_url || '');
          }
        }
      } catch (err) {
        console.error('Error fetching book for edit:', err);
        setErrorMsg('Failed to load book data.');
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [id]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const uploadImageToSupabase = async (file) => {
    if (!file) return null;

    if (isSupabaseConfigured && supabase) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
      const filePath = `covers/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('book-images')
        .upload(filePath, file, { cacheControl: '3600', upsert: true });

      if (uploadError) {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(file);
        });
      }

      const { data } = supabase.storage
        .from('book-images')
        .getPublicUrl(filePath);

      return data?.publicUrl;
    } else {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (Number(price) < 0 || Number(stock) < 0) {
      setErrorMsg('Price and Stock must be non-negative values.');
      return;
    }

    setSubmitting(true);

    try {
      let finalImageUrl = imageUrl.trim();

      if (selectedFile) {
        setUploadingImage(true);
        const uploaded = await uploadImageToSupabase(selectedFile);
        if (uploaded) {
          finalImageUrl = uploaded;
        }
        setUploadingImage(false);
      }

      const updates = {
        title: title.trim(),
        author: author.trim(),
        category,
        price: Number(price),
        stock: Number(stock),
        description: description.trim(),
        image_url: finalImageUrl,
        updated_at: new Date().toISOString(),
      };

      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase
          .from('books')
          .update(updates)
          .eq('id', id);
        if (error) throw error;
      } else {
        localStore.updateBook(id, updates);
      }

      setSuccessMsg('Book updated successfully!');
      setTimeout(() => {
        navigate('/admin/books');
      }, 1200);
    } catch (err) {
      console.error('Update book error:', err);
      setErrorMsg(err.message || 'Failed to update book.');
    } finally {
      setSubmitting(false);
      setUploadingImage(false);
    }
  };

  if (loading) {
    return <Loading text="Loading book information..." />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="space-y-1">
        <Link
          to="/admin/books"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Inventory
        </Link>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          Edit Book Details
        </h1>
        <p className="text-slate-500 text-sm">
          Modify pricing, availability stock, and book description
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2.5 text-xs text-rose-700">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2.5 text-xs text-emerald-700">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleUpdate} className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-white p-6 sm:p-10 rounded-3xl border border-slate-200/80 shadow-xs">
        {/* Left Fields */}
        <div className="lg:col-span-8 space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Book Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-800"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Author *
              </label>
              <input
                type="text"
                required
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-800"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Price (₹) *
              </label>
              <input
                type="number"
                required
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Stock Quantity *
              </label>
              <input
                type="number"
                required
                min="0"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Description
            </label>
            <textarea
              rows="4"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-800 resize-none"
            />
          </div>
        </div>

        {/* Right Fields: Cover & Preview */}
        <div className="lg:col-span-4 space-y-4">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            Cover Preview
          </label>

          <div className="relative aspect-[3/4] w-full rounded-2xl border-2 border-slate-200 bg-slate-50 overflow-hidden flex items-center justify-center shadow-xs">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <ImageIcon className="w-10 h-10 text-slate-300" />
            )}
          </div>

          <div>
            <label className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl cursor-pointer transition border border-slate-300">
              <Upload className="w-4 h-4" />
              <span>Replace Image File</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Or Update Image URL:
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => {
                setImageUrl(e.target.value);
                setPreviewUrl(e.target.value);
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden"
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={submitting || uploadingImage}
              className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition active:scale-98 flex items-center justify-center gap-2"
            >
              {submitting || uploadingImage ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Changes...</span>
                </>
              ) : (
                <span>Save Book Updates</span>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
