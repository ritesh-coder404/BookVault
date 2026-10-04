import { createClient } from '@supabase/supabase-js';
import { 
  INITIAL_BOOKS, 
  INITIAL_ORDERS, 
  INITIAL_CUSTOMERS, 
  INITIAL_COUPONS, 
  INITIAL_REVIEWS, 
  INITIAL_WISHLISTS 
} from './mockData';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if valid credentials are provided
export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== 'https://your-project.supabase.co' &&
  supabaseAnonKey !== 'your-anon-public-key' &&
  !supabaseUrl.includes('your_supabase')
);

// Real Supabase client instance
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// ==========================================================
// MOCK / LOCAL FALLBACK ENGINE (V2)
// (Provides complete seamless functionality out-of-the-box
// when Supabase credentials have not yet been plugged in)
// ==========================================================

const STORAGE_KEYS = {
  BOOKS: 'bookstore_demo_books_v2',
  ORDERS: 'bookstore_demo_orders_v2',
  CUSTOMERS: 'bookstore_demo_customers_v2',
  WISHLISTS: 'bookstore_demo_wishlists_v2',
  REVIEWS: 'bookstore_demo_reviews_v2',
  COUPONS: 'bookstore_demo_coupons_v2',
  RECENTLY_VIEWED: 'bookstore_recently_viewed_v2',
};

