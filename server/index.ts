import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { handleDemo } from "./routes/demo.js";
import { handleProfile } from "./routes/profile.js";
import { handleGetFlashcards, handleSubmitAnswer, handleSimulateNextDay, handleResetProgress } from "./routes/flashcards.js";
import { handleDeepSeekRoleplay } from "./routes/deepseek-roleplay.js";
import { handleDeepSeekReading } from "./routes/deepseek-reading.js";
import { handleTTS } from "./routes/tts.js";
import {
  handleCreateCheckoutSession,
  handleStripeWebhook,
  handleVerifyCheckoutSession,
} from "./routes/billing.js";
import { requireAuth } from "./middleware/auth.js";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(cookieParser());

  // Stripe Webhook needs raw body for signature verification
  app.post("/api/billing/webhook", express.raw({ type: "application/json" }), handleStripeWebhook);

  // Standard JSON parser for all other routes
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Request logger for debugging
  app.use((req, _res, next) => {
    if (process.env.NODE_ENV === "development" || !process.env.NODE_ENV) {
      console.log(`[Express] ${req.method} ${req.path}`);
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
  apiRouter.post("/billing/checkout", requireAuth, handleCreateCheckoutSession);
  apiRouter.post("/billing/verify-session", requireAuth, handleVerifyCheckoutSession);

  // Protected routes (require authentication)
  apiRouter.get("/profile", requireAuth, handleProfile);
  apiRouter.get("/flashcards", requireAuth, handleGetFlashcards);
  apiRouter.post("/flashcards/answer", requireAuth, handleSubmitAnswer);
  apiRouter.post("/flashcards/simulate-next-day", requireAuth, handleSimulateNextDay);
  apiRouter.post("/flashcards/reset", requireAuth, handleResetProgress);

  // Mount the router
  app.use("/api", apiRouter);
  
  // Also mount at root for environments that don't auto-prefix
  app.use(apiRouter);

  // Error handler
  app.use((err: any, _req, res, _next) => {
    console.error("Express error:", err);
    res.status(500).json({ 
      error: "Internal server error", 
      message: err instanceof Error ? err.message : String(err) 
    });
  });

  return app;
}
