import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Tick02Icon, Loading03Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { parseJsonResponse } from "@/lib/http";
import { useToast } from "@/hooks/use-toast";
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
    name: "Monthly",
    price: "$2.99",
    period: "/mo",
    description: "Complete access to all of Polysia.",
    features: [
      "Unlimited Practice Conversations",
      "Tailored Reading support",
      "Character Flashcards",
      "Cloud Vocabulary Sync",
      "Learning Analytics",
    ],
    buttonText: "Pay Monthly",
    popular: true,
  },
  {
    id: "lifetime",
    name: "Lifetime",
    price: "$44.99",
    period: " one-time",
    description: "Secure your fluency with a single payment.",
    features: [
      "All Pro features forever",
      "Lifetime updates",
      "Priority Support",
      "No recurring fees",
    ],
    buttonText: "Get Lifetime",
    popular: false,
  },
];

export default function PricingSection() {
  const { user, session } = useAuth();
  const { toast } = useToast();
  const [activeCheckoutPlan, setActiveCheckoutPlan] = useState<BillingPlanId | null>(null);

  const handleCheckout = async (planId: BillingPlanId) => {
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
    <section className="relative w-full bg-background px-6 pb-4 pt-24 sm:pb-6 sm:pt-32">
      <div className="absolute left-0 top-0 h-px w-full bg-border/60" />

      <div className="mx-auto max-w-5xl">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-heading text-foreground sm:text-4xl lg:text-5xl">
            Fair and effective{" "}
            <span className="italic-serif text-primary">
              pricing.
            </span>
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Choose between a monthly subscription and a lifelong plan for learning. Secure checkout is powered by Stripe.
          </p>
        </div>

        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-2">
          {plans.map((plan) => (
            <div
                key={plan.id}
                className={`relative flex flex-col overflow-hidden rounded-3xl border p-8 transition-all duration-300 ${
                  plan.id === "pro_monthly"
                    ? "bg-black text-white border-black shadow-2xl shadow-black/20 dark:bg-white dark:text-black dark:border-white"
                    : "bg-zinc-50 dark:bg-zinc-900/50 border-border"
                }`}
              >
              <div className="mb-8">
                <h3 className={`mb-2 text-xl ${plan.id === "pro_monthly" ? "text-white dark:text-black" : "text-foreground"}`}>
                  {plan.name}
                </h3>
                <div className="flex items-baseline gap-1">
                  <span className={`text-4xl ${plan.id === "pro_monthly" ? "text-white dark:text-black" : "text-primary"}`}>{plan.price}</span>
                  <span className={`text-sm font-medium ${plan.id === "pro_monthly" ? "text-zinc-400 dark:text-zinc-600" : "text-muted-foreground"}`}>
                    {plan.period}
                  </span>
                </div>
                <p className={`mt-4 text-sm leading-relaxed ${plan.id === "pro_monthly" ? "text-zinc-400 dark:text-zinc-600" : "text-muted-foreground"}`}>
                  {plan.description}
                </p>
              </div>

              <div className="mb-8 flex-1 space-y-4">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-start gap-3">
                    <div className="mt-1 shrink-0">
                      <HugeiconsIcon 
                        icon={Tick02Icon} 
                        className={`h-4 w-4 ${plan.id === "pro_monthly" ? "text-white dark:text-black" : "text-primary"}`} 
                        strokeWidth={3} 
                      />
                    </div>
                    <span className={`text-sm leading-tight ${plan.id === "pro_monthly" ? "text-zinc-300 dark:text-zinc-700" : "text-foreground/80"}`}>
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              <Button
                type="button"
                variant={plan.popular ? "default" : "outline"}
                disabled={activeCheckoutPlan !== null}
                onClick={() => void handleCheckout(plan.id)}
                  className={`w-full rounded-xl py-6 text-base ${
                    plan.id === "pro_monthly"
                      ? "bg-white text-black hover:bg-zinc-200 border-none shadow-lg shadow-white/10 dark:bg-black dark:text-white dark:hover:bg-black/90 dark:shadow-black/20"
                      : activeCheckoutPlan === plan.id
                        ? "bg-primary text-primary-foreground border-none"
                        : "border-border text-foreground hover:border-primary hover:bg-primary hover:text-primary-foreground"
                }`}
              >
                {activeCheckoutPlan === plan.id ? (
                  <>
                    <HugeiconsIcon icon={Loading03Icon} className="mr-2 h-4 w-4 animate-spin" />
                    Redirecting...
                  </>
                ) : (
                  plan.buttonText
                )}
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-16 h-px w-full bg-border/60 sm:mt-24" />
    </section>
  );
}
