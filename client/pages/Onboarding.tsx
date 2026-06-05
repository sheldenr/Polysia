import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2, ChevronLeft, ChevronRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { GlowButton } from "@/components/ui/glow-button";

const proficiencyLevels = [
  { label: "Total Beginner", description: "Starting from scratch", hsk: 1, icon: "🌱" },
  { label: "Elementary", description: "I know basic phrases", hsk: 2, icon: "🚲" },
  { label: "Intermediate", description: "I can have basic conversations", hsk: 4, icon: "🚗" },
  { label: "Advanced", description: "I'm quite fluent", hsk: 7, icon: "✈️" },
];
const learningGoals = [
  { label: "Travel & Culture", icon: "✈️" },
  { label: "Career Growth", icon: "💼" },
  { label: "Academic Study", icon: "🎓" },
  { label: "Daily Fluency", icon: "🗣️" },
  { label: "Exam Preparation", icon: "📝" },
];
const learningReasons = [
  { label: "Family & Friends", icon: "❤️" },
  { label: "Work Opportunities", icon: "📈" },
  { label: "School or University", icon: "🏫" },
  { label: "Travel Confidence", icon: "🗺️" },
  { label: "Personal Interest", icon: "🌟" },
];
const ageOptions = [
  { label: "Under 18", value: 16 },
  { label: "18-24", value: 21 },
  { label: "25-34", value: 29 },
  { label: "35-44", value: 39 },
  { label: "45-54", value: 49 },
  { label: "55+", value: 60 },
];
const dailyTimeOptions = [
  { label: "10 min / day", value: 10, description: "Just a quick dip" },
  { label: "20 min / day", value: 20, description: "Consistent progress" },
  { label: "30 min / day", value: 30, description: "Serious learner" },
  { label: "45 min / day", value: 45, description: "Intensive study" },
  { label: "60 min / day", value: 60, description: "Full immersion" },
];
const referralOptions = [
  "Social Media",
  "Friend / Family",
  "Search Engine",
  "Blog or Article",
  "Advertisement",
  "Other",
];

const trialFeatures = [
  "Unlimited Practice Conversations",
  "Character Flashcards & SRS",
  "Tailored Reading Support",
  "AI Voice Companion",
  "Learning Analytics",
];

type OnboardingStep = "level" | "goal" | "reason" | "age" | "time" | "referral" | "payment";

function Background() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden transform-gpu" style={{ transform: 'translateZ(0)' }} aria-hidden="true">
      <div 
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
        style={{ 
          backgroundImage: `radial-gradient(circle at 1px 1px, var(--primary) 1px, transparent 0)`,
          backgroundSize: '32px 32px'
        }} 
      />
      <div 
        className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04]"
        style={{ 
          backgroundImage: `radial-gradient(circle at 1px 1px, var(--primary) 1.5px, transparent 0)`,
          backgroundSize: '96px 96px',
        }} 
      />
      {/* Gradient Overlay to fade dots */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_0%,var(--background)_90%)]" />
    </div>
  );
}

