import React, { useEffect, useState } from "react";
import axios from "axios";
import API_BASE_URL from "../utils/api";

const Favorites = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    if (user) {
      axios
        .get(`${API_BASE_URL}/api/users/${user.id}/favorites`)
        .then((res) => setFavorites(res.data.favorites))
        .catch((err) => console.error("Failed to fetch favorites:", err));
    }
  }, [user]);

  const removeFavorite = async (productId) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/api/users/${user.id}/favorites`, {
        productId,
      });
      setFavorites(favorites.filter((p) => p._id !== productId));
      localStorage.setItem("user", JSON.stringify({ ...user, favorites: res.data.favorites }));
    } catch (err) {
      console.error("Failed to remove favorite:", err);
    }
  };

  if (!user) return <p className="text-center mt-10">Please log in to view your favorites.</p>;

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6">Your Favorites</h2>
      {favorites.length === 0 ? (
        <p>You have no favorites yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {favorites.map((product) => (
            <div key={product._id} className="bg-white rounded shadow p-4">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-40 object-cover mb-4 rounded"
              />
              <h3 className="text-xl font-semibold">{product.name}</h3>
              <p className="text-gray-600">{product.description}</p>
              <p className="text-green-600 font-bold mt-2">${product.price}</p>
              <button
                onClick={() => removeFavorite(product._id)}
                className="mt-4 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
              >
                Remove from Favorites
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Favorites;
