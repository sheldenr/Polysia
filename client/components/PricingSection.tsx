import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Tick02Icon, Loading03Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { parseJsonResponse } from "@/lib/http";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import type {
  BillingPlanId,
  CreateCheckoutSessionResponse,
  CreateCheckoutSessionRequest,
} from "@shared/api";

const plans: Array<{
  id: BillingPlanId;
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  buttonText: string;
  popular: boolean;
}> = [
  {
    id: "pro_monthly",
    name: "Pro Monthly",
    price: "$2.99",
    period: "/month",
    description: "Complete access with a 7-day free trial. Perfect for dedicated learners.",
    features: [
      "Unlimited Practice Conversations",
      "Tailored Reading support",
      "Character Flashcards",
      "Cloud Vocabulary Sync",
      "Learning Analytics",
    ],
    buttonText: "Start 7-day Free Trial",
    popular: true,
  },
  {
    id: "lifetime",
    name: "Lifetime Access",
    price: "$44.99",
    period: "one-time",
    description: "Secure your fluency forever with a single payment. No recurring fees.",
    features: [
      "All Pro features forever",
      "Lifetime updates",
      "Priority Support",
      "Future AI capabilities included",
    ],
    buttonText: "Get Lifetime Access",
    popular: false,
  },
];

export default function PricingSection() {
  const { user, session, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeCheckoutPlan, setActiveCheckoutPlan] = useState<BillingPlanId | null>(null);

  const handleCheckout = async (planId: BillingPlanId) => {
    if (!isAuthenticated) {
      navigate("/signup");
      return;
    }
    
    setActiveCheckoutPlan(planId);

    try {
      const payload: CreateCheckoutSessionRequest = {
        plan: planId,
        customerEmail: user?.email,
      };

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (session?.access_token) {
        headers["Authorization"] = `Bearer ${session.access_token}`;
      }

      const response = await fetch("/api/billing/checkout", {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      const data = await parseJsonResponse<
        | CreateCheckoutSessionResponse
        | { error?: string }
      >(response, {
        emptyMessage: "Unable to start checkout: the server returned no response.",
        invalidMessage: "Unable to start checkout: received an invalid server response.",
      });

      if (!response.ok || !("checkoutUrl" in data)) {
        throw new Error(
          "error" in data && data.error
            ? data.error
            : "Unable to start checkout.",
        );
      }

      window.location.href = data.checkoutUrl;
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Checkout unavailable",
        description:
          error instanceof Error ? error.message : "Please try again in a moment.",
      });
      setActiveCheckoutPlan(null);
    }
  };

  return (
    <section className="relative w-full bg-white dark:bg-background px-6 py-24 sm:py-32 overflow-hidden">
      {/* Refined Divider */}
      <div className="absolute left-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-border/60 to-transparent" />

      <div className="mx-auto max-w-3xl">
        <div className="mb-12 text-left">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-semibold tracking-tight text-foreground mb-4">
            Invest in your <br />
            Mandarin future
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-xl">
            Professional tools for serious language learners. <br />
            Simple pricing, powerful results.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-stretch">
          {plans.map((plan) => (
            <div
                key={plan.id}
                className={cn(
                  "relative flex flex-col justify-between p-6 sm:p-10 transition-all duration-500 group rounded-xl",
                  "bg-zinc-950 dark:bg-zinc-900/60 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.15)] dark:shadow-none",
                  plan.popular && "ring-1 ring-zinc-800"
                )}
              >
              <div>
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-[10px] font-bold capitalize tracking-[0.15em] mb-3 text-zinc-500">
                      {plan.name}
                    </h3>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl sm:text-5xl font-heading tracking-tighter text-zinc-50">
                        {plan.price}
                      </span>
                      <span className="text-sm font-medium text-zinc-500">
                        {plan.period}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-sm leading-relaxed mb-6 max-w-sm text-zinc-400">
                  {plan.description}
                </p>

                <div className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-3">
                      <div className="mt-1 shrink-0">
                        <HugeiconsIcon 
                          icon={Tick02Icon} 
                          className="h-3.5 w-3.5 text-zinc-400"
                          strokeWidth={2.5} 
                        />
                      </div>
                      <span className="text-xs text-zinc-300">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <Button
                type="button"
                disabled={activeCheckoutPlan !== null}
                onClick={() => void handleCheckout(plan.id)}
                className={cn(
                  "w-full h-12 text-sm font-bold transition-all duration-300 rounded-xl",
                  plan.popular
                    ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-xl shadow-primary/20"
                    : "bg-zinc-800 text-zinc-100 hover:bg-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
                )}
              >
                {activeCheckoutPlan === plan.id ? (
                  <>
                    <HugeiconsIcon icon={Loading03Icon} className="mr-3 h-5 w-5 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  plan.buttonText
                )}
              </Button>
            </div>
          ))}
        </div>

        {/* Stripe Trust Footer */}
        <div className="mt-16 flex items-center justify-center gap-6 text-muted-foreground/40 grayscale opacity-50">
           <span className="text-xs font-bold capitalize tracking-widest">Secure Checkout via Stripe</span>
        </div>
      </div>
    </section>
  );
}
