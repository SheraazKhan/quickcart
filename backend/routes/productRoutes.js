const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const { getAllProducts } = require("../controllers/productController");
const Product = require("../models/Product");

// Multer setup for storing images in public/images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/images"); // Ensure this folder exists
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

/**
 * GET / - List all products
 */
router.get("/", getAllProducts);

/**
 * POST / - Add new product with image upload
 */
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const { name, price, description, category, stock } = req.body;
    const image = req.file ? `/images/${req.file.filename}` : "";

    const product = new Product({
      name,
      price,
      description,
      category,
      stock,
      image,
    });

    await product.save();
    res.status(201).json(product);
  } catch (err) {
    console.error("Add product error:", err);
    res.status(500).json({ error: "Failed to add product" });
  }
});

/**
 * GET /:id - Get single product by ID
 */
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * PUT /:id - Update a product with optional image upload
 */
router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    const updateData = {
      name: req.body.name,
      price: req.body.price,
      description: req.body.description,
      category: req.body.category,
      stock: req.body.stock,
    };

    // If a new image was uploaded, update the image field
    if (req.file) {
      updateData.image = `/images/${req.file.filename}`;
    }

    const updated = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(updated);
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ error: "Failed to update product" });
  }
});

/**
 * DELETE /:id - Delete a product
 */
router.delete("/:id", async (req, res) => {
  console.log("🗑 Deleting product:", req.params.id);
  try {
    const result = await Product.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ error: "Product not found" });
    res.json({ message: "Product deleted" });
  } catch (err) {
    console.error("❌ Delete failed:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
