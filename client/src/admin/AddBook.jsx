import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Upload, 
  BookOpen, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Image as ImageIcon 
} from 'lucide-react';
import { supabase, isSupabaseConfigured, localStore } from '../lib/supabase';

export default function AddBook() {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState('Technology');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('15');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [loading, setLoading] = useState(false);
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

  // Handle local file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
    }
  };

  // Upload image to Supabase Storage bucket 'book-images'
  const uploadImageToSupabase = async (file) => {
    if (!file) return null;

    if (isSupabaseConfigured && supabase) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
      const filePath = `covers/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('book-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        console.warn('Supabase storage upload error:', uploadError.message);
        // Fallback to Data URL if storage bucket policy prevents or bucket doesn't exist yet
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
      // Local fallback: convert file to base64 Data URL
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (Number(price) < 0 || Number(stock) < 0) {
      setErrorMsg('Price and Stock must be non-negative values.');
      return;
    }

    setLoading(true);

    try {
      let finalImageUrl = imageUrl.trim();

      // If file was selected, upload it
      if (selectedFile) {
        setUploadingImage(true);
        const uploaded = await uploadImageToSupabase(selectedFile);
        if (uploaded) {
          finalImageUrl = uploaded;
        }
        setUploadingImage(false);
      }

      // Fallback default image if none provided
      if (!finalImageUrl) {
        finalImageUrl = "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800";
      }

      const newBookData = {
        title: title.trim(),
        author: author.trim(),
        category,
        price: Number(price),
        stock: Number(stock),
        description: description.trim(),
        image_url: finalImageUrl,
      };

      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.from('books').insert([newBookData]);
        if (error) throw error;
      } else {
        localStore.addBook(newBookData);
      }

      setSuccessMsg('Book Added Successfully! Redirecting to inventory...');
      setTimeout(() => {
        navigate('/admin/books');
      }, 1500);
    } catch (err) {
      console.error('Add book error:', err);
      setErrorMsg(err.message || 'Failed to add book. Please verify your inputs.');
    } finally {
      setLoading(false);
      setUploadingImage(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Link
            to="/admin/books"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Inventory
          </Link>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Add New Book
          </h1>
          <p className="text-slate-500 text-sm">
            Enter book details and upload cover image to Supabase Storage
          </p>
        </div>
      </div>

      {/* Notifications */}
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

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-white p-6 sm:p-10 rounded-3xl border border-slate-200/80 shadow-xs">
        
        {/* Left Form: Details */}
        <div className="lg:col-span-8 space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Book Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Designing Data-Intensive Applications"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-800"
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
                placeholder="e.g. Martin Kleppmann"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-800"
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
                step="1"
                placeholder="e.g. 799"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Initial Stock *
              </label>
              <input
                type="number"
                required
                min="0"
                placeholder="e.g. 20"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Description / Synopsis
            </label>
            <textarea
              rows="4"
              placeholder="Provide a compelling overview of the book's contents, theme, and key takeaways..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-800 resize-none"
            />
          </div>
        </div>

        {/* Right Form: Cover Image & Preview */}
        <div className="lg:col-span-4 space-y-4">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            Book Cover Image
          </label>

          {/* Image Preview Box */}
          <div className="relative aspect-[3/4] w-full rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 overflow-hidden flex flex-col items-center justify-center text-center p-4">
            {previewUrl || imageUrl ? (
              <img
                src={previewUrl || imageUrl}
                alt="Book cover preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="space-y-2 text-slate-400">
                <ImageIcon className="w-10 h-10 mx-auto" />
                <p className="text-xs font-medium">Cover Preview</p>
              </div>
            )}
          </div>

          {/* Upload Button */}
          <div>
            <label className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl cursor-pointer transition border border-slate-300">
              <Upload className="w-4 h-4" />
              <span>Choose Image File</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
            <p className="text-[10px] text-slate-400 text-center mt-1">
              Uploads to Supabase Storage ('book-images')
            </p>
          </div>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-2 text-[10px] font-bold text-slate-400 uppercase">OR Image URL</span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          {/* Direct Image URL input */}
          <input
            type="url"
            placeholder="https://images.unsplash.com/..."
            value={imageUrl}
            onChange={(e) => {
              setImageUrl(e.target.value);
              setPreviewUrl(e.target.value);
            }}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-800"
          />

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading || uploadingImage}
              className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition active:scale-98 flex items-center justify-center gap-2"
            >
              {loading || uploadingImage ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{uploadingImage ? 'Uploading Image...' : 'Saving Book...'}</span>
                </>
              ) : (
                <span>Publish Book to Catalog</span>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
