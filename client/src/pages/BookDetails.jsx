import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, 
  ArrowLeft, 
  Truck, 
  ShieldCheck, 
  RotateCcw, 
  Check, 
  AlertCircle, 
  Plus, 
  Minus,
  Sparkles,
  Heart,
  Star,
  MessageSquare,
  Send,
  UserCheck
} from 'lucide-react';
import { supabase, isSupabaseConfigured, localStore } from '../lib/supabase';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import BookCard from '../components/BookCard';
import Loading from '../components/Loading';

export default function BookDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { user, profile } = useAuth();

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [imgError, setImgError] = useState(false);

  // Reviews state
  const [reviews, setReviews] = useState([]);
  const [ratingInput, setRatingInput] = useState(5);
  const [reviewTextInput, setReviewTextInput] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Related books
  const [relatedBooks, setRelatedBooks] = useState([]);

  useEffect(() => {
    const fetchBookAndReviews = async () => {
      setLoading(true);
      try {
        let currentBook = null;
        if (isSupabaseConfigured && supabase) {
          const { data, error } = await supabase
            .from('books')
            .select('*')
            .eq('id', id)
            .single();

          if (error) throw error;
          currentBook = data;

          // Fetch reviews for this book
          const { data: revs } = await supabase
            .from('reviews')
            .select('*')
            .eq('book_id', id)
            .order('created_at', { ascending: false });

          setReviews(revs || []);

          // Fetch related books from same category
          if (currentBook?.category) {
            const { data: related } = await supabase
              .from('books')
              .select('*')
              .eq('category', currentBook.category)
              .neq('id', id)
              .limit(4);
            setRelatedBooks(related || []);
          }
        } else {
          currentBook = localStore.getBookById(id);
          const revs = localStore.getReviews(id);
          setReviews(revs);

          // Get related from local store
          const all = localStore.getBooks();
          const related = all.filter(
            (b) => b.category === currentBook?.category && b.id !== id
          ).slice(0, 4);
          setRelatedBooks(related);
        }

        setBook(currentBook);

        // Record in Recently Viewed
        if (currentBook) {
          localStore.addRecentlyViewed(currentBook);
        }
      } catch (err) {
        console.error('Error fetching book details:', err);
        const fallback = localStore.getBookById(id);
        setBook(fallback);
        if (fallback) localStore.addRecentlyViewed(fallback);
      } finally {
        setLoading(false);
      }
    };

    fetchBookAndReviews();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  if (loading) {
    return <Loading text="Loading 3D book details..." />;
  }

  if (!book) {
    return (
      <div className="max-w-xl mx-auto my-20 p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-center shadow-xs space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Book Not Found</h2>
        <p className="text-slate-500 text-xs sm:text-sm">
          The requested book could not be found. It may have been relocated or removed.
        </p>
        <Link
          to="/books"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl text-xs hover:bg-indigo-700 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Catalog
        </Link>
      </div>
    );
  }

  const isOutOfStock = book.stock <= 0;
  const isLowStock = book.stock > 0 && book.stock <= 5;
  const inWishlist = isInWishlist(book.id);
  const defaultCover = "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800";

  const handleIncrement = () => {
    if (quantity < book.stock) setQuantity((prev) => prev + 1);
  };

  const handleDecrement = () => {
    if (quantity > 1) setQuantity((prev) => prev - 1);
  };

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    const ok = addToCart(book, quantity);
    if (ok) {
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    }
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    const ok = addToCart(book, quantity);
    if (ok) navigate('/checkout');
  };

  // Submit Review Handler
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewTextInput.trim()) return;

    setSubmittingReview(true);
    const newRevData = {
      book_id: book.id,
      user_id: user?.id || 'usr-demo-customer-1',
      user_name: profile?.name || user?.email?.split('@')[0] || 'Verified Reader',
      rating: ratingInput,
      review_text: reviewTextInput.trim(),
    };

    try {
      if (isSupabaseConfigured && supabase && user) {
        const { data, error } = await supabase
          .from('reviews')
          .insert([newRevData])
          .select()
          .single();
        if (error) throw error;
        setReviews((prev) => [data, ...prev]);
      } else {
        const created = localStore.addReview(newRevData);
        setReviews((prev) => [created, ...prev]);
      }
      setReviewTextInput('');
      setRatingInput(5);
    } catch (err) {
      console.error('Error submitting review:', err);
    } finally {
      setSubmittingReview(false);
    }
  };

  const averageRating = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + Number(r.rating), 0) / reviews.length).toFixed(1)
    : (book.rating || 4.8);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12 dark:bg-slate-950 transition-colors">
      
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-slate-500">
        <Link to="/" className="hover:text-indigo-600 transition">Home</Link>
        <span>/</span>
        <Link to="/books" className="hover:text-indigo-600 transition">Books</Link>
        <span>/</span>
        <Link to={`/books?category=${encodeURIComponent(book.category)}`} className="hover:text-indigo-600 transition">
          {book.category}
        </Link>
        <span>/</span>
        <span className="text-slate-800 dark:text-white font-medium truncate max-w-xs">{book.title}</span>
      </nav>

      {/* Main 3D Book Presentation Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 bg-white dark:bg-slate-900 p-6 sm:p-10 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        
        {/* Cover Column with 3D Depth */}
        <div className="lg:col-span-5 flex flex-col items-center perspective-1000">
          <div className="relative w-full max-w-xs sm:max-w-sm aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 book-spine-effect group hover:rotate-y-[-6deg] hover:rotate-x-[3deg] transition-transform duration-300">
            <img
              src={imgError || !book.image_url ? defaultCover : book.image_url}
              alt={book.title}
              onError={() => setImgError(true)}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            {book.category && (
              <span className="absolute top-4 left-4 px-3 py-1 text-xs font-bold uppercase tracking-wider bg-white/95 dark:bg-slate-900/95 backdrop-blur-md text-slate-900 dark:text-white rounded-full shadow-sm">
                {book.category}
              </span>
            )}
            <button
              onClick={() => toggleWishlist(book)}
              className={`absolute top-4 right-4 p-2.5 rounded-full backdrop-blur-md transition-all shadow-md ${
                inWishlist
                  ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/90'
                  : 'bg-white/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-200 hover:text-rose-500'
              }`}
              title={inWishlist ? "Saved in Wishlist" : "Add to Wishlist"}
            >
              <Heart className={`w-5 h-5 ${inWishlist ? 'fill-rose-500 text-rose-500' : ''}`} />
            </button>
          </div>
          <p className="text-xs text-slate-400 mt-4 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            Hardcover / Collector Edition • 3D Showcase
          </p>
        </div>

        {/* Book Information Column */}
        <div className="lg:col-span-7 flex flex-col space-y-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              {isOutOfStock ? (
                <span className="px-3 py-0.5 text-xs font-bold text-rose-700 bg-rose-100 dark:bg-rose-950 dark:text-rose-300 rounded-full">
                  Out of Stock
                </span>
              ) : isLowStock ? (
                <span className="px-3 py-0.5 text-xs font-bold text-amber-800 bg-amber-100 dark:bg-amber-950 dark:text-amber-300 rounded-full animate-pulse">
                  Only {book.stock} left in stock
                </span>
              ) : (
                <span className="px-3 py-0.5 text-xs font-semibold text-emerald-700 bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300 rounded-full">
                  In Stock ({book.stock} copies)
                </span>
              )}

              {/* Star Rating Badge */}
              <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900 text-amber-700 dark:text-amber-400 text-xs font-bold">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{averageRating}</span>
                <span className="text-slate-400 font-normal">({reviews.length} reviews)</span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
              {book.title}
            </h1>
            <p className="text-base text-slate-600 dark:text-slate-400 font-medium mt-1">
              by <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{book.author}</span>
            </p>
          </div>

          {/* Pricing */}
          <div className="flex items-baseline gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
              ₹{Number(book.price).toLocaleString('en-IN')}
            </span>
            <span className="text-sm text-slate-400 line-through">
              ₹{Math.round(Number(book.price) * 1.25)}
            </span>
            <span className="text-xs font-bold px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 rounded-md">
              Save 20%
            </span>
          </div>

          {/* Synopsis */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">
              Book Synopsis
            </h3>
            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-line">
              {book.description || `Delve into "${book.title}", masterfully written by ${book.author}. An indispensable addition to your personal library.`}
            </p>
          </div>

          {/* Quantity Selector & Action Buttons */}
          <div className="pt-2 space-y-4">
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">Quantity:</span>
              <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 p-1">
                <button
                  onClick={handleDecrement}
                  disabled={quantity <= 1 || isOutOfStock}
                  className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 disabled:opacity-40 rounded-lg hover:bg-white dark:hover:bg-slate-700 transition"
                  aria-label="Decrease"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 text-sm font-bold text-slate-800 dark:text-white">
                  {quantity}
                </span>
                <button
                  onClick={handleIncrement}
                  disabled={quantity >= book.stock || isOutOfStock}
                  className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 disabled:opacity-40 rounded-lg hover:bg-white dark:hover:bg-slate-700 transition"
                  aria-label="Increase"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <span className="text-xs text-slate-400">
                {book.stock} available in warehouse
              </span>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`w-full sm:w-1/2 flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl font-bold text-xs sm:text-sm shadow-md transition-all ${
                  isOutOfStock
                    ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                    : added
                    ? 'bg-emerald-600 text-white'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white active:scale-98'
                }`}
              >
                {added ? (
                  <>
                    <Check className="w-5 h-5" />
                    <span>Added to Cart!</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5" />
                    <span>Add to Cart</span>
                  </>
                )}
              </button>

              <button
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                className="w-full sm:w-1/2 flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl font-bold text-xs sm:text-sm bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white disabled:opacity-40 shadow-md transition active:scale-98"
              >
                Buy Now (Fast Checkout)
              </button>
            </div>
          </div>

          {/* Guarantee Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 border-t border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-xs">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>Free Delivery &gt; ₹499</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Safe Demo Payments</span>
            </div>
            <div className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-amber-600 shrink-0" />
              <span>7-Day Easy Return</span>
            </div>
          </div>
        </div>
      </div>

      {/* REVIEWS & RATINGS SECTION */}
      <section className="bg-white dark:bg-slate-900 p-6 sm:p-10 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-6">
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-indigo-600" />
              Customer Reviews ({reviews.length})
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Read real thoughts from readers or share your experience
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white">{averageRating}</span>
            <div className="flex flex-col">
              <div className="flex text-amber-400">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="text-[10px] text-slate-400">Average Reader Score</span>
            </div>
          </div>
        </div>

        {/* Add Review Form */}
        <form onSubmit={handleReviewSubmit} className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl space-y-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">
              Write a Review
            </span>

            {/* Star selector */}
            <div className="flex items-center gap-1">
              <span className="text-xs text-slate-500 mr-1">Your Rating:</span>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRatingInput(star)}
                  className="p-1 hover:scale-110 transition"
                >
                  <Star
                    className={`w-5 h-5 ${
                      star <= ratingInput ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <textarea
            rows="3"
            required
            placeholder="Share your thoughts on the story, lessons, writing style, or print quality..."
            value={reviewTextInput}
            onChange={(e) => setReviewTextInput(e.target.value)}
            className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          />

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submittingReview}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit Review</span>
            </button>
          </div>
        </form>

        {/* Reviews List */}
        <div className="space-y-4">
          {reviews.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-4">
              No reviews yet for this title. Be the first to share your review!
            </p>
          ) : (
            reviews.map((rev) => (
              <div
                key={rev.id}
                className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-bold flex items-center justify-center text-xs">
                      {rev.user_name ? rev.user_name.charAt(0).toUpperCase() : 'R'}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-white">
                        {rev.user_name || 'Verified Reader'}
                      </p>
                      <span className="text-[10px] text-slate-400">
                        {new Date(rev.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex text-amber-400">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${
                          s <= Number(rev.rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed pl-9">
                  {rev.review_text}
                </p>
              </div>
            ))
          )}
        </div>
      </section>

      {/* RECOMMENDED & RELATED BOOKS */}
      {relatedBooks.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Recommended For You
              </span>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                More in {book.category}
              </h2>
            </div>
            <Link
              to={`/books?category=${encodeURIComponent(book.category)}`}
              className="text-xs font-bold text-indigo-600 hover:underline"
            >
              View More ({book.category})
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {relatedBooks.map((relBook) => (
              <BookCard key={relBook.id} book={relBook} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
