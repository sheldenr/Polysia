import path from "path";
import "dotenv/config";
import * as express from "express";
import express__default from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { z } from "zod";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import Stripe from "stripe";
const handleDemo = (req, res) => {
  const response = {
    message: "Hello from Express server"
  };
  res.status(200).json(response);
};
const signupSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters")
});
const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required")
});
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";
const JWT_EXPIRES_IN = "7d";
const users = /* @__PURE__ */ new Map();
function hashPassword(password) {
  return bcrypt.hashSync(password, 10);
}
function comparePassword(password, hash) {
  return bcrypt.compareSync(password, hash);
}
function generateToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}
function sanitizeUser(user) {
  return {
    id: user.id,
    email: user.email,
    createdAt: user.createdAt
  };
}
const handleSignup = (req, res) => {
  try {
    const validation = signupSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: validation.error.errors[0].message
      });
    }
    const { email, password } = validation.data;
    const existingUser = Array.from(users.values()).find((u) => u.email === email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists"
      });
    }
    const userId = randomUUID();
    const passwordHash = hashPassword(password);
    const newUser = {
      id: userId,
      email,
      passwordHash,
      createdAt: /* @__PURE__ */ new Date()
    };
    users.set(userId, newUser);
    const token = generateToken(userId);
    return res.status(201).json({
      success: true,
      user: sanitizeUser(newUser),
      token
    });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};
const handleLogin = (req, res) => {
  try {
    const validation = loginSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: validation.error.errors[0].message
      });
    }
    const { email, password } = validation.data;
    const user = Array.from(users.values()).find((u) => u.email === email);
    if (!user || !comparePassword(password, user.passwordHash)) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }
    const token = generateToken(user.id);
    return res.status(200).json({
      success: true,
      user: sanitizeUser(user),
      token
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};
const handleVerifyToken = (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "No token provided"
      });
    }
    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token"
      });
    }
    const user = users.get(decoded.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found"
      });
    }
    return res.status(200).json({
      success: true,
      user: sanitizeUser(user)
    });
  } catch (error) {
    console.error("Token verification error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};
const handleProfile = (req, res) => {
  const userId = req.userId;
  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
  const user = users.get(userId);
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }
  return res.json({
    success: true,
    user: sanitizeUser(user)
  });
};
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
const handleDeepSeekRoleplay = async (req, res) => {
  const parsed = deepSeekRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: parsed.error.errors[0]?.message ?? "Invalid request payload"
    });
  }
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: "DeepSeek is not configured. Add DEEPSEEK_API_KEY to your environment."
    });
  }
  const model = process.env.DEEPSEEK_MODEL ?? "deepseek-chat";
  try {
    const upstream = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages: parsed.data.messages,
        temperature: parsed.data.temperature ?? 0.7,
        max_tokens: parsed.data.max_tokens ?? 220
      })
    });
    const upstreamBody = await upstream.json();
    if (!upstream.ok) {
      return res.status(502).json({
        error: upstreamBody.error?.message ?? "DeepSeek request failed. Please try again."
      });
    }
    const content = upstreamBody.choices?.[0]?.message?.content?.trim();
    if (!content) {
      return res.status(502).json({
        error: "DeepSeek returned an empty response."
      });
    }
    const response = {
      content,
      model: upstreamBody.model ?? model,
      usage: upstreamBody.usage
    };
    return res.status(200).json(response);
  } catch (error) {
    console.error("DeepSeek roleplay error:", error);
    return res.status(500).json({
      error: "Unable to reach DeepSeek right now."
    });
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
  const trimmed = raw.trim();
  if (!trimmed.startsWith("```")) {
    return trimmed;
  }
  return trimmed.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
}
const handleDeepSeekReading = async (_req, res) => {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: "DeepSeek is not configured. Add DEEPSEEK_API_KEY to your environment."
    });
  }
  const model = process.env.DEEPSEEK_MODEL ?? "deepseek-chat";
  const selectedTopic = randomTopics[Math.floor(Math.random() * randomTopics.length)];
  try {
    const upstream = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        temperature: 0.8,
        max_tokens: 320,
        messages: [
          {
            role: "system",
            content: 'You are a Chinese reading tutor. Return strict JSON only (no markdown): {"titleZh":"...","titleEn":"...","text":"...","quiz":[{"question":"...","answer":true},{"question":"...","answer":false}]}. titleZh should be a concise Chinese topic title (4-12 chars). titleEn should be the natural English translation of that Chinese title. text must be a single Mandarin passage between 180 and 220 Chinese characters. text must contain only Chinese (no English, no pinyin, no bullets). quiz must contain exactly 2 true/false questions that are directly based on details from text. Each question must be in English and each answer must be a boolean.'
          },
          {
            role: "user",
            content: `Create today's reading passage for an intermediate learner. Use a random topic around: ${selectedTopic}.`
          }
        ]
      })
    });
    const upstreamBody = await upstream.json();
    if (!upstream.ok) {
      return res.status(502).json({
        error: upstreamBody.error?.message ?? "DeepSeek reading prompt request failed."
      });
    }
    const content = upstreamBody.choices?.[0]?.message?.content?.trim();
    if (!content) {
      return res.status(502).json({
        error: "DeepSeek returned an empty reading prompt."
      });
    }
    let parsed = null;
    try {
      parsed = JSON.parse(stripCodeFences(content));
    } catch {
      return res.status(502).json({
        error: "DeepSeek returned an invalid reading payload."
      });
    }
    const titleZh = parsed.titleZh?.trim();
    const titleEn = parsed.titleEn?.trim();
    const text = parsed.text?.trim();
    const quiz = parsed.quiz;
    if (!titleZh || !titleEn || !text || !Array.isArray(quiz) || quiz.length !== 2 || quiz.some((item) => !item.question?.trim() || typeof item.answer !== "boolean")) {
      return res.status(502).json({
        error: "DeepSeek reading payload is missing required fields."
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
      model: upstreamBody.model ?? model
    };
    return res.status(200).json(response);
  } catch (error) {
    console.error("DeepSeek reading prompt error:", error);
    return res.status(500).json({
      error: "Unable to generate reading prompt right now."
    });
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
function requireAuth(req, res, next) {
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
function createServer() {
  const app2 = express__default();
  app2.use(cors());
  app2.use(express__default.json());
  app2.use(express__default.urlencoded({ extended: true }));
  app2.use(cookieParser());
  app2.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });
  app2.get("/api/demo", handleDemo);
  app2.post("/api/ai/roleplay", handleDeepSeekRoleplay);
  app2.get("/api/ai/reading-prompt", handleDeepSeekReading);
  app2.post("/api/billing/checkout", handleCreateCheckoutSession);
  app2.post("/api/auth/signup", handleSignup);
  app2.post("/api/auth/login", handleLogin);
  app2.get("/api/auth/verify", handleVerifyToken);
  app2.get("/api/profile", requireAuth, handleProfile);
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
