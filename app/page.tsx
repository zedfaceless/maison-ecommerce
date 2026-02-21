"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase, Product } from "@/lib/supabase";

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    async function fetchFeatured() {
      const { data } = await supabase
        .from("products")
        .select("*, category:categories(*)")
        .eq("is_featured", true)
        .eq("is_active", true)
        .limit(8);
      if (data) setFeaturedProducts(data);
    }
    fetchFeatured();
  }, []);

  return (
    <div className="min-h-screen bg-[#fdf8f6] relative grain-overlay">
      {/* Navigation */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-white/90 backdrop-blur-lg shadow-sm py-3"
            : "bg-transparent py-6"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <Link
            href="/"
            className="font-display text-2xl md:text-3xl font-bold tracking-wide text-midnight-950"
          >
            MAISON
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-midnight-800">
            <a href="#collections" className="hover:text-brand-600 transition-colors">
              Collections
            </a>
            <a href="#featured" className="hover:text-brand-600 transition-colors">
              Featured
            </a>
            <a href="#about" className="hover:text-brand-600 transition-colors">
              About
            </a>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/auth/login"
              className="px-5 py-2.5 text-sm font-medium text-midnight-800 hover:text-brand-600 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/auth/signup"
              className="px-5 py-2.5 text-sm font-medium bg-midnight-950 text-white rounded-full hover:bg-midnight-800 transition-all active:scale-[0.97]"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-20 right-10 w-72 h-72 rounded-full bg-brand-200/30 blur-3xl animate-float" />
        <div className="absolute bottom-20 left-10 w-96 h-96 rounded-full bg-midnight-200/20 blur-3xl animate-float" style={{ animationDelay: "3s" }} />
        <div className="absolute top-1/3 left-1/4 w-2 h-2 rounded-full bg-brand-400 animate-float" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 right-1/3 w-3 h-3 rounded-full bg-midnight-300 animate-float" style={{ animationDelay: "2s" }} />

        <div className="max-w-7xl mx-auto px-6 pt-32 pb-20 grid lg:grid-cols-2 gap-12 items-center">
          <div className="opacity-0 animate-slide-up">
            <p className="text-brand-600 font-medium text-sm tracking-[0.2em] uppercase mb-4">
              Spring/Summer 2026
            </p>
            <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold text-midnight-950 leading-[0.95] mb-6">
              Where
              <br />
              Style{" "}
              <span className="italic text-brand-600">Meets</span>
              <br />
              Substance
            </h1>
            <p className="text-lg text-midnight-600 max-w-md mb-8 leading-relaxed">
              Discover curated collections from independent sellers. Premium
              quality, timeless design, delivered to your door.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/auth/signup"
                className="btn-primary text-base px-8 py-4 rounded-full"
              >
                Shop Now
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link
                href="/auth/signup?role=seller"
                className="btn-secondary text-base px-8 py-4 rounded-full"
              >
                Start Selling
              </Link>
            </div>
            <div className="flex items-center gap-8 mt-12 text-sm text-midnight-500">
              <div>
                <p className="text-2xl font-bold text-midnight-950 font-display">2K+</p>
                <p>Products</p>
              </div>
              <div className="w-px h-10 bg-gray-200" />
              <div>
                <p className="text-2xl font-bold text-midnight-950 font-display">500+</p>
                <p>Sellers</p>
              </div>
              <div className="w-px h-10 bg-gray-200" />
              <div>
                <p className="text-2xl font-bold text-midnight-950 font-display">50K+</p>
                <p>Happy Customers</p>
              </div>
            </div>
          </div>

          {/* Hero visual - Asymmetric image grid */}
          <div className="relative hidden lg:block opacity-0 animate-fade-in stagger-3">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-brand-100 to-brand-200 rounded-3xl h-64 flex items-center justify-center overflow-hidden">
                  <div className="text-center p-6">
                    <p className="font-display text-3xl font-bold text-brand-800">Men</p>
                    <p className="text-brand-600 text-sm mt-1">New Arrivals</p>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-midnight-100 to-midnight-200 rounded-3xl h-48 flex items-center justify-center">
                  <div className="text-center p-6">
                    <p className="font-display text-xl font-bold text-midnight-800">Free Shipping</p>
                    <p className="text-midnight-500 text-sm mt-1">On all orders</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4 pt-8">
                <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-3xl h-48 flex items-center justify-center">
                  <div className="text-center p-6">
                    <p className="font-display text-4xl font-bold text-amber-800">25%</p>
                    <p className="text-amber-600 text-sm mt-1">Spring Sale</p>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-rose-50 to-rose-100 rounded-3xl h-64 flex items-center justify-center">
                  <div className="text-center p-6">
                    <p className="font-display text-3xl font-bold text-rose-800">Women</p>
                    <p className="text-rose-600 text-sm mt-1">Trending Now</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Collections Section */}
      <section id="collections" className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-brand-600 font-medium text-sm tracking-[0.2em] uppercase mb-3">
              Explore
            </p>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-midnight-950">
              Shop by Category
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: "Men's Collection", slug: "men", color: "from-midnight-800 to-midnight-950", count: "15+ Items" },
              { name: "Women's Collection", slug: "women", color: "from-brand-500 to-brand-700", count: "15+ Items" },
              { name: "Children's Wear", slug: "children", color: "from-amber-400 to-amber-600", count: "Coming Soon" },
            ].map((cat, i) => (
              <Link
                key={cat.slug}
                href={`/auth/signup`}
                className={`group relative overflow-hidden rounded-3xl h-80 bg-gradient-to-br ${cat.color} p-8 flex flex-col justify-end transition-transform hover:scale-[1.02] active:scale-[0.99]`}
              >
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-colors" />
                <div className="relative z-10">
                  <p className="text-white/70 text-sm mb-2">{cat.count}</p>
                  <h3 className="font-display text-2xl font-bold text-white">
                    {cat.name}
                  </h3>
                  <div className="mt-4 flex items-center gap-2 text-white/80 text-sm group-hover:gap-3 transition-all">
                    <span>Shop Now</span>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section id="featured" className="py-24 bg-[#fdf8f6]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-brand-600 font-medium text-sm tracking-[0.2em] uppercase mb-3">
                Curated
              </p>
              <h2 className="font-display text-4xl md:text-5xl font-bold text-midnight-950">
                Featured Picks
              </h2>
            </div>
            <Link
              href="/auth/signup"
              className="hidden md:inline-flex items-center gap-2 text-sm font-medium text-midnight-600 hover:text-brand-600 transition-colors"
            >
              View All
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
          {featuredProducts.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product, i) => (
                <div
                  key={product.id}
                  className="product-card bg-white rounded-2xl overflow-hidden border border-gray-100 opacity-0 animate-slide-up"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <div className="relative aspect-[3/4] bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center overflow-hidden">
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" loading="lazy" />
                    ) : (
                      <span className="font-display text-2xl text-gray-300">{product.name.charAt(0)}</span>
                    )}
                    {product.compare_at_price && (
                      <span className="absolute top-3 left-3 bg-brand-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                        SALE
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">
                      {product.category?.name}
                    </p>
                    <h3 className="font-medium text-midnight-950 mb-2 line-clamp-1">
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-midnight-950">
                        ${product.price.toFixed(2)}
                      </span>
                      {product.compare_at_price && (
                        <span className="text-sm text-gray-400 line-through">
                          ${product.compare_at_price.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl overflow-hidden border border-gray-100 animate-pulse"
                >
                  <div className="aspect-[3/4] bg-gray-100" />
                  <div className="p-4 space-y-2">
                    <div className="h-3 bg-gray-100 rounded w-1/3" />
                    <div className="h-4 bg-gray-100 rounded w-2/3" />
                    <div className="h-4 bg-gray-100 rounded w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Promotion Banner */}
      <section className="py-20 bg-midnight-950 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl" />
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <p className="text-brand-400 font-medium text-sm tracking-[0.2em] uppercase mb-4">
            Limited Time
          </p>
          <h2 className="font-display text-4xl md:text-6xl font-bold mb-4">
            Use Code{" "}
            <span className="text-brand-400 italic">WELCOME10</span>
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Get 10% off your first order over $25
          </p>
          <Link
            href="/auth/signup"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-midnight-950 rounded-full font-medium hover:bg-gray-100 transition-colors active:scale-[0.97]"
          >
            Claim Your Discount
          </Link>
        </div>
      </section>

      {/* About / Features Section */}
      <section id="about" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                ),
                title: "Free Shipping",
                desc: "Standard delivery at no cost on all orders. Expedited shipping available for $12.",
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                ),
                title: "Verified Sellers",
                desc: "Every seller is verified and reviewed. Quality you can trust, guaranteed.",
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                ),
                title: "Curated Selection",
                desc: "Handpicked collections of premium clothing for men, women, and children.",
              },
            ].map((feature, i) => (
              <div key={i} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-50 text-brand-600 mb-6">
                  {feature.icon}
                </div>
                <h3 className="font-display text-xl font-bold text-midnight-950 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 bg-midnight-950 text-gray-400">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <h3 className="font-display text-2xl font-bold text-white mb-4">
                MAISON
              </h3>
              <p className="text-sm leading-relaxed">
                A curated marketplace connecting fashion-forward shoppers with
                independent sellers worldwide.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-white mb-4">Shop</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Men</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Women</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Children</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Sale</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-white mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Shipping Info</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Returns</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-white mb-4">Sell with Us</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Start Selling</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Seller Resources</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-sm text-center">
            <p>&copy; 2026 MAISON. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
