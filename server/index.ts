import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { handleDemo } from "./routes/demo.js";
import { handleSignup, handleLogin, handleVerifyToken } from "./routes/auth.js";
import { handleProfile } from "./routes/profile.js";
import { handleDeepSeekRoleplay } from "./routes/deepseek-roleplay.js";
import { handleDeepSeekReading } from "./routes/deepseek-reading.js";
import { handleCreateCheckoutSession } from "./routes/billing.js";
import { requireAuth } from "./middleware/auth.js";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  const apiRouter = express.Router();

  // Example API routes
  apiRouter.get("/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  apiRouter.get("/demo", handleDemo);
  apiRouter.post("/ai/roleplay", handleDeepSeekRoleplay);
  apiRouter.get("/ai/reading-prompt", handleDeepSeekReading);
  apiRouter.post("/billing/checkout", handleCreateCheckoutSession);

  // Auth routes (public)
  apiRouter.post("/auth/signup", handleSignup);
  apiRouter.post("/auth/login", handleLogin);
  apiRouter.get("/auth/verify", handleVerifyToken);

  // Protected routes (require authentication)
  apiRouter.get("/profile", requireAuth, handleProfile);

  // Mount the router at both /api and root to handle different deployment environments
  app.use("/api", apiRouter);
  app.use(apiRouter);

  return app;
}
