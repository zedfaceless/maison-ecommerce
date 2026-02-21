"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { supabase, Product, Category } from "@/lib/supabase";
import { useCartStore } from "@/lib/store";

function ProductsContent() {
  const searchParams = useSearchParams();
  const categoryFilter = searchParams.get("category");

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(categoryFilter || "all");
  const [sortBy, setSortBy] = useState("newest");
  const { addToCart } = useCartStore();
  const [addingId, setAddingId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCategories() {
      const { data } = await supabase.from("categories").select("*");
      if (data) setCategories(data);
    }
    fetchCategories();
  }, []);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      let query = supabase
        .from("products")
        .select("*, category:categories(*)")
        .eq("is_active", true);

      if (selectedCategory && selectedCategory !== "all") {
        const cat = categories.find((c) => c.slug === selectedCategory);
        if (cat) query = query.eq("category_id", cat.id);
      }

      if (search) {
        query = query.ilike("name", `%${search}%`);
      }

      switch (sortBy) {
        case "price_low":
          query = query.order("price", { ascending: true });
          break;
        case "price_high":
          query = query.order("price", { ascending: false });
          break;
        case "name":
          query = query.order("name", { ascending: true });
          break;
        default:
          query = query.order("created_at", { ascending: false });
      }

      const { data } = await query;
      setProducts(data || []);
      setLoading(false);
    }
    fetchProducts();
  }, [selectedCategory, sortBy, search, categories]);

  const handleAddToCart = async (productId: string) => {
    setAddingId(productId);
    await addToCart(productId, 1);
    setTimeout(() => setAddingId(null), 800);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-midnight-950 mb-2">Shop Collection</h1>
        <p className="text-gray-500">Discover curated fashion for every occasion</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products..." className="pl-11" />
        </div>
        <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="w-full md:w-48">
          <option value="all">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.slug}>{cat.name}</option>
          ))}
        </select>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-full md:w-48">
          <option value="newest">Newest First</option>
          <option value="price_low">Price: Low to High</option>
          <option value="price_high">Price: High to Low</option>
          <option value="name">Name A-Z</option>
        </select>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-100 animate-pulse">
              <div className="aspect-[3/4] bg-gray-100" />
              <div className="p-4 space-y-2">
                <div className="h-3 bg-gray-100 rounded w-1/3" />
                <div className="h-4 bg-gray-100 rounded w-2/3" />
                <div className="h-4 bg-gray-100 rounded w-1/4" />
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-400 text-lg">No products found</p>
          <p className="text-gray-300 text-sm mt-2">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <div key={product.id} className="product-card bg-white rounded-2xl overflow-hidden border border-gray-100 group">
              <Link href={`/products/${product.id}`}>
                <div className="relative aspect-[3/4] bg-gray-50 overflow-hidden">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                      <span className="font-display text-4xl text-gray-200">{product.name.charAt(0)}</span>
                    </div>
                  )}
                  {product.compare_at_price && (
                    <span className="absolute top-3 left-3 bg-brand-600 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                      {Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)}% OFF
                    </span>
                  )}
                  {product.stock <= 5 && product.stock > 0 && (
                    <span className="absolute top-3 right-3 bg-amber-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">Low Stock</span>
                  )}
                </div>
              </Link>
              <div className="p-4">
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">{product.category?.name}</p>
                <Link href={`/products/${product.id}`}>
                  <h3 className="font-medium text-midnight-950 mb-1 line-clamp-1 hover:text-brand-600 transition-colors">{product.name}</h3>
                </Link>
                <p className="text-xs text-gray-400 mb-3 line-clamp-2">{product.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-midnight-950">${product.price.toFixed(2)}</span>
                    {product.compare_at_price && (
                      <span className="text-sm text-gray-400 line-through">${product.compare_at_price.toFixed(2)}</span>
                    )}
                  </div>
                  <button
                    onClick={() => handleAddToCart(product.id)}
                    disabled={product.stock === 0 || addingId === product.id}
                    className={`p-2.5 rounded-xl transition-all ${
                      addingId === product.id
                        ? "bg-green-100 text-green-600"
                        : product.stock === 0
                        ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                        : "bg-midnight-950 text-white hover:bg-midnight-800 active:scale-95"
                    }`}
                  >
                    {addingId === product.id ? (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-6 py-8"><div className="animate-pulse space-y-4"><div className="h-8 bg-gray-200 rounded w-1/4" /><div className="h-4 bg-gray-100 rounded w-1/3" /></div></div>}>
      <ProductsContent />
    </Suspense>
  );
}
