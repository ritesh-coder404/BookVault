import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Eye, BookOpen, Check, Heart, Star } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

export default function BookCard({ book }) {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [added, setAdded] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const isOutOfStock = book.stock <= 0;
  const isLowStock = book.stock > 0 && book.stock <= 5;
  const inWishlist = isInWishlist(book.id);

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (isOutOfStock) return;
    const ok = addToCart(book, 1);
    if (ok) {
      setAdded(true);
      setTimeout(() => setAdded(false), 1500);
    }
  };

  const handleToggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(book);
  };

  const defaultCover = "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800";
  const displayRating = book.rating || 4.7;

  return (
    <div className="perspective-1000 group flex flex-col h-full">
      <div className="book-card-3d relative flex flex-col h-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs hover:border-indigo-300 dark:hover:border-indigo-700 transition-all duration-300">
        
        {/* Book Cover Container with 3D Spine Effect */}
        <Link
          to={`/books/${book.id}`}
          className="relative block aspect-[3/4] w-full overflow-hidden bg-slate-100 dark:bg-slate-800 book-spine-effect"
        >
          {!imageLoaded && !imgError && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-100 dark:bg-slate-800 animate-pulse">
              <BookOpen className="w-8 h-8 text-slate-400" />
            </div>
          )}

          <img
            src={imgError || !book.image_url ? defaultCover : book.image_url}
            alt={book.title}
            onLoad={() => setImageLoaded(true)}
            onError={() => {
              setImgError(true);
              setImageLoaded(true);
            }}
            className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />

          {/* Category Pill */}
          {book.category && (
            <span className="absolute top-3 left-3 px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-slate-800 dark:text-slate-200 rounded-full shadow-xs">
              {book.category}
            </span>
          )}

          {/* Wishlist Heart Button */}
          <button
            onClick={handleToggleWishlist}
            className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all duration-200 shadow-sm ${
              inWishlist
                ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/80'
                : 'bg-white/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-300 hover:text-rose-500 hover:scale-110'
            }`}
            title={inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
            aria-label="Wishlist"
          >
            <Heart className={`w-4 h-4 ${inWishlist ? 'fill-rose-500 text-rose-500' : ''}`} />
          </button>

          {/* Stock Badge */}
          <div className="absolute bottom-3 left-3">
            {isOutOfStock ? (
              <span className="px-2 py-0.5 text-[10px] font-bold text-rose-700 bg-rose-100/95 dark:bg-rose-950 dark:text-rose-300 backdrop-blur-sm rounded-md shadow-xs">
                Out of Stock
              </span>
            ) : isLowStock ? (
              <span className="px-2 py-0.5 text-[10px] font-semibold text-amber-800 bg-amber-100/95 dark:bg-amber-950 dark:text-amber-300 backdrop-blur-sm rounded-md shadow-xs animate-pulse">
                Only {book.stock} left
              </span>
            ) : null}
          </div>
        </Link>

        {/* Book Content */}
        <div className="flex flex-col flex-1 p-4 sm:p-5">
          {/* Star rating & Reviews */}
          <div className="flex items-center gap-1.5 mb-1.5">
            <div className="flex items-center text-amber-400">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
            </div>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {displayRating}
            </span>
            <span className="text-[11px] text-slate-400">
              ({book.reviews_count || 12})
            </span>
          </div>

          <Link to={`/books/${book.id}`}>
            <h3
              className="text-sm sm:text-base font-bold text-slate-900 dark:text-white line-clamp-1 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              title={book.title}
            >
              {book.title}
            </h3>
          </Link>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-3 mt-0.5 line-clamp-1">
            by {book.author}
          </p>

          {/* Price & Actions */}
          <div className="mt-auto pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg font-black text-slate-900 dark:text-white">
                  ₹{Number(book.price).toLocaleString('en-IN')}
                </span>
                <span className="text-[11px] text-slate-400 line-through">
                  ₹{Math.round(Number(book.price) * 1.25)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <Link
                to={`/books/${book.id}`}
                className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800 rounded-xl transition"
                title="View Details"
              >
                <Eye className="w-4 h-4" />
              </Link>

              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold shadow-xs transition-all duration-200 ${
                  isOutOfStock
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                    : added
                    ? 'bg-emerald-600 text-white'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white active:scale-95'
                }`}
                title="Add to cart"
              >
                {added ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Added</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Add</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
