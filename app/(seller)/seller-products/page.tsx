"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase, Product } from "@/lib/supabase";
import { useAuthStore } from "@/lib/store";

export default function SellerProductsPage() {
  const { user } = useAuthStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      if (!user) return;
      const { data } = await supabase
        .from("products")
        .select("*, category:categories(name)")
        .eq("seller_id", user.id)
        .order("created_at", { ascending: false });
      setProducts(data || []);
      setLoading(false);
    }
    fetchProducts();
  }, [user]);

  const toggleActive = async (productId: string, isActive: boolean) => {
    await supabase
      .from("products")
      .update({ is_active: !isActive })
      .eq("id", productId);
    setProducts(
      products.map((p) =>
        p.id === productId ? { ...p, is_active: !isActive } : p
      )
    );
  };

  const deleteProduct = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    await supabase.from("products").delete().eq("id", productId);
    setProducts(products.filter((p) => p.id !== productId));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-midnight-950">
            Products
          </h1>
          <p className="text-gray-500 mt-1">
            Manage your product listings
          </p>
        </div>
        <Link href="/seller-products/new" className="btn-primary">
          + Add Product
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <p className="text-gray-400 text-lg mb-4">
            You haven&apos;t added any products yet
          </p>
          <Link href="/seller-products/new" className="btn-primary">
            Add Your First Product
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-50 bg-gray-50/50">
                <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-right py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-300 font-display">
                        {product.name.charAt(0)}
                      </div>
                      <span className="font-medium text-midnight-950 text-sm">{product.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500">{product.category?.name || "—"}</td>
                  <td className="py-4 px-4 text-sm font-medium text-midnight-950">${product.price.toFixed(2)}</td>
                  <td className="py-4 px-4">
                    <span className={`text-sm font-medium ${product.stock <= 5 ? "text-red-600" : product.stock <= 20 ? "text-amber-600" : "text-green-600"}`}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <button
                      onClick={() => toggleActive(product.id, product.is_active)}
                      className={`px-3 py-1 rounded-full text-xs font-bold ${product.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-500"}`}
                    >
                      {product.is_active ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/seller-products/${product.id}`} className="p-2 text-gray-400 hover:text-midnight-950 transition-colors" title="Edit">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </Link>
                      <button onClick={() => deleteProduct(product.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors" title="Delete">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
