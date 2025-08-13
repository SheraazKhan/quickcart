import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";
import API_BASE_URL from "../utils/api";

const FREE_SHIPPING_THRESHOLD = 30;
const SHIPPING_FEE = 4.99;

const OrderSuccess = () => {
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const redirectStatus = params.get("redirect_status"); // usually "succeeded"
  const paymentIntent = params.get("payment_intent") || ""; // from Stripe return_url

  const [cartSnapshot, setCartSnapshot] = useState([]);
  const [shippingInfo, setShippingInfo] = useState({ name: "", address: "" });
  const [orderId, setOrderId] = useState("");
  const [saving, setSaving] = useState(true);

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  })();
  const token = localStorage.getItem("token");

  // Totals
  const subtotal = useMemo(
    () =>
      cartSnapshot.reduce(
        (sum, i) => sum + Number(i.price || 0) * Number(i.quantity || 1),
        0
      ),
    [cartSnapshot]
  );
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : SHIPPING_FEE;
  const total = useMemo(() => Number((subtotal + shipping).toFixed(2)), [subtotal, shipping]);

  // Try to persist order once (idempotent via paymentIntent)
  useEffect(() => {
    // 1) Take a snapshot of cart + shipping (if still present)
    const snapCart = (() => {
      try {
        return JSON.parse(localStorage.getItem("cart")) || [];
      } catch {
        return [];
      }
    })();
    const snapShip = (() => {
      try {
        return JSON.parse(localStorage.getItem("shipping")) || { name: "", address: "" };
      } catch {
        return { name: "", address: "" };
      }
    })();

    setCartSnapshot(snapCart);
    setShippingInfo(snapShip);

    // 2) Save order to backend if available, but only once for this PI
    const guardKey = paymentIntent ? `orderSaved:${paymentIntent}` : `orderSaved:once`;
    const alreadySaved = localStorage.getItem(guardKey);

    const saveOrder = async () => {
      // If nothing in cart (already cleared), just stop the spinner
      if (!snapCart.length || alreadySaved) {
        setSaving(false);
        return;
      }

      try {
        // Example payload (adjust to your API schema if needed)
        const payload = {
          items: snapCart.map((i) => ({ product: i._id, name: i.name, price: i.price, quantity: i.quantity })),
          subtotal,
          shippingFee: shipping,
          total,
          shipping: snapShip,
          paymentIntentId: paymentIntent || undefined,
        };

        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        // If your backend exposes /api/orders, keep it; otherwise this will just no-op in catch.
        const { data } = await axios.post(`${API_BASE_URL}/api/orders`, payload, { headers });

        // Try to read an order id/number if returned
        const oid = data?.order?._id || data?.orderId || data?._id || "";
        if (oid) setOrderId(String(oid));

        // mark saved and clear cart
        localStorage.setItem(guardKey, "1");
        localStorage.removeItem("cart");
      } catch (err) {
        // If no orders endpoint or any error, still clear cart to avoid duplicate charges UX
        console.warn("Order save skipped/failed:", err?.response?.data || err?.message || err);
        localStorage.setItem(guardKey, "1");
        localStorage.removeItem("cart");
      } finally {
        setSaving(false);
      }
    };

    // Only auto-save if Stripe says succeeded; otherwise just show the page
    if (redirectStatus === "succeeded" || !paymentIntent) {
      saveOrder();
    } else {
      setSaving(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="bg-gray-50 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="bg-white rounded-xl p-8 ring-1 ring-black/5 shadow-[0_1px_2px_rgba(0,0,0,0.06),0_10px_20px_rgba(0,0,0,0.06)] text-center">
          {/* Icon */}
          <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 ring-1 ring-emerald-200">
            <svg viewBox="0 0 24 24" className="h-7 w-7 text-emerald-600">
              <path
                fill="currentColor"
                d="M9 16.2l-3.5-3.5L4 14.2l5 5 11-11-1.5-1.5z"
              />
            </svg>
          </div>

          <h1 className="text-2xl font-extrabold text-slate-900">
            {redirectStatus === "succeeded" ? "Order Confirmed!" : "Thanks! We're processing your order"}
          </h1>
          <p className="text-gray-600 mt-2">
            {user?.email
              ? `A confirmation has been sent to ${user.email}.`
              : "Your order has been placed successfully."}
          </p>

          {orderId && (
            <p className="mt-1 text-sm text-gray-500">Order #<span className="font-medium">{orderId}</span></p>
          )}

          {/* Summary */}
          {cartSnapshot.length > 0 && (
            <div className="text-left mt-8">
              <h2 className="text-lg font-semibold mb-3">Order Summary</h2>

              <ul className="divide-y divide-gray-200">
                {cartSnapshot.map((item) => (
                  <li key={item._id} className="py-3 flex items-center gap-3">
                    <img
                      src={
                        typeof item.image === "string"
                          ? item.image
                          : item.image?.url || "/placeholder.jpg"
                      }
                      alt={item.name}
                      className="h-12 w-12 object-contain rounded bg-white ring-1 ring-black/5"
                      onError={(e) => (e.currentTarget.src = "/placeholder.jpg")}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium line-clamp-1">{item.name}</div>
                      <div className="text-xs text-gray-500">Qty {item.quantity}</div>
                    </div>
                    <div className="text-sm font-semibold">
                      ${(Number(item.price) * Number(item.quantity)).toFixed(2)}
                    </div>
                  </li>
                ))}
              </ul>

              <div className="mt-4 space-y-1 text-sm">
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
                {shipping === 0 && (
                  <p className="text-xs text-gray-500">Free shipping on orders over ${FREE_SHIPPING_THRESHOLD}.</p>
                )}
              </div>

              {shippingInfo?.address && (
                <div className="mt-4 text-sm">
                  <div className="text-gray-500">Ship to</div>
                  <div className="font-medium">{shippingInfo.name}</div>
                  <div className="text-gray-700">{shippingInfo.address}</div>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/orders"
              className="inline-flex items-center justify-center px-5 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
            >
              View Order History
            </Link>
            <Link
              to="/products"
              className="inline-flex items-center justify-center px-5 py-3 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 font-semibold"
            >
              Continue Shopping
            </Link>
          </div>

          {/* Saving state */}
          {saving && (
            <p className="mt-4 text-xs text-gray-500">
              Finalizing your order details…
            </p>
          )}
        </div>
      </div>
    </main>
  );
};

export default OrderSuccess;
