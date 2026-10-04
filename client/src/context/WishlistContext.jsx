import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { supabase, isSupabaseConfigured, localStore } from '../lib/supabase';

const WishlistContext = createContext();

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchWishlist = async () => {
    if (!user) {
      setWishlistItems([]);
      return;
    }
    setLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase
          .from('wishlists')
          .select(`
            id,
            book_id,
            created_at,
            books (*)
          `)
          .eq('user_id', user.id);

        if (error) throw error;
        const formatted = (data || []).map((w) => ({
          id: w.id,
          book_id: w.book_id,
          book: w.books,
        })).filter(w => w.book !== null);
        setWishlistItems(formatted);
      } else {
        const localItems = localStore.getWishlist(user.id);
        setWishlistItems(localItems);
      }
    } catch (err) {
      console.error('Error fetching wishlist:', err);
      const localItems = localStore.getWishlist(user?.id || 'usr-demo-customer-1');
      setWishlistItems(localItems);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, [user]);

  const addToWishlist = async (book) => {
    if (!book) return;
    const userId = user?.id || 'usr-demo-customer-1';

    try {
      if (isSupabaseConfigured && supabase && user) {
        const { error } = await supabase
          .from('wishlists')
          .insert([{ user_id: user.id, book_id: book.id }]);
        if (error && error.code !== '23505') throw error;
      } else {
        localStore.addToWishlist(userId, book.id);
      }

      setWishlistItems((prev) => {
        if (prev.some((item) => item.book_id === book.id)) return prev;
        return [...prev, { id: 'wsh-' + Date.now(), book_id: book.id, book }];
      });
    } catch (err) {
      console.error('Error adding to wishlist:', err);
    }
  };

  const removeFromWishlist = async (bookId) => {
    const userId = user?.id || 'usr-demo-customer-1';

    try {
      if (isSupabaseConfigured && supabase && user) {
        const { error } = await supabase
          .from('wishlists')
          .delete()
          .eq('user_id', user.id)
          .eq('book_id', bookId);
        if (error) throw error;
      } else {
        localStore.removeFromWishlist(userId, bookId);
      }

      setWishlistItems((prev) => prev.filter((item) => item.book_id !== bookId));
    } catch (err) {
      console.error('Error removing from wishlist:', err);
    }
  };

  const isInWishlist = (bookId) => {
    return wishlistItems.some((item) => item.book_id === bookId);
  };

  const toggleWishlist = (book) => {
    if (isInWishlist(book.id)) {
      removeFromWishlist(book.id);
    } else {
      addToWishlist(book);
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        wishlistCount: wishlistItems.length,
        loading,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        toggleWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};
