import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const FREE_SHIPPING_THRESHOLD = 30;
const SHIPPING_FEE = 4.99;

const Cart = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("cart")) || [];
    } catch {
      return [];
    }
  });

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  })();

  // Keep in sync if something else updates localStorage (optional quality-of-life)
  useEffect(() => {
    const onStorage = () => {
      try {
        const stored = JSON.parse(localStorage.getItem("cart")) || [];
        setCart(stored);
      } catch {}
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const persist = (next) => {
    setCart(next);
    localStorage.setItem("cart", JSON.stringify(next));
  };

  const updateQuantity = (id, delta) => {
    const next = cart
      .map((item) => {
        if (item._id !== id) return item;
        const qty = Number(item.quantity || 1) + delta;
        return qty <= 0 ? null : { ...item, quantity: qty };
      })
      .filter(Boolean);
    persist(next);
  };

  const removeItem = (id) => {
    persist(cart.filter((item) => item._id !== id));
  };

  const clearCart = () => {
    persist([]);
  };

  const subtotal = useMemo(
    () =>
      cart.reduce(
        (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1),
        0
      ),
    [cart]
  );

  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : SHIPPING_FEE;
  const total = useMemo(() => Number((subtotal + shipping).toFixed(2)), [subtotal, shipping]);

  const proceedToCheckout = () => {
    navigate("/checkout");
  };

  const getItemImage = (img) => {
    if (!img) return "/placeholder.jpg";
    if (typeof img === "string") {
      if (/^https?:\/\//i.test(img)) return img;
      // If your backend serves /images, this path will still work since you saved full URLs in cart in other pages
      return img.startsWith("/") ? img : `/${img}`;
    }
    if (img?.url) return img.url;
    return "/placeholder.jpg";
  };

  return (
    <main className="bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-extrabold text-slate-900 mb-4">Your Cart</h1>

        {cart.length === 0 ? (
          <div className="bg-white rounded-xl p-10 text-center ring-1 ring-black/5 shadow-[0_1px_2px_rgba(0,0,0,0.06),0_10px_20px_rgba(0,0,0,0.06)]">
            <h3 className="font-semibold text-lg">Your cart is empty</h3>
            <p className="text-gray-600 mt-1">
              Browse products and add items to your cart.
            </p>
            <Link
              to="/products"
              className="inline-flex items-center justify-center mt-4 px-5 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-[1fr_360px]">
            {/* Left: items list */}
            <section className="bg-white rounded-xl p-6 ring-1 ring-black/5 shadow-[0_1px_2px_rgba(0,0,0,0.06),0_10px_20px_rgba(0,0,0,0.06)]">
              <ul className="divide-y divide-gray-200">
                {cart.map((item) => (
                  <li key={item._id} className="py-4 flex items-center gap-4">
                    <img
                      src={getItemImage(item.image)}
                      alt={item.name}
                      className="h-16 w-16 object-contain rounded bg-white ring-1 ring-black/5"
                      onError={(e) => (e.currentTarget.src = "/placeholder.jpg")}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium line-clamp-1">{item.name}</div>
                      <div className="text-xs text-gray-500">
                        ${(Number(item.price) || 0).toFixed(2)} each
                      </div>
                      <div className="mt-2 inline-flex items-center rounded-lg border border-gray-200">
                        <button
                          onClick={() => updateQuantity(item._id, -1)}
                          className="px-3 py-1.5 text-sm hover:bg-gray-50"
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>
                        <span className="px-4 py-1.5 text-sm border-x border-gray-200 select-none">
                          {Number(item.quantity || 1)}
                        </span>
                        <button
                          onClick={() => updateQuantity(item._id, 1)}
                          className="px-3 py-1.5 text-sm hover:bg-gray-50"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold">
                        ${(Number(item.price) * Number(item.quantity)).toFixed(2)}
                      </div>
                      <button
                        onClick={() => removeItem(item._id)}
                        className="mt-2 text-sm text-red-600 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="mt-4 flex items-center justify-between">
                <Link to="/products" className="text-sm text-indigo-600 hover:underline">
                  ← Continue shopping
                </Link>
                <button
                  type="button"
                  onClick={clearCart}
                  className="text-sm text-gray-600 hover:underline"
                >
                  Clear cart
                </button>
              </div>
            </section>

            {/* Right: summary */}
            <aside className="bg-white rounded-xl p-6 ring-1 ring-black/5 shadow-[0_1px_2px_rgba(0,0,0,0.06),0_10px_20px_rgba(0,0,0,0.06)] h-fit">
              <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">
                    {shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between text-base font-bold pt-2 border-t">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              <p className="text-xs text-gray-500 mt-3">
                Free shipping on orders over ${FREE_SHIPPING_THRESHOLD}.
              </p>

              {user ? (
                <button
                  onClick={proceedToCheckout}
                  className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-3 rounded-lg"
                >
                  Proceed to Checkout
                </button>
              ) : (
                <button
                  onClick={() => navigate("/login", { state: { from: "/checkout" } })}
                  className="w-full mt-4 bg-gray-800 hover:bg-gray-900 text-white font-semibold px-5 py-3 rounded-lg"
                >
                  Login to Checkout
                </button>
              )}
            </aside>
          </div>
        )}
      </div>
    </main>
  );
};

export default Cart;
