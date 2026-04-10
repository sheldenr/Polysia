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
function normalizePromptLength(prompt) {
  const compact = prompt.replace(/\s+/g, "").trim();
  if (compact.length <= 230) {
    return compact;
  }
  const trimmed = compact.slice(0, 220);
  return trimmed.replace(/[，。！？；、]*$/, "。");
}
const handleDeepSeekReading = async (_req, res) => {
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
        temperature: 0.8,
        max_tokens: 320,
        messages: [
          {
            role: "system",
            content: "You are a Chinese reading tutor. Generate one Mandarin reading prompt between 180 and 220 Chinese characters. Return only plain Chinese text, no title, no bullets, no markdown."
          },
          {
            role: "user",
            content: "Create today's reading prompt for an intermediate learner focused on daily life situations."
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
    const prompt = upstreamBody.choices?.[0]?.message?.content?.trim();
    if (!prompt) {
      return res.status(502).json({
        error: "DeepSeek returned an empty reading prompt."
      });
    }
    const response = {
      prompt: normalizePromptLength(prompt),
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
  app2.post("/api/auth/signup", handleSignup);
  app2.post("/api/auth/login", handleLogin);
  app2.get("/api/auth/verify", handleVerifyToken);
  app2.get("/api/profile", requireAuth, handleProfile);
  return app2;
}
const app = createServer();
const port = process.env.PORT || 3e3;
const __dirname$1 = import.meta.dirname;
const distPath = path.join(__dirname$1, "../spa");
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
