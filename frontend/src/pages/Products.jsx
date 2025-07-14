import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../utils/api"; 

const Products = () => {
  const [products, setProducts] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/api/products`)
      .then((res) => setProducts(res.data))
      .catch((err) => console.error("Error fetching products:", err));

    if (user) {
      axios
        .get(`${API_BASE_URL}/api/users/${user.id}/favorites`)
        .then((res) => setFavorites(res.data.favorites.map((f) => f._id)))
        .catch((err) => console.error("Error fetching favorites:", err));
    }
  }, [user]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    try {
      await axios.delete(`${API_BASE_URL}/api/products/${id}`);
      setProducts(products.filter((p) => p._id !== id));
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete product");
    }
  };

  const toggleFavorite = async (productId) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/api/users/${user.id}/favorites`, {
        productId,
      });
      setFavorites(res.data.favorites);
      localStorage.setItem("user", JSON.stringify({ ...user, favorites: res.data.favorites }));
    } catch (err) {
      console.error("Favorite toggle failed", err);
    }
  };

  const isFavorite = (id) => favorites.includes(id);

  const addToCart = (product) => {
    const existingCart = JSON.parse(localStorage.getItem("cart")) || [];
    const existingItem = existingCart.find((item) => item._id === product._id);

    const updatedCart = existingItem
      ? existingCart.map((item) =>
          item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
        )
      : [...existingCart, { ...product, quantity: 1 }];

    localStorage.setItem("cart", JSON.stringify(updatedCart));
    alert(`${product.name} added to cart`);
  };

  const getProductImage = (filename) => {
    return filename ? `${API_BASE_URL}${filename}` : "/placeholder.jpg";
  };

  return (
    <div className="bg-white min-h-screen p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">All Products</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {products.map((product) => (
          <div key={product._id} className="bg-white rounded shadow p-4 relative">
            <img
              src={getProductImage(product.image)}
              alt={product.name}
              className="w-full h-40 object-contain mb-4 rounded bg-white"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/placeholder.jpg";
              }}
            />
            <h3 className="text-xl font-semibold">{product.name}</h3>
            <p className="text-gray-600">{product.description}</p>
            <p className="text-green-600 font-bold mt-2">${product.price}</p>

            {user && (
              <button
                onClick={() => toggleFavorite(product._id)}
                className={`absolute top-2 right-2 text-2xl ${
                  isFavorite(product._id)
                    ? "text-red-500"
                    : "text-gray-300 hover:text-red-400"
                }`}
                title={isFavorite(product._id) ? "Remove from favorites" : "Add to favorites"}
              >
                ♥
              </button>
            )}

            <div className="mt-4 flex flex-wrap gap-2">
              {localStorage.getItem("token") && (
                <>
                  <button
                    onClick={() => navigate(`/edit-product/${product._id}`)}
                    className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(product._id)}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </>
              )}
              <button
                onClick={() => addToCart(product)}
                className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
              >
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Products;
