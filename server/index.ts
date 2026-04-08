import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { handleDemo } from "./routes/demo.js";
import { handleSignup, handleLogin, handleVerifyToken } from "./routes/auth.js";
import { handleProfile } from "./routes/profile.js";
import { requireAuth } from "./middleware/auth.js";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Auth routes (public)
  app.post("/api/auth/signup", handleSignup);
  app.post("/api/auth/login", handleLogin);
  app.get("/api/auth/verify", handleVerifyToken);

  // Protected routes (require authentication)
  app.get("/api/profile", requireAuth, handleProfile);

  return app;
}
