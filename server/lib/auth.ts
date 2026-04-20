import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { User } from "../../shared/auth";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";
const JWT_EXPIRES_IN = "7d";

export interface UserWithPassword extends User {
  passwordHash: string;
}

// In-memory user storage (replace with database in production)
export const users: Map<string, UserWithPassword> = new Map();

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10);
}

export function comparePassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash);
}

export function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): { userId: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string };
  } catch {
    return null;
  }
}

export function sanitizeUser(user: UserWithPassword): User {
  return {
    id: user.id,
    email: user.email,
    createdAt: user.createdAt,
  };
}
