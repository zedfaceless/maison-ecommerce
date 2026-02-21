"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/lib/store";

type DashboardStats = {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  lowStockProducts: number;
  totalReviews: number;
  avgRating: number;
};

export default function SellerDashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    lowStockProducts: 0,
    totalReviews: 0,
    avgRating: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
      if (!user) return;

      const { count: productsCount } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true })
        .eq("seller_id", user.id);

      const { count: lowStock } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true })
        .eq("seller_id", user.id)
        .lte("stock", 10);

      const { data: orderItems } = await supabase
        .from("order_items")
        .select("*, order:orders(*)")
        .eq("seller_id", user.id);

      const uniqueOrders = new Map();
      let totalRevenue = 0;
      let pendingOrders = 0;

      orderItems?.forEach((item) => {
        if (item.order && !uniqueOrders.has(item.order.id)) {
          uniqueOrders.set(item.order.id, item.order);
          totalRevenue += item.total_price;
          if (item.order.status === "pending") pendingOrders++;
        } else if (item.order) {
          totalRevenue += item.total_price;
        }
      });

      const { data: sellerProducts } = await supabase
        .from("products")
        .select("id")
        .eq("seller_id", user.id);

      let totalReviews = 0;
      let totalRatingSum = 0;

      if (sellerProducts && sellerProducts.length > 0) {
        const productIds = sellerProducts.map((p) => p.id);
        const { data: reviews } = await supabase
          .from("reviews")
          .select("rating")
          .in("product_id", productIds);
        if (reviews) {
          totalReviews = reviews.length;
          totalRatingSum = reviews.reduce((sum, r) => sum + r.rating, 0);
        }
      }

      const { data: recentOrderData } = await supabase
        .from("order_items")
        .select("*, order:orders(*, customer:profiles(full_name, email)), product:products(name)")
        .eq("seller_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);

      setStats({
        totalProducts: productsCount || 0,
        totalOrders: uniqueOrders.size,
        totalRevenue,
        pendingOrders,
        lowStockProducts: lowStock || 0,
        totalReviews,
        avgRating: totalReviews > 0 ? totalRatingSum / totalReviews : 0,
      });

      const seen = new Set();
      const deduped = (recentOrderData || []).filter((item) => {
        if (seen.has(item.order?.id)) return false;
        seen.add(item.order?.id);
        return true;
      });
      setRecentOrders(deduped.slice(0, 5));
      setLoading(false);
    }
    fetchDashboard();
  }, [user]);

  const statCards = [
    { label: "Total Revenue", value: `$${stats.totalRevenue.toFixed(2)}`, icon: "💰", color: "bg-green-50 text-green-700" },
    { label: "Total Orders", value: stats.totalOrders, icon: "📦", color: "bg-blue-50 text-blue-700" },
    { label: "Pending Approval", value: stats.pendingOrders, icon: "⏳", color: "bg-amber-50 text-amber-700" },
    { label: "Products Listed", value: stats.totalProducts, icon: "🏷️", color: "bg-purple-50 text-purple-700" },
    { label: "Low Stock Items", value: stats.lowStockProducts, icon: "⚠️", color: "bg-red-50 text-red-700" },
    { label: "Avg. Rating", value: stats.avgRating > 0 ? `${stats.avgRating.toFixed(1)} ⭐` : "N/A", icon: "⭐", color: "bg-yellow-50 text-yellow-700" },
  ];

  const statusColors: Record<string, string> = {
    pending: "bg-amber-100 text-amber-800",
    approved: "bg-blue-100 text-blue-800",
    shipped: "bg-purple-100 text-purple-800",
    delivered: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3" />
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-28 bg-gray-100 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-midnight-950">Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back, {user?.full_name?.split(" ")[0]}</p>
        </div>
        <Link href="/seller-products/new" className="btn-primary">+ Add Product</Link>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {statCards.map((stat) => (
          <div key={stat.label} className="p-5 bg-white rounded-2xl border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500">{stat.label}</span>
              <span className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center text-lg`}>{stat.icon}</span>
            </div>
            <p className="text-2xl font-bold text-midnight-950">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid sm:grid-cols-4 gap-4 mb-8">
        <Link href="/seller-orders" className="p-4 bg-white rounded-2xl border border-gray-100 hover:border-brand-200 hover:shadow-sm transition-all text-center">
          <p className="text-sm font-medium text-midnight-800">Manage Orders</p>
          {stats.pendingOrders > 0 && <p className="text-xs text-amber-600 mt-1">{stats.pendingOrders} awaiting approval</p>}
        </Link>
        <Link href="/seller-products" className="p-4 bg-white rounded-2xl border border-gray-100 hover:border-brand-200 hover:shadow-sm transition-all text-center">
          <p className="text-sm font-medium text-midnight-800">View Products</p>
        </Link>
        <Link href="/seller-inventory" className="p-4 bg-white rounded-2xl border border-gray-100 hover:border-brand-200 hover:shadow-sm transition-all text-center">
          <p className="text-sm font-medium text-midnight-800">Inventory</p>
          {stats.lowStockProducts > 0 && <p className="text-xs text-red-600 mt-1">{stats.lowStockProducts} low stock</p>}
        </Link>
        <Link href="/seller-products/new" className="p-4 bg-white rounded-2xl border border-gray-100 hover:border-brand-200 hover:shadow-sm transition-all text-center">
          <p className="text-sm font-medium text-midnight-800">Add Product</p>
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-midnight-950">Recent Orders</h2>
            <Link href="/seller-orders" className="text-sm text-brand-600 hover:underline">View all →</Link>
          </div>
        </div>
        {recentOrders.length === 0 ? (
          <div className="p-12 text-center text-gray-400">No orders yet. Orders will appear here when customers purchase your products.</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {recentOrders.map((item) => (
              <div key={item.id} className="p-4 px-6 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-brand-50 text-brand-700 flex items-center justify-center text-sm font-bold">
                    {item.order?.customer?.full_name?.charAt(0) || "?"}
                  </div>
                  <div>
                    <p className="font-medium text-midnight-950 text-sm">{item.order?.customer?.full_name}</p>
                    <p className="text-xs text-gray-400">{item.product?.name} × {item.quantity}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize ${statusColors[item.order?.status] || ""}`}>
                    {item.order?.status}
                  </span>
                  <span className="text-sm font-bold text-midnight-950">${item.total_price.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
