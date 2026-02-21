"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { supabase, Order } from "@/lib/supabase";
import { useAuthStore } from "@/lib/store";

function OrdersContent() {
  const { user } = useAuthStore();
  const searchParams = useSearchParams();
  const success = searchParams.get("success");

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      if (!user) return;
      const { data } = await supabase
        .from("orders")
        .select(
          "*, order_items(*, product:products(name, price, image_url)), carrier:carriers(name)"
        )
        .eq("customer_id", user.id)
        .order("created_at", { ascending: false });
      if (data) setOrders(data);
      setLoading(false);
    }
    fetchOrders();
  }, [user]);

  const statusColors: Record<string, string> = {
    pending: "bg-amber-100 text-amber-800",
    approved: "bg-blue-100 text-blue-800",
    shipped: "bg-purple-100 text-purple-800",
    delivered: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Order placed successfully! The seller will review and approve your order.
        </div>
      )}

      <h1 className="font-display text-3xl font-bold text-midnight-950 mb-8">
        My Orders
      </h1>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-400 text-lg">No orders yet</p>
          <p className="text-gray-300 text-sm mt-2">
            Start shopping to see your orders here
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="p-6 bg-white rounded-2xl border border-gray-100"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs text-gray-400 mb-1">
                    Order #{order.id.slice(0, 8).toUpperCase()}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(order.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${
                      statusColors[order.status]
                    }`}
                  >
                    {order.status}
                  </span>
                  <span className="font-bold text-midnight-950 text-lg">
                    ${order.total.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Order Items */}
              <div className="space-y-2 mb-4">
                {order.order_items?.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">
                        {item.product?.name}
                      </span>
                      <span className="text-gray-400">× {item.quantity}</span>
                      {item.size && (
                        <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded">
                          {item.size}
                        </span>
                      )}
                    </div>
                    <span className="text-gray-600">
                      ${item.total_price.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Order details */}
              <div className="flex flex-wrap gap-4 text-xs text-gray-400 pt-3 border-t border-gray-50">
                <span>
                  Shipping:{" "}
                  {order.shipping_type === "expedited"
                    ? "Expedited (1-2 days)"
                    : "Standard (5-7 days)"}
                </span>
                {order.carrier && <span>Carrier: {order.carrier.name}</span>}
                {order.tracking_number && (
                  <span>Tracking: {order.tracking_number}</span>
                )}
                {order.discount_amount > 0 && (
                  <span className="text-green-600">
                    Discount: -${order.discount_amount.toFixed(2)}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function OrdersPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="h-8 bg-gray-200 rounded w-1/4 animate-pulse" />
        </div>
      }
    >
      <OrdersContent />
    </Suspense>
  );
}
