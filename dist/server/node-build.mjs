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
