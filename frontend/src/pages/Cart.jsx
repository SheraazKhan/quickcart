import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Cart = () => {
  const [cart, setCart] = useState([]);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("cart")) || [];
    setCart(stored);
  }, []);

  const updateQuantity = (id, delta) => {
    const updated = cart
      .map((item) =>
        item._id === id ? { ...item, quantity: item.quantity + delta } : item
      )
      .filter((item) => item.quantity > 0);
    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
  };

  const removeItem = (id) => {
    const updated = cart.filter((item) => item._id !== id);
    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
  };

  const getTotal = () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const proceedToCheckout = () => {
    navigate("/checkout");
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6">Your Cart</h2>
      {cart.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          {cart.map((item) => (
            <div key={item._id} className="mb-4 p-4 bg-white rounded shadow">
              <h3 className="text-xl font-semibold">{item.name}</h3>
              <p>Price: ${item.price}</p>
              <p>Quantity: {item.quantity}</p>
              <div className="space-x-2 mt-2">
                <button
                  onClick={() => updateQuantity(item._id, 1)}
                  className="px-2 bg-green-500 text-white rounded"
                >
                  +
                </button>
                <button
                  onClick={() => updateQuantity(item._id, -1)}
                  className="px-2 bg-yellow-500 text-white rounded"
                >
                  -
                </button>
                <button
                  onClick={() => removeItem(item._id)}
                  className="px-2 bg-red-500 text-white rounded"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}

          <h3 className="text-xl font-bold mt-6">Total: ${getTotal().toFixed(2)}</h3>

          {user ? (
            <button
              onClick={proceedToCheckout}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Proceed to Checkout
            </button>
          ) : (
            <button
              onClick={() => navigate("/login", { state: { from: "/checkout" } })}
              className="mt-4 bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              Login to Checkout
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default Cart;
