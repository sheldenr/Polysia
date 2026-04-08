import { RequestHandler } from "express";
import { users, sanitizeUser } from "../lib/auth.js";

export const handleProfile: RequestHandler = (req, res) => {
  const userId = req.userId; // Set by requireAuth middleware

  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  const user = users.get(userId);

  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  return res.json({
    success: true,
    user: sanitizeUser(user),
  });
};
