import React from "react";
import { Link } from "react-router-dom";


import heroImage from "../assets/images/hero.jpg";
import deliveryIcon from "../assets/images/delivery.png";
import discountIcon from "../assets/images/discount.png";
import supportIcon from "../assets/images/support.png";

const Home = () => {
  return (
    <div className="bg-gray-50">
      
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

      
      <section className="py-12 px-6 bg-gray-100">
        <div className="max-w-6xl mx-auto text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800">Featured Products</h2>
          <p className="text-gray-600 mt-2">Popular picks from our store</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white p-4 rounded shadow hover:shadow-md transition">
              <img
                src={`https://placehold.co/300x200?text=Product+${i}`}
                alt={`Product ${i}`}
                className="mb-4 w-full h-40 object-cover rounded"
              />
              <h3 className="font-semibold text-lg">Product {i}</h3>
              <p className="text-green-600 font-bold">$29.99</p>
            </div>
          ))}
        </div>
      </section>

      
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
