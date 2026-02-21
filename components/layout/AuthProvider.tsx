"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";

export function AuthProvider({
  children,
  requiredRole,
}: {
  children: React.ReactNode;
  requiredRole?: "customer" | "seller";
}) {
  const { user, loading, fetchUser } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login");
    }
    if (!loading && user && requiredRole && user.role !== requiredRole) {
      router.push(user.role === "seller" ? "/seller-dashboard" : "/products");
    }
  }, [user, loading, requiredRole, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fdf8f6] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-brand-200 border-t-brand-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;
  if (requiredRole && user.role !== requiredRole) return null;

  return <>{children}</>;
}
