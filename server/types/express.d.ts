declare namespace Express {
  interface Request {
    user?: {
      id: string;
      email?: string | null;
      created_at?: string;
      user_metadata?: Record<string, unknown> | null;
    };
    userId?: string;
  }
}
