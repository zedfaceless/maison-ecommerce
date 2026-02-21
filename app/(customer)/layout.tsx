"use client";

import { useEffect } from "react";
import { AuthProvider } from "@/components/layout/AuthProvider";
import { CustomerNav } from "@/components/layout/CustomerNav";
import { useCartStore } from "@/lib/store";

function CustomerLayoutInner({ children }: { children: React.ReactNode }) {
  const { fetchCart } = useCartStore();

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  return (
    <div className="min-h-screen bg-[#fdf8f6]">
      <CustomerNav />
      <main>{children}</main>
    </div>
  );
}

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider requiredRole="customer">
      <CustomerLayoutInner>{children}</CustomerLayoutInner>
    </AuthProvider>
  );
}
