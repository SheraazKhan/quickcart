const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  name: String,
  address: String,
  items: [
    {
      _id: false,
      productId: String,
      name: String,
      price: Number,
      quantity: Number,
    },
  ],
  total: Number,
}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);
