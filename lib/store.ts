import { create } from "zustand";
import { supabase, Profile, CartItem, Product } from "./supabase";

// ============================================
// AUTH STORE
// ============================================
type AuthState = {
  user: Profile | null;
  loading: boolean;
  setUser: (user: Profile | null) => void;
  fetchUser: () => Promise<void>;
  signOut: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  setUser: (user) => set({ user, loading: false }),
  fetchUser: async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        set({ user: profile, loading: false });
      } else {
        set({ user: null, loading: false });
      }
    } catch {
      set({ user: null, loading: false });
    }
  },
  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null });
  },
}));

// ============================================
// CART STORE
// ============================================
type CartState = {
  items: (CartItem & { product: Product })[];
  loading: boolean;
  fetchCart: () => Promise<void>;
  addToCart: (
    productId: string,
    quantity: number,
    size?: string,
    color?: string
  ) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  getTotal: () => number;
  getItemCount: () => number;
};

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  loading: false,
  fetchCart: async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    set({ loading: true });
    const { data } = await supabase
      .from("cart_items")
      .select("*, product:products(*)")
      .eq("customer_id", user.id);
    set({ items: (data as any) || [], loading: false });
  },
  addToCart: async (productId, quantity, size = "M", color) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const existing = get().items.find(
      (i) =>
        i.product_id === productId && i.size === size && i.color === color
    );

    if (existing) {
      await supabase
        .from("cart_items")
        .update({ quantity: existing.quantity + quantity })
        .eq("id", existing.id);
    } else {
      await supabase.from("cart_items").insert({
        customer_id: user.id,
        product_id: productId,
        quantity,
        size,
        color,
      });
    }
    await get().fetchCart();
  },
  updateQuantity: async (itemId, quantity) => {
    if (quantity <= 0) {
      await get().removeItem(itemId);
      return;
    }
    await supabase
      .from("cart_items")
      .update({ quantity })
      .eq("id", itemId);
    await get().fetchCart();
  },
  removeItem: async (itemId) => {
    await supabase.from("cart_items").delete().eq("id", itemId);
    await get().fetchCart();
  },
  clearCart: async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("cart_items").delete().eq("customer_id", user.id);
    set({ items: [] });
  },
  getTotal: () =>
    get().items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    ),
  getItemCount: () =>
    get().items.reduce((sum, item) => sum + item.quantity, 0),
}));
