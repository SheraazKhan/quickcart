import React from "react";
import { Link } from "react-router-dom";

const OrderSuccess = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 text-center px-4">
      <div className="bg-white p-8 rounded shadow-md max-w-md w-full">
        <h2 className="text-3xl font-bold text-green-600 mb-4">🎉 Order Confirmed!</h2>
        <p className="text-gray-700 mb-6">
          Thank you for your purchase! Your order has been placed successfully.
        </p>
        <Link
          to="/orders"
          className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          View Order History
        </Link>
        <p className="mt-4">
          or <Link to="/" className="text-blue-600 underline">continue shopping</Link>
        </p>
      </div>
    </div>
  );
};

export default OrderSuccess;