export default function Onboarding() {
  const { user, session, refreshProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const isPreview = searchParams.get("preview") === "true";

  const [activeStep, setActiveStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);

  const [proficiencyLevel, setProficiencyLevel] = useState("");
  const [goal, setGoal] = useState("");
  const [reason, setReason] = useState("");
  const [age, setAge] = useState<number | null>(null);
  const [dailyMinutes, setDailyMinutes] = useState<number | null>(null);
  const [referral, setReferral] = useState("");

  const [activeCheckoutPlan, setActiveCheckoutPlan] = useState<"pro_monthly" | "lifetime" | null>(null);

  const steps: Array<{ key: OnboardingStep; title: string; description: string }> = useMemo(
    () => [
      {
        key: "level",
        title: "What is your current level?",
        description: "Choose the level that best matches your current Chinese skills.",
      },
      {
        key: "goal",
        title: "What is your main goal?",
        description: "Tell us what success looks like for your Chinese learning.",
      },
      {
        key: "reason",
        title: "Why are you learning Chinese?",
        description: "A short reason helps tailor motivation and examples.",
      },
      {
        key: "age",
        title: "How old are you?",
        description: "We use this for age-appropriate phrasing and examples.",
      },
      {
        key: "time",
        title: "How much time per day can you spend?",
        description: "We'll shape your pace around your daily availability.",
      },
      {
        key: "referral",
        title: "How'd you hear about us?",
        description: "Knowing how you found Polysia helps us grow our community.",
      },
      {
        key: "payment",
        title: "Start your free trial",
        description: "7 days free, then $2.99/month. No charge today.",
      },
    ],
    [],
  );

  const currentStep = steps[activeStep];

  const canContinue = useMemo(() => {
    switch (currentStep.key) {
      case "level":
        return !!proficiencyLevel;
      case "goal":
        return !!goal;
      case "reason":
        return !!reason;
      case "age":
        return age !== null;
      case "time":
        return dailyMinutes !== null;
      case "referral":
        return !!referral;
      case "payment":
        return true;
      default:
        return false;
    }
  }, [age, currentStep.key, dailyMinutes, goal, proficiencyLevel, reason, referral]);

  // Handle payment success redirect from Stripe
  useEffect(() => {
    const checkoutState = searchParams.get("checkout");
    if (checkoutState !== "success" || !user) return;

    const sessionId = searchParams.get("session_id");

    const finalizeSuccess = async () => {
      setIsFinishing(true);

      if (sessionId && session?.access_token) {
        try {
          const response = await fetch("/api/billing/verify-session", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({ sessionId }),
          });
          if (!response.ok) {
            console.error("verify-session failed", await response.text());
          }
        } catch (e) {
          console.error("verify-session error", e);
        }
      } else if (supabase) {
        await supabase
          .from("profiles")
          .update({ onboarding_complete: true })
          .eq("id", user.id);
      }

      toast({
        title: "Payment successful!",
        description: "Your account access has been updated. Welcome to Pro!",
      });

      await refreshProfile();
      navigate("/learning-hub", { replace: true });
    };

    void finalizeSuccess();
  }, [searchParams, user, session, toast, refreshProfile, navigate]);

  useEffect(() => {
    if (!supabase || !user || isPreview) {
      return;
    }
    if (searchParams.get("checkout") === "success") {
      return;
    }

    async function checkOnboardingStatus() {
      const profile = await refreshProfile();
      const isSubscribed =
        profile?.subscriptionStatus === "active" || profile?.subscriptionStatus === "trialing";
      if (profile?.onboardingComplete || isSubscribed) {
        navigate("/learning-hub", { replace: true });
        return;
      }

      const { data: surveyRow } = await supabase
        .from("profiles")
        .select("onboarded_at")
        .eq("id", user!.id)
        .maybeSingle();

      if (surveyRow?.onboarded_at) {
        const paymentIndex = steps.findIndex((s) => s.key === "payment");
        if (paymentIndex >= 0) {
          setActiveStep(paymentIndex);
        }
      }
    }

    void checkOnboardingStatus();
  }, [navigate, user, refreshProfile, isPreview, steps, searchParams]);

  const saveProfileAndSeed = async (): Promise<boolean> => {
    if (!supabase || !user || dailyMinutes === null) return false;

    const { error: profileError } = await supabase.from("profiles").upsert(
      {
        id: user.id,
        onboarding_hsk_level: proficiencyLevel,
        onboarding_goal: goal,
        onboarding_reason: reason,
        onboarding_age: age,
        onboarding_daily_minutes: dailyMinutes,
        onboarding_referral: referral,
        onboarded_at: new Date().toISOString(),
      },
      { onConflict: "id" },
    );

    if (profileError) {
      toast({
        variant: "blackDisclaimer",
        title: "Could not save onboarding",
        description: profileError.message,
      });
      return false;
    }

    try {
      await supabase
        .from("flashcards")
        .delete()
        .eq("user_id", user.id);
    } catch (e) {
      console.error("Failed to reset cards:", e);
      return false;
    }

    await refreshProfile();
    return true;
  };

  const handleContinue = async () => {
    if (!canContinue || isSubmitting) return;

    if (currentStep.key === "referral") {
      if (isPreview) {
        setActiveStep((prev) => prev + 1);
        return;
      }
      setIsSubmitting(true);
      const success = await saveProfileAndSeed();
      setIsSubmitting(false);
      if (success) setActiveStep((prev) => prev + 1);
      return;
    }

    if (activeStep < steps.length - 1) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep((prev) => prev - 1);
    }
  };

  const handleStartCheckout = async (plan: "pro_monthly" | "lifetime") => {
    if (isPreview) {
      setIsFinishing(true);
      window.setTimeout(() => navigate("/learning-hub", { replace: true }), 1800);
      return;
    }

    setActiveCheckoutPlan(plan);
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (session?.access_token) {
        headers["Authorization"] = `Bearer ${session.access_token}`;
      }

      const response = await fetch("/api/billing/checkout", {
        method: "POST",
        headers,
        body: JSON.stringify({ plan, customerEmail: user?.email }),
      });

      const data = await response.json();
      if (!response.ok || !data.checkoutUrl) {
        throw new Error(data.error || "Checkout failed.");
      }

      window.location.href = data.checkoutUrl;
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Checkout unavailable",
        description: error instanceof Error ? error.message : "Please try again in a moment.",
      });
      setActiveCheckoutPlan(null);
    }
  };

  if (isFinishing) {
    return (
      <section className="min-h-screen bg-background flex items-center justify-center px-6">
        <Background />
        <div className="flex flex-col items-center text-center relative z-10">
          <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
          <h1 className="text-3xl font-heading font-semibold text-foreground">Building your learning plan...</h1>
          <p className="mt-3 text-muted-foreground">
            Setting up your daily path based on your goals and level.
          </p>
        </div>
      </section>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center overflow-x-hidden font-sans relative">
      <Background />
      
      {/* Header */}
      <header className="w-full max-w-7xl px-6 py-8 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <img src="/logo only.svg" alt="Polysia" className="h-10 w-10" />
          <span className="font-heading text-2xl font-semibold tracking-tight text-foreground">Polysia</span>
        </div>
        <div className="hidden sm:flex flex-col items-end gap-0.5">
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Account</span>
          <span className="text-sm font-medium text-foreground truncate max-w-[200px]">
            {user?.email || "Guest"}
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-4xl flex flex-col items-center px-6 pb-24 relative z-10">
        <div className="w-full pt-8 sm:pt-12">
          {/* Progress Bar */}
          <div className="w-full h-1 bg-muted rounded-full mb-12 overflow-hidden">
            <motion.div 
              initial={false}
              animate={{ width: `${((activeStep + 1) / steps.length) * 100}%` }}
              className="h-full bg-primary transition-all duration-500 ease-out"
            />
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep.key}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="space-y-10"
            >
              <div className="space-y-4 text-center sm:text-left">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-semibold tracking-tight text-foreground leading-[1.1]">
                  {currentStep.title}
                </h1>
                <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl leading-relaxed">
                  {currentStep.description}
                </p>
              </div>

              {currentStep.key !== "payment" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {currentStep.key === "level" && proficiencyLevels.map((level) => (
                    <SelectionCard
                      key={level.label}
                      label={level.label}
                      icon={level.icon}
                      description={level.description}
                      isSelected={proficiencyLevel === level.label}
                      onClick={() => setProficiencyLevel(level.label)}
                    />
                  ))}
                  {currentStep.key === "level" && (
                    <div className="sm:col-span-2">
                      <button
                        type="button"
                        onClick={() => setProficiencyLevel("I don't know")}
                        className={cn(
                          "w-full p-5 rounded-2xl border-2 transition-all text-center font-semibold text-base",
                          proficiencyLevel === "I don't know"
                            ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20"
                            : "bg-card/50 backdrop-blur-sm text-muted-foreground border-border hover:border-primary/50 hover:bg-card"
                        )}
                      >
                        I don't know my level
                      </button>
                    </div>
                  )}

                  {currentStep.key === "goal" && learningGoals.map((item) => (
                    <SelectionCard
                      key={item.label}
                      label={item.label}
                      icon={item.icon}
                      isSelected={goal === item.label}
                      onClick={() => setGoal(item.label)}
                    />
                  ))}

                  {currentStep.key === "reason" && learningReasons.map((item) => (
                    <SelectionCard
                      key={item.label}
                      label={item.label}
                      icon={item.icon}
                      isSelected={reason === item.label}
                      onClick={() => setReason(item.label)}
                    />
                  ))}

                  {currentStep.key === "age" && ageOptions.map((option) => (
                    <SelectionCard
                      key={option.label}
                      label={option.label}
                      isSelected={age === option.value}
                      onClick={() => setAge(option.value)}
                    />
                  ))}

                  {currentStep.key === "time" && dailyTimeOptions.map((option) => (
                    <SelectionCard
                      key={option.value}
                      label={option.label}
                      description={option.description}
                      isSelected={dailyMinutes === option.value}
                      onClick={() => setDailyMinutes(option.value)}
                    />
                  ))}

                  {currentStep.key === "referral" && referralOptions.map((item) => (
                    <SelectionCard
                      key={item}
                      label={item}
                      isSelected={referral === item}
                      onClick={() => setReferral(item)}
                    />
                  ))}
                </div>
              )}

              {currentStep.key === "payment" && (
                <div className="max-w-xl mx-auto w-full">
                  <div className="rounded-3xl bg-card border border-border p-8 shadow-2xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                    
                    <div className="relative z-10">
                      <div className="mb-8">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-primary mb-4">
                          7-day free trial
                        </span>
                        <div className="flex items-baseline gap-2 mt-3">
                          <span className="text-5xl font-heading font-bold text-foreground">$2.99</span>
                          <span className="text-muted-foreground font-medium">/month after trial</span>
                        </div>
                        <p className="mt-4 text-muted-foreground leading-relaxed">
                          No charge today. Cancel anytime before the trial ends. Full access to everything.
                        </p>
                      </div>

                      <div className="space-y-4 mb-10">
                        {trialFeatures.map((feature) => (
                          <div key={feature} className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <Check className="w-3.5 h-3.5 text-primary" strokeWidth={3} />
                            </div>
                            <span className="text-foreground font-medium">{feature}</span>
                          </div>
                        ))}
                      </div>

                      <GlowButton
                        type="button"
                        onClick={() => void handleStartCheckout("pro_monthly")}
                        disabled={activeCheckoutPlan !== null}
                        className="w-full h-14 text-base font-bold rounded-2xl"
                      >
                        {activeCheckoutPlan === "pro_monthly" ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin mr-2" />
                            Redirecting...
                          </>
                        ) : (
                          <>
                            Start 7-day free trial
                            <ChevronRight className="ml-1.5 w-5 h-5" />
                          </>
                        )}
                      </GlowButton>

                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => void handleStartCheckout("lifetime")}
                        disabled={activeCheckoutPlan !== null}
                        className="mt-4 w-full h-12 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      >
                        {activeCheckoutPlan === "lifetime" ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            Redirecting...
                          </>
                        ) : (
                          "Prefer lifetime access? $44.99 one-time"
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Fixed Footer Navigation */}
      <footer className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-md border-t border-border p-6 z-20">
        <div className="max-w-4xl mx-auto w-full flex items-center justify-between">
          <button
            onClick={handleBack}
            disabled={activeStep === 0 || currentStep.key === "payment"}
            className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground disabled:opacity-0 transition-all uppercase tracking-widest"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>

          <div className="flex items-center gap-6">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] hidden sm:block">
              {activeStep + 1} / {steps.length}
            </span>

            {currentStep.key !== "payment" && (
              <GlowButton
                onClick={() => void handleContinue()}
                disabled={!canContinue || isSubmitting}
                className="min-w-[140px]"
              >
                {isSubmitting && currentStep.key === "referral" ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Saving
                  </>
                ) : (
                  <>
                    Continue
                    <ChevronRight className="ml-1.5 w-4 h-4" />
                  </>
                )}
              </GlowButton>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}

