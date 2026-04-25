import path from "path";
import "dotenv/config";
import * as express from "express";
import express__default from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";
const handleDemo = (req, res) => {
  const response = {
    message: "Hello from Express server"
  };
  res.status(200).json(response);
};
const handleProfile = (req, res) => {
  const user = req.user;
  if (!user) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
  return res.json({
    success: true,
    user: {
      id: user.id,
      email: user.email,
      createdAt: user.created_at,
      metadata: user.user_metadata
    }
  });
};
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;
if (!supabase) {
  console.warn("⚠️ Supabase environment variables are missing. Auth will fail.");
}
async function verifySupabaseToken(token) {
  if (!supabase) {
    console.error("Auth failed: Supabase client not initialized.");
    return null;
  }
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) return null;
    return user;
  } catch (err) {
    console.error("Supabase token verification error:", err);
    return null;
  }
}
const deepSeekRequestSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(["system", "user", "assistant"]),
      content: z.string().min(1)
    })
  ).min(1).max(20),
  temperature: z.number().min(0).max(2).optional(),
  max_tokens: z.number().int().min(1).max(1e3).optional()
});
async function parseDeepSeekUpstreamBody$1(response) {
  const rawBody = await response.text();
  if (!rawBody) {
    return {
      body: {},
      parseError: false,
      rawBody: ""
    };
  }
  try {
    return {
      body: JSON.parse(rawBody),
      parseError: false,
      rawBody
    };
  } catch {
    return {
      body: {},
      parseError: true,
      rawBody
    };
  }
}
const handleDeepSeekRoleplay = async (req, res) => {
  console.log("[DeepSeek Roleplay] Received request");
  const parsed = deepSeekRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: parsed.error.errors[0]?.message ?? "Invalid request payload"
    });
  }
  const userId = req.userId;
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    console.error("[DeepSeek Roleplay] Missing DEEPSEEK_API_KEY");
    return res.status(500).json({
      error: "DeepSeek is not configured. Add DEEPSEEK_API_KEY to your environment."
    });
  }
  let knownVocab = [];
  if (userId && supabase) {
    const { data: flashcards } = await supabase.from("flashcards").select("simplified").eq("user_id", userId).not("state", "eq", "NEW");
    if (flashcards) {
      knownVocab = flashcards.map((f) => f.simplified);
    }
  }
  const vocabList = knownVocab.length > 0 ? knownVocab.join(", ") : "basic HSK 1";
  const vocabConstraint = knownVocab.length > 0 ? `The user knows these Chinese characters/words: [${vocabList}]. Heavily prioritize using these known words in your responses. You can introduce a very small amount of new vocabulary (1-2 new words per response) if necessary for the context, but keep it mostly within their known set.` : "The user is a beginner. Use only very basic HSK 1 vocabulary.";
  const messages = [...parsed.data.messages];
  const systemMessageIdx = messages.findIndex((m) => m.role === "system");
  if (systemMessageIdx !== -1) {
    messages[systemMessageIdx].content = `${vocabConstraint} ${messages[systemMessageIdx].content}`;
  } else {
    messages.unshift({
      role: "system",
      content: vocabConstraint
    });
  }
  const model = process.env.DEEPSEEK_MODEL ?? "deepseek-chat";
  const timeoutMs = Number(process.env.DEEPSEEK_TIMEOUT_MS ?? 25e3);
  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => controller.abort(),
    Number.isFinite(timeoutMs) && timeoutMs > 0 ? timeoutMs : 25e3
  );
  try {
    const upstream = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      signal: controller.signal,
      body: JSON.stringify({
        model,
        messages,
        temperature: parsed.data.temperature ?? 0.7,
        max_tokens: parsed.data.max_tokens ?? 220
      })
    });
    const { body: upstreamBody, parseError, rawBody } = await parseDeepSeekUpstreamBody$1(upstream);
    if (!upstream.ok) {
      console.error(
        `[DeepSeek Roleplay] API error (${upstream.status}):`,
        upstreamBody.error ?? rawBody.slice(0, 300)
      );
      return res.status(502).json({
        error: upstreamBody.error?.message ?? `DeepSeek request failed with status ${upstream.status}.`,
        debug: false ? upstreamBody : void 0
      });
    }
    if (parseError) {
      console.error("[DeepSeek Roleplay] Upstream returned non-JSON body:", rawBody.slice(0, 300));
      return res.status(502).json({
        error: "DeepSeek returned a non-JSON response."
      });
    }
    const content = upstreamBody.choices?.[0]?.message?.content?.trim();
    if (!content) {
      console.error("[DeepSeek Roleplay] Empty response choices:", upstreamBody.choices);
      return res.status(502).json({
        error: "DeepSeek returned an empty response.",
        debug: false ? upstreamBody : void 0
      });
    }
    const response = {
      content,
      model: upstreamBody.model ?? model,
      usage: upstreamBody.usage
    };
    return res.status(200).json(response);
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      console.error("[DeepSeek Roleplay] Request timed out");
      return res.status(504).json({
        error: "DeepSeek took too long to respond. Please try again."
      });
    }
    console.error("DeepSeek roleplay error:", error);
    return res.status(500).json({
      error: "Unable to reach DeepSeek right now."
    });
  } finally {
    clearTimeout(timeoutId);
  }
};
const randomTopics = [
  "a surprising street food discovery",
  "a rainy-day commute mishap",
  "a weekend mountain hike",
  "an unexpected bookstore conversation",
  "a neighborhood festival moment",
  "a train station delay story",
  "a first visit to a night market",
  "a small act of kindness from a stranger",
  "trying a new hobby class",
  "a day working from a cafe"
];
function normalizeReadingText(text) {
  const compact = text.replace(/\s+/g, "").trim();
  if (compact.length <= 230) {
    return compact;
  }
  const trimmed = compact.slice(0, 220);
  return trimmed.replace(/[，。！？；、]*$/, "。");
}
function stripCodeFences(raw) {
  let content = raw.trim();
  if (!content.startsWith("{")) {
    const match = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (match && match[1]) {
      content = match[1].trim();
    }
  }
  if (!content.startsWith("{")) {
    const match = content.match(/(\{[\s\S]*\})/);
    if (match && match[1]) {
      content = match[1].trim();
    }
  }
  return content.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
}
async function parseDeepSeekUpstreamBody(response) {
  const rawBody = await response.text();
  if (!rawBody) {
    return {
      body: {},
      parseError: false,
      rawBody: ""
    };
  }
  try {
    return {
      body: JSON.parse(rawBody),
      parseError: false,
      rawBody
    };
  } catch {
    return {
      body: {},
      parseError: true,
      rawBody
    };
  }
}
const handleDeepSeekReading = async (req, res) => {
  console.log("[DeepSeek Reading] Received request for reading prompt");
  const userId = req.userId;
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    console.error("[DeepSeek Reading] Missing DEEPSEEK_API_KEY");
    return res.status(500).json({
      error: "DeepSeek is not configured. Add DEEPSEEK_API_KEY to your environment."
    });
  }
  let hskLevel = "Beginner";
  if (userId && supabase) {
    const { data: profile } = await supabase.from("profiles").select("onboarding_hsk_level").eq("id", userId).maybeSingle();
    if (profile?.onboarding_hsk_level) {
      hskLevel = profile.onboarding_hsk_level;
    }
  }
  const hskConstraint = hskLevel === "Beginner" ? "The user is at HSK 1 level. Use only HSK 1 vocabulary and basic grammar." : hskLevel === "Intermediate" ? "The user is at HSK 2-3 level. Use vocabulary and grammar structures appropriate for HSK 2 and 3." : "The user is at HSK 3-4 level. Use vocabulary and grammar structures appropriate for HSK 3 and 4.";
  const vocabConstraint = `${hskConstraint} Ensure the text is natural but accessible for this level.`;
  const model = process.env.DEEPSEEK_MODEL ?? "deepseek-chat";
  const timeoutMs = Number(process.env.DEEPSEEK_TIMEOUT_MS ?? 25e3);
  const selectedTopic = randomTopics[Math.floor(Math.random() * randomTopics.length)];
  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => controller.abort(),
    Number.isFinite(timeoutMs) && timeoutMs > 0 ? timeoutMs : 25e3
  );
  try {
    console.log(`[DeepSeek Reading] Fetching from DeepSeek with topic: ${selectedTopic}`);
    const upstream = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      signal: controller.signal,
      body: JSON.stringify({
        model,
        temperature: 0.6,
        // Slightly lower temperature for faster/more stable generation
        max_tokens: 400,
        // Slightly more tokens to avoid truncation
        messages: [
          {
            role: "system",
            content: `You are a Chinese reading tutor. ${vocabConstraint} Return strict JSON only (no markdown): {"titleZh":"...","titleEn":"...","text":"...","quiz":[{"question":"...","answer":true},{"question":"...","answer":false}]}. titleZh should be a concise Chinese topic title (4-12 chars). titleEn should be the natural English translation of that Chinese title. text must be a single Mandarin passage between 180 and 220 Chinese characters. text must contain only Chinese (no English, no pinyin, no bullets). quiz must contain exactly 2 true/false questions that are directly based on details from text. Each question must be in English and each answer must be a boolean.`
          },
          {
            role: "user",
            content: `Create today's reading passage for the user. Use a random topic around: ${selectedTopic}.`
          }
        ]
      })
    });
    const { body: upstreamBody, parseError, rawBody } = await parseDeepSeekUpstreamBody(upstream);
    if (!upstream.ok) {
      console.error("[DeepSeek Reading] Upstream error:", upstream.status, upstreamBody.error ?? rawBody.slice(0, 300));
      return res.status(502).json({
        error: upstreamBody.error?.message ?? `DeepSeek reading prompt request failed with status ${upstream.status}.`
      });
    }
    if (parseError) {
      console.error("[DeepSeek Reading] Upstream returned non-JSON body:", rawBody.slice(0, 300));
      return res.status(502).json({
        error: "DeepSeek returned a non-JSON response."
      });
    }
    const content = upstreamBody.choices?.[0]?.message?.content?.trim();
    if (!content) {
      console.error("[DeepSeek Reading] Empty content from DeepSeek");
      return res.status(502).json({
        error: "DeepSeek returned an empty reading prompt."
      });
    }
    console.log("[DeepSeek Reading] Successfully received response from DeepSeek");
    let parsed = null;
    const strippedContent = stripCodeFences(content);
    try {
      parsed = JSON.parse(strippedContent);
    } catch (err) {
      console.error("DeepSeek JSON Parse Error:", err);
      console.error("Raw Content:", content);
      console.error("Stripped Content:", strippedContent);
      return res.status(502).json({
        error: "DeepSeek returned an invalid reading payload.",
        debug: false ? { content, err: String(err) } : void 0
      });
    }
    const titleZh = parsed.titleZh?.trim();
    const titleEn = parsed.titleEn?.trim();
    const text = parsed.text?.trim();
    const quiz = parsed.quiz;
    if (!titleZh || !titleEn || !text || !Array.isArray(quiz) || quiz.length !== 2 || quiz.some((item) => !item.question?.trim() || typeof item.answer !== "boolean")) {
      console.error("DeepSeek Validation Error: Missing required fields");
      console.error("Parsed Data:", parsed);
      return res.status(502).json({
        error: "DeepSeek reading payload is missing required fields.",
        debug: false ? { parsed } : void 0
      });
    }
    const response = {
      titleZh,
      titleEn,
      text: normalizeReadingText(text),
      quiz: quiz.map((item) => ({
        question: item.question.trim(),
        answer: item.answer
      })),
      model: upstreamBody.model ?? model,
      hskLevel
    };
    return res.status(200).json(response);
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      console.error("[DeepSeek Reading] Request timed out");
      return res.status(504).json({
        error: "DeepSeek took too long to respond. Please try again in a moment."
      });
    }
    console.error("DeepSeek reading prompt error:", error);
    return res.status(500).json({
      error: "Unable to generate reading prompt right now."
    });
  } finally {
    clearTimeout(timeoutId);
  }
};
const checkoutRequestSchema = z.object({
  plan: z.enum(["pro_monthly", "lifetime"]),
  customerEmail: z.string().email().optional()
});
const planPriceMap = {
  pro_monthly: process.env.STRIPE_PRICE_PRO_MONTHLY,
  lifetime: process.env.STRIPE_PRICE_LIFETIME
};
function getBaseUrl(req) {
  const origin = req.headers.origin;
  if (origin && /^https?:\/\//i.test(origin)) {
    return origin;
  }
  const host = req.get("host");
  const protocol = req.protocol || "https";
  return host ? `${protocol}://${host}` : "http://localhost:8080";
}
const handleCreateCheckoutSession = async (req, res) => {
  const parsed = checkoutRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: parsed.error.errors[0]?.message ?? "Invalid checkout payload."
    });
  }
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return res.status(500).json({
      error: "Stripe is not configured. Add STRIPE_SECRET_KEY."
    });
  }
  const stripe = new Stripe(secretKey);
  const payload = parsed.data;
  const priceId = planPriceMap[payload.plan];
  if (!priceId) {
    return res.status(500).json({
      error: payload.plan === "pro_monthly" ? "Missing STRIPE_PRICE_PRO_MONTHLY." : "Missing STRIPE_PRICE_LIFETIME."
    });
  }
  const baseUrl = getBaseUrl(req);
  const successUrl = process.env.STRIPE_SUCCESS_URL ?? `${baseUrl}/pricing?checkout=success&plan=${payload.plan}`;
  const cancelUrl = process.env.STRIPE_CANCEL_URL ?? `${baseUrl}/pricing?checkout=cancelled&plan=${payload.plan}`;
  try {
    const session = await stripe.checkout.sessions.create({
      mode: payload.plan === "pro_monthly" ? "subscription" : "payment",
      line_items: [
        {
          price: priceId,
          quantity: 1
        }
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: payload.customerEmail,
      allow_promotion_codes: true,
      billing_address_collection: "auto",
      metadata: {
        product_plan: payload.plan
      }
    });
    if (!session.url) {
      return res.status(502).json({
        error: "Stripe did not return a checkout URL."
      });
    }
    const response = {
      checkoutUrl: session.url
    };
    return res.status(200).json(response);
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return res.status(500).json({
      error: "Unable to start checkout right now."
    });
  }
};
async function requireAuth(req, res, next) {
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
function createServer() {
  const app2 = express__default();
  app2.use(cors());
  app2.use(express__default.json());
  app2.use(express__default.urlencoded({ extended: true }));
  app2.use(cookieParser());
  app2.use((req, _res, next) => {
    next();
  });
  const apiRouter = express__default.Router();
  apiRouter.get("/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });
  apiRouter.get("/demo", handleDemo);
  apiRouter.post("/ai/roleplay", requireAuth, handleDeepSeekRoleplay);
  apiRouter.get("/ai/reading-prompt", requireAuth, handleDeepSeekReading);
  apiRouter.post("/billing/checkout", handleCreateCheckoutSession);
  apiRouter.get("/profile", requireAuth, handleProfile);
  app2.use("/api", apiRouter);
  app2.use(apiRouter);
  app2.use((err, _req, res, _next) => {
    console.error("Express error:", err);
    res.status(500).json({
      error: "Internal server error",
      message: err instanceof Error ? err.message : String(err)
    });
  });
  return app2;
}
const app = createServer();
const port = process.env.PORT || 3e3;
const __dirname = import.meta.dirname;
const distPath = path.join(__dirname, "../spa");
app.use(express.static(distPath));
app.get("*", (req, res) => {
  if (req.path.startsWith("/api/") || req.path.startsWith("/health")) {
    return res.status(404).json({ error: "API endpoint not found" });
  }
  res.sendFile(path.join(distPath, "index.html"));
});
app.listen(port, () => {
  console.log(`🚀 Fusion Starter server running on port ${port}`);
  console.log(`📱 Frontend: http://localhost:${port}`);
  console.log(`🔧 API: http://localhost:${port}/api`);
});
process.on("SIGTERM", () => {
  console.log("🛑 Received SIGTERM, shutting down gracefully");
  process.exit(0);
});
process.on("SIGINT", () => {
  console.log("🛑 Received SIGINT, shutting down gracefully");
  process.exit(0);
});
//# sourceMappingURL=node-build.mjs.map
