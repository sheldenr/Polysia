import { RequestHandler } from "express";
import { signupSchema, loginSchema, AuthResponse, VerifyResponse } from "../../shared/auth";
import {
  users,
  hashPassword,
  comparePassword,
  generateToken,
  verifyToken,
  sanitizeUser,
} from "../lib/auth";
import { randomUUID } from "crypto";

export const handleSignup: RequestHandler = (req, res) => {
  try {
    const validation = signupSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: validation.error.errors[0].message,
      } as AuthResponse);
    }

    const { email, password } = validation.data;

    // Check if user already exists
    const existingUser = Array.from(users.values()).find((u) => u.email === email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      } as AuthResponse);
    }

    // Create new user
    const userId = randomUUID();
    const passwordHash = hashPassword(password);

    const newUser = {
      id: userId,
      email,
      passwordHash,
      createdAt: new Date(),
    };

    users.set(userId, newUser);

    // Generate token
    const token = generateToken(userId);

    return res.status(201).json({
      success: true,
      user: sanitizeUser(newUser),
      token,
    } as AuthResponse);
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    } as AuthResponse);
  }
};

export const handleLogin: RequestHandler = (req, res) => {
  try {
    const validation = loginSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: validation.error.errors[0].message,
      } as AuthResponse);
    }

    const { email, password } = validation.data;

    // Find user by email
    const user = Array.from(users.values()).find((u) => u.email === email);

    if (!user || !comparePassword(password, user.passwordHash)) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      } as AuthResponse);
    }

    // Generate token
    const token = generateToken(user.id);

    return res.status(200).json({
      success: true,
      user: sanitizeUser(user),
      token,
    } as AuthResponse);
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    } as AuthResponse);
  }
};

export const handleVerifyToken: RequestHandler = (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      } as VerifyResponse);
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      } as VerifyResponse);
    }

    const user = users.get(decoded.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      } as VerifyResponse);
    }

    return res.status(200).json({
      success: true,
      user: sanitizeUser(user),
    } as VerifyResponse);
  } catch (error) {
    console.error("Token verification error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    } as VerifyResponse);
  }
};
