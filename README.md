# 📚 BookStore E-Commerce Web Application (BookVault V2)

A full-stack, premium 3D BookStore e-commerce web application built with **React**, **Vite**, **Tailwind CSS**, and **Supabase** (PostgreSQL, Auth, Storage, and Row Level Security).

---

## ✨ Features (Master V2)

### 🛒 3D Customer Experience
- **100+ Books Catalog**: Powered by Supabase PostgreSQL and seeded with 100+ titles across Software Engineering, AI/ML, Business, Self-Help, and Fiction.
- **3D Bookstore UI**: Pure CSS 3D perspective transforms (`rotateY`, `rotateX`, subtle spine gradients, realistic depth, and floating hero showcase).
- **Light & Dark Mode**: Persistent theme switcher in Navbar.
- **Customer Authentication**: Sign up, log in, session persistence, and secure profile management via Supabase Auth.
- **Book Discovery**: Search by title/author, multi-category filters, price range selector, star rating filters, and pagination.
- **Book Details**: High-resolution 3D cover, stock availability status, quantity limiter, "Add to Cart", and "Buy Now".
- **Customer Reviews & 1–5 Star Ratings**: Real user feedback system with star ratings and review submission.
- **Related & Recommended Books**: Contextual recommendations based on category and topic.
- **Wishlist System**: Save favorite titles to personal wishlist with direct "Move to Cart" action.
- **Recently Viewed**: Track recently viewed books across browsing sessions.
- **Discount Coupons**: Apply promo codes (`BOOK10`, `SAVE20`, `WELCOME50`) for instant checkout savings.
- **Cart Management**: Add/remove/adjust quantities (enforcing strict warehouse stock limits) and live total calculations.
- **Dual Payment Checkout**:
  - **Cash on Delivery (COD)**: Places order in pending payment state.
  - **Demo Online Payment**: Realistic simulated gateway modal (`Payment Processing...` ➔ `Payment Successful ✓` ➔ Order Created).
- **Order Success Page**: Detailed confirmation receipt with Order ID and tracking summary.
- **My Orders**: Complete order tracking with status updates: `Pending` ➔ `Confirmed` ➔ `Shipped` ➔ `Delivered` / `Cancelled`.
- **FAQ & Support**: Interactive accordion and contact message form.

### 🛡️ Admin Management Suite
- **Admin Dashboard**: Real-time KPI metrics (Gross Revenue, Total Orders, 100+ Catalog Inventory, Registered Customers), fulfillment pipeline charts, and low-stock alerts.
- **Inventory Management**:
  - Add new books with direct cover image upload to Supabase Storage bucket (`book-images`) or image URLs.
  - Quick stock increment/decrement directly from the table.
  - Edit pricing, description, stock, and delete with confirmation.
- **Order Management**: View all customer orders and update live fulfillment statuses.
- **Review Moderation**: Inspect customer ratings and delete inappropriate reviews.
- **Coupon Manager**: Create new discount codes (Percentage / Fixed), set min order amounts, and toggle active status.
- **Customer Directory**: View registered customer profiles and joined dates.

---

## 🚀 Database Setup & 100 Books Seed

### Step 1: Run the Schema
In your [Supabase Dashboard](https://supabase.com/dashboard) ➔ **SQL Editor**, run:
```sql
-- Execute supabase_setup.sql from the project root
```
This creates:
- `profiles`
- `books`
- `orders`
- `order_items`
- `wishlists`
- `reviews`
- `coupons`
- Complete Row Level Security (RLS) policies and triggers

### Step 2: Seed the 100 Books
In Supabase **SQL Editor**, open and run:
```sql
-- Execute BOOKSTORE_100_BOOKS_SEED.sql
```
Verify the insertion:
```sql
SELECT count(*) AS total_books FROM public.books;
-- Expected output: 100+
```

---

## 💻 Running the Application

```bash
cd client
npm install
npm run dev
```
Open **`http://localhost:5173`** in your browser.

### Test Credentials (1-Click Autofill on Login)
| Role | Email | Password | Access Scope |
| :--- | :--- | :--- | :--- |
| **Customer** | `customer@bookstore.com` | `customer123` | Store, Cart, Checkout, Wishlist, My Orders |
| **Admin** | `admin@bookstore.com` | `admin123` | Store + `/admin` Console |

---

## 🔒 Security Best Practices
- **No MongoDB Used**: Pure PostgreSQL with standard foreign keys.
- **Row Level Security (RLS)** is enabled on all tables.
- Public/customers can only read catalog books, their own orders, profile, and wishlist.
- Only administrators can manage books, update order statuses, or manage coupons.
- **Safe Environment**: Only `VITE_SUPABASE_ANON_KEY` is exposed in the frontend. Never use the service-role key in client code.
- **Demo Mode**: Real money is never charged.
