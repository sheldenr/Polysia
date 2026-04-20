import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { handleDemo } from "./routes/demo";
import { handleSignup, handleLogin, handleVerifyToken } from "./routes/auth";
import { handleProfile } from "./routes/profile";
import { handleDeepSeekRoleplay } from "./routes/deepseek-roleplay";
import { handleDeepSeekReading } from "./routes/deepseek-reading";
import { handleCreateCheckoutSession } from "./routes/billing";
import { requireAuth } from "./middleware/auth";

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

  // 404 handler
  app.use((_req, res) => {
    res.status(404).json({ error: "Route not found" });
  });

  // Error handler
  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error("Express error:", err);
    res.status(500).json({ 
      error: "Internal server error", 
      message: err instanceof Error ? err.message : String(err) 
    });
  });

  return app;
}
