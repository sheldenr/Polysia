import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { supabase, supabaseConfigError } from "./supabase";
import type { User, Session } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  onboardingComplete: boolean;
  subscriptionStatus: string | null;
  paymentBypassUntil: string | null;
  profileLoaded: boolean;
  supabaseConfigError: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean; error?: string; requiresEmailVerification?: boolean }>;
  logout: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  loginWithGoogleToken: (token: string) => Promise<{ success: boolean; error?: string }>;
  refreshProfile: () => Promise<{ onboardingComplete: boolean; subscriptionStatus: string | null; paymentBypassUntil: string | null } | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Consolidate profile into one state to avoid partial updates
  const [profile, setProfile] = useState<{
    onboardingComplete: boolean;
    subscriptionStatus: string | null;
    paymentBypassUntil: string | null;
    isLoaded: boolean;
  }>({
    onboardingComplete: false,
    subscriptionStatus: null,
    paymentBypassUntil: null,
    isLoaded: false
  });

  const fetchProfile = async (userId: string) => {
    try {
      if (!supabase) return null;
      
      // Get the session to get the access token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return null;

      // Call our Express API which performs the Stripe sync
      const response = await fetch("/api/profile", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch profile from API");
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message || "API returned failure");
      }

      const profileData = result.profile;
      const onboarding = profileData?.onboardingComplete ?? false;
      const subStatus = profileData?.subscriptionStatus ?? null;
      const bypass = profileData?.paymentBypassUntil ?? null;

      const newProfile = { 
        onboardingComplete: onboarding, 
        subscriptionStatus: subStatus, 
        paymentBypassUntil: bypass,
        isLoaded: true 
      };
      
      setProfile(newProfile);
      return newProfile;
    } catch (err) {
      console.error("Error fetching profile:", err);
      return null;
    }
  };

  const refreshProfile = useCallback(async () => {
    if (user) {
      if (user.id === "debug-user") return profile;
      return await fetchProfile(user.id);
    }
    return null;
  }, [user, profile]);

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

    // Local development bypass
    const debugAuth = localStorage.getItem("DEBUG_AUTH") === "true";
    const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
    
    if (debugAuth && isLocal) {
      console.log("DEBUG_AUTH active: Injecting mock user");
      const mockUser = {
        id: "debug-user",
        email: "debug@polysia.com",
        user_metadata: { full_name: "Debug User" },
        app_metadata: {},
      } as any;
      setUser(mockUser);
      setProfile({
        onboardingComplete: false,
        subscriptionStatus: "active",
        paymentBypassUntil: null,
        isLoaded: true
      });
      setIsLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id).finally(() => {
          setIsLoading(false);
        });
      } else {
        setIsLoading(false);
      }
      if (session) {
        clearAuthParamsFromUrl();
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id).finally(() => {
          setIsLoading(false);
        });
      } else {
        setProfile({ onboardingComplete: false, subscriptionStatus: null, paymentBypassUntil: null, isLoaded: false });
        setIsLoading(false);
      }
      if (session) {
        clearAuthParamsFromUrl();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Handle post-payment verification and redirection
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const checkoutState = params.get("checkout");
    const sessionId = params.get("session_id");

    if (checkoutState === "success" && sessionId && session?.access_token) {
      const verifyPayment = async () => {
        try {
          const response = await fetch("/api/billing/verify-session", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({ sessionId }),
          });
          
          if (response.ok) {
            await refreshProfile();
            toast({
              title: "Payment successful!",
              description: "Welcome to Pro! You now have full access.",
            });
            
            // Clear URL and redirect to learning hub
            const url = new URL(window.location.href);
            url.searchParams.delete("checkout");
            url.searchParams.delete("session_id");
            url.searchParams.delete("plan");
            window.history.replaceState({}, document.title, url.pathname);
            
            // If not already on learning-hub, redirect there
            if (!window.location.pathname.startsWith("/learning-hub")) {
              window.location.href = "/learning-hub";
            }
          } else {
            const errorData = await response.json();
            throw new Error(errorData.error || "Verification failed");
          }
        } catch (error) {
          console.error("Global payment verification error:", error);
          toast({
            variant: "destructive",
            title: "Verification failed",
            description: error instanceof Error ? error.message : "Could not verify your payment. Please contact support.",
          });
        }
      };
      
      void verifyPayment();
    }
  }, [session, refreshProfile, toast]);

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

  const loginWithGoogleToken = async (token: string) => {
    if (!supabase) {
      return { success: false, error: supabaseConfigError ?? "Supabase is not configured" };
    }

    try {
      const { error } = await supabase.auth.signInWithIdToken({
        provider: "google",
        token: token,
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

    // Ensure we use http for localhost to avoid SSL errors during dev
    let redirectTo = `${window.location.origin}/auth/callback`;
    if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
      redirectTo = redirectTo.replace("https://", "http://");
    }

    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
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
        onboardingComplete: profile.onboardingComplete,
        subscriptionStatus: profile.subscriptionStatus,
        paymentBypassUntil: profile.paymentBypassUntil,
        profileLoaded: profile.isLoaded,
        supabaseConfigError,
        login,
        signup,
        logout,
        signInWithGoogle,
        loginWithGoogleToken,
        refreshProfile,
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
