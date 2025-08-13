import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const [q, setQ] = useState("");

  // read user safely
  let user = null;
  try {
    const storedUser = localStorage.getItem("user");
    if (storedUser) user = JSON.parse(storedUser);
  } catch (err) {
    console.error("Failed to parse user from localStorage:", err);
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const onSearch = (e) => {
    e.preventDefault();
    if (!q.trim()) return;
    navigate(`/products?search=${encodeURIComponent(q.trim())}`);
  };

  return (
    <header className="bg-white/90 backdrop-blur sticky top-0 z-50 border-b border-slate-200">
      {/* Top row */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          
          <img src="/quickcart-logo.svg" alt="" className="h-7 hidden sm:block" />
          <span className="text-xl font-extrabold tracking-tight text-slate-900">
            QuickCart
          </span>
        </Link>

        {/* Search (desktop/tablet) */}
        <form onSubmit={onSearch} className="flex-1 hidden md:flex">
          <div className="flex w-full items-center gap-2 bg-slate-100 rounded-full px-4 py-2 focus-within:ring-2 ring-indigo-600">
            <input
              className="bg-transparent flex-1 outline-none text-sm"
              placeholder="Search for products…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <button
              type="submit"
              className="text-white bg-indigo-600 hover:bg-indigo-700 text-sm font-medium px-4 py-2 rounded-full"
            >
              Search
            </button>
          </div>
        </form>

        {/* Right-side nav */}
        <nav className="ml-auto flex items-center gap-3 text-sm">
          <Link to="/" className="font-medium text-slate-700 hover:text-indigo-600">
            Home
          </Link>
          <Link to="/products" className="font-medium text-slate-700 hover:text-indigo-600">
            Products
          </Link>
          <Link to="/favorites" className="font-medium text-slate-700 hover:text-indigo-600">
            Favorites
          </Link>
          <Link
            to="/cart"
            className="px-3 py-2 rounded-full bg-slate-100 hover:bg-slate-200 font-medium"
          >
            Cart
          </Link>

          {user ? (
            <>
              <Link
                to="/add-product"
                className="font-medium text-slate-700 hover:text-orange-600"
              >
                Add Product
              </Link>
              <Link
                to="/profile"
                className="font-medium text-slate-700 hover:text-indigo-600"
              >
                Profile
              </Link>
              <span className="hidden sm:inline text-slate-600">
                Hi, {user.name || "Guest"}
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg font-semibold"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="font-medium text-slate-700 hover:text-indigo-600">
                Login
              </Link>
              <Link
                to="/register"
                className="font-medium text-slate-700 hover:text-emerald-600"
              >
                Register
              </Link>
            </>
          )}
        </nav>
      </div>

      {/* Free shipping bar */}
      <div className="bg-slate-900 text-slate-100 text-center text-xs py-2">
        Free shipping on orders over $30
      </div>

      {/* Mobile search (optional) */}
      <div className="md:hidden px-4 py-2 border-t border-slate-200 bg-white">
        <form onSubmit={onSearch}>
          <div className="flex items-center gap-2 bg-slate-100 rounded-full px-4 py-2 focus-within:ring-2 ring-indigo-600">
            <input
              className="bg-transparent flex-1 outline-none text-sm"
              placeholder="Search for products…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <button
              type="submit"
              className="text-white bg-indigo-600 hover:bg-indigo-700 text-sm font-medium px-4 py-2 rounded-full"
            >
              Search
            </button>
          </div>
        </form>
      </div>
    </header>
  );
};

export default Navbar;
