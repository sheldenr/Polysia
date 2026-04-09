import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase, supabaseConfigError } from "./supabase";
import type { User, Session } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean; error?: string; requiresEmailVerification?: boolean }>;
  logout: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const clearAuthParamsFromUrl = () => {
    const url = new URL(window.location.href);
    let changed = false;

    if (
      url.hash &&
      /(access_token|refresh_token|expires_in|token_type|provider_token|provider_refresh_token)/.test(url.hash)
    ) {
      url.hash = "";
      changed = true;
    }

    for (const key of ["code", "state"]) {
      if (url.searchParams.has(key)) {
        url.searchParams.delete(key);
        changed = true;
      }
    }

    if (changed) {
      window.history.replaceState({}, document.title, `${url.pathname}${url.search}${url.hash}`);
    }
  };

  useEffect(() => {
    if (!supabase) {
      console.error(supabaseConfigError);
      setIsLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session) {
        clearAuthParamsFromUrl();
      }
      setIsLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session) {
        clearAuthParamsFromUrl();
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signup = async (email: string, password: string) => {
    if (!supabase) {
      return { success: false, error: supabaseConfigError ?? "Supabase is not configured" };
    }

    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return {
        success: true,
        requiresEmailVerification: !session,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "An error occurred",
      };
    }
  };

  const login = async (email: string, password: string) => {
    if (!supabase) {
      return { success: false, error: supabaseConfigError ?? "Supabase is not configured" };
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "An error occurred",
      };
    }
  };

  const logout = async () => {
    if (!supabase) {
      return;
    }

    await supabase.auth.signOut();
  };

  const signInWithGoogle = async () => {
    if (!supabase) {
      throw new Error(supabaseConfigError ?? "Supabase is not configured");
    }

    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
        signInWithGoogle,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
