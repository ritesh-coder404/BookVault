import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2, ArrowRight, BookOpen } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';

export default function Wishlist() {
  const { wishlistItems, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  const handleMoveToCart = (book) => {
    addToCart(book, 1);
    removeFromWishlist(book.id);
  };

  if (wishlistItems.length === 0) {
    return (
      <div className="max-w-2xl mx-auto my-16 px-4 text-center">
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-12 shadow-xs space-y-5">
          <div className="w-20 h-20 bg-rose-50 dark:bg-rose-950/60 text-rose-500 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
            <Heart className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-white">Your Wishlist is Empty</h2>
          <p className="text-slate-500 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
            Save books you love to your personal wishlist by clicking the heart icon on any book cover.
          </p>
          <div className="pt-2">
            <Link
              to="/books"
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs sm:text-sm transition shadow-md active:scale-95"
            >
              <span>Explore 100+ Books</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 dark:bg-slate-950 transition-colors">
      <div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          My Saved Wishlist ({wishlistItems.length})
        </h1>
        <p className="text-slate-500 text-xs sm:text-sm mt-1">
          Saved titles you intend to purchase or read in the future
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {wishlistItems.map(({ book }) => {
          if (!book) return null;
          const isOutOfStock = book.stock <= 0;

          return (
            <div
              key={book.id}
              className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col"
            >
              <Link to={`/books/${book.id}`} className="relative block aspect-[3/4] bg-slate-100 dark:bg-slate-800 overflow-hidden book-spine-effect">
                <img
                  src={book.image_url || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800"}
                  alt={book.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    removeFromWishlist(book.id);
                  }}
                  className="absolute top-3 right-3 p-2 bg-white/90 dark:bg-slate-900/90 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-full transition shadow-xs"
                  title="Remove from Wishlist"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </Link>

              <div className="p-4 flex flex-col flex-1">
                {book.category && (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    {book.category}
                  </span>
                )}
                <Link to={`/books/${book.id}`}>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm hover:text-indigo-600 line-clamp-1 mt-0.5">
                    {book.title}
                  </h3>
                </Link>
                <p className="text-xs text-slate-500 mb-3">by {book.author}</p>

                <div className="mt-auto pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <span className="text-base font-black text-slate-900 dark:text-white">
                    ₹{Number(book.price).toLocaleString('en-IN')}
                  </span>

                  <button
                    onClick={() => handleMoveToCart(book)}
                    disabled={isOutOfStock}
                    className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 text-white disabled:text-slate-400 text-xs font-bold rounded-xl transition shadow-xs"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    <span>Move to Cart</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
