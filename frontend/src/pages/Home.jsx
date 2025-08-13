import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import API_BASE_URL from "../utils/api";

// keep your existing assets:
import heroImage from "../assets/images/hero.jpg";
import deliveryIcon from "../assets/images/delivery.png";
import discountIcon from "../assets/images/discount.png";
import supportIcon from "../assets/images/support.png";

const Home = () => {
  const [loading, setLoading] = useState(true);
  const [allProducts, setAllProducts] = useState([]);

  // pull products once
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await axios.get(`${API_BASE_URL}/api/products`);
        if (mounted) setAllProducts(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("Failed to load products:", e);
        if (mounted) setAllProducts([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, []);

  // choose featured (prefer items with `featured` or `isFeatured`; else take first 8)
  const featured = useMemo(() => {
    const flagged = allProducts.filter(p => p.featured || p.isFeatured);
    const base = flagged.length ? flagged : allProducts;
    return base.slice(0, 8);
  }, [allProducts]);

  const getImg = (img) => {
    if (!img) return "/placeholder.jpg";
    if (typeof img === "string") {
      if (/^https?:\/\//i.test(img)) return img;
      return `${API_BASE_URL}${img.startsWith("/") ? "" : "/"}${img}`;
    }
    if (img?.url) return img.url;
    return "/placeholder.jpg";
  };

  const addToCart = (product) => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const idx = cart.findIndex((i) => i._id === product._id);
    if (idx >= 0) cart[idx].quantity += 1;
    else cart.push({ ...product, quantity: 1 });
    localStorage.setItem("cart", JSON.stringify(cart));
  };

  return (
    <div className="bg-gray-50">
      {/* Hero */}
      <section
        className="py-20 px-4 text-center bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="bg-white bg-opacity-80 p-10 max-w-2xl mx-auto rounded shadow-md">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Welcome to QuickCart 🛒
          </h1>
          <p className="text-lg text-gray-700 mb-6">
            Your one-stop shop for fashion, electronics & more!
          </p>
          <div className="flex justify-center gap-4">
            <Link
              to="/products"
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              Shop Now
            </Link>
            <Link
              to="/register"
              className="px-6 py-2 border border-blue-600 text-blue-600 rounded hover:bg-blue-100 transition"
            >
              Create Account
            </Link>
          </div>
        </div>
      </section>

      {/* Perks */}
      <section className="py-12 px-6 bg-white">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div>
            <img src={deliveryIcon} alt="Fast Delivery" className="mx-auto mb-4 w-12" />
            <h3 className="font-bold text-lg mb-2">Fast Delivery</h3>
            <p className="text-gray-600">Get your items delivered within days!</p>
          </div>
          <div>
            <img src={discountIcon} alt="Great Deals" className="mx-auto mb-4 w-12" />
            <h3 className="font-bold text-lg mb-2">Great Deals</h3>
            <p className="text-gray-600">Enjoy discounts on top brands and items.</p>
          </div>
          <div>
            <img src={supportIcon} alt="Support" className="mx-auto mb-4 w-12" />
            <h3 className="font-bold text-lg mb-2">24/7 Support</h3>
            <p className="text-gray-600">We're here to help, anytime you need us.</p>
          </div>
        </div>
      </section>

      {/* Featured Products (live) */}
      <section className="py-12 px-6 bg-gray-100">
        <div className="max-w-6xl mx-auto text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800">Featured Products</h2>
          <p className="text-gray-600 mt-2">Popular picks from our store</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white p-4 rounded shadow ring-1 ring-black/5 animate-pulse">
                <div className="w-full h-40 rounded bg-gray-200 mb-4" />
                <div className="h-4 w-2/3 bg-gray-200 rounded mb-2" />
                <div className="h-4 w-1/3 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {featured.map((p) => (
              <div key={p._id} className="bg-white p-4 rounded shadow ring-1 ring-black/5">
                <img
                  src={getImg(p.image)}
                  alt={p.name}
                  className="mb-4 w-full h-40 object-contain rounded bg-white"
                  onError={(e) => (e.currentTarget.src = "/placeholder.jpg")}
                />
                <div className="text-xs text-gray-500">
                  {(p.countInStock ?? 0) > 0 ? "In stock" : "Out of stock"}
                </div>
                <h3 className="font-semibold line-clamp-1">{p.name}</h3>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-green-600 font-bold">${Number(p.price || 0).toFixed(2)}</span>
                  <button
                    onClick={() => addToCart(p)}
                    className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold"
                  >
                    Add to cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-center mt-8">
          <Link
            to="/products"
            className="inline-flex items-center justify-center px-5 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
          >
            Browse All Products
          </Link>
        </div>
      </section>

      {/* Newsletter */}
      <section className="bg-white py-12 px-6 text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="text-2xl font-bold mb-2">Stay Updated</h2>
          <p className="text-gray-600 mb-4">Get exclusive offers & updates in your inbox</p>
          <form className="flex flex-col sm:flex-row items-center gap-2 justify-center">
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded"
            />
            <button className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default Home;
