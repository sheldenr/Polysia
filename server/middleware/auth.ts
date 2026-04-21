import { Request, Response, NextFunction } from "express";
import { verifySupabaseToken } from "../lib/auth";
import type { User } from "@supabase/supabase-js";

declare global {
  namespace Express {
    interface Request {
      user?: User;
      userId?: string;
    }
  }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
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
}
