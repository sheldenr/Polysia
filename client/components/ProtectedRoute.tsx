import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { PaymentGate } from "@/components/PaymentGate";

interface ProtectedRouteProps {
  children: ReactNode;
  allowOnboarding?: boolean;
}

export function ProtectedRoute({ children, allowOnboarding = false }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, onboardingComplete, profileLoaded } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!profileLoaded) {
    if (allowOnboarding) {
      return <>{children}</>;
    }
    return <Navigate to="/onboarding" replace />;
  }

  if (!onboardingComplete && !allowOnboarding) {
    return <Navigate to="/onboarding" replace />;
  }

  if (allowOnboarding) {
    return <>{children}</>;
  }

  return <PaymentGate>{children}</PaymentGate>;
}
