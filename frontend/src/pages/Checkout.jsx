import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  useStripe,
  useElements,
  PaymentElement,
  Elements
} from "@stripe/react-stripe-js";
import { stripePromise } from "../stripe/stripeConfig";

import API_BASE_URL from "../utils/api";

const CheckoutForm = ({ clientSecret }) => {
  const [cart, setCart] = useState([]);
  const [form, setForm] = useState({ name: "", address: "" });
  const [msg, setMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
    setCart(storedCart);
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    if (!form.name.trim() || !form.address.trim()) {
      setMsg("Name and address are required.");
      return;
    }

    setSubmitting(true);

    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: "https://quickcart-frontend.netlify.app/order-success",
      },
    });

    if (result.error) {
      setMsg(result.error.message || "Payment failed.");
      setSubmitting(false);
    }
  };

  const getTotal = () =>
    cart.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-semibold mb-1">Name</label>
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded"
          placeholder="Full name"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-semibold mb-1">Address</label>
        <textarea
          name="address"
          value={form.address}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded"
          placeholder="Shipping address"
          required
        />
      </div>

      <div className="border-t pt-4">
        <PaymentElement />
      </div>

      <div className="font-bold mt-4 text-right">Total: ${getTotal()}</div>

      <button
        type="submit"
        disabled={!stripe || submitting}
        className={`w-full bg-green-600 text-white p-2 rounded hover:bg-green-700 transition ${
          submitting ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        {submitting ? "Processing..." : "Pay Now"}
      </button>

      {msg && (
        <p className="text-center text-sm mt-3 text-red-600 font-medium">{msg}</p>
      )}
    </form>
  );
};

const Checkout = () => {
  const [clientSecret, setClientSecret] = useState("");
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();

  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    if (!user) {
      navigate("/login", { state: { from: "/checkout" } });
    } else if (cart.length === 0) {
      navigate("/cart");
    } else {
      axios
        .post(`${API_BASE_URL}/api/payments/create-payment-intent`, {
          amount: total,
        })
        .then((res) => {
          setClientSecret(res.data.clientSecret);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Stripe init failed:", err);
          setLoading(false);
        });
    }
  }, []);

  if (loading) {
    return <div className="text-center mt-10 text-lg">Preparing checkout...</div>;
  }

  if (!clientSecret) {
    return <div className="text-center mt-10 text-red-600">Failed to initiate payment.</div>;
  }

  return (
    <div className="p-8 bg-gray-100 min-h-screen flex justify-center items-start">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-6 text-center">Checkout</h2>
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <CheckoutForm clientSecret={clientSecret} />
        </Elements>
      </div>
    </div>
  );
};

export default Checkout;
