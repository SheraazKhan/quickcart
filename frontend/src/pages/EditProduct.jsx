import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import API_BASE_URL from "../utils/api";


const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    price: "",
    description: "",
    category: "",
    stock: "",
    image: ""
  });

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null); 

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/api/products`)
      .then((res) => {
        const product = res.data.find((p) => p._id === id);
        if (product) setForm(product);
        else alert("Product not found");
      })
      .catch((err) => console.error("Error fetching product:", err));
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile)); 
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("price", form.price);
    formData.append("description", form.description);
    formData.append("category", form.category);
    formData.append("stock", form.stock);
    if (file) {
      formData.append("image", file); 
    }

    try {
      await axios.put(`${API_BASE_URL}/api/products/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      alert("Product updated!");
      navigate("/products");
    } catch (err) {
      console.error("Update error:", err);
      alert("Failed to update");
    }
  };

  const getProductImage = (filename) => {
    return filename ? `${API_BASE_URL}${filename}` : "/placeholder.jpg";
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow-md w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-4">Edit Product</h2>

        {["name", "price", "description", "category", "stock"].map((field) => (
          <input
            key={field}
            name={field}
            value={form[field]}
            placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded mb-4"
          />
        ))}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Change Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full"
          />

          {(preview || form.image) && (
            <img
              src={preview || getProductImage(form.image)}
              alt="Preview"
              className="mt-2 h-32 w-full object-cover rounded border"
            />
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          Update Product
        </button>
      </form>
    </div>
  );
};

export default EditProduct;
