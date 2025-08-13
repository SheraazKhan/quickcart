import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import API_BASE_URL from "../utils/api";
import FiltersSidebar from "../components/FiltersSidebar";

const Products = () => {
  const navigate = useNavigate();
  const { search } = useLocation();

  // URL params: ?search=...&category=...
  const params = new URLSearchParams(search);
  const query = (params.get("search") || "").trim().toLowerCase();
  const categoryParam = (params.get("category") || "").trim().toLowerCase();

  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [favorites, setFavorites] = useState([]); // array of product _ids
  const [sort, setSort] = useState("popular");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 0 });

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  })();
  const token = localStorage.getItem("token");

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    const fetchAll = async () => {
      try {
        const [prodRes, favRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/products`),
          user
            ? axios.get(`${API_BASE_URL}/api/users/${user.id}/favorites`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
              })
            : Promise.resolve({ data: { favorites: [] } }),
        ]);

        if (!mounted) return;

        setProducts(Array.isArray(prodRes.data) ? prodRes.data : []);
        // normalize favorites to array of ids
        const favs = (favRes.data?.favorites || []).map((f) =>
          typeof f === "string" ? f : f?._id
        );
        setFavorites(favs);
      } catch (err) {
        console.error("Error fetching products/favorites:", err);
        setProducts([]);
        setFavorites([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchAll();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [API_BASE_URL, user?.id, token]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/products/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete product");
    }
  };

  const toggleFavorite = async (productId) => {
    if (!user) {
      navigate("/login");
      return;
    }
    try {
      // optimistic update
      setFavorites((prev) =>
        prev.includes(productId)
          ? prev.filter((id) => id !== productId)
          : [...prev, productId]
      );

      const res = await axios.post(
        `${API_BASE_URL}/api/users/${user.id}/favorites`,
        { productId },
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );

      const normalized =
        res.data?.favorites?.map((f) => (typeof f === "string" ? f : f?._id)) ||
        [];
      setFavorites(normalized);
      localStorage.setItem(
        "user",
        JSON.stringify({ ...user, favorites: normalized })
      );
    } catch (err) {
      console.error("Favorite toggle failed", err);
      // revert optimistic on error
      setFavorites((prev) =>
        prev.includes(productId)
          ? prev.filter((id) => id !== productId)
          : [...prev, productId]
      );
    }
  };

  const addToCart = (product) => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const idx = cart.findIndex((i) => i._id === product._id);
    if (idx >= 0) cart[idx].quantity += 1;
    else cart.push({ ...product, quantity: 1 });
    localStorage.setItem("cart", JSON.stringify(cart));
    alert(`${product.name} added to cart`);
  };

  const getProductImage = (img) => {
    if (!img) return "/placeholder.jpg";
    // Support: string path ("/images/x.jpg"), object {url}, or full URL
    if (typeof img === "string") {
      if (/^https?:\/\//i.test(img)) return img;
      return `${API_BASE_URL}${img.startsWith("/") ? "" : "/"}${img}`;
    }
    if (img?.url) return img.url;
    return "/placeholder.jpg";
  };

  // Build brand list
  const allBrands = useMemo(
    () =>
      Array.from(
        new Set(
          products
            .map((p) => (p.brand || p.manufacturer || "").toString().trim())
            .filter(Boolean)
        )
      ).sort(),
    [products]
  );

  // Filter & sort
  const filtered = useMemo(() => {
    let list = [...products];

    if (categoryParam) {
      list = list.filter((p) =>
        (p.category || "").toLowerCase().includes(categoryParam)
      );
    }
    if (query) {
      const q = query.toLowerCase();
      list = list.filter((p) => {
        const fields = [
          p.name,
          p.description,
          p.category,
          p.brand,
          p.manufacturer,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return fields.includes(q);
      });
    }
    if (inStockOnly) list = list.filter((p) => (p.countInStock ?? 0) > 0);
    if (selectedBrands.length) {
      list = list.filter((p) => selectedBrands.includes(p.brand || p.manufacturer));
    }
    // Price range
    if (priceRange.min > 0 || priceRange.max > 0) {
      const min = Number(priceRange.min) || 0;
      const max = Number(priceRange.max) || Number.POSITIVE_INFINITY;
      list = list.filter((p) => {
        const price = Number(p.price || 0);
        return price >= min && price <= max;
      });
    }

    if (sort === "price-asc") list.sort((a, b) => (a.price || 0) - (b.price || 0));
    if (sort === "price-desc") list.sort((a, b) => (b.price || 0) - (a.price || 0));
    // "popular" => leave original order

    return list;
  }, [
    products,
    query,
    categoryParam,
    inStockOnly,
    selectedBrands,
    sort,
    priceRange.min,
    priceRange.max,
  ]);

  const isFavorite = (id) => favorites.includes(id);

  // UI helpers
  const Heart = ({ filled }) => (
    <svg
      viewBox="0 0 24 24"
      className={`h-6 w-6 ${filled ? "fill-red-500" : "fill-none"} stroke-red-500`}
      strokeWidth="2"
    >
      <path d="M12 21s-7.364-4.455-9.428-8.571C.13 9.23 1.63 6 4.714 6c1.9 0 3.238 1.143 4.286 2.571C10.048 7.143 11.386 6 13.286 6 16.37 6 17.87 9.23 21.428 12.429 19.364 16.545 12 21 12 21z" />
    </svg>
  );

  return (
    <main className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
        {/* Sidebar */}
        <FiltersSidebar
          brands={allBrands}
          selectedBrands={selectedBrands}
          setSelectedBrands={setSelectedBrands}
          inStockOnly={inStockOnly}
          setInStockOnly={setInStockOnly}
          sort={sort}
          setSort={setSort}
          priceRange={priceRange}
          setPriceRange={setPriceRange}
          onClear={() => {
            setSelectedBrands([]);
            setInStockOnly(false);
            setSort("popular");
            setPriceRange({ min: 0, max: 0 });
          }}
        />

        {/* Content */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-gray-600">
              Showing {filtered.length} product{filtered.length !== 1 ? "s" : ""}
              {query && (
                <span>
                  {" "}
                  for <span className="font-semibold">“{query}”</span>
                </span>
              )}
              {categoryParam && (
                <span>
                  {" "}
                  in <span className="font-semibold">{categoryParam}</span>
                </span>
              )}
            </div>
            <button
              className="text-sm text-indigo-600 hover:underline"
              onClick={() => navigate("/products")}
            >
              Clear filters
            </button>
          </div>

          {/* Grid */}
          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.06),0_10px_20px_rgba(0,0,0,0.06)] ring-1 ring-black/5 p-4 animate-pulse"
                >
                  <div className="h-40 bg-gray-200 rounded mb-4" />
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-xl p-10 text-center text-gray-600 ring-1 ring-black/5">
              No products found.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
              {filtered.map((product) => (
                <div
                  key={product._id}
                  className="relative bg-white rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.06),0_10px_20px_rgba(0,0,0,0.06)] ring-1 ring-black/5 overflow-hidden"
                >
                  {/* Favorite */}
                  <button
                    onClick={() => toggleFavorite(product._id)}
                    title={
                      isFavorite(product._id)
                        ? "Remove from favorites"
                        : "Add to favorites"
                    }
                    className="absolute top-3 right-3 rounded-full bg-white/90 p-1.5 shadow ring-1 ring-black/5"
                  >
                    <Heart filled={isFavorite(product._id)} />
                  </button>

                  {/* Image */}
                  <div className="p-3">
                    <img
                      src={getProductImage(product.image)}
                      alt={product.name}
                      className="w-full h-44 object-contain bg-white rounded-lg"
                      onError={(e) => (e.currentTarget.src = "/placeholder.jpg")}
                    />
                  </div>

                  {/* Body */}
                  <div className="px-4 pb-4">
                    <div className="text-xs text-gray-500">
                      {(product.countInStock ?? 0) > 0 ? "In stock" : "Out of stock"}
                    </div>
                    <h3 className="font-semibold mt-1 line-clamp-1">{product.name}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {product.description}
                    </p>

                    {/* Actions — Option A */}
                    <div className="mt-3">
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold">
                          ${Number(product.price || 0).toFixed(2)}
                        </span>

                        {token && (
                          <div className="flex items-center gap-1">
                            {/* Edit (icon) */}
                            <button
                              onClick={() => navigate(`/edit-product/${product._id}`)}
                              title="Edit"
                              className="p-2 rounded-md bg-yellow-500/90 hover:bg-yellow-600 text-white ring-1 ring-black/5"
                            >
                              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                              </svg>
                            </button>
                            {/* Delete (icon) */}
                            <button
                              onClick={() => handleDelete(product._id)}
                              title="Delete"
                              className="p-2 rounded-md bg-red-500/90 hover:bg-red-600 text-white ring-1 ring-black/5"
                            >
                              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                                <path d="M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                              </svg>
                            </button>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => addToCart(product)}
                        className="mt-3 w-full px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold"
                      >
                        Add to cart
                      </button>
                    </div>
                    {/* /Actions */}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
};

export default Products;
