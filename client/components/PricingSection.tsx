import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Tick02Icon, Loading03Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
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
    name: "Pro",
    price: "$2.99",
    period: "/mo",
    description: "Complete access to all AI-powered learning tools.",
    features: [
      "Unlimited AI Roleplay sessions",
      "Unlimited Smart Reading support",
      "Advanced Spaced Repetition (SRS)",
      "Cloud Vocabulary Synchronization",
      "Detailed Learning Analytics",
      "Priority AI response times",
    ],
    buttonText: "Start Pro",
    popular: true,
  },
  {
    id: "lifetime",
    name: "Lifetime",
    price: "$44.99",
    period: " one-time",
    description: "Secure your mastery with a single payment.",
    features: [
      "All Pro features forever",
      "Lifetime feature updates",
      "Exclusive Founder Badge",
      "Direct priority support",
      "No recurring subscriptions",
    ],
    buttonText: "Get Lifetime",
    popular: false,
  },
];

export default function PricingSection() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeCheckoutPlan, setActiveCheckoutPlan] = useState<BillingPlanId | null>(null);

  const handleCheckout = async (planId: BillingPlanId) => {
    setActiveCheckoutPlan(planId);

    try {
      const payload: CreateCheckoutSessionRequest = {
        plan: planId,
        customerEmail: user?.email,
      };

      const response = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as
        | CreateCheckoutSessionResponse
        | { error?: string };

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
            Simple, Transparent{" "}
            <span className="italic-serif text-primary">
              potential.
            </span>
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Choose the plan that fits your learning pace. Secure checkout is powered by Stripe.
          </p>
        </div>

        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-2">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative flex flex-col overflow-hidden rounded-3xl border bg-card p-8 ${
                plan.popular
                  ? "border-primary ring-1 ring-primary/30 shadow-2xl shadow-primary/10"
                  : "border-border"
              }`}
            >
              {plan.popular && (
                <div className="absolute right-0 top-0 rounded-bl-lg bg-primary px-3 py-1 text-[10px] uppercase tracking-widest text-primary-foreground">
                  Most Popular
                </div>
              )}

              <div className="mb-8">
                <h3 className="mb-2 text-xl text-foreground">{plan.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl text-primary">{plan.price}</span>
                  <span className="text-sm font-medium text-muted-foreground">{plan.period}</span>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                  {plan.description}
                </p>
              </div>

              <div className="mb-8 flex-1 space-y-4">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-start gap-3">
                    <div className="mt-1 shrink-0">
                      <HugeiconsIcon icon={Tick02Icon} className="h-4 w-4 text-primary" strokeWidth={3} />
                    </div>
                    <span className="text-sm leading-tight text-foreground/80">{feature}</span>
                  </div>
                ))}
              </div>

              <Button
                type="button"
                variant={plan.popular ? "default" : "outline"}
                disabled={activeCheckoutPlan !== null}
                onClick={() => void handleCheckout(plan.id)}
                className={`w-full rounded-xl py-6 text-base ${
                  plan.popular
                    ? "shadow-lg shadow-primary/20"
                    : "border-border text-foreground hover:bg-secondary/50"
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
