import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import redisClient from "../config/redis.js";
import { registerSchema, loginSchema } from "../validations/auth.validation.js";

/* ================= REGISTER ================= */
export const register = async (req, res) => {
  try {
    await registerSchema.validate(req.body, { abortEarly: false });

    const exists = await User.findOne({ email: req.body.email });
    if (exists) {
      return res.status(400).json({
        errors: { email: "Email already exists" }
      });
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    await User.create({
      ...req.body,
      password: hashedPassword
    });

    res.status(201).json({
      message: "Registration successful"
    });
  } catch (err) {
    if (err.name === "ValidationError") {
      const errors = {};
      err.inner.forEach(e => {
        errors[e.path] = e.message;
      });
      return res.status(400).json({ errors });
    }

    res.status(500).json({ message: "Server error" });
  }
};

/* ================= LOGIN ================= */
export const login = async (req, res) => {
  try {
    await loginSchema.validate(req.body, { abortEarly: false });

    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(400).json({
        errors: { email: "Email not registered" }
      });
    }

    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        errors: { password: "Incorrect password" }
      });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // 🔥 Redis session
    await redisClient.set(
      `session:${user._id}`,
      token,
      { EX: 60 * 60 * 24 }
    );

    res.json({
      message: "Login successful",
      token
    });
  } catch (err) {
    if (err.name === "ValidationError") {
      const errors = {};
      err.inner.forEach(e => {
        errors[e.path] = e.message;
      });
      return res.status(400).json({ errors });
    }

    res.status(500).json({ message: "Server error" });
  }
};

/* ================= GET PROFILE ================= */
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch {
    res.status(500).json({ message: "Failed to fetch profile" });
  }
};

/* ================= UPDATE PROFILE ================= */
export const updateProfile = async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      req.body,
      { new: true, runValidators: true }
    ).select("-password");

    res.json({
      message: "Profile updated successfully",
      user: updatedUser
    });
  } catch {
    res.status(500).json({ message: "Profile update failed" });
  }
};
