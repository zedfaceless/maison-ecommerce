"use client";

import Link from "next/link";
import { useCartStore } from "@/lib/store";

export default function CartPage() {
  const { items, loading, updateQuantity, removeItem, getTotal } =
    useCartStore();
  const subtotal = getTotal();

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-gray-100 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-20 text-center">
        <div className="mb-6">
          <svg className="w-20 h-20 mx-auto text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        </div>
        <h2 className="font-display text-2xl font-bold text-midnight-950 mb-2">
          Your cart is empty
        </h2>
        <p className="text-gray-400 mb-6">
          Discover our curated collection and find something you love.
        </p>
        <Link href="/products" className="btn-primary">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <h1 className="font-display text-3xl font-bold text-midnight-950 mb-8">
        Shopping Cart ({items.length})
      </h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex gap-4 p-4 bg-white rounded-2xl border border-gray-100"
            >
              {/* Product image */}
              <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                {item.product?.image_url ? (
                  <img src={item.product.image_url} alt={item.product.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="font-display text-2xl text-gray-200">{item.product?.name?.charAt(0)}</span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <Link
                      href={`/products/${item.product_id}`}
                      className="font-medium text-midnight-950 hover:text-brand-600 transition-colors line-clamp-1"
                    >
                      {item.product?.name}
                    </Link>
                    <p className="text-sm text-gray-400 mt-0.5">
                      {item.size && `Size: ${item.size}`}
                      {item.size && item.color && " · "}
                      {item.color && `Color: ${item.color}`}
                    </p>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-1.5 text-gray-300 hover:text-red-500 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center border border-gray-200 rounded-lg">
                    <button
                      onClick={() =>
                        updateQuantity(item.id, item.quantity - 1)
                      }
                      className="px-3 py-1.5 text-gray-500 hover:text-midnight-950 text-sm"
                    >
                      −
                    </button>
                    <span className="px-3 py-1.5 text-sm font-medium text-midnight-950">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        updateQuantity(item.id, item.quantity + 1)
                      }
                      className="px-3 py-1.5 text-gray-500 hover:text-midnight-950 text-sm"
                    >
                      +
                    </button>
                  </div>
                  <span className="font-bold text-midnight-950">
                    ${(item.product.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 p-6 bg-white rounded-2xl border border-gray-100">
            <h3 className="font-display text-lg font-bold text-midnight-950 mb-4">
              Order Summary
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span className="font-medium">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span className="text-green-600 font-medium">Free</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax (8.25%)</span>
                <span className="font-medium">
                  ${(subtotal * 0.0825).toFixed(2)}
                </span>
              </div>
              <hr className="border-gray-100" />
              <div className="flex justify-between text-lg font-bold text-midnight-950">
                <span>Estimated Total</span>
                <span>${(subtotal + subtotal * 0.0825).toFixed(2)}</span>
              </div>
            </div>
            <Link
              href="/checkout"
              className="btn-primary w-full mt-6 py-4 text-base"
            >
              Proceed to Checkout
            </Link>
            <Link
              href="/products"
              className="block text-center text-sm text-gray-500 hover:text-brand-600 mt-3 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
