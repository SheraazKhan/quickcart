const Product = require("../models/Product");

exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addProduct = async (req, res) => {
    const { name, price, description, image, category, stock } = req.body;
    try {
      const newProduct = new Product({ name, price, description, image, category, stock });
      await newProduct.save();
      res.status(201).json({ message: "Product created" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
  