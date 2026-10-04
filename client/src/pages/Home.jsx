import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  Search, 
  Truck, 
  ShieldCheck, 
  Clock, 
  Sparkles, 
  Flame, 
  Compass, 
  BookOpen,
  Tag,
  Copy,
  Check,
  Star,
  Layers,
  History
} from 'lucide-react';
import { supabase, isSupabaseConfigured, localStore } from '../lib/supabase';
import BookCard from '../components/BookCard';
import Loading from '../components/Loading';

export default function Home() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedCoupon, setCopiedCoupon] = useState('');
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
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
        console.error('Error fetching books for Home:', err);
        setBooks(localStore.getBooks());
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
    setRecentlyViewed(localStore.getRecentlyViewed());
  }, []);

  const handleHeroSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/books?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const copyCouponCode = (code) => {
    navigator.clipboard?.writeText(code);
    setCopiedCoupon(code);
    setTimeout(() => setCopiedCoupon(''), 2000);
  };

  const categories = [
    { name: 'Self Help', count: '10+ Books', color: 'from-emerald-500 to-teal-500' },
    { name: 'Business', count: '12+ Books', color: 'from-amber-500 to-orange-500' },
    { name: 'Programming', count: '25+ Books', color: 'from-blue-500 to-cyan-500' },
    { name: 'Web Development', count: '15+ Books', color: 'from-indigo-500 to-purple-500' },
    { name: 'Computer Science', count: '18+ Books', color: 'from-purple-500 to-pink-500' },
    { name: 'AI/ML', count: '14+ Books', color: 'from-rose-500 to-red-500' },
  ];

  const featuredBooks = books.slice(0, 4);
  const bestSellers = books.slice(4, 8);
  const newArrivals = books.slice(8, 12);

  // Floating Hero Book reference
  const heroBook = books[0] || {
    title: 'Atomic Habits',
    author: 'James Clear',
    price: 272,
    image_url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800'
  };

  return (
    <div className="flex flex-col gap-14 pb-16 dark:bg-slate-950 transition-colors">
      
      {/* 3D HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-indigo-950 via-slate-900 to-slate-950 text-white pt-16 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-indigo-500/10 blur-3xl pointer-events-none rounded-full" />
        
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          
          {/* Left Hero Text */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-indigo-200 text-xs font-semibold tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              100+ Books Catalog • 3D E-Commerce Platform
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight">
              Enter The Future of <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-indigo-400 via-violet-300 to-pink-400 bg-clip-text text-transparent">
                Digital Book Discovery
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Explore 100+ bestsellers across Engineering, Artificial Intelligence, Psychology, Fiction, and Finance. Enjoy realistic 3D book previews and fast checkout.
            </p>

            {/* Hero Search Box */}
            <form onSubmit={handleHeroSearch} className="max-w-md mx-auto lg:mx-0 flex items-center bg-white dark:bg-slate-900 rounded-2xl p-1.5 shadow-2xl shadow-indigo-950/60 border border-slate-700/50">
              <Search className="w-4 h-4 text-slate-400 ml-3" />
              <input
                type="text"
                placeholder="Search 100 books by title or author..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-3 py-2 text-xs sm:text-sm text-slate-900 dark:text-white bg-transparent focus:outline-hidden placeholder-slate-400"
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition shadow-md active:scale-95"
              >
                Explore
              </button>
            </form>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                to="/books"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-slate-950 font-bold text-xs sm:text-sm hover:bg-slate-100 transition shadow-lg active:scale-95"
              >
                <span>Browse Full Catalog</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/books?category=Programming"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-xs sm:text-sm transition"
              >
                Code & Tech Books (25+)
              </Link>
            </div>
          </div>

          {/* Right Floating 3D Showcase */}
          <div className="lg:col-span-5 flex justify-center perspective-1000">
            <div className="relative w-64 sm:w-72 aspect-[3/4] animate-float-3d group">
              {/* Back ambient 3D shadow */}
              <div className="absolute inset-0 bg-indigo-500/25 blur-2xl rounded-3xl -translate-z-12 transform scale-95" />
              
              {/* 3D Book Container */}
              <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20 book-spine-effect">
                <img
                  src={heroBook.image_url}
                  alt={heroBook.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent flex flex-col justify-end p-5">
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-wider w-max mb-1">
                    Featured Bestseller
                  </span>
                  <h3 className="font-bold text-white text-base leading-snug line-clamp-1">
                    {heroBook.title}
                  </h3>
                  <p className="text-xs text-slate-300">by {heroBook.author}</p>
                  <p className="text-sm font-black text-amber-400 mt-2">
                    ₹{heroBook.price} <span className="text-[10px] text-slate-400 font-normal">Free delivery</span>
                  </p>
                </div>
              </div>

              {/* Floating review sticker */}
              <div className="absolute -top-4 -right-4 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md text-slate-900 dark:text-white px-3 py-1.5 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 text-xs font-bold animate-float-gentle">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span>4.9 / 5.0 Rating</span>
              </div>
            </div>
          </div>
        </div>

        {/* Value Prop Badges */}
        <div className="max-w-6xl mx-auto mt-16 pt-8 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-6 text-slate-300 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-indigo-400">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-white">Free Delivery</p>
              <p className="text-slate-400">Orders above ₹499</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-white">100 Original Books</p>
              <p className="text-slate-400">Verified publishers</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-white">Fast Dispatch</p>
              <p className="text-slate-400">Ships within 24 hours</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-purple-400">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-white">Secure Checkout</p>
              <p className="text-slate-400">Safe payment processing</p>
            </div>
          </div>
        </div>
      </section>

      {/* ACTIVE COUPON CODES BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-violet-500/10 dark:from-amber-950/20 dark:via-indigo-950/20 dark:to-violet-950/20 border border-indigo-200 dark:border-indigo-900 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider flex items-center justify-center md:justify-start gap-1">
              <Tag className="w-3.5 h-3.5" />
              Special Reader Discounts
            </span>
            <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
              Unlock Instant Savings on Your Order
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Apply these coupon codes during checkout for instant discounts:
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            {[
              { code: 'BOOK10', desc: '10% OFF (Orders ₹300+)' },
              { code: 'SAVE20', desc: '20% OFF (Orders ₹500+)' },
              { code: 'WELCOME50', desc: 'Flat ₹50 OFF' },
            ].map((cpn) => (
              <button
                key={cpn.code}
                onClick={() => copyCouponCode(cpn.code)}
                className="group flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:border-indigo-500 text-xs font-mono font-bold text-slate-800 dark:text-slate-200 shadow-xs hover:shadow transition"
              >
                <span>{cpn.code}</span>
                <span className="text-[10px] font-sans text-slate-400 font-normal">({cpn.desc})</span>
                {copiedCoupon === cpn.code ? (
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600" />
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* MAIN CONTENT CONTAINERS */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 w-full">
        
        {/* Categories Showcase */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                <Compass className="w-4 h-4" />
                Curated Genres
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
                Explore Popular Categories
              </h2>
            </div>
            <Link
              to="/books"
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <span>View All Categories</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.name}
                to={`/books?category=${encodeURIComponent(cat.name)}`}
                className="group relative overflow-hidden p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all duration-200 text-center"
              >
                <div className={`w-12 h-12 mx-auto rounded-xl bg-gradient-to-tr ${cat.color} flex items-center justify-center text-white mb-3 shadow-md group-hover:scale-110 transition-transform`}>
                  <BookOpen className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-800 dark:text-slate-200 text-xs sm:text-sm group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {cat.name}
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">{cat.count}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* Featured Books Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Handpicked Reads
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
                Featured 3D Bestsellers
              </h2>
            </div>
            <Link
              to="/books"
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <span>Explore All (100+)</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <Loading text="Loading 3D catalog..." />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {featuredBooks.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          )}
        </section>

        {/* Best Sellers Section */}
        {bestSellers.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-rose-600 flex items-center gap-1.5">
                  <Flame className="w-4 h-4" />
                  Top Rated
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
                  Reader Favorites
                </h2>
              </div>
              <Link
                to="/books?sort=rating"
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                <span>View More</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {bestSellers.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          </section>
        )}

        {/* New Arrivals Section */}
        {newArrivals.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600 flex items-center gap-1.5">
                  <Layers className="w-4 h-4" />
                  Freshly Added
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
                  New Arrivals
                </h2>
              </div>
              <Link
                to="/books?sort=newest"
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                <span>Browse New</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {newArrivals.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          </section>
        )}

        {/* Recently Viewed Books Section */}
        {recentlyViewed.length > 0 && (
          <section className="space-y-6 pt-4 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Recently Viewed by You
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {recentlyViewed.slice(0, 6).map((item) => (
                <Link
                  key={item.id}
                  to={`/books/${item.id}`}
                  className="group bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-400 transition"
                >
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="w-full aspect-[3/4] object-cover rounded-lg mb-2"
                  />
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate group-hover:text-indigo-600">
                    {item.title}
                  </p>
                  <p className="text-[11px] text-slate-500">₹{item.price}</p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
