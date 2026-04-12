import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const plans = [
  {
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
    buttonText: "Get Pro Access",
    popular: true,
  },
  {
    name: "Lifetime",
    price: "$79",
    period: " once",
    description: "Secure your mastery with a one-time investment.",
    features: [
      "All Pro features forever",
      "Lifetime feature updates",
      "Exclusive Founder Badge",
      "Direct priority support",
      "No recurring subscriptions",
    ],
    buttonText: "Get Lifetime Access",
    popular: false,
  },
];

export default function PricingSection() {
  return (
    <section className="w-full bg-background px-6 py-24 sm:py-32 pb-4 sm:pb-6 relative">
      {/* Full-width top divider */}
      <div className="absolute top-0 left-0 w-full h-px bg-border/60" />

      <div className="mx-auto max-w-5xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-heading font-bold text-foreground sm:text-4xl lg:text-5xl mb-4">
            Simple, Transparent{" "}
            <span className="font-serif italic text-primary">Pricing</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that fits your learning pace. No hidden fees.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`flex flex-col p-8 bg-card border ${
                plan.popular ? "border-primary ring-1 ring-primary/30 shadow-2xl shadow-primary/10" : "border-border"
              } rounded-2xl relative overflow-hidden`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-bl-lg">
                  Most Popular
                </div>
              )}
              
              <div className="mb-8">
                <h3 className="text-xl font-bold text-foreground mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-primary">{plan.price}</span>
                  {plan.period && (
                    <span className="text-muted-foreground text-sm font-medium">
                      {plan.period}
                    </span>
                  )}
                </div>
                <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                  {plan.description}
                </p>
              </div>

              <div className="flex-1 space-y-4 mb-8">
                {plan.features.map((feature, fIndex) => (
                  <div key={fIndex} className="flex items-start gap-3">
                    <div className="mt-1 flex-shrink-0">
                      <Check className="w-4 h-4 text-primary" strokeWidth={3} />
                    </div>
                    <span className="text-sm text-foreground/80 leading-tight">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              <Button
                variant={plan.popular ? "default" : "outline"}
                className={`w-full py-6 text-base font-bold rounded-xl ${
                  plan.popular 
                    ? "shadow-lg shadow-primary/20" 
                    : "border-border text-foreground hover:bg-secondary/50"
                }`}
              >
                {plan.buttonText}
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Full-width bottom divider */}
      <div className="mt-16 sm:mt-24 w-full h-px bg-border/60" />
    </section>
  );
}
