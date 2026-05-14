import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { PaymentGate } from "@/components/PaymentGate";

interface ProtectedRouteProps {
  children: ReactNode;
  allowOnboarding?: boolean;
}

export function ProtectedRoute({ children, allowOnboarding = false }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, onboardingComplete, subscriptionStatus, profileLoaded } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const searchParams = location.search;
  const isCheckoutSuccessReturn =
    new URLSearchParams(location.search).get("checkout") === "success";

  if (!isAuthenticated) {
    return <Navigate to={`/login${searchParams}`} replace />;
  }

  const isSubscribed = subscriptionStatus === "active" || subscriptionStatus === "trialing";

  if (!profileLoaded) {
    if (allowOnboarding) {
      return <>{children}</>;
    }
    return <Navigate to={`/onboarding${searchParams}`} replace />;
  }

  // Allow access if onboarded OR subscribed
  if (!onboardingComplete && !isSubscribed && !allowOnboarding && !isCheckoutSuccessReturn) {
    return <Navigate to={`/onboarding${searchParams}`} replace />;
  }

  if (allowOnboarding) {
    return <>{children}</>;
  }

  return <PaymentGate>{children}</PaymentGate>;
}
