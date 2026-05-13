import { ReactNode } from "react";
import { Lock } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";

const BYPASS_EMAILS = new Set(["bbshelden@gmail.com"]);

export function isPaymentBypassed(email: string | null | undefined): boolean {
  if (!email) return false;
  return BYPASS_EMAILS.has(email.trim().toLowerCase());
}

interface PaymentGateProps {
  children: ReactNode;
}

export function PaymentGate({ children }: PaymentGateProps) {
  const { user, logout } = useAuth();
  const allowed = isPaymentBypassed(user?.email);

  if (allowed) {
    return <>{children}</>;
  }

  return (
    <div className="relative min-h-screen">
      <div
        aria-hidden
        className="pointer-events-none select-none opacity-30 grayscale blur-[1px]"
      >
        {children}
      </div>
      <div className="fixed inset-0 z-[9998] bg-background/70 backdrop-blur-sm" />
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-3xl border bg-card p-8 text-center shadow-2xl">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-secondary/60">
            <Lock className="h-6 w-6 text-foreground" />
          </div>
          <h2 className="font-heading text-2xl mb-2">Payment required</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Polysia is currently in a paid early-access period. Complete payment
            to unlock flashcards, reading, and roleplay.
          </p>
          <div className="flex flex-col gap-2">
            <Button asChild className="rounded-xl">
              <a href="/pricing">View pricing</a>
            </Button>
            <Button
              variant="ghost"
              className="rounded-xl text-muted-foreground"
              onClick={() => {
                void logout();
              }}
            >
              Sign out
            </Button>
          </div>
          {user?.email && (
            <p className="mt-4 text-[11px] text-muted-foreground/70">
              Signed in as {user.email}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
