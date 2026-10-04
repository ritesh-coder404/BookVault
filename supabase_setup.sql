-- ==========================================================
-- BOOKSTORE E-COMMERCE V2 - SUPABASE SETUP SCHEMA & POLICIES
-- ==========================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. BOOKS TABLE
CREATE TABLE IF NOT EXISTS public.books (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    category TEXT NOT NULL,
    price NUMERIC NOT NULL CHECK (price >= 0),
    description TEXT,
    image_url TEXT,
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    total_amount NUMERIC NOT NULL CHECK (total_amount >= 0),
    discount_amount NUMERIC DEFAULT 0,
    coupon_code TEXT,
    shipping_name TEXT NOT NULL,
    mobile TEXT NOT NULL,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    pincode TEXT NOT NULL,
    payment_method TEXT NOT NULL CHECK (payment_method IN ('COD', 'DEMO_ONLINE')),
    payment_status TEXT NOT NULL DEFAULT 'PENDING' CHECK (payment_status IN ('PENDING', 'PAID', 'FAILED')),
    order_status TEXT NOT NULL DEFAULT 'Pending' CHECK (order_status IN ('Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. ORDER_ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    book_id UUID REFERENCES public.books(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price NUMERIC NOT NULL CHECK (price >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. WISHLISTS TABLE
CREATE TABLE IF NOT EXISTS public.wishlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, book_id)
);

-- 7. REVIEWS TABLE
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    user_name TEXT,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. COUPONS TABLE
CREATE TABLE IF NOT EXISTS public.coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('PERCENTAGE', 'FIXED')),
    discount_value NUMERIC NOT NULL CHECK (discount_value > 0),
    min_order_amount NUMERIC DEFAULT 0,
    max_discount NUMERIC,
    active BOOLEAN DEFAULT true,
    expires_at TIMESTAMP WITH TIME ZONE
);

-- 9. HELPER FUNCTIONS
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. AUTOMATIC PROFILE CREATION TRIGGER ON SIGNUP
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    COALESCE(new.raw_user_meta_data->>'role', 'customer')
  )
  ON CONFLICT (id) DO UPDATE
  SET name = EXCLUDED.name,
      email = EXCLUDED.email;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 11. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- 11.1 PROFILES POLICIES
DROP POLICY IF EXISTS "Users can view own profile or admin can view all" ON public.profiles;
CREATE POLICY "Users can view own profile or admin can view all"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- 11.2 BOOKS POLICIES
DROP POLICY IF EXISTS "Public can view books" ON public.books;
CREATE POLICY "Public can view books"
  ON public.books FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Only admin can insert books" ON public.books;
CREATE POLICY "Only admin can insert books"
  ON public.books FOR INSERT
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Only admin can update books" ON public.books;
CREATE POLICY "Only admin can update books"
  ON public.books FOR UPDATE
  USING (public.is_admin());

DROP POLICY IF EXISTS "Only admin can delete books" ON public.books;
CREATE POLICY "Only admin can delete books"
  ON public.books FOR DELETE
  USING (public.is_admin());

-- 11.3 ORDERS POLICIES
DROP POLICY IF EXISTS "Users can view own orders or admin view all" ON public.orders;
CREATE POLICY "Users can view own orders or admin view all"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users can insert own orders" ON public.orders;
CREATE POLICY "Users can insert own orders"
  ON public.orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Only admin can update orders" ON public.orders;
CREATE POLICY "Only admin can update orders"
  ON public.orders FOR UPDATE
  USING (public.is_admin());

-- 11.4 ORDER_ITEMS POLICIES
DROP POLICY IF EXISTS "Users can view own order items" ON public.order_items;
CREATE POLICY "Users can view own order items"
  ON public.order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND (orders.user_id = auth.uid() OR public.is_admin())
    )
  );

DROP POLICY IF EXISTS "Users can insert own order items" ON public.order_items;
CREATE POLICY "Users can insert own order items"
  ON public.order_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- 11.5 WISHLISTS POLICIES
DROP POLICY IF EXISTS "Users can view own wishlist" ON public.wishlists;
CREATE POLICY "Users can view own wishlist"
  ON public.wishlists FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert into own wishlist" ON public.wishlists;
CREATE POLICY "Users can insert into own wishlist"
  ON public.wishlists FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete from own wishlist" ON public.wishlists;
CREATE POLICY "Users can delete from own wishlist"
  ON public.wishlists FOR DELETE
  USING (auth.uid() = user_id);

-- 11.6 REVIEWS POLICIES
DROP POLICY IF EXISTS "Public can view reviews" ON public.reviews;
CREATE POLICY "Public can view reviews"
  ON public.reviews FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can insert own reviews" ON public.reviews;
CREATE POLICY "Users can insert own reviews"
  ON public.reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own reviews" ON public.reviews;
CREATE POLICY "Users can update own reviews"
  ON public.reviews FOR UPDATE
  USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users or admin can delete reviews" ON public.reviews;
CREATE POLICY "Users or admin can delete reviews"
  ON public.reviews FOR DELETE
  USING (auth.uid() = user_id OR public.is_admin());

-- 11.7 COUPONS POLICIES
DROP POLICY IF EXISTS "Public can read active coupons" ON public.coupons;
CREATE POLICY "Public can read active coupons"
  ON public.coupons FOR SELECT
  USING (active = true OR public.is_admin());

DROP POLICY IF EXISTS "Only admin can manage coupons" ON public.coupons;
CREATE POLICY "Only admin can manage coupons"
  ON public.coupons FOR ALL
  USING (public.is_admin());

-- 12. STORAGE BUCKET CONFIGURATION
INSERT INTO storage.buckets (id, name, public)
VALUES ('book-images', 'book-images', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Book images are publicly accessible" ON storage.objects;
CREATE POLICY "Book images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'book-images');

DROP POLICY IF EXISTS "Only admin can upload book images" ON storage.objects;
CREATE POLICY "Only admin can upload book images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'book-images' AND public.is_admin());

DROP POLICY IF EXISTS "Only admin can update book images" ON storage.objects;
CREATE POLICY "Only admin can update book images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'book-images' AND public.is_admin());

DROP POLICY IF EXISTS "Only admin can delete book images" ON storage.objects;
CREATE POLICY "Only admin can delete book images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'book-images' AND public.is_admin());

-- 13. SEED INITIAL COUPONS
INSERT INTO public.coupons (code, discount_type, discount_value, min_order_amount, max_discount, active)
VALUES
('BOOK10', 'PERCENTAGE', 10, 300, 150, true),
('SAVE20', 'PERCENTAGE', 20, 500, 300, true),
('WELCOME50', 'FIXED', 50, 250, NULL, true)
ON CONFLICT (code) DO NOTHING;

-- 14. 100 BOOKS SEEDING
-- To populate the database with 100 books, run BOOKSTORE_100_BOOKS_SEED.sql in Supabase SQL editor.
