import { Request, Response, NextFunction } from "express";
import { verifyToken, users } from "../lib/auth";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "No token provided" });
  }

  const token = authHeader.substring(7);
  const decoded = verifyToken(token);

  if (!decoded) {
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }

  const user = users.get(decoded.userId);
  if (!user) {
    return res.status(401).json({ success: false, message: "User not found" });
  }

  req.userId = decoded.userId;
  next();
}
