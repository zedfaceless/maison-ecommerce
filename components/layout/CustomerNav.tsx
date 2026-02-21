"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore, useCartStore } from "@/lib/store";

export function CustomerNav() {
  const { user, signOut } = useAuthStore();
  const { getItemCount } = useCartStore();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const itemCount = getItemCount();

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-lg border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/products" className="font-display text-xl font-bold text-midnight-950">
            MAISON
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-midnight-700">
            <Link href="/products" className="hover:text-brand-600 transition-colors">
              All Products
            </Link>
            <Link href="/products?category=men" className="hover:text-brand-600 transition-colors">
              Men
            </Link>
            <Link href="/products?category=women" className="hover:text-brand-600 transition-colors">
              Women
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Cart */}
          <Link
            href="/cart"
            className="relative p-2 text-midnight-700 hover:text-brand-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-brand-600 text-white text-xs rounded-full flex items-center justify-center font-bold">
                {itemCount}
              </span>
            )}
          </Link>

          {/* Orders */}
          <Link
            href="/orders"
            className="p-2 text-midnight-700 hover:text-brand-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </Link>

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2 p-2 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-sm font-bold">
                {user?.full_name?.charAt(0) || "U"}
              </div>
              <span className="hidden md:block text-sm font-medium text-midnight-800">
                {user?.full_name?.split(" ")[0]}
              </span>
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                  <p className="px-4 py-2 text-xs text-gray-400">{user?.email}</p>
                  <hr className="my-1 border-gray-100" />
                  <Link
                    href="/orders"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => setMenuOpen(false)}
                  >
                    My Orders
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    Sign Out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
