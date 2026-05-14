import type { RequestHandler } from "express";
import { verifySupabaseToken } from "../lib/auth.js";

export const requireAuth: RequestHandler = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "No token provided" });
  }

  const token = authHeader.substring(7);
  const user = await verifySupabaseToken(token);

  if (!user) {
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }

  req.user = user;
  req.userId = user.id;
  next();
};
