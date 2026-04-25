import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { handleDemo } from "./routes/demo.js";
import { handleProfile } from "./routes/profile.js";
import { handleDeepSeekRoleplay } from "./routes/deepseek-roleplay.js";
import { handleDeepSeekReading } from "./routes/deepseek-reading.js";
import { handleTTS } from "./routes/tts.js";
import { handleCreateCheckoutSession } from "./routes/billing.js";
import { requireAuth } from "./middleware/auth.js";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // Request logger for debugging
  app.use((req, _res, next) => {
    if (process.env.NODE_ENV === "development" || !process.env.NODE_ENV) {
      console.log(`[Express] ${req.method} ${req.path}`);
      console.log(`  Accept: ${req.get("Accept")}`);
      console.log(`  Content-Type: ${req.get("Content-Type")}`);
    }
    next();
  });

  const apiRouter = express.Router();

  // Example API routes
  apiRouter.get("/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  apiRouter.get("/demo", handleDemo);
  apiRouter.post("/ai/roleplay", requireAuth, handleDeepSeekRoleplay);
  apiRouter.get("/ai/reading-prompt", requireAuth, handleDeepSeekReading);
  apiRouter.post("/ai/tts", requireAuth, handleTTS);
  apiRouter.post("/billing/checkout", handleCreateCheckoutSession);

  // Protected routes (require authentication)
  apiRouter.get("/profile", requireAuth, handleProfile);

  // Mount the router
  // If we are already under /api (e.g. Vercel/Netlify), this handles the subpaths
  // If we are at root, this mounts everything under /api
  app.use("/api", apiRouter);
  
  // Also mount at root for environments that don't auto-prefix
  app.use(apiRouter);

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