// Initialize localStorage if empty
const initLocalStorage = () => {
  if (typeof window === 'undefined') return;
  if (!localStorage.getItem(STORAGE_KEYS.BOOKS)) {
    localStorage.setItem(STORAGE_KEYS.BOOKS, JSON.stringify(INITIAL_BOOKS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(INITIAL_ORDERS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.CUSTOMERS)) {
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(INITIAL_CUSTOMERS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.COUPONS)) {
    localStorage.setItem(STORAGE_KEYS.COUPONS, JSON.stringify(INITIAL_COUPONS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.REVIEWS)) {
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(INITIAL_REVIEWS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.WISHLISTS)) {
    localStorage.setItem(STORAGE_KEYS.WISHLISTS, JSON.stringify(INITIAL_WISHLISTS));
  }
};

initLocalStorage();

export const localStore = {
  // Books
  getBooks: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BOOKS);
      return data ? JSON.parse(data) : INITIAL_BOOKS;
    } catch {
      return INITIAL_BOOKS;
    }
  },
  saveBooks: (books) => {
    localStorage.setItem(STORAGE_KEYS.BOOKS, JSON.stringify(books));
  },
  getBookById: (id) => {
    const books = localStore.getBooks();
    return books.find((b) => b.id === id) || null;
  },
  addBook: (bookData) => {
    const books = localStore.getBooks();
    const newBook = {
      ...bookData,
      id: 'b-' + Math.random().toString(36).substr(2, 6),
      rating: 5.0,
      reviews_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    books.unshift(newBook);
    localStore.saveBooks(books);
    return newBook;
  },
  updateBook: (id, updates) => {
    const books = localStore.getBooks();
    const index = books.findIndex((b) => b.id === id);
    if (index === -1) throw new Error('Book not found');
    books[index] = { ...books[index], ...updates, updated_at: new Date().toISOString() };
    localStore.saveBooks(books);
    return books[index];
  },
  deleteBook: (id) => {
    const books = localStore.getBooks().filter((b) => b.id !== id);
    localStore.saveBooks(books);
  },

  // Orders
  getOrders: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ORDERS);
      return data ? JSON.parse(data) : INITIAL_ORDERS;
    } catch {
      return INITIAL_ORDERS;
    }
  },
  saveOrders: (orders) => {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  },
  getUserOrders: (userId) => {
    const orders = localStore.getOrders();
    return orders.filter((o) => o.user_id === userId);
  },
  createOrder: (orderData, items) => {
    const orders = localStore.getOrders();
    const books = localStore.getBooks();

    // Verify and decrement stock
    for (const item of items) {
      const bookIndex = books.findIndex((b) => b.id === item.book_id);
      if (bookIndex !== -1) {
        if (books[bookIndex].stock < item.quantity) {
          throw new Error(`Insufficient stock for "${books[bookIndex].title}". Only ${books[bookIndex].stock} available.`);
        }
        books[bookIndex].stock -= item.quantity;
      }
    }
    localStore.saveBooks(books);

    const newOrder = {
      ...orderData,
      id: 'ord-' + Math.floor(1000 + Math.random() * 9000) + '-' + Math.random().toString(36).substr(2, 4),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      items: items.map((it) => {
        const book = books.find((b) => b.id === it.book_id);
        return {
          id: 'item-' + Math.random().toString(36).substr(2, 6),
          book_id: it.book_id,
          quantity: it.quantity,
          price: it.price,
          book: book ? { title: book.title, author: book.author, image_url: book.image_url } : null,
        };
      }),
    };

    orders.unshift(newOrder);
    localStore.saveOrders(orders);
    return newOrder;
  },
  updateOrderStatus: (orderId, newStatus) => {
    const orders = localStore.getOrders();
    const index = orders.findIndex((o) => o.id === orderId);
    if (index === -1) throw new Error('Order not found');
    orders[index].order_status = newStatus;
    orders[index].updated_at = new Date().toISOString();
    localStore.saveOrders(orders);
    return orders[index];
  },

  // Customers
  getCustomers: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
      return data ? JSON.parse(data) : INITIAL_CUSTOMERS;
    } catch {
      return INITIAL_CUSTOMERS;
    }
  },

  // Wishlists
  getWishlist: (userId) => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.WISHLISTS);
      const list = data ? JSON.parse(data) : INITIAL_WISHLISTS;
      const userList = list.filter((w) => w.user_id === userId);
      const books = localStore.getBooks();
      return userList.map((w) => ({
        ...w,
        book: books.find((b) => b.id === w.book_id) || null,
      })).filter((w) => w.book !== null);
    } catch {
      return [];
    }
  },
  addToWishlist: (userId, bookId) => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.WISHLISTS);
      const list = data ? JSON.parse(data) : INITIAL_WISHLISTS;
      if (!list.some((w) => w.user_id === userId && w.book_id === bookId)) {
        list.push({
          id: 'wsh-' + Math.random().toString(36).substr(2, 6),
          user_id: userId,
          book_id: bookId,
          created_at: new Date().toISOString(),
        });
        localStorage.setItem(STORAGE_KEYS.WISHLISTS, JSON.stringify(list));
      }
    } catch (e) {
      console.error(e);
    }
  },
  removeFromWishlist: (userId, bookId) => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.WISHLISTS);
      const list = data ? JSON.parse(data) : INITIAL_WISHLISTS;
      const filtered = list.filter((w) => !(w.user_id === userId && w.book_id === bookId));
      localStorage.setItem(STORAGE_KEYS.WISHLISTS, JSON.stringify(filtered));
    } catch (e) {
      console.error(e);
    }
  },
  isInWishlist: (userId, bookId) => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.WISHLISTS);
      const list = data ? JSON.parse(data) : INITIAL_WISHLISTS;
      return list.some((w) => w.user_id === userId && w.book_id === bookId);
    } catch {
      return false;
    }
  },

  // Reviews
  getReviews: (bookId) => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.REVIEWS);
      const list = data ? JSON.parse(data) : INITIAL_REVIEWS;
      return list.filter((r) => r.book_id === bookId);
    } catch {
      return [];
    }
  },
  getAllReviews: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.REVIEWS);
      const reviews = data ? JSON.parse(data) : INITIAL_REVIEWS;
      const books = localStore.getBooks();
      return reviews.map((r) => ({
        ...r,
        book: books.find((b) => b.id === r.book_id) || null,
      }));
    } catch {
      return [];
    }
  },
  addReview: (reviewData) => {
    const data = localStorage.getItem(STORAGE_KEYS.REVIEWS);
    const list = data ? JSON.parse(data) : INITIAL_REVIEWS;
    const newRev = {
      ...reviewData,
      id: 'rev-' + Math.random().toString(36).substr(2, 6),
      created_at: new Date().toISOString(),
    };
    list.unshift(newRev);
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(list));
    return newRev;
  },
  deleteReview: (reviewId) => {
    const data = localStorage.getItem(STORAGE_KEYS.REVIEWS);
    const list = data ? JSON.parse(data) : INITIAL_REVIEWS;
    const filtered = list.filter((r) => r.id !== reviewId);
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(filtered));
  },

  // Coupons
  getCoupons: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.COUPONS);
      return data ? JSON.parse(data) : INITIAL_COUPONS;
    } catch {
      return INITIAL_COUPONS;
    }
  },
  saveCoupons: (coupons) => {
    localStorage.setItem(STORAGE_KEYS.COUPONS, JSON.stringify(coupons));
  },
  validateCoupon: (code, orderAmount) => {
    const coupons = localStore.getCoupons();
    const cpn = coupons.find((c) => c.code.toUpperCase() === code.trim().toUpperCase() && c.active);
    if (!cpn) {
      throw new Error('Invalid or inactive coupon code');
    }
    if (cpn.min_order_amount && orderAmount < cpn.min_order_amount) {
      throw new Error(`Minimum order amount of ₹${cpn.min_order_amount} required to use this coupon`);
    }

    let discount = 0;
    if (cpn.discount_type === 'PERCENTAGE') {
      discount = (orderAmount * cpn.discount_value) / 100;
      if (cpn.max_discount && discount > cpn.max_discount) {
        discount = cpn.max_discount;
      }
    } else {
      discount = cpn.discount_value;
    }

    return {
      code: cpn.code,
      discount: Math.min(discount, orderAmount),
      coupon: cpn,
    };
  },
  addCoupon: (cpnData) => {
    const coupons = localStore.getCoupons();
    const newCpn = {
      ...cpnData,
      id: 'cpn-' + Math.random().toString(36).substr(2, 6),
      code: cpnData.code.trim().toUpperCase(),
      active: true,
    };
    coupons.unshift(newCpn);
    localStore.saveCoupons(coupons);
    return newCpn;
  },
  toggleCoupon: (id) => {
    const coupons = localStore.getCoupons();
    const idx = coupons.findIndex((c) => c.id === id);
    if (idx !== -1) {
      coupons[idx].active = !coupons[idx].active;
      localStore.saveCoupons(coupons);
    }
  },
  deleteCoupon: (id) => {
    const coupons = localStore.getCoupons().filter((c) => c.id !== id);
    localStore.saveCoupons(coupons);
  },

  // Recently Viewed
  getRecentlyViewed: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.RECENTLY_VIEWED);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
  addRecentlyViewed: (book) => {
    try {
      if (!book) return;
      const existing = localStore.getRecentlyViewed();
      const filtered = existing.filter((b) => b.id !== book.id);
      filtered.unshift({
        id: book.id,
        title: book.title,
        author: book.author,
        category: book.category,
        price: book.price,
        image_url: book.image_url,
        stock: book.stock,
      });
      // Keep up to 12 items
      localStorage.setItem(STORAGE_KEYS.RECENTLY_VIEWED, JSON.stringify(filtered.slice(0, 12)));
    } catch (e) {
      console.error(e);
    }
  },
};
