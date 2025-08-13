import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    price: "",
    description: "",
    category: "",
    stock: "",
    image: "",
  });

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [banner, setBanner] = useState({ text: "", ok: true });

  const token = localStorage.getItem("token");
  const fileInputRef = useRef(null);

  // Helpers
  const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

  const getProductImage = (img) => {
    if (!img) return "/placeholder.jpg";
    if (typeof img === "string") {
      if (/^https?:\/\//i.test(img)) return img;
      return `${API_BASE_URL}${img.startsWith("/") ? "" : "/"}${img}`;
    }
    if (img?.url) return img.url;
    return "/placeholder.jpg";
  };

  // Load product
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        // Prefer GET /api/products/:id; fall back to list if needed
        let product;
        try {
          const { data } = await axios.get(`${API_BASE_URL}/api/products/${id}`);
          product = data;
        } catch {
          const { data } = await axios.get(`${API_BASE_URL}/api/products`);
          product = Array.isArray(data) ? data.find((p) => p._id === id) : null;
        }

        if (!product) {
          setBanner({ text: "Product not found.", ok: false });
          return;
        }

        if (!mounted) return;
        setForm({
          name: product.name || "",
          price: product.price ?? "",
          description: product.description || "",
          category: product.category || "",
          stock: product.stock ?? product.countInStock ?? "",
          image: product.image || "",
        });
      } catch (err) {
        console.error("Error fetching product:", err);
        setBanner({ text: "Failed to load product.", ok: false });
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
      if (preview) URL.revokeObjectURL(preview);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Field handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    // basic numeric guards
    if (name === "price" && Number(value) < 0) return;
    if (name === "stock" && Number(value) < 0) return;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const setImageFile = (f) => {
    if (!f) return;
    if (!f.type?.startsWith?.("image/")) {
      setBanner({ text: "Please choose an image file.", ok: false });
      return;
    }
    setFile(f);
    const url = URL.createObjectURL(f);
    setPreview((old) => {
      if (old) URL.revokeObjectURL(old);
      return url;
    });
  };

  const handleFileChange = (e) => setImageFile(e.target.files?.[0]);

  // Drag & drop
  const onDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setImageFile(e.dataTransfer.files?.[0]);
  };
  const onDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const clearSelectedImage = () => {
    setFile(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const validate = () => {
    if (!form.name.trim()) return "Name is required.";
    if (form.price === "" || isNaN(Number(form.price))) return "Valid price is required.";
    if (!form.description.trim()) return "Description is required.";
    if (!form.category.trim()) return "Category is required.";
    if (form.stock === "" || isNaN(Number(form.stock))) return "Valid stock is required.";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) {
      setBanner({ text: err, ok: false });
      return;
    }

    const formData = new FormData();
    formData.append("name", form.name.trim());
    formData.append("price", Number(form.price));
    formData.append("description", form.description.trim());
    formData.append("category", form.category.trim());
    formData.append("stock", Number(form.stock));
    if (file) formData.append("image", file);

    try {
      setSubmitting(true);
      setProgress(0);

      await axios.put(`${API_BASE_URL}/api/products/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          ...authHeader,
        },
        onUploadProgress: (evt) => {
          if (!evt.total) return;
          setProgress(Math.round((evt.loaded * 100) / evt.total));
        },
      });

      setBanner({ text: "✅ Product updated!", ok: true });
      setTimeout(() => navigate("/products"), 600);
    } catch (error) {
      console.error("Update error:", error);
      const msg = error?.response?.data?.error || "Failed to update product.";
      setBanner({ text: msg, ok: false });
    } finally {
      setSubmitting(false);
      setProgress(0);
    }
  };

  return (
    <main className="bg-gray-50 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white p-6 md:p-8 rounded-xl ring-1 ring-black/5 shadow-[0_1px_2px_rgba(0,0,0,0.06),0_10px_20px_rgba(0,0,0,0.06)]">
          <h2 className="text-2xl font-extrabold text-slate-900 mb-6">Edit Product</h2>

          {loading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-gray-200 rounded w-1/3" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="h-10 bg-gray-200 rounded" />
                <div className="h-10 bg-gray-200 rounded" />
              </div>
              <div className="h-28 bg-gray-200 rounded" />
              <div className="h-48 bg-gray-200 rounded" />
            </div>
          ) : (
            <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-5">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Product name"
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
                  rows={4}
                  placeholder="Brief description of the product"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                />
              </div>

              {/* Image */}
              <div>
                <label className="block text-sm font-medium mb-2">Image</label>

                {/* Current image */}
                {(form.image || preview) && (
                  <img
                    src={preview || getProductImage(form.image)}
                    alt="Current"
                    className="w-full h-56 object-contain bg-gray-50 rounded-lg ring-1 ring-black/5 mb-3"
                  />
                )}

                {/* Uploader */}
                {!preview ? (
                  <div
                    onDrop={onDrop}
                    onDragOver={onDragOver}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-indigo-400"
                  >
                    <input
                      id="file-input"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      ref={fileInputRef}
                    />
                    <label htmlFor="file-input" className="block cursor-pointer">
                      <div className="text-sm text-gray-600">
                        Drag & drop an image here, or{" "}
                        <span className="text-indigo-600 underline">browse</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">JPG/PNG recommended.</div>
                    </label>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={clearSelectedImage}
                      className="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm font-medium"
                    >
                      Remove selected
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
                      onChange={handleFileChange}
                    />
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
                  {submitting ? "Updating…" : "Update Product"}
                </button>
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  disabled={submitting}
                  className="bg-white border border-gray-200 hover:bg-gray-50 px-5 py-2.5 rounded-lg font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Banner */}
          {banner.text && (
            <div
              className={`mt-6 border rounded-lg px-4 py-3 text-sm ${
                banner.ok
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-red-50 text-red-700 border-red-200"
              }`}
            >
              {banner.text}
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default EditProduct;
