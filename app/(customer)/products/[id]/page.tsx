"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase, Product, Review } from "@/lib/supabase";
import { useCartStore, useAuthStore } from "@/lib/store";

export default function ProductDetailPage() {
  const { id } = useParams();
  const { user } = useAuthStore();
  const { addToCart } = useCartStore();

  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    async function fetchProduct() {
      const { data } = await supabase
        .from("products")
        .select("*, category:categories(*)")
        .eq("id", id)
        .single();
      if (data) {
        setProduct(data);
        if (data.sizes?.length) setSelectedSize(data.sizes[0]);
        if (data.colors?.length) setSelectedColor(data.colors[0]);
      }
      setLoading(false);
    }

    async function fetchReviews() {
      const { data } = await supabase
        .from("reviews")
        .select("*, profiles(full_name, avatar_url)")
        .eq("product_id", id)
        .order("created_at", { ascending: false });
      if (data) setReviews(data);
    }

    fetchProduct();
    fetchReviews();
  }, [id]);

  const avgRating = reviews.length
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  const handleAddToCart = async () => {
    if (!product) return;
    setAdding(true);
    await addToCart(product.id, quantity, selectedSize, selectedColor);
    setTimeout(() => setAdding(false), 1000);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !product) return;
    setSubmittingReview(true);

    const { error } = await supabase.from("reviews").insert({
      product_id: product.id,
      customer_id: user.id,
      rating: reviewForm.rating,
      comment: reviewForm.comment,
    });

    if (!error) {
      const { data } = await supabase
        .from("reviews")
        .select("*, profiles(full_name, avatar_url)")
        .eq("product_id", id)
        .order("created_at", { ascending: false });
      if (data) setReviews(data);
      setShowReviewForm(false);
      setReviewForm({ rating: 5, comment: "" });
    }
    setSubmittingReview(false);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid md:grid-cols-2 gap-12 animate-pulse">
          <div className="aspect-square bg-gray-100 rounded-3xl" />
          <div className="space-y-4">
            <div className="h-4 bg-gray-100 rounded w-1/4" />
            <div className="h-8 bg-gray-100 rounded w-3/4" />
            <div className="h-6 bg-gray-100 rounded w-1/3" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <p className="text-xl text-gray-400">Product not found</p>
        <Link href="/products" className="text-brand-600 mt-4 inline-block">
          ← Back to products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-8">
        <Link href="/products" className="hover:text-brand-600">Products</Link>
        <span>/</span>
        <span className="text-midnight-800">{product.name}</span>
      </div>

      <div className="grid md:grid-cols-2 gap-12">
        {/* Product Image */}
        <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl flex items-center justify-center overflow-hidden">
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <span className="font-display text-8xl text-gray-200">{product.name.charAt(0)}</span>
          )}
          {product.compare_at_price && (
            <span className="absolute top-6 left-6 bg-brand-600 text-white text-sm font-bold px-3 py-1.5 rounded-full">
              {Math.round(
                ((product.compare_at_price - product.price) /
                  product.compare_at_price) *
                  100
              )}
              % OFF
            </span>
          )}
        </div>

        {/* Product Info */}
        <div>
          <p className="text-sm text-gray-400 uppercase tracking-wider mb-2">
            {product.category?.name}
          </p>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-midnight-950 mb-3">
            {product.name}
          </h1>

          {/* Rating */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg
                  key={star}
                  className={`w-5 h-5 ${
                    star <= Math.round(avgRating)
                      ? "text-amber-400"
                      : "text-gray-200"
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-sm text-gray-500">
              {avgRating.toFixed(1)} ({reviews.length} reviews)
            </span>
          </div>

          {/* Price */}
          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl font-bold text-midnight-950">
              ${product.price.toFixed(2)}
            </span>
            {product.compare_at_price && (
              <span className="text-xl text-gray-400 line-through">
                ${product.compare_at_price.toFixed(2)}
              </span>
            )}
          </div>

          <p className="text-gray-600 mb-8 leading-relaxed">
            {product.description}
          </p>

          {/* Size selector */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="mb-6">
              <p className="text-sm font-medium text-midnight-800 mb-2">Size</p>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all ${
                      selectedSize === size
                        ? "border-midnight-950 bg-midnight-950 text-white"
                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Color selector */}
          {product.colors && product.colors.length > 0 && (
            <div className="mb-6">
              <p className="text-sm font-medium text-midnight-800 mb-2">
                Color: {selectedColor}
              </p>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all ${
                      selectedColor === color
                        ? "border-midnight-950 bg-midnight-50 text-midnight-950"
                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity & Add to Cart */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center border-2 border-gray-200 rounded-xl">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-4 py-3 text-gray-500 hover:text-midnight-950"
              >
                −
              </button>
              <span className="px-4 py-3 font-medium text-midnight-950 min-w-[3rem] text-center">
                {quantity}
              </span>
              <button
                onClick={() =>
                  setQuantity(Math.min(product.stock, quantity + 1))
                }
                className="px-4 py-3 text-gray-500 hover:text-midnight-950"
              >
                +
              </button>
            </div>
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0 || adding}
              className={`flex-1 btn py-4 rounded-xl text-base font-medium ${
                adding
                  ? "bg-green-500 text-white"
                  : product.stock === 0
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-midnight-950 text-white hover:bg-midnight-800"
              }`}
            >
              {adding
                ? "✓ Added!"
                : product.stock === 0
                ? "Out of Stock"
                : "Add to Cart"}
            </button>
          </div>

          {/* Stock info */}
          <p className="text-sm text-gray-400">
            {product.stock > 10
              ? `${product.stock} in stock`
              : product.stock > 0
              ? `Only ${product.stock} left!`
              : "Currently out of stock"}
          </p>

          {/* Shipping info */}
          <div className="mt-6 p-4 bg-gray-50 rounded-xl space-y-2 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Free standard shipping (5-7 days)
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <svg className="w-4 h-4 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Expedited shipping: +$12 (1-2 days)
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <section className="mt-16 border-t border-gray-200 pt-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-display text-2xl font-bold text-midnight-950">
            Customer Reviews ({reviews.length})
          </h2>
          <button
            onClick={() => setShowReviewForm(!showReviewForm)}
            className="btn-secondary"
          >
            Write a Review
          </button>
        </div>

        {/* Review Form */}
        {showReviewForm && (
          <form
            onSubmit={handleSubmitReview}
            className="mb-8 p-6 bg-white rounded-2xl border border-gray-100"
          >
            <h3 className="font-medium text-midnight-950 mb-4">Your Review</h3>
            <div className="mb-4">
              <p className="text-sm font-medium text-midnight-800 mb-2">
                Rating
              </p>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() =>
                      setReviewForm({ ...reviewForm, rating: star })
                    }
                    className="p-1"
                  >
                    <svg
                      className={`w-7 h-7 ${
                        star <= reviewForm.rating
                          ? "text-amber-400"
                          : "text-gray-200"
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-4">
              <textarea
                value={reviewForm.comment}
                onChange={(e) =>
                  setReviewForm({ ...reviewForm, comment: e.target.value })
                }
                placeholder="Share your thoughts about this product..."
                rows={4}
                className="w-full"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submittingReview}
                className="btn-primary"
              >
                {submittingReview ? "Submitting..." : "Submit Review"}
              </button>
              <button
                type="button"
                onClick={() => setShowReviewForm(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Reviews List */}
        {reviews.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
            <p className="text-gray-400">
              No reviews yet. Be the first to review this product!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="p-6 bg-white rounded-2xl border border-gray-100"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-sm font-bold">
                      {review.profiles?.full_name?.charAt(0) || "?"}
                    </div>
                    <div>
                      <p className="font-medium text-midnight-950 text-sm">
                        {review.profiles?.full_name || "Anonymous"}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(review.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        className={`w-4 h-4 ${
                          star <= review.rating
                            ? "text-amber-400"
                            : "text-gray-200"
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
                {review.comment && (
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {review.comment}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
