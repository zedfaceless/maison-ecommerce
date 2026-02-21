"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useCartStore, useAuthStore } from "@/lib/store";

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { items, getTotal, clearCart } = useCartStore();

  const [shippingType, setShippingType] = useState<"regular" | "expedited">("regular");
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState<{
    code: string;
    discount_type: string;
    discount_value: number;
    id: string;
  } | null>(null);
  const [promoError, setPromoError] = useState("");
  const [shipping, setShipping] = useState({
    address: "",
    city: "",
    state: "",
    zip: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const subtotal = getTotal();
  const taxRate = 0.0825;
  const taxAmount = Math.round(subtotal * taxRate * 100) / 100;
  const shippingCost = shippingType === "expedited" ? 12 : 0;

  let discountAmount = 0;
  if (promoApplied) {
    if (promoApplied.discount_type === "percentage") {
      discountAmount =
        Math.round(subtotal * (promoApplied.discount_value / 100) * 100) / 100;
    } else {
      discountAmount = promoApplied.discount_value;
    }
  }

  const total =
    Math.round((subtotal + taxAmount + shippingCost - discountAmount) * 100) /
    100;

  const handleApplyPromo = async () => {
    setPromoError("");
    if (!promoCode.trim()) return;

    const { data, error } = await supabase
      .from("promotions")
      .select("*")
      .eq("code", promoCode.toUpperCase().trim())
      .eq("is_active", true)
      .single();

    if (error || !data) {
      setPromoError("Invalid or expired promo code");
      return;
    }

    if (subtotal < data.min_order_amount) {
      setPromoError(
        `Minimum order of $${data.min_order_amount.toFixed(2)} required`
      );
      return;
    }

    setPromoApplied({
      code: data.code,
      discount_type: data.discount_type,
      discount_value: data.discount_value,
      id: data.id,
    });
  };

  const handlePlaceOrder = async () => {
    if (!user) return;
    if (!shipping.address || !shipping.city || !shipping.state || !shipping.zip) {
      setError("Please fill in all shipping details");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const estimatedDelivery =
        shippingType === "expedited" ? "1-2 business days" : "5-7 business days";

      // Create order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          customer_id: user.id,
          status: "pending",
          subtotal,
          tax_rate: taxRate,
          tax_amount: taxAmount,
          shipping_type: shippingType,
          shipping_cost: shippingCost,
          discount_amount: discountAmount,
          promotion_id: promoApplied?.id || null,
          total,
          shipping_address: shipping.address,
          shipping_city: shipping.city,
          shipping_state: shipping.state,
          shipping_zip: shipping.zip,
          estimated_delivery: estimatedDelivery,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = items.map((item) => ({
        order_id: order.id,
        product_id: item.product_id,
        seller_id: item.product.seller_id,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
        unit_price: item.product.price,
        total_price: item.product.price * item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Update promotion usage
      if (promoApplied) {
        await supabase.rpc("increment_promo_usage", {
          promo_id: promoApplied.id,
        });
      }

      // Clear cart
      await clearCart();

      // Redirect to orders
      router.push("/orders?success=true");
    } catch (err: any) {
      setError(err.message || "Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-20 text-center">
        <p className="text-gray-400 text-lg">Your cart is empty</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <h1 className="font-display text-3xl font-bold text-midnight-950 mb-8">
        Checkout
      </h1>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="grid lg:grid-cols-5 gap-8">
        {/* Left - Forms */}
        <div className="lg:col-span-3 space-y-6">
          {/* Shipping Address */}
          <div className="p-6 bg-white rounded-2xl border border-gray-100">
            <h2 className="font-display text-lg font-bold text-midnight-950 mb-4">
              Shipping Address
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-midnight-800 mb-1.5">
                  Street Address
                </label>
                <input
                  type="text"
                  value={shipping.address}
                  onChange={(e) =>
                    setShipping({ ...shipping, address: e.target.value })
                  }
                  placeholder="123 Main Street"
                  required
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-midnight-800 mb-1.5">
                    City
                  </label>
                  <input
                    type="text"
                    value={shipping.city}
                    onChange={(e) =>
                      setShipping({ ...shipping, city: e.target.value })
                    }
                    placeholder="New York"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-midnight-800 mb-1.5">
                    State
                  </label>
                  <input
                    type="text"
                    value={shipping.state}
                    onChange={(e) =>
                      setShipping({ ...shipping, state: e.target.value })
                    }
                    placeholder="NY"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-midnight-800 mb-1.5">
                    ZIP Code
                  </label>
                  <input
                    type="text"
                    value={shipping.zip}
                    onChange={(e) =>
                      setShipping({ ...shipping, zip: e.target.value })
                    }
                    placeholder="10001"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Shipping Method */}
          <div className="p-6 bg-white rounded-2xl border border-gray-100">
            <h2 className="font-display text-lg font-bold text-midnight-950 mb-4">
              Shipping Method
            </h2>
            <div className="space-y-3">
              <label
                className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  shippingType === "regular"
                    ? "border-midnight-950 bg-midnight-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="shipping"
                    value="regular"
                    checked={shippingType === "regular"}
                    onChange={() => setShippingType("regular")}
                    className="w-4 h-4 text-midnight-950"
                  />
                  <div>
                    <p className="font-medium text-midnight-950">
                      Standard Shipping
                    </p>
                    <p className="text-sm text-gray-400">5-7 business days</p>
                  </div>
                </div>
                <span className="font-bold text-green-600">FREE</span>
              </label>

              <label
                className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  shippingType === "expedited"
                    ? "border-midnight-950 bg-midnight-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="shipping"
                    value="expedited"
                    checked={shippingType === "expedited"}
                    onChange={() => setShippingType("expedited")}
                    className="w-4 h-4 text-midnight-950"
                  />
                  <div>
                    <p className="font-medium text-midnight-950">
                      Expedited Shipping
                    </p>
                    <p className="text-sm text-gray-400">1-2 business days</p>
                  </div>
                </div>
                <span className="font-bold text-midnight-950">$12.00</span>
              </label>
            </div>
          </div>

          {/* Promo Code */}
          <div className="p-6 bg-white rounded-2xl border border-gray-100">
            <h2 className="font-display text-lg font-bold text-midnight-950 mb-4">
              Promo Code
            </h2>
            {promoApplied ? (
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl border border-green-200">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="font-medium text-green-800">
                    {promoApplied.code} applied —{" "}
                    {promoApplied.discount_type === "percentage"
                      ? `${promoApplied.discount_value}% off`
                      : `$${promoApplied.discount_value} off`}
                  </span>
                </div>
                <button
                  onClick={() => setPromoApplied(null)}
                  className="text-sm text-green-600 hover:underline"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="flex gap-3">
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="Enter promo code"
                  className="flex-1"
                />
                <button onClick={handleApplyPromo} className="btn-secondary">
                  Apply
                </button>
              </div>
            )}
            {promoError && (
              <p className="text-sm text-red-500 mt-2">{promoError}</p>
            )}
            <p className="text-xs text-gray-400 mt-2">
              Try: WELCOME10, SAVE20, or SPRING25
            </p>
          </div>
        </div>

        {/* Right - Order Summary */}
        <div className="lg:col-span-2">
          <div className="sticky top-24 p-6 bg-white rounded-2xl border border-gray-100">
            <h3 className="font-display text-lg font-bold text-midnight-950 mb-4">
              Order Summary
            </h3>

            {/* Items */}
            <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0 overflow-hidden text-gray-300 font-display">
                    {item.product?.image_url ? (
                      <img src={item.product.image_url} alt={item.product.name} className="w-full h-full object-cover" />
                    ) : (
                      item.product?.name?.charAt(0)
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-midnight-950 line-clamp-1">
                      {item.product?.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      Qty: {item.quantity}
                    </p>
                  </div>
                  <span className="text-sm font-medium text-midnight-950">
                    ${(item.product.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <hr className="border-gray-100 mb-4" />

            {/* Totals */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax (8.25%)</span>
                <span>${taxAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span className={shippingCost === 0 ? "text-green-600" : ""}>
                  {shippingCost === 0 ? "Free" : `$${shippingCost.toFixed(2)}`}
                </span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}
              <hr className="border-gray-100" />
              <div className="flex justify-between text-lg font-bold text-midnight-950 pt-1">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={loading}
              className="btn-primary w-full mt-6 py-4 text-base"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                `Place Order — $${total.toFixed(2)}`
              )}
            </button>

            <p className="text-xs text-gray-400 text-center mt-4">
              Orders require seller approval before shipping
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
