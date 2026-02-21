# MAISON — Curated Fashion Ecommerce Platform

A full-featured ecommerce platform built with **Next.js 14**, **TypeScript**, **Tailwind CSS**, and **Supabase**.

## Features

### Customer Side
- **Product Browsing** — Search, filter by category (Men/Women/Children), sort by price/name/date
- **Product Details** — View product info, sizes, colors, stock availability
- **Reviews & Ratings** — Rate products (1-5 stars) and leave comments
- **Shopping Cart** — Add/remove items, adjust quantities, persistent cart
- **Checkout** — Full checkout with:
  - Shipping address
  - Tax calculation (US standard ~8.25%)
  - Standard shipping (free, 5-7 days)
  - Expedited shipping (+$12, 1-2 days)
  - Promo codes (WELCOME10, SAVE20, SPRING25)
- **Order Tracking** — View order history and status

### Seller Side
- **Dashboard** — Revenue, orders, inventory, ratings metrics
- **Product Management** — Add, edit, delete products with categories/sizes/colors
- **Order Management** — Approve/reject orders, assign carriers (UPS/FedEx/USPS/DHL), add tracking numbers
- **Inventory Tracking** — Monitor stock levels, update quantities, low stock alerts

### General
- Beautiful landing page with animations
- Role-based authentication (Customer vs Seller)
- 30 pre-seeded sample clothing items (15 men, 15 women)
- 3 pre-configured promo codes
- 4 shipping carriers

---

## Quick Start

### 1. Set Up Database

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Open **SQL Editor** → Click **New Query**
3. Copy and paste the entire contents of `sql/schema.sql`
4. Click **Run** — this creates all tables, seeds 30 products, sets up RLS policies, and configures auth triggers

### 2. Configure Supabase Auth

In your Supabase dashboard:
1. Go to **Authentication** → **Providers**
2. Make sure **Email** provider is enabled
3. Go to **Authentication** → **URL Configuration**
4. Set **Site URL** to: `http://localhost:3000`

### 3. Install & Run

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 4. Test It Out

1. **Create a Seller account**: Sign up with role = Seller
2. **Create a Customer account**: Sign up with role = Customer (use a different email)
3. As Seller: Add products from the dashboard
4. As Customer: Browse products, add to cart, checkout
5. As Seller: Approve orders, assign carriers

---

## Environment Variables

Already configured in `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://oucdejjqsoqprcwablzd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
```

---

## Project Structure

```
ecommerce/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── layout.tsx                  # Root layout
│   ├── globals.css                 # Global styles
│   ├── auth/
│   │   ├── login/page.tsx          # Login page
│   │   └── signup/page.tsx         # Signup with role selection
│   ├── (customer)/                 # Customer route group
│   │   ├── layout.tsx              # Customer layout with nav
│   │   ├── products/page.tsx       # Product listing
│   │   ├── products/[id]/page.tsx  # Product detail + reviews
│   │   ├── cart/page.tsx           # Shopping cart
│   │   ├── checkout/page.tsx       # Checkout with tax/shipping/promo
│   │   └── orders/page.tsx         # Order history
│   └── (seller)/                   # Seller route group
│       ├── layout.tsx              # Seller layout with sidebar
│       ├── dashboard/page.tsx      # Analytics dashboard
│       ├── products/page.tsx       # Product management
│       ├── products/new/page.tsx   # Add new product
│       ├── products/[id]/page.tsx  # Edit product
│       ├── orders/page.tsx         # Order approval + carrier assignment
│       └── inventory/page.tsx      # Stock management
├── components/
│   └── layout/
│       ├── AuthProvider.tsx        # Auth guard component
│       ├── CustomerNav.tsx         # Customer top navigation
│       └── SellerSidebar.tsx       # Seller sidebar navigation
├── lib/
│   ├── supabase.ts                 # Supabase client + TypeScript types
│   └── store.ts                    # Zustand state management (auth + cart)
├── sql/
│   └── schema.sql                  # Complete database schema (RUN THIS FIRST!)
├── .env.local                      # Environment variables
├── tailwind.config.ts
├── tsconfig.json
├── next.config.js
└── package.json
```

---

## Tax, Shipping & Promotions

| Item | Details |
|------|---------|
| Tax Rate | 8.25% (US standard average) |
| Standard Shipping | Free, 5-7 business days |
| Expedited Shipping | $12.00, 1-2 business days |
| WELCOME10 | 10% off orders over $25 |
| SAVE20 | $20 off orders over $100 |
| SPRING25 | 25% off orders over $50 |

---

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth with role-based access
- **State**: Zustand (client-side state)
- **Fonts**: Playfair Display + DM Sans
