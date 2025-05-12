const express = require("express");
const router = express.Router();
const Order = require("../models/Order");

// POST /api/orders - Place a new order
router.post("/", async (req, res) => {
  try {
    const { userId, name, address, items, total } = req.body;

    const formattedItems = items.map(item => ({
      productId: item._id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
    }));

    const newOrder = new Order({
      userId,
      name,
      address,
      items: formattedItems,
      total,
    });

    await newOrder.save();
    res.status(201).json({ message: "Order placed successfully" });
  } catch (err) {
    console.error("Order placement error:", err);
    res.status(500).json({ error: "Failed to place order" });
  }
});

// GET /api/orders/:userId - Get user's order history
router.get("/:userId", async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error("Order fetch error:", err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

module.exports = router;
