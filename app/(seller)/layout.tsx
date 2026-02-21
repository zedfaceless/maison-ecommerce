"use client";

import { AuthProvider } from "@/components/layout/AuthProvider";
import { SellerSidebar } from "@/components/layout/SellerSidebar";

export default function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider requiredRole="seller">
      <div className="min-h-screen bg-[#f8f9fc] flex">
        <SellerSidebar />
        <main className="flex-1 ml-64 p-8">{children}</main>
      </div>
    </AuthProvider>
  );
}
