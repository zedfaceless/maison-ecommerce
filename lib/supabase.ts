import { createClient } from "@supabase/supabase-js";

// These MUST come from the environment. The previous fallback to
// "https://placeholder.supabase.co" meant a misconfigured deploy still
// built and rendered — the storefront just came up permanently empty,
// with the only symptom a DNS error in the browser console. Failing at
// module load turns that silent runtime failure into a loud build-time
// one, which is where it belongs.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  const missing = [
    !supabaseUrl && "NEXT_PUBLIC_SUPABASE_URL",
    !supabaseAnonKey && "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  ]
    .filter(Boolean)
    .join(", ");

  throw new Error(
    `Supabase is not configured: missing ${missing}. ` +
      `Copy .env.example to .env.local and fill it in for local development, ` +
      `or set the variables in the Vercel project settings for a deploy. ` +
      `See README.md > Quick Start.`
  );
}

// NEXT_PUBLIC_* values are embedded in the client bundle by design.
// Only ever put the anon key here — never the service_role key, which
// bypasses row-level security.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  email: string;
  full_name: string;
  role: "customer" | "seller";
  avatar_url?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  created_at: string;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string;
};

export type Product = {
  id: string;
  seller_id?: string;
  category_id?: string;
  category?: Category;
  name: string;
  description?: string;
  price: number;
  compare_at_price?: number;
  image_url?: string;
  images?: string[];
  sizes?: string[];
  colors?: string[];
  stock: number;
  is_active: boolean;
  is_featured: boolean;
  created_at: string;
  avg_rating?: number;
  review_count?: number;
};

export type Review = {
  id: string;
  product_id: string;
  customer_id: string;
  rating: number;
  comment?: string;
  created_at: string;
  profiles?: { full_name: string; avatar_url?: string };
};

export type CartItem = {
  id: string;
  customer_id: string;
  product_id: string;
  quantity: number;
  size?: string;
  color?: string;
  product?: Product;
};

export type Order = {
  id: string;
  customer_id: string;
  status: "pending" | "approved" | "shipped" | "delivered" | "cancelled";
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  shipping_type: "regular" | "expedited";
  shipping_cost: number;
  discount_amount: number;
  promotion_id?: string;
  total: number;
  carrier_id?: string;
  tracking_number?: string;
  shipping_address?: string;
  shipping_city?: string;
  shipping_state?: string;
  shipping_zip?: string;
  estimated_delivery?: string;
  notes?: string;
  created_at: string;
  order_items?: OrderItem[];
  carrier?: Carrier;
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string;
  seller_id?: string;
  quantity: number;
  size?: string;
  color?: string;
  unit_price: number;
  total_price: number;
  product?: Product;
};

export type Promotion = {
  id: string;
  code: string;
  description?: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  min_order_amount: number;
  is_active: boolean;
};

export type Carrier = {
  id: string;
  name: string;
  tracking_url_template?: string;
  is_active: boolean;
};
