import jwt from "jsonwebtoken";
import redisClient from "../config/redis.js";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const redisToken = await redisClient.get(`session:${decoded.id}`);
    if (!redisToken) return res.status(401).json({ message: "Session expired" });

    req.user = await User.findById(decoded.id).select("-password");
    next();
  } catch {
    res.status(401).json({ message: "Unauthorized" });
  }
};
