"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase, Category } from "@/lib/supabase";
import { useAuthStore } from "@/lib/store";

export default function AddProductPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    compare_at_price: "",
    category_id: "",
    stock: "",
    sizes: "S,M,L,XL",
    colors: "",
    is_featured: false,
  });

  useEffect(() => {
    async function fetchCategories() {
      const { data } = await supabase.from("categories").select("*");
      if (data) setCategories(data);
    }
    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setError("");
    setLoading(true);

    try {
      const { error: insertError } = await supabase.from("products").insert({
        seller_id: user.id,
        name: form.name,
        description: form.description,
        price: parseFloat(form.price),
        compare_at_price: form.compare_at_price
          ? parseFloat(form.compare_at_price)
          : null,
        category_id: form.category_id || null,
        stock: parseInt(form.stock) || 0,
        sizes: form.sizes
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        colors: form.colors
          .split(",")
          .map((c) => c.trim())
          .filter(Boolean),
        is_featured: form.is_featured,
        is_active: true,
      });

      if (insertError) throw insertError;
      router.push("/seller-products");
    } catch (err: any) {
      setError(err.message || "Failed to add product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-3xl font-bold text-midnight-950 mb-2">
        Add New Product
      </h1>
      <p className="text-gray-500 mb-8">
        Fill in the details below to list a new product
      </p>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="p-6 bg-white rounded-2xl border border-gray-100 space-y-5">
          <h2 className="font-display text-lg font-bold text-midnight-950">Basic Information</h2>
          <div>
            <label className="block text-sm font-medium text-midnight-800 mb-1.5">Product Name *</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Classic Cotton T-Shirt" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-midnight-800 mb-1.5">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe your product..." rows={4} />
          </div>
          <div>
            <label className="block text-sm font-medium text-midnight-800 mb-1.5">Category</label>
            <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}>
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="p-6 bg-white rounded-2xl border border-gray-100 space-y-5">
          <h2 className="font-display text-lg font-bold text-midnight-950">Pricing & Inventory</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-midnight-800 mb-1.5">Price ($) *</label>
              <input type="number" step="0.01" min="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="0.00" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-midnight-800 mb-1.5">Compare At Price ($)</label>
              <input type="number" step="0.01" min="0" value={form.compare_at_price} onChange={(e) => setForm({ ...form, compare_at_price: e.target.value })} placeholder="Original price (optional)" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-midnight-800 mb-1.5">Stock Quantity *</label>
            <input type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} placeholder="0" required />
          </div>
        </div>

        <div className="p-6 bg-white rounded-2xl border border-gray-100 space-y-5">
          <h2 className="font-display text-lg font-bold text-midnight-950">Variants</h2>
          <div>
            <label className="block text-sm font-medium text-midnight-800 mb-1.5">Sizes (comma-separated)</label>
            <input type="text" value={form.sizes} onChange={(e) => setForm({ ...form, sizes: e.target.value })} placeholder="S, M, L, XL" />
          </div>
          <div>
            <label className="block text-sm font-medium text-midnight-800 mb-1.5">Colors (comma-separated)</label>
            <input type="text" value={form.colors} onChange={(e) => setForm({ ...form, colors: e.target.value })} placeholder="Black, White, Navy" />
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} className="w-4 h-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500" />
            <span className="text-sm text-midnight-800">Mark as featured product</span>
          </label>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={loading} className="btn-primary py-3.5">
            {loading ? "Adding..." : "Add Product"}
          </button>
          <button type="button" onClick={() => router.back()} className="btn-secondary py-3.5">Cancel</button>
        </div>
      </form>
    </div>
  );
}
