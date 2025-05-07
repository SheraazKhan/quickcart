const express = require("express");
const router = express.Router();
const User = require("../models/User");

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Cloudinary config
const { upload } = require("../config/cloudinary");

// Update user profile (name/email)
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

// Upload profile picture
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

module.exports = router;
