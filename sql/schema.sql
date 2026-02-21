-- ============================================
-- MAISON ECOMMERCE - DATABASE SCHEMA
-- Run this ENTIRE file in Supabase SQL Editor
-- Go to: SQL Editor > New Query > Paste > Run
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. PROFILES (extends Supabase auth.users)
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('customer', 'seller')),
  avatar_url TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. CATEGORIES
-- ============================================
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO categories (name, slug, description) VALUES
  ('Men', 'men', 'Men''s clothing and apparel'),
  ('Women', 'women', 'Women''s clothing and apparel'),
  ('Children', 'children', 'Children''s clothing and apparel')
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- 3. PRODUCTS
-- ============================================
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL CHECK (price > 0),
  compare_at_price DECIMAL(10,2),
  image_url TEXT,
  images TEXT[] DEFAULT '{}',
  sizes TEXT[] DEFAULT '{S,M,L,XL}',
  colors TEXT[] DEFAULT '{}',
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  is_active BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 4. REVIEWS
-- ============================================
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, customer_id)
);

-- ============================================
-- 5. PROMOTIONS
-- ============================================
CREATE TABLE IF NOT EXISTS promotions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value DECIMAL(10,2) NOT NULL CHECK (discount_value > 0),
  min_order_amount DECIMAL(10,2) DEFAULT 0,
  max_uses INTEGER,
  current_uses INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  starts_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO promotions (code, description, discount_type, discount_value, min_order_amount, max_uses) VALUES
  ('WELCOME10', 'Welcome 10% off your first order', 'percentage', 10, 25, 1000),
  ('SAVE20', 'Save $20 on orders over $100', 'fixed', 20, 100, 500),
  ('SPRING25', 'Spring Sale - 25% off', 'percentage', 25, 50, 300)
ON CONFLICT (code) DO NOTHING;

-- ============================================
-- 6. CARRIERS
-- ============================================
CREATE TABLE IF NOT EXISTS carriers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  tracking_url_template TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO carriers (name, tracking_url_template) VALUES
  ('UPS', 'https://www.ups.com/track?tracknum={tracking_number}'),
  ('FedEx', 'https://www.fedex.com/fedextrack/?trknbr={tracking_number}'),
  ('USPS', 'https://tools.usps.com/go/TrackConfirmAction?tLabels={tracking_number}'),
  ('DHL', 'https://www.dhl.com/en/express/tracking.html?AWB={tracking_number}')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- 7. ORDERS
-- ============================================
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'shipped', 'delivered', 'cancelled')),
  subtotal DECIMAL(10,2) NOT NULL,
  tax_rate DECIMAL(5,4) DEFAULT 0.0825,
  tax_amount DECIMAL(10,2) NOT NULL,
  shipping_type TEXT NOT NULL DEFAULT 'regular' CHECK (shipping_type IN ('regular', 'expedited')),
  shipping_cost DECIMAL(10,2) NOT NULL DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  promotion_id UUID REFERENCES promotions(id),
  total DECIMAL(10,2) NOT NULL,
  carrier_id UUID REFERENCES carriers(id),
  tracking_number TEXT,
  shipping_address TEXT,
  shipping_city TEXT,
  shipping_state TEXT,
  shipping_zip TEXT,
  estimated_delivery TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 8. ORDER ITEMS
-- ============================================
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  seller_id UUID REFERENCES profiles(id),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  size TEXT,
  color TEXT,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 9. CART ITEMS
-- ============================================
CREATE TABLE IF NOT EXISTS cart_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  size TEXT DEFAULT 'M',
  color TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(customer_id, product_id, size, color)
);

-- ============================================
-- 10. SEED 30 SAMPLE PRODUCTS
-- ============================================
DO $$
DECLARE
  men_cat UUID;
  women_cat UUID;
