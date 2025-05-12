const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Product = require("../models/Product"); // Add this if not already
const bcrypt = require("bcryptjs");

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Cloudinary config
const { upload } = require("../config/cloudinary");

/**
 * PUT /:id - Update user profile (name, email)
 */
router.put("/:id", async (req, res) => {
  try {
    const { name, email } = req.body;
    const normalizedEmail = email.toLowerCase();

    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser && existingUser._id.toString() !== req.params.id) {
      return res.status(400).json({ error: "Email already in use" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { name, email: normalizedEmail },
      { new: true }
    );

    res.json({
      id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      profilePicture: updatedUser.profilePicture,
    });
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /:id/upload - Upload profile picture
 */
router.post("/:id/upload", upload.single("image"), async (req, res) => {
  try {
    const imageUrl = req.file.path;

    const updated = await User.findByIdAndUpdate(
      req.params.id,
      { profilePicture: imageUrl },
      { new: true }
    );

    res.json({ image: updated.profilePicture });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: "Upload failed" });
  }
});

/**
 * DELETE /:id/remove-picture - Remove profile picture
 */
router.delete("/:id/remove-picture", async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.params.id, { profilePicture: "" }, { new: true });
    res.json({ image: "" });
  } catch (err) {
    console.error("Remove error:", err);
    res.status(500).json({ error: "Failed to remove profile picture." });
  }
});

/**
 * PUT /:id/change-password - Change user password
 */
router.put("/:id/change-password", async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(400).json({ error: "Incorrect old password" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ message: "Password changed successfully" });
  } catch (err) {
    console.error("Password change error:", err);
    res.status(500).json({ error: "Failed to change password" });
  }
});

/**
 * POST /:id/favorites - Toggle favorite product
 */
router.post("/:id/favorites", async (req, res) => {
  const userId = req.params.id;
  const { productId } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const index = user.favorites.indexOf(productId);

    if (index === -1) {
      user.favorites.push(productId); // Add to favorites
    } else {
      user.favorites.splice(index, 1); // Remove from favorites
    }

    await user.save();
    res.json({ favorites: user.favorites });
  } catch (err) {
    console.error("Favorite toggle error:", err);
    res.status(500).json({ error: "Failed to update favorites" });
  }
});

/**
 * GET /:id/favorites - Get favorite products
 */
router.get("/:id/favorites", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate("favorites");
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({ favorites: user.favorites });
  } catch (err) {
    console.error("Get favorites error:", err);
    res.status(500).json({ error: "Failed to fetch favorites" });
  }
});

module.exports = router;
