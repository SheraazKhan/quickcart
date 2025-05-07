const express = require("express");
const router = express.Router();
const { getAllProducts, addProduct } = require("../controllers/productController");
const Product = require("../models/Product");


router.get("/", getAllProducts);
router.post("/", addProduct);

router.get("/:id", async (req, res) => {
    try {
      const product = await Product.findById(req.params.id);
      if (!product) return res.status(404).json({ error: "Product not found" });
      res.json(product);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
router.put("/:id", async (req, res) => {
    try {
      const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
      res.json(updated);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  

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
