import React, { useEffect, useState } from "react";
import axios from "axios";
import API_BASE_URL from "../utils/api";

const SUGGESTED_CATEGORIES = [
  "Laptops",
  "Phones",
  "Headphones",
  "Gaming",
  "Home",
  "Accessories",
];

const AddProduct = () => {
  const [form, setForm] = useState({
    name: "",
    price: "",
    description: "",
    category: "",
    stock: "",
  });

  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);
  const token = localStorage.getItem("token");

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // basic numeric guard for price/stock
    if (name === "price" && Number(value) < 0) return;
    if (name === "stock" && Number(value) < 0) return;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const setFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Please choose an image file.");
      return;
    }
    setImageFile(file);
    const url = URL.createObjectURL(file);
    setPreview((old) => {
      if (old) URL.revokeObjectURL(old);
      return url;
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    setFile(file);
  };

  // Drag & drop
  const onDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    setFile(file);
  };

  const onDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const clearImage = () => {
    setImageFile(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
  };

  const validate = () => {
    if (!form.name.trim()) return "Name is required.";
    if (form.price === "" || isNaN(Number(form.price))) return "Valid price is required.";
    if (Number(form.price) < 0) return "Price cannot be negative.";
    if (!form.description.trim()) return "Description is required.";
    if (!form.category.trim()) return "Category is required.";
    if (form.stock === "" || isNaN(Number(form.stock))) return "Valid stock is required.";
    if (Number(form.stock) < 0) return "Stock cannot be negative.";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const error = validate();
    if (error) {
      alert(error);
      return;
    }

    const formData = new FormData();
    formData.append("name", form.name.trim());
    formData.append("price", Number(form.price));
    formData.append("description", form.description.trim());
    formData.append("category", form.category.trim());
    formData.append("stock", Number(form.stock));
    if (imageFile) formData.append("image", imageFile);

    try {
      setSubmitting(true);
      setProgress(0);

      await axios.post(`${API_BASE_URL}/api/products`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        onUploadProgress: (evt) => {
          if (!evt.total) return;
          const pct = Math.round((evt.loaded * 100) / evt.total);
          setProgress(pct);
        },
      });

      alert("✅ Product added!");
      setForm({ name: "", price: "", description: "", category: "", stock: "" });
      clearImage();
      setProgress(0);
    } catch (err) {
      console.error("❌ Error adding product:", err);
      const msg = err?.response?.data?.error || "Server error";
      alert("Error: " + msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="bg-gray-50 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.06),0_10px_20px_rgba(0,0,0,0.06)] ring-1 ring-black/5 p-6">
          <h2 className="text-2xl font-bold mb-6">Add Product</h2>

          <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Product name"
                required
                className="w-full px-3 py-2 border border-gray-200 rounded-lg"
              />
            </div>

            {/* Price & Stock */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Price</label>
                <input
                  type="number"
                  name="price"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={handleChange}
                  placeholder="0.00"
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Stock</label>
                <input
                  type="number"
                  name="stock"
                  min="0"
                  step="1"
                  value={form.stock}
                  onChange={handleChange}
                  placeholder="0"
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <input
                name="category"
                value={form.category}
                onChange={handleChange}
                list="category-suggestions"
                placeholder="e.g. Laptops"
                required
                className="w-full px-3 py-2 border border-gray-200 rounded-lg"
              />
              <datalist id="category-suggestions">
                {SUGGESTED_CATEGORIES.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Brief description of the product"
                rows={4}
                required
                className="w-full px-3 py-2 border border-gray-200 rounded-lg"
              />
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium mb-2">Image</label>

              {!preview ? (
                <div
                  onDrop={onDrop}
                  onDragOver={onDragOver}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-indigo-400"
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="file-input"
                  />
                  <label htmlFor="file-input" className="block cursor-pointer">
                    <div className="text-sm text-gray-600">
                      Drag & drop an image here, or <span className="text-indigo-600 underline">browse</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      JPG/PNG recommended. Max ~5–10MB.
                    </div>
                  </label>
                </div>
              ) : (
                <div className="relative">
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-56 object-contain bg-gray-50 rounded-lg ring-1 ring-black/5"
                  />
                  <div className="mt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={clearImage}
                      className="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm font-medium"
                    >
                      Remove
                    </button>
                    <label
                      htmlFor="file-replace"
                      className="px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold cursor-pointer"
                    >
                      Replace
                    </label>
                    <input
                      id="file-replace"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Progress */}
            {submitting && (
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-emerald-600 h-2 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white px-5 py-2.5 rounded-lg font-semibold"
              >
                {submitting ? "Adding…" : "Add Product"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setForm({ name: "", price: "", description: "", category: "", stock: "" });
                  clearImage();
                }}
                disabled={submitting}
                className="bg-white border border-gray-200 hover:bg-gray-50 px-5 py-2.5 rounded-lg font-semibold"
              >
                Reset
              </button>
            </div>
          </form>
        </div>

        {/* Tips */}
        <p className="text-xs text-gray-500 mt-4">
          Note: Images are saved to <code>/public/images</code> on the server and served from <code>/images/…</code>.  
          If you switch to Cloudinary later, the backend can return a hosted URL — this UI will still work.
        </p>
      </div>
    </main>
  );
};

export default AddProduct;
