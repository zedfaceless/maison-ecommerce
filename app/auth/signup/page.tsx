"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultRole = searchParams.get("role") || "customer";

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    role: defaultRole as "customer" | "seller",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            full_name: form.full_name,
            role: form.role,
          },
        },
      });

      if (signUpError) throw signUpError;

      if (data.user) {
        router.push(
          form.role === "seller" ? "/seller-dashboard" : "/products"
        );
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fdf8f6] flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-midnight-950 via-midnight-900 to-midnight-800 relative overflow-hidden items-center justify-center p-12">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl" />
        <div className="relative text-center text-white">
          <h2 className="font-display text-5xl font-bold mb-4">
            Join the{" "}
            <span className="italic text-brand-400">Community</span>
          </h2>
          <p className="text-lg text-gray-300 max-w-md mx-auto">
            {form.role === "seller"
              ? "Start your journey as a seller. Reach thousands of customers and grow your fashion business."
              : "Discover curated fashion from independent sellers. Premium quality, timeless design."}
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">
          <Link
            href="/"
            className="font-display text-2xl font-bold text-midnight-950 mb-8 inline-block"
          >
            MAISON
          </Link>
          <h1 className="font-display text-3xl font-bold text-midnight-950 mb-2">
            Create your account
          </h1>
          <p className="text-gray-500 mb-8">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="text-brand-600 font-medium hover:underline"
            >
              Sign in
            </Link>
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-midnight-800 mb-2">
                I want to
              </label>
              <div className="grid grid-cols-2 gap-3">
                {(["customer", "seller"] as const).map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setForm({ ...form, role })}
                    className={`p-4 rounded-xl border-2 text-center transition-all ${
                      form.role === role
                        ? "border-brand-600 bg-brand-50 text-brand-700"
                        : "border-gray-200 text-gray-500 hover:border-gray-300"
                    }`}
                  >
                    <div className="text-2xl mb-1">
                      {role === "customer" ? "🛍️" : "🏪"}
                    </div>
                    <p className="text-sm font-medium capitalize">{role === "customer" ? "Shop" : "Sell"}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-midnight-800 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={form.full_name}
                onChange={(e) =>
                  setForm({ ...form, full_name: e.target.value })
                }
                placeholder="John Doe"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-midnight-800 mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm({ ...form, email: e.target.value })
                }
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-midnight-800 mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={form.password}
                onChange={(e) =>
                  setForm({ ...form, password: e.target.value })
                }
                placeholder="Minimum 6 characters"
                minLength={6}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-4 rounded-xl text-base"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                `Create ${form.role === "seller" ? "Seller" : "Customer"} Account`
              )}
            </button>
          </form>

          <p className="text-xs text-gray-400 text-center mt-6">
            By signing up, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#fdf8f6]" />}>
      <SignUpForm />
    </Suspense>
  );
}
