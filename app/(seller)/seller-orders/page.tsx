"use client";

import { useState, useEffect } from "react";
import { supabase, Order, Carrier } from "@/lib/supabase";
import { useAuthStore } from "@/lib/store";

export default function SellerOrdersPage() {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [carriers, setCarriers] = useState<Carrier[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    async function fetchData() {
      if (!user) return;

      // Fetch carriers
      const { data: carrierData } = await supabase
        .from("carriers")
        .select("*")
        .eq("is_active", true);
      setCarriers(carrierData || []);

      // Fetch orders containing seller's products
      const { data: orderItems } = await supabase
        .from("order_items")
        .select(
          "*, order:orders(*, customer:profiles(full_name, email, phone)), product:products(name)"
        )
        .eq("seller_id", user.id)
        .order("created_at", { ascending: false });

      // Group by order
      const orderMap = new Map();
      orderItems?.forEach((item) => {
        if (!item.order) return;
        if (!orderMap.has(item.order.id)) {
          orderMap.set(item.order.id, {
            ...item.order,
            items: [],
          });
        }
        orderMap.get(item.order.id).items.push(item);
      });

      setOrders(Array.from(orderMap.values()));
      setLoading(false);
    }
    fetchData();
  }, [user]);

  const updateOrderStatus = async (
    orderId: string,
    status: string,
    carrierId?: string,
    trackingNumber?: string
  ) => {
    const updates: any = { status, updated_at: new Date().toISOString() };
    if (carrierId) updates.carrier_id = carrierId;
    if (trackingNumber) updates.tracking_number = trackingNumber;

    await supabase.from("orders").update(updates).eq("id", orderId);

    setOrders(
      orders.map((o) =>
        o.id === orderId ? { ...o, ...updates, status } : o
      )
    );
  };

  const filteredOrders =
    filter === "all"
      ? orders
      : orders.filter((o) => o.status === filter);

  const statusColors: Record<string, string> = {
    pending: "bg-amber-100 text-amber-800",
    approved: "bg-blue-100 text-blue-800",
    shipped: "bg-purple-100 text-purple-800",
    delivered: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  };

  const statusCounts = orders.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-midnight-950">
            Orders
          </h1>
          <p className="text-gray-500 mt-1">
            Manage customer orders and assign carriers
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {[
          { key: "all", label: "All" },
          { key: "pending", label: "Pending" },
          { key: "approved", label: "Approved" },
          { key: "shipped", label: "Shipped" },
          { key: "delivered", label: "Delivered" },
          { key: "cancelled", label: "Cancelled" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
              filter === tab.key
                ? "bg-midnight-950 text-white"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            {tab.label}
            {tab.key !== "all" && statusCounts[tab.key] > 0 && (
              <span className="ml-1.5 text-xs">
                ({statusCounts[tab.key]})
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <p className="text-gray-400 text-lg">No orders found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              carriers={carriers}
              statusColors={statusColors}
              onUpdateStatus={updateOrderStatus}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function OrderCard({
  order,
  carriers,
  statusColors,
  onUpdateStatus,
}: {
  order: any;
  carriers: Carrier[];
  statusColors: Record<string, string>;
  onUpdateStatus: (
    id: string,
    status: string,
    carrierId?: string,
    tracking?: string
  ) => Promise<void>;
}) {
  const [selectedCarrier, setSelectedCarrier] = useState(
    order.carrier_id || ""
  );
  const [trackingNumber, setTrackingNumber] = useState(
    order.tracking_number || ""
  );
  const [updating, setUpdating] = useState(false);

  const handleApprove = async () => {
    setUpdating(true);
    await onUpdateStatus(order.id, "approved");
    setUpdating(false);
  };

  const handleShip = async () => {
    if (!selectedCarrier) {
      alert("Please select a carrier first");
      return;
    }
    setUpdating(true);
    await onUpdateStatus(
      order.id,
      "shipped",
      selectedCarrier,
      trackingNumber
    );
    setUpdating(false);
  };

  const handleDeliver = async () => {
    setUpdating(true);
    await onUpdateStatus(order.id, "delivered");
    setUpdating(false);
  };

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel this order?")) return;
    setUpdating(true);
    await onUpdateStatus(order.id, "cancelled");
    setUpdating(false);
  };

  return (
    <div className="p-6 bg-white rounded-2xl border border-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs text-gray-400 mb-1">
            Order #{order.id.slice(0, 8).toUpperCase()}
          </p>
          <p className="font-medium text-midnight-950">
            {order.customer?.full_name} ({order.customer?.email})
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            {new Date(order.created_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
        <div className="text-right">
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${
              statusColors[order.status]
            }`}
          >
            {order.status}
          </span>
          <p className="text-lg font-bold text-midnight-950 mt-2">
            ${order.total.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Items */}
      <div className="bg-gray-50 rounded-xl p-4 mb-4">
        {order.items.map((item: any) => (
          <div
            key={item.id}
            className="flex items-center justify-between text-sm py-1"
          >
            <span className="text-gray-700">
              {item.product?.name}{" "}
              {item.size && <span className="text-gray-400">({item.size})</span>}{" "}
              × {item.quantity}
            </span>
            <span className="font-medium">${item.total_price.toFixed(2)}</span>
          </div>
        ))}
        <div className="flex justify-between text-xs text-gray-400 mt-2 pt-2 border-t border-gray-200">
          <span>
            Shipping: {order.shipping_type === "expedited" ? "Expedited" : "Standard"}
          </span>
          <span>Tax: ${order.tax_amount.toFixed(2)}</span>
          {order.discount_amount > 0 && (
            <span className="text-green-600">
              Discount: -${order.discount_amount.toFixed(2)}
            </span>
          )}
        </div>
      </div>

      {/* Shipping details */}
      <div className="text-xs text-gray-500 mb-4">
        Ship to: {order.shipping_address}, {order.shipping_city},{" "}
        {order.shipping_state} {order.shipping_zip}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-3">
        {order.status === "pending" && (
          <>
            <button
              onClick={handleApprove}
              disabled={updating}
              className="btn bg-blue-600 text-white hover:bg-blue-700 text-sm py-2"
            >
              {updating ? "..." : "✓ Approve Order"}
            </button>
            <button
              onClick={handleCancel}
              disabled={updating}
              className="btn bg-white border border-red-200 text-red-600 hover:bg-red-50 text-sm py-2"
            >
              Cancel
            </button>
          </>
        )}

        {order.status === "approved" && (
          <>
            <select
              value={selectedCarrier}
              onChange={(e) => setSelectedCarrier(e.target.value)}
              className="text-sm py-2 w-40"
            >
              <option value="">Select Carrier</option>
              {carriers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="Tracking # (optional)"
              className="text-sm py-2 w-48"
            />
            <button
              onClick={handleShip}
              disabled={updating || !selectedCarrier}
              className="btn bg-purple-600 text-white hover:bg-purple-700 text-sm py-2"
            >
              {updating ? "..." : "📦 Ship Order"}
            </button>
          </>
        )}

        {order.status === "shipped" && (
          <button
            onClick={handleDeliver}
            disabled={updating}
            className="btn bg-green-600 text-white hover:bg-green-700 text-sm py-2"
          >
            {updating ? "..." : "✓ Mark Delivered"}
          </button>
        )}
      </div>
    </div>
  );
}
