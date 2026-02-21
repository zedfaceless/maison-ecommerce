"use client";

import { useState, useEffect } from "react";
import { supabase, Product } from "@/lib/supabase";
import { useAuthStore } from "@/lib/store";

export default function InventoryPage() {
  const { user } = useAuthStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStock, setEditStock] = useState(0);

  useEffect(() => {
    async function fetchProducts() {
      if (!user) return;
      const { data } = await supabase
        .from("products")
        .select("*, category:categories(name)")
        .eq("seller_id", user.id)
        .order("stock", { ascending: true });
      setProducts(data || []);
      setLoading(false);
    }
    fetchProducts();
  }, [user]);

  const updateStock = async (productId: string) => {
    await supabase
      .from("products")
      .update({ stock: editStock, updated_at: new Date().toISOString() })
      .eq("id", productId);
    setProducts(
      products.map((p) =>
        p.id === productId ? { ...p, stock: editStock } : p
      )
    );
    setEditingId(null);
  };

  const totalItems = products.reduce((sum, p) => sum + p.stock, 0);
  const lowStockCount = products.filter((p) => p.stock <= 10 && p.stock > 0).length;
  const outOfStockCount = products.filter((p) => p.stock === 0).length;
  const totalValue = products.reduce((sum, p) => sum + p.price * p.stock, 0);

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-midnight-950">
          Inventory
        </h1>
        <p className="text-gray-500 mt-1">
          Track and manage your product stock levels
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid sm:grid-cols-4 gap-4 mb-8">
        <div className="p-5 bg-white rounded-2xl border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Total Units</p>
          <p className="text-2xl font-bold text-midnight-950">{totalItems}</p>
        </div>
        <div className="p-5 bg-white rounded-2xl border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Inventory Value</p>
          <p className="text-2xl font-bold text-midnight-950">
            ${totalValue.toFixed(2)}
          </p>
        </div>
        <div className="p-5 bg-white rounded-2xl border border-amber-100 bg-amber-50/50">
          <p className="text-sm text-amber-600 mb-1">Low Stock</p>
          <p className="text-2xl font-bold text-amber-700">{lowStockCount}</p>
        </div>
        <div className="p-5 bg-white rounded-2xl border border-red-100 bg-red-50/50">
          <p className="text-sm text-red-600 mb-1">Out of Stock</p>
          <p className="text-2xl font-bold text-red-700">{outOfStockCount}</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <p className="text-gray-400">No products in inventory</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-50 bg-gray-50/50">
                <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Value
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-right py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products.map((product) => (
                <tr
                  key={product.id}
                  className={`hover:bg-gray-50/50 transition-colors ${
                    product.stock === 0 ? "bg-red-50/30" : ""
                  }`}
                >
                  <td className="py-4 px-6">
                    <span className="font-medium text-midnight-950 text-sm">
                      {product.name}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500">
                    {product.category?.name || "—"}
                  </td>
                  <td className="py-4 px-4 text-sm text-midnight-950">
                    ${product.price.toFixed(2)}
                  </td>
                  <td className="py-4 px-4">
                    {editingId === product.id ? (
                      <input
                        type="number"
                        min="0"
                        value={editStock}
                        onChange={(e) =>
                          setEditStock(parseInt(e.target.value) || 0)
                        }
                        className="w-20 text-sm py-1.5 px-2"
                        autoFocus
                      />
                    ) : (
                      <span
                        className={`text-sm font-bold ${
                          product.stock === 0
                            ? "text-red-600"
                            : product.stock <= 10
                            ? "text-amber-600"
                            : "text-green-600"
                        }`}
                      >
                        {product.stock}
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500">
                    ${(product.price * product.stock).toFixed(2)}
                  </td>
                  <td className="py-4 px-4">
                    {product.stock === 0 ? (
                      <span className="px-2 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">
                        Out of Stock
                      </span>
                    ) : product.stock <= 10 ? (
                      <span className="px-2 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
                        Low Stock
                      </span>
                    ) : (
                      <span className="px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                        In Stock
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-6 text-right">
                    {editingId === product.id ? (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => updateStock(product.id)}
                          className="text-xs px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="text-xs px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setEditingId(product.id);
                          setEditStock(product.stock);
                        }}
                        className="text-xs px-3 py-1.5 bg-midnight-950 text-white rounded-lg hover:bg-midnight-800"
                      >
                        Update Stock
                      </button>
                    )}
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
