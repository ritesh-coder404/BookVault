import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  RotateCcw, 
  BookX, 
  Star, 
  ChevronLeft, 
  ChevronRight,
  SlidersHorizontal
} from 'lucide-react';
import { supabase, isSupabaseConfigured, localStore } from '../lib/supabase';
import BookCard from '../components/BookCard';
import Loading from '../components/Loading';

const ITEMS_PER_PAGE = 12;

export default function Books() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  // States
  const initialSearch = searchParams.get('search') || '';
  const initialCategory = searchParams.get('category') || 'All';
  const initialSort = searchParams.get('sort') || 'newest';

  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [sortBy, setSortBy] = useState(initialSort);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [minRating, setMinRating] = useState('all');
  const [priceBracket, setPriceBracket] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Sync state if URL query params change
  useEffect(() => {
    setSearchTerm(searchParams.get('search') || '');
    setSelectedCategory(searchParams.get('category') || 'All');
    if (searchParams.get('sort')) setSortBy(searchParams.get('sort'));
  }, [searchParams]);

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
        console.error('Error fetching books:', err);
        setBooks(localStore.getBooks());
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  const categories = useMemo(() => {
    const set = new Set(books.map((b) => b.category).filter(Boolean));
    return ['All', ...Array.from(set)];
  }, [books]);

  const handleCategorySelect = (cat) => {
    setSelectedCategory(cat);
    setCurrentPage(1);
    const newParams = new URLSearchParams(searchParams);
    if (cat === 'All') {
      newParams.delete('category');
    } else {
      newParams.set('category', cat);
    }
    setSearchParams(newParams);
  };

  const handleSearchChange = (val) => {
    setSearchTerm(val);
    setCurrentPage(1);
    const newParams = new URLSearchParams(searchParams);
    if (!val) {
      newParams.delete('search');
    } else {
      newParams.set('search', val);
    }
    setSearchParams(newParams);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All');
    setSortBy('newest');
    setInStockOnly(false);
    setMinRating('all');
    setPriceBracket('all');
    setCurrentPage(1);
    setSearchParams({});
  };

  // Filter & sort logic
  const filteredBooks = useMemo(() => {
    return books
      .filter((book) => {
        // Category
        const matchCategory =
          selectedCategory === 'All' ||
          book.category?.toLowerCase() === selectedCategory.toLowerCase();

        // Search
        const term = searchTerm.toLowerCase().trim();
        const matchSearch =
          !term ||
          book.title?.toLowerCase().includes(term) ||
          book.author?.toLowerCase().includes(term) ||
          book.category?.toLowerCase().includes(term);

        // Stock
        const matchStock = inStockOnly ? book.stock > 0 : true;

        // Rating
        const rating = book.rating || 4.7;
        const matchRating =
          minRating === 'all' ||
          (minRating === '4.5' && rating >= 4.5) ||
          (minRating === '4.0' && rating >= 4.0);

        // Price Brackets
        const price = Number(book.price);
        let matchPrice = true;
        if (priceBracket === 'under300') matchPrice = price < 300;
        else if (priceBracket === '300to600') matchPrice = price >= 300 && price <= 600;
        else if (priceBracket === '600to900') matchPrice = price > 600 && price <= 900;
        else if (priceBracket === 'above900') matchPrice = price > 900;

        return matchCategory && matchSearch && matchStock && matchRating && matchPrice;
      })
      .sort((a, b) => {
        if (sortBy === 'price-low') return Number(a.price) - Number(b.price);
        if (sortBy === 'price-high') return Number(b.price) - Number(a.price);
        if (sortBy === 'rating') return (b.rating || 4.7) - (a.rating || 4.7);
        if (sortBy === 'stock') return b.stock - a.stock;
        return new Date(b.created_at) - new Date(a.created_at);
      });
  }, [books, selectedCategory, searchTerm, inStockOnly, minRating, priceBracket, sortBy]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredBooks.length / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedBooks = filteredBooks.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 dark:bg-slate-950 transition-colors">
      
      {/* Page Title & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            BookStore Catalog ({books.length} Titles)
          </span>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
            Browse All Books
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-0.5">
            Showing {filteredBooks.length} results matching your selected filters
          </p>
        </div>

        <div className="w-full md:w-80 relative">
          <input
            type="text"
            placeholder="Search by title, author, topic..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500 shadow-xs text-slate-800 dark:text-white placeholder-slate-400"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => handleCategorySelect(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-150 ${
              selectedCategory.toLowerCase() === cat.toLowerCase()
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Secondary Filter & Sort Toolbar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-4 text-xs">
        
        <div className="flex flex-wrap items-center gap-4">
          {/* Price Bracket */}
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-slate-500">Price:</span>
            <select
              value={priceBracket}
              onChange={(e) => { setPriceBracket(e.target.value); setCurrentPage(1); }}
              className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 focus:outline-hidden"
            >
              <option value="all">All Prices</option>
              <option value="under300">Under ₹300</option>
              <option value="300to600">₹300 - ₹600</option>
              <option value="600to900">₹600 - ₹900</option>
              <option value="above900">Above ₹900</option>
            </select>
          </div>

          {/* Rating filter */}
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-slate-500">Rating:</span>
            <select
              value={minRating}
              onChange={(e) => { setMinRating(e.target.value); setCurrentPage(1); }}
              className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 focus:outline-hidden"
            >
              <option value="all">All Ratings</option>
              <option value="4.5">4.5★ and above</option>
              <option value="4.0">4.0★ and above</option>
            </select>
          </div>

          {/* In Stock toggle */}
          <label className="flex items-center gap-2 cursor-pointer select-none text-slate-700 dark:text-slate-300 font-medium">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => { setInStockOnly(e.target.checked); setCurrentPage(1); }}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
            />
            <span>In Stock Only</span>
          </label>
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-500">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 font-semibold focus:outline-hidden"
          >
            <option value="newest">Newest Releases</option>
            <option value="rating">Top Rated</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="stock">Availability</option>
          </select>
        </div>
      </div>

      {/* Main Books Grid or Empty State */}
      {loading ? (
        <Loading text="Loading 100+ book inventory..." />
      ) : paginatedBooks.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {paginatedBooks.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-200 dark:border-slate-800 text-xs">
              <span className="text-slate-500">
                Showing {startIndex + 1}–{Math.min(startIndex + ITEMS_PER_PAGE, filteredBooks.length)} of {filteredBooks.length} books
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  aria-label="Previous Page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => { setCurrentPage(pageNum); window.scrollTo({ top: 120, behavior: 'smooth' }); }}
                    className={`w-8 h-8 rounded-xl font-bold transition ${
                      currentPage === pageNum
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  aria-label="Next Page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-12 text-center max-w-lg mx-auto shadow-xs space-y-4 my-8">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400 mx-auto">
            <BookX className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">No matching books</h3>
          <p className="text-xs sm:text-sm text-slate-500">
            We couldn't find any books matching your criteria. Try changing categories or clearing price/rating filters.
          </p>
          <button
            onClick={handleResetFilters}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition"
          >
            <RotateCcw className="w-4 h-4" />
            Reset All Filters
          </button>
        </div>
      )}
    </div>
  );
}
