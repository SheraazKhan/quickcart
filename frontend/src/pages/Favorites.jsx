import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import API_BASE_URL from "../utils/api";

const Favorites = () => {
  // read user safely
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  })();
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]); // array of product objects

  // image helper (supports: string path, cloudinary {url}, or full URL)
  const getProductImage = (img) => {
    if (!img) return "/placeholder.jpg";
    if (typeof img === "string") {
      if (/^https?:\/\//i.test(img)) return img;
      return `${API_BASE_URL}${img.startsWith("/") ? "" : "/"}${img}`;
    }
    if (img?.url) return img.url;
    return "/placeholder.jpg";
  };

  // add to cart
  const addToCart = (product) => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const idx = cart.findIndex((i) => i._id === product._id);
    if (idx >= 0) cart[idx].quantity += 1;
    else cart.push({ ...product, quantity: 1 });
    localStorage.setItem("cart", JSON.stringify(cart));
    navigate("/cart");
  };

  useEffect(() => {
    if (!user) return;
    let mounted = true;

    const fetchFavorites = async () => {
      setLoading(true);
      try {
        const favRes = await axios.get(
          `${API_BASE_URL}/api/users/${user.id}/favorites`,
          { headers: token ? { Authorization: `Bearer ${token}` } : {} }
        );
        const raw = favRes.data?.favorites || [];

        // If API returns IDs, fetch product details; if it returns objects, use them directly.
        let items = [];
        if (raw.length && typeof raw[0] === "string") {
          const results = await Promise.all(
            raw.map((id) =>
              axios.get(`${API_BASE_URL}/api/products/${id}`).then((r) => r.data)
            )
          );
          items = results;
        } else {
          items = raw; // assume populated products
        }

        if (mounted) setFavorites(items);
      } catch (err) {
        console.error("Failed to fetch favorites:", err);
        if (mounted) setFavorites([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchFavorites();
    return () => {
      mounted = false;
    };
  }, [user, token]);

  const removeFavorite = async (productId) => {
    if (!user) return;
    try {
      // optimistic update
      setFavorites((prev) => prev.filter((p) => p._id !== productId));

      const res = await axios.post(
        `${API_BASE_URL}/api/users/${user.id}/favorites`,
        { productId },
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );

      // If server returns the list, you could resync here if you want:
      // const normalized = (res.data?.favorites || []).map(f => typeof f === "string" ? f : f?._id);
      // (We keep the optimistic list for snappy UX.)
      localStorage.setItem("user", JSON.stringify({ ...user, favorites: res.data?.favorites || [] }));
    } catch (err) {
      console.error("Failed to remove favorite:", err);
      // (Optional) revert on error by reloading:
      // window.location.reload();
    }
  };

  if (!user) {
    return (
      <main className="bg-gray-50 min-h-screen">
        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <div className="bg-white rounded-xl p-10 ring-1 ring-black/5 shadow-[0_1px_2px_rgba(0,0,0,0.06),0_10px_20px_rgba(0,0,0,0.06)]">
            <h2 className="text-xl font-semibold mb-2">Please log in to view your favorites</h2>
            <p className="text-gray-600 mb-6">Sign in to see and manage your saved products.</p>
            <Link
              to="/login"
              className="inline-flex items-center justify-center px-5 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
            >
              Go to Login
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-900">Your Favorites</h2>
          {favorites.length > 0 && (
            <Link
              to="/products"
              className="text-sm text-indigo-600 hover:underline"
            >
              Browse more products
            </Link>
          )}
        </div>

        {/* Loading skeleton */}
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-xl p-4 ring-1 ring-black/5 shadow-[0_1px_2px_rgba(0,0,0,0.06),0_10px_20px_rgba(0,0,0,0.06)] animate-pulse"
              >
                <div className="h-40 bg-gray-200 rounded mb-4" />
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : favorites.length === 0 ? (
          <div className="bg-white rounded-xl p-10 text-center ring-1 ring-black/5 shadow-[0_1px_2px_rgba(0,0,0,0.06),0_10px_20px_rgba(0,0,0,0.06)]">
            <h3 className="font-semibold text-lg">No favorites yet</h3>
            <p className="text-gray-600 mt-1">Start exploring and add products to your favorites.</p>
            <Link
              to="/products"
              className="inline-flex items-center justify-center mt-4 px-5 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
            {favorites.map((p) => (
              <div
                key={p._id}
                className="bg-white rounded-xl ring-1 ring-black/5 shadow-[0_1px_2px_rgba(0,0,0,0.06),0_10px_20px_rgba(0,0,0,0.06)] overflow-hidden"
              >
                <div className="p-3">
                  <img
                    src={getProductImage(p.image)}
                    alt={p.name}
                    className="w-full h-44 object-contain bg-white rounded-lg"
                    onError={(e) => (e.currentTarget.src = "/placeholder.jpg")}
                  />
                </div>
                <div className="px-4 pb-4">
                  <div className="text-xs text-gray-500">
                    {(p.countInStock ?? 0) > 0 ? "In stock" : "Out of stock"}
                  </div>
                  <h3 className="font-semibold mt-1 line-clamp-1">{p.name}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2">{p.description}</p>

                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-lg font-bold">
                      ${Number(p.price || 0).toFixed(2)}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => removeFavorite(p._id)}
                        className="px-3 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-semibold"
                      >
                        Remove
                      </button>
                      <button
                        onClick={() => addToCart(p)}
                        className="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold"
                      >
                        Add to cart
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default Favorites;
