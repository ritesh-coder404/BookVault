import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured, localStore } from '../lib/supabase';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('bookstore_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [appliedCoupon, setAppliedCoupon] = useState(() => {
    try {
      const saved = localStorage.getItem('bookstore_coupon');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  useEffect(() => {
    try {
      localStorage.setItem('bookstore_cart', JSON.stringify(cartItems));
    } catch (e) {
      console.error('Failed to save cart to localStorage', e);
    }
  }, [cartItems]);

  useEffect(() => {
    try {
      if (appliedCoupon) {
        localStorage.setItem('bookstore_coupon', JSON.stringify(appliedCoupon));
      } else {
        localStorage.removeItem('bookstore_coupon');
      }
    } catch (e) {
      console.error(e);
    }
  }, [appliedCoupon]);

  const addToCart = (book, quantity = 1) => {
    if (!book) return false;

    if (book.stock <= 0) {
      showNotification(`"${book.title}" is currently out of stock.`, 'error');
      return false;
    }

    let success = true;
    setCartItems((prevItems) => {
      const existingIndex = prevItems.findIndex((item) => item.book.id === book.id);

      if (existingIndex > -1) {
        const currentQty = prevItems[existingIndex].quantity;
        const newQty = currentQty + quantity;

        if (newQty > book.stock) {
          showNotification(
            `Only ${book.stock} copies available. You already have ${currentQty} in cart.`,
            'warning'
          );
          success = false;
          return prevItems;
        }

        const updated = [...prevItems];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQty,
          book,
        };
        showNotification(`Updated quantity of "${book.title}" in cart.`, 'success');
        return updated;
      } else {
        if (quantity > book.stock) {
          showNotification(`Only ${book.stock} copies available.`, 'warning');
          success = false;
          return prevItems;
        }

        showNotification(`Added "${book.title}" to cart!`, 'success');
        return [...prevItems, { book, quantity, price: Number(book.price) }];
      }
    });

    return success;
  };

  const updateQuantity = (bookId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(bookId);
      return;
    }

    setCartItems((prevItems) => {
      return prevItems.map((item) => {
        if (item.book.id === bookId) {
          if (newQuantity > item.book.stock) {
            showNotification(`Cannot exceed available stock of ${item.book.stock}`, 'warning');
            return { ...item, quantity: item.book.stock };
          }
          return { ...item, quantity: newQuantity };
        }
        return item;
      });
    });
  };

  const removeFromCart = (bookId) => {
    setCartItems((prevItems) => {
      const item = prevItems.find((it) => it.book.id === bookId);
      if (item) {
        showNotification(`Removed "${item.book.title}" from cart.`, 'info');
      }
      return prevItems.filter((it) => it.book.id !== bookId);
    });
  };

  const clearCart = () => {
    setCartItems([]);
    setAppliedCoupon(null);
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0
  );

  // Apply Coupon Logic
  const applyCoupon = async (code) => {
    if (!code || !code.trim()) {
      showNotification('Please enter a coupon code.', 'warning');
      return { success: false, message: 'Please enter a coupon code.' };
    }

    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase
          .from('coupons')
          .select('*')
          .ilike('code', code.trim())
          .eq('active', true)
          .single();

        if (error || !data) {
          throw new Error('Invalid or inactive coupon code');
        }

        if (data.min_order_amount && subtotal < data.min_order_amount) {
          throw new Error(`Minimum order amount of ₹${data.min_order_amount} required`);
        }

        let disc = 0;
        if (data.discount_type === 'PERCENTAGE') {
          disc = (subtotal * data.discount_value) / 100;
          if (data.max_discount && disc > data.max_discount) {
            disc = data.max_discount;
          }
        } else {
          disc = data.discount_value;
        }

        const couponInfo = {
          code: data.code,
          discount: Math.min(disc, subtotal),
          details: data,
        };
        setAppliedCoupon(couponInfo);
        showNotification(`Coupon "${data.code}" applied! You saved ₹${Math.round(disc)}`, 'success');
        return { success: true, coupon: couponInfo };
      } else {
        const res = localStore.validateCoupon(code, subtotal);
        setAppliedCoupon(res);
        showNotification(`Coupon "${res.code}" applied! You saved ₹${Math.round(res.discount)}`, 'success');
        return { success: true, coupon: res };
      }
    } catch (err) {
      showNotification(err.message || 'Failed to apply coupon', 'error');
      return { success: false, message: err.message };
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    showNotification('Coupon removed', 'info');
  };

  const discount = appliedCoupon ? Math.min(appliedCoupon.discount, subtotal) : 0;
  const deliveryFee = subtotal > 499 || subtotal === 0 ? 0 : 49;
  const total = Math.max(0, subtotal - discount + deliveryFee);
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const value = {
    cartItems,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    deliveryFee,
    discount,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    total,
    itemCount,
    notification,
    showNotification,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
      {notification && (
        <div className="fixed bottom-5 right-5 z-50 transition-all transform animate-bounce duration-300">
          <div
            className={`px-4 py-3 rounded-xl shadow-xl text-white font-medium flex items-center gap-2 ${
              notification.type === 'error'
                ? 'bg-rose-600'
                : notification.type === 'warning'
                ? 'bg-amber-500'
                : 'bg-emerald-600'
            }`}
          >
            <span>{notification.message}</span>
          </div>
        </div>
      )}
    </CartContext.Provider>
  );
};
