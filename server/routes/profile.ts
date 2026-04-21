import { RequestHandler } from "express";

export const handleProfile: RequestHandler = (req, res) => {
  const user = req.user; // Set by requireAuth middleware

  if (!user) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  return res.json({
    success: true,
    user: {
      id: user.id,
      email: user.email,
      createdAt: user.created_at,
      metadata: user.user_metadata,
    },
  });
};
