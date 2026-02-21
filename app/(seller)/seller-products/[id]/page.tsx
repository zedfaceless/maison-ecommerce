"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase, Category } from "@/lib/supabase";
import { useAuthStore } from "@/lib/store";

export default function EditProductPage() {
  const router = useRouter();
  const { id } = useParams();
  const { user } = useAuthStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    compare_at_price: "",
    category_id: "",
    stock: "",
    sizes: "",
    colors: "",
    is_featured: false,
    is_active: true,
  });

  useEffect(() => {
    async function fetchData() {
      const [{ data: cats }, { data: product }] = await Promise.all([
        supabase.from("categories").select("*"),
        supabase.from("products").select("*").eq("id", id).single(),
      ]);

      if (cats) setCategories(cats);
      if (product) {
        setForm({
          name: product.name,
          description: product.description || "",
          price: product.price.toString(),
          compare_at_price: product.compare_at_price?.toString() || "",
          category_id: product.category_id || "",
          stock: product.stock.toString(),
          sizes: product.sizes?.join(", ") || "",
          colors: product.colors?.join(", ") || "",
          is_featured: product.is_featured,
          is_active: product.is_active,
        });
      }
      setLoading(false);
    }
    fetchData();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setError("");
    setSaving(true);

    try {
      const { error: updateError } = await supabase
        .from("products")
        .update({
          name: form.name,
          description: form.description,
          price: parseFloat(form.price),
          compare_at_price: form.compare_at_price ? parseFloat(form.compare_at_price) : null,
          category_id: form.category_id || null,
          stock: parseInt(form.stock) || 0,
          sizes: form.sizes.split(",").map((s) => s.trim()).filter(Boolean),
          colors: form.colors.split(",").map((c) => c.trim()).filter(Boolean),
          is_featured: form.is_featured,
          is_active: form.is_active,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .eq("seller_id", user.id);

      if (updateError) throw updateError;
      router.push("/seller-products");
    } catch (err: any) {
      setError(err.message || "Failed to update product");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/3" />
        <div className="h-64 bg-gray-100 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-3xl font-bold text-midnight-950 mb-2">Edit Product</h1>
      <p className="text-gray-500 mb-8">Update your product details</p>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="p-6 bg-white rounded-2xl border border-gray-100 space-y-5">
          <h2 className="font-display text-lg font-bold text-midnight-950">Basic Information</h2>
          <div>
            <label className="block text-sm font-medium text-midnight-800 mb-1.5">Product Name *</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-midnight-800 mb-1.5">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} />
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
              <input type="number" step="0.01" min="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-midnight-800 mb-1.5">Compare At Price ($)</label>
              <input type="number" step="0.01" min="0" value={form.compare_at_price} onChange={(e) => setForm({ ...form, compare_at_price: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-midnight-800 mb-1.5">Stock *</label>
            <input type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} required />
          </div>
        </div>

        <div className="p-6 bg-white rounded-2xl border border-gray-100 space-y-5">
          <h2 className="font-display text-lg font-bold text-midnight-950">Variants & Status</h2>
          <div>
            <label className="block text-sm font-medium text-midnight-800 mb-1.5">Sizes (comma-separated)</label>
            <input type="text" value={form.sizes} onChange={(e) => setForm({ ...form, sizes: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-midnight-800 mb-1.5">Colors (comma-separated)</label>
            <input type="text" value={form.colors} onChange={(e) => setForm({ ...form, colors: e.target.value })} />
          </div>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} className="w-4 h-4 rounded" />
              <span className="text-sm text-midnight-800">Featured</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="w-4 h-4 rounded" />
              <span className="text-sm text-midnight-800">Active (visible to customers)</span>
            </label>
          </div>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="btn-primary py-3.5">
            {saving ? "Saving..." : "Save Changes"}
          </button>
          <button type="button" onClick={() => router.back()} className="btn-secondary py-3.5">Cancel</button>
        </div>
      </form>
    </div>
  );
}