function SelectionCard({
  label,
  description,
  icon,
  isSelected,
  onClick
}: {
  label: string;
  description?: string;
  icon?: string;
  isSelected: boolean;
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "p-5 rounded-2xl border-2 transition-all text-left flex items-center justify-between group relative overflow-hidden",
        isSelected
          ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
          : "border-border bg-card/50 backdrop-blur-sm hover:border-primary/50 hover:bg-card"
      )}
    >
      <div className="flex items-center gap-5 relative z-10">
        {icon && (
          <div className={cn(
            "w-14 h-14 rounded-2xl flex items-center justify-center text-3xl bg-muted/50 border border-border transition-all group-hover:scale-110",
            isSelected && "bg-primary/10 border-primary/20 scale-110"
          )}>
            {icon}
          </div>
        )}
        <div className="flex flex-col gap-1">
          <span className={cn(
            "font-bold text-lg leading-tight",
            isSelected ? "text-foreground" : "text-foreground/80 group-hover:text-foreground"
          )}>
            {label}
          </span>
          {description && (
            <span className={cn(
              "text-[10px] font-bold uppercase tracking-widest leading-none",
              isSelected ? "text-primary" : "text-muted-foreground"
            )}>
              {description}
            </span>
          )}
        </div>
      </div>
      <div className={cn(
        "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 relative z-10",
        isSelected ? "border-primary bg-primary" : "border-border group-hover:border-primary/50"
      )}>
        {isSelected && (
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-2 h-2 rounded-full bg-primary-foreground" 
          />
        )}
      </div>
    </button>
  );
}