BEGIN
  SELECT id INTO men_cat FROM categories WHERE slug = 'men';
  SELECT id INTO women_cat FROM categories WHERE slug = 'women';

  -- Only insert if products table is empty
  IF NOT EXISTS (SELECT 1 FROM products LIMIT 1) THEN

  -- MEN'S PRODUCTS (15 items)
  INSERT INTO products (category_id, name, description, price, compare_at_price, sizes, colors, stock, is_featured) VALUES
  (men_cat, 'Classic Oxford Shirt', 'Timeless button-down oxford shirt in premium cotton. Perfect for both casual and formal occasions.', 59.99, 79.99, '{S,M,L,XL,XXL}', '{White,Light Blue,Pink}', 120, true),
  (men_cat, 'Slim Fit Chinos', 'Modern slim-fit chino pants with stretch comfort. Versatile for the office or weekend.', 49.99, NULL, '{28,30,32,34,36}', '{Khaki,Navy,Olive}', 95, false),
  (men_cat, 'Wool Blend Blazer', 'Sophisticated wool-blend blazer with notch lapels. A wardrobe essential.', 189.99, 249.99, '{S,M,L,XL}', '{Charcoal,Navy}', 45, true),
  (men_cat, 'Crew Neck T-Shirt Pack', 'Premium cotton crew neck t-shirts. Soft and breathable. Pack of 3.', 34.99, NULL, '{S,M,L,XL,XXL}', '{White,Black,Gray}', 200, false),
  (men_cat, 'Denim Jacket', 'Classic denim jacket with modern fit. Washed indigo with brass buttons.', 89.99, 119.99, '{S,M,L,XL}', '{Indigo,Light Wash}', 60, true),
  (men_cat, 'Formal Dress Pants', 'Flat-front dress pants with tailored fit. Wrinkle-resistant fabric.', 69.99, NULL, '{30,32,34,36,38}', '{Black,Charcoal,Navy}', 80, false),
  (men_cat, 'Cashmere V-Neck Sweater', 'Luxuriously soft cashmere v-neck sweater. Lightweight warmth.', 129.99, 169.99, '{S,M,L,XL}', '{Burgundy,Camel,Gray}', 35, true),
  (men_cat, 'Polo Shirt', 'Classic piqué polo with embroidered logo. Smart-casual staple.', 44.99, NULL, '{S,M,L,XL,XXL}', '{Navy,White,Red,Green}', 150, false),
  (men_cat, 'Tailored Suit', 'Two-piece tailored suit in premium worsted wool. Jacket and trousers.', 349.99, 449.99, '{S,M,L,XL}', '{Black,Charcoal,Navy}', 25, true),
  (men_cat, 'Linen Summer Shirt', 'Relaxed-fit linen shirt perfect for warm weather. Breathable fabric.', 54.99, NULL, '{S,M,L,XL}', '{White,Sky Blue,Sage}', 70, false),
  (men_cat, 'Jogger Pants', 'Modern athletic joggers with tapered leg. Zippered pockets.', 39.99, NULL, '{S,M,L,XL}', '{Black,Gray,Navy}', 110, false),
  (men_cat, 'Leather Belt', 'Genuine leather belt with polished buckle. Finishing touch.', 29.99, 44.99, '{S,M,L,XL}', '{Brown,Black}', 200, false),
  (men_cat, 'Henley Long Sleeve', 'Soft cotton henley with relaxed fit. Three-button placket.', 39.99, NULL, '{S,M,L,XL}', '{Heather Gray,Olive,Burgundy}', 85, false),
  (men_cat, 'Quilted Vest', 'Lightweight quilted vest. Perfect layering piece.', 79.99, 99.99, '{S,M,L,XL}', '{Navy,Black,Forest Green}', 55, false),
  (men_cat, 'Trench Coat', 'Double-breasted trench coat in water-resistant cotton. Classic style.', 199.99, 269.99, '{S,M,L,XL}', '{Tan,Black}', 30, true),

  -- WOMEN'S PRODUCTS (15 items)
  (women_cat, 'Silk Wrap Dress', 'Elegant silk wrap dress with flattering silhouette. Perfect for special occasions.', 149.99, 199.99, '{XS,S,M,L,XL}', '{Emerald,Burgundy,Black}', 40, true),
  (women_cat, 'High-Waisted Jeans', 'Premium stretch denim with high-waisted fit. Flattering for every body type.', 69.99, NULL, '{24,26,28,30,32}', '{Dark Wash,Medium Wash,Black}', 130, false),
  (women_cat, 'Cashmere Cardigan', 'Ultra-soft cashmere cardigan with pearl buttons. Cozy elegance.', 139.99, 179.99, '{XS,S,M,L}', '{Blush,Ivory,Charcoal}', 50, true),
  (women_cat, 'Pleated Midi Skirt', 'Flowing pleated midi skirt in satin finish. Moves beautifully.', 64.99, NULL, '{XS,S,M,L}', '{Dusty Rose,Navy,Champagne}', 65, false),
  (women_cat, 'Tailored Blazer', 'Structured blazer with feminine cut. Power dressing at its finest.', 159.99, 219.99, '{XS,S,M,L,XL}', '{Black,White,Blush}', 45, true),
  (women_cat, 'Floral Maxi Dress', 'Romantic floral print maxi dress with ruffled hem. Bohemian chic.', 89.99, NULL, '{XS,S,M,L}', '{Garden Print,Sunset Print}', 75, false),
  (women_cat, 'Cropped Trousers', 'Tailored cropped trousers with side zip. Office to brunch.', 74.99, NULL, '{XS,S,M,L,XL}', '{Black,Tan,White}', 85, false),
  (women_cat, 'Satin Blouse', 'Luxurious satin blouse with bow-tie neckline. Touch of glamour.', 69.99, 89.99, '{XS,S,M,L}', '{Ivory,Champagne,Black}', 60, true),
  (women_cat, 'Knit Sweater Dress', 'Cozy ribbed knit sweater dress. Perfect with boots.', 84.99, NULL, '{XS,S,M,L}', '{Camel,Charcoal,Cream}', 55, false),
  (women_cat, 'Wide-Leg Palazzo Pants', 'Flowing wide-leg pants in premium crepe. Dramatic silhouette.', 79.99, 99.99, '{XS,S,M,L}', '{Black,Ivory,Terracotta}', 70, false),
  (women_cat, 'Leather Moto Jacket', 'Genuine leather motorcycle jacket. Edgy and timeless.', 249.99, 329.99, '{XS,S,M,L}', '{Black,Cognac}', 30, true),
  (women_cat, 'Cotton Sundress', 'Lightweight cotton sundress with smocked bodice. Summer essential.', 49.99, NULL, '{XS,S,M,L,XL}', '{Yellow,Lavender,White}', 100, false),
  (women_cat, 'Pencil Skirt', 'Classic pencil skirt in stretch fabric. Polished professional look.', 54.99, NULL, '{XS,S,M,L,XL}', '{Black,Navy,Burgundy}', 90, false),
  (women_cat, 'Oversized Wool Coat', 'Luxurious oversized wool coat with wide lapels. Statement outerwear.', 229.99, 299.99, '{XS,S,M,L}', '{Camel,Black,Gray}', 25, true),
  (women_cat, 'Ruffle Top', 'Feminine ruffle-trim top in lightweight chiffon. Playful movement.', 44.99, NULL, '{XS,S,M,L,XL}', '{Blush,White,Sky Blue}', 110, false);

  END IF;
