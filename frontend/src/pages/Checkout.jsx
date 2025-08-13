import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  useStripe,
  useElements,
  PaymentElement,
  Elements,
} from "@stripe/react-stripe-js";
import { stripePromise } from "../stripe/stripeConfig";
import API_BASE_URL from "../utils/api";

/* ---------- Helpers ---------- */
const useCart = () => {
  const [cart, setCart] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("cart")) || [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart(stored);
  }, []);

  const subtotal = useMemo(
    () => cart.reduce((sum, i) => sum + Number(i.price || 0) * Number(i.quantity || 1), 0),
    [cart]
  );
  const shipping = subtotal >= 30 ? 0 : 4.99; // free shipping threshold to match the banner
  const total = Number((subtotal + shipping).toFixed(2));

  return { cart, subtotal: Number(subtotal.toFixed(2)), shipping, total };
};

const getItemImage = (img) => {
  if (!img) return "/placeholder.jpg";
  if (typeof img === "string") {
    if (/^https?:\/\//i.test(img)) return img;
    // If your server serves /images, API_BASE_URL + path works:
    return `${API_BASE_URL}${img.startsWith("/") ? "" : "/"}${img}`;
  }
  if (img?.url) return img.url;
  return "/placeholder.jpg";
};

/* ---------- Form (left column) ---------- */
const CheckoutForm = ({ clientSecret }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const { cart, subtotal, shipping, total } = useCart();

  const [form, setForm] = useState(() => {
    // optionally restore previous shipping info
    try {
      return JSON.parse(localStorage.getItem("shipping")) || { name: "", address: "" };
    } catch {
      return { name: "", address: "" };
    }
  });
  const [msg, setMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  })();

  const handleChange = (e) => {
    setMsg("");
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    if (!form.name.trim() || !form.address.trim()) {
      setMsg("Name and address are required.");
      return;
    }
    setSubmitting(true);
    localStorage.setItem("shipping", JSON.stringify(form));

    // Provide billing details to Stripe for better receipts & risk checks
    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        payment_method_data: {
          billing_details: {
            name: form.name.trim(),
            email: user?.email,
            address: { line1: form.address.trim() },
          },
        },
        return_url: `${window.location.origin}/order-success`,
      },
    });

    if (result.error) {
      setMsg(result.error.message || "Payment failed.");
      setSubmitting(false);
    }
    // On success, Stripe will redirect to /order-success
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium mb-1">Full Name</label>
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg"
          placeholder="Jane Doe"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Address</label>
        <textarea
          name="address"
          value={form.address}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg"
          placeholder="123 Market St, City, State"
          rows={3}
          required
        />
      </div>

      <div className="border-t pt-4">
        <PaymentElement />
      </div>

      <div className="text-right text-sm text-gray-600">
        Subtotal: <span className="font-medium">${subtotal.toFixed(2)}</span>
        <span className="mx-2">•</span>
        Shipping:{" "}
        <span className="font-medium">
          {shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}
        </span>
        <div className="text-lg font-bold mt-1">Total: ${total.toFixed(2)}</div>
      </div>

      <button
        type="submit"
        disabled={!stripe || submitting}
        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold px-5 py-3 rounded-lg"
      >
        {submitting ? "Processing…" : "Pay Now"}
      </button>

      {msg && (
        <div className="border rounded-lg px-4 py-3 text-sm bg-red-50 text-red-700 border-red-200">
          {msg}
        </div>
      )}

      <div className="text-center">
        <Link to="/cart" className="text-sm text-indigo-600 hover:underline">
          Back to cart
        </Link>
      </div>
    </form>
  );
};

/* ---------- Page shell (two-column layout) ---------- */
const Checkout = () => {
  const [clientSecret, setClientSecret] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { cart, subtotal, shipping, total } = useCart();

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  })();

  useEffect(() => {
    const init = async () => {
      if (!user) {
        navigate("/login", { state: { from: "/checkout" } });
        return;
      }
      if (cart.length === 0) {
        navigate("/cart");
        return;
      }

      try {
        const res = await axios.post(`${API_BASE_URL}/api/payments/create-payment-intent`, {
          amount: total, // keep as your backend expects (your original code sent total)
        });
        setClientSecret(res.data.clientSecret);
      } catch (err) {
        console.error("Stripe init failed:", err);
      } finally {
        setLoading(false);
      }
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <main className="bg-gray-50 min-h-screen">
        <div className="max-w-6xl mx-auto px-4 py-10">
          <div className="grid gap-6 md:grid-cols-[1fr_360px]">
            <div className="bg-white rounded-xl p-6 ring-1 ring-black/5 shadow animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-4" />
              <div className="h-10 bg-gray-200 rounded mb-3" />
              <div className="h-24 bg-gray-200 rounded mb-3" />
              <div className="h-10 bg-gray-200 rounded" />
            </div>
            <div className="bg-white rounded-xl p-6 ring-1 ring-black/5 shadow animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/2 mb-3" />
              <div className="h-24 bg-gray-200 rounded" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!clientSecret) {
    return (
      <main className="bg-gray-50 min-h-screen">
        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <div className="bg-white rounded-xl p-10 ring-1 ring-black/5 shadow">
            <h2 className="text-xl font-semibold mb-2 text-red-600">
              Failed to initiate payment.
            </h2>
            <p className="text-gray-600">
              Please return to your cart and try again.
            </p>
            <Link to="/cart" className="inline-block mt-4 text-indigo-600 hover:underline">
              Back to cart
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-extrabold text-slate-900 mb-4">Checkout</h1>

        <div className="grid gap-6 md:grid-cols-[1fr_360px]">
          {/* Left: Payment & shipping form */}
          <div className="bg-white rounded-xl p-6 ring-1 ring-black/5 shadow-[0_1px_2px_rgba(0,0,0,0.06),0_10px_20px_rgba(0,0,0,0.06)]">
            <Elements
              stripe={stripePromise}
              options={{
                clientSecret,
                appearance: {
                  theme: "stripe",
                  variables: {
                    colorPrimary: "#4f46e5",
                    fontFamily: "Inter, system-ui, sans-serif",
                    borderRadius: "8px",
                  },
                },
              }}
            >
              <CheckoutForm clientSecret={clientSecret} />
            </Elements>
          </div>

          {/* Right: Order summary */}
          <aside className="bg-white rounded-xl p-6 ring-1 ring-black/5 shadow-[0_1px_2px_rgba(0,0,0,0.06),0_10px_20px_rgba(0,0,0,0.06)] h-fit">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>

            <ul className="divide-y divide-gray-200 mb-4">
              {cart.map((item) => (
                <li key={item._id} className="py-3 flex items-center gap-3">
                  <img
                    src={getItemImage(item.image)}
                    alt={item.name}
                    className="h-12 w-12 object-contain rounded bg-white ring-1 ring-black/5"
                    onError={(e) => (e.currentTarget.src = "/placeholder.jpg")}
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium line-clamp-1">{item.name}</div>
                    <div className="text-xs text-gray-500">Qty {item.quantity}</div>
                  </div>
                  <div className="text-sm font-semibold">
                    ${(Number(item.price) * Number(item.quantity)).toFixed(2)}
                  </div>
                </li>
              ))}
            </ul>

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
              Free shipping on orders over $30.
            </p>
          </aside>
        </div>
      </div>
    </main>
  );
};

export default Checkout;
