const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseApiKey =
  process.env.SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SERVICE_ROLE;

export interface AuthenticatedUser {
  id: string;
  email?: string | null;
  created_at?: string;
  user_metadata?: Record<string, unknown> | null;
}

if (!supabaseUrl || !supabaseApiKey) {
  console.warn("⚠️ Supabase environment variables are missing. Auth will fail.");
}

export async function verifySupabaseToken(token: string): Promise<AuthenticatedUser | null> {
  if (!supabaseUrl || !supabaseApiKey) {
    console.error("Auth failed: Supabase credentials are missing.");
    return null;
  }

  try {
    const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        apikey: supabaseApiKey,
      },
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as Partial<AuthenticatedUser>;
    if (!payload?.id) {
      return null;
    }

    return {
      id: payload.id,
      email: payload.email ?? null,
      created_at: payload.created_at,
      user_metadata:
        payload.user_metadata && typeof payload.user_metadata === "object"
          ? payload.user_metadata
          : null,
    };
  } catch (err) {
    console.error("Supabase token verification error:", err);
    return null;
  }
}