END $$;

-- ============================================
-- 11. ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE carriers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DO $$ 
DECLARE r RECORD;
BEGIN
  FOR r IN (SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public') LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', r.policyname, r.tablename);
  END LOOP;
END $$;

-- Profiles
CREATE POLICY "Public profiles are viewable" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Products
CREATE POLICY "Active products viewable by everyone" ON products FOR SELECT USING (is_active = true OR auth.uid() = seller_id);
CREATE POLICY "Sellers can insert products" ON products FOR INSERT WITH CHECK (
  auth.uid() = seller_id AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'seller')
);
CREATE POLICY "Sellers can update own products" ON products FOR UPDATE USING (auth.uid() = seller_id);
CREATE POLICY "Sellers can delete own products" ON products FOR DELETE USING (auth.uid() = seller_id);

-- Categories
CREATE POLICY "Categories viewable by everyone" ON categories FOR SELECT USING (true);

-- Reviews
CREATE POLICY "Reviews viewable by everyone" ON reviews FOR SELECT USING (true);
CREATE POLICY "Customers can insert reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = customer_id);
CREATE POLICY "Customers can update own reviews" ON reviews FOR UPDATE USING (auth.uid() = customer_id);
CREATE POLICY "Customers can delete own reviews" ON reviews FOR DELETE USING (auth.uid() = customer_id);

-- Promotions
CREATE POLICY "Active promotions viewable" ON promotions FOR SELECT USING (is_active = true);

-- Carriers
CREATE POLICY "Carriers viewable by everyone" ON carriers FOR SELECT USING (true);

-- Orders
CREATE POLICY "Customers view own orders" ON orders FOR SELECT USING (auth.uid() = customer_id);
CREATE POLICY "Customers create orders" ON orders FOR INSERT WITH CHECK (auth.uid() = customer_id);
CREATE POLICY "Sellers view orders with their items" ON orders FOR SELECT USING (
  EXISTS (SELECT 1 FROM order_items WHERE order_items.order_id = orders.id AND order_items.seller_id = auth.uid())
);
CREATE POLICY "Sellers update orders with their items" ON orders FOR UPDATE USING (
  EXISTS (SELECT 1 FROM order_items WHERE order_items.order_id = orders.id AND order_items.seller_id = auth.uid())
);

-- Order Items
CREATE POLICY "Order items viewable by customer" ON order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.customer_id = auth.uid())
);
CREATE POLICY "Order items viewable by seller" ON order_items FOR SELECT USING (seller_id = auth.uid());
CREATE POLICY "Customers insert order items" ON order_items FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.customer_id = auth.uid())
);

-- Cart Items
CREATE POLICY "Users manage own cart" ON cart_items FOR ALL USING (auth.uid() = customer_id);

-- ============================================
-- 12. AUTH TRIGGER - Auto-create profile
-- ============================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- 13. HELPER FUNCTION - Increment promo usage
-- ============================================
CREATE OR REPLACE FUNCTION increment_promo_usage(promo_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE promotions SET current_uses = current_uses + 1 WHERE id = promo_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- DONE! Your database is ready.
-- ============================================
