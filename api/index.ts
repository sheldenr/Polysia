import { createServer } from "../server/index.js";

let app: any;

try {
  console.log("[Vercel] Initializing Express app...");
  app = createServer();
  console.log("[Vercel] Express app initialized successfully.");
} catch (err) {
  console.error("[Vercel] CRITICAL: Failed to initialize Express app:", err);
}

export default (req: any, res: any) => {
  if (!app) {
    console.error("[Vercel] Request failed: Express app not initialized.");
    return res.status(500).json({ error: "Server failed to initialize." });
  }
  return app(req, res);
};
