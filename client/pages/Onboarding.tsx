import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2, ChevronLeft, ChevronRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

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

function ExpandingCircles() {
  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none">
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute border border-primary/30 rounded-full"
          initial={{ width: "0%", height: "0%", opacity: 0 }}
          animate={{
            width: ["0%", "300%"],
            height: ["0%", "300%"],
            opacity: [0, 0.4, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            delay: i * 1.6,
            ease: "easeOut",
          }}
          style={{
            filter: "blur(12px)",
            borderWidth: "1px",
          }}
        />
      ))}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={`thin-${i}`}
          className="absolute border border-primary/20 rounded-full"
          initial={{ width: "0%", height: "0%", opacity: 0 }}
          animate={{
            width: ["0%", "200%"],
            height: ["0%", "200%"],
            opacity: [0, 0.3, 0],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            delay: i * 2,
            ease: "linear",
          }}
          style={{
            filter: "blur(2px)",
            borderWidth: "0.5px",
          }}
        />
      ))}
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

      // Server verifies the Stripe session and flips subscription_status +
      // onboarding_complete via the service role key. This removes the
      // dependency on the webhook firing before the redirect.
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
        // Fallback when session_id is missing — keep the client-side flip so
        // returning users don't get stuck at the survey.
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
    // The checkout-success effect drives this flow — don't race with it.
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

      // Survey saved but payment not received yet — resume at payment step.
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
      // Wipe any existing flashcards
      const { error: wipeError } = await supabase
        .from("flashcards")
        .delete()
        .eq("user_id", user.id);
      
      if (wipeError) {
        toast({
          variant: "blackDisclaimer",
          title: "Could not reset your flashcards",
          description: wipeError.message,
        });
        return false;
      }

      // We no longer seed thousands of cards here. 
      // The useSRS hook will fetch the first batch based on proficiencyLevel.
      
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
      <section className="min-h-screen bg-zinc-100 flex items-center justify-center px-6">
        <div className="flex flex-col items-center text-center">
          <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
          <h1 className="text-3xl font-heading text-zinc-900">Building your learning plan...</h1>
          <p className="mt-3 text-zinc-500">
            Setting up your daily path based on your goals and level.
          </p>
        </div>
      </section>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-100 flex overflow-hidden font-sans">
      {/* Left Side (25%) */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative w-[25%] hidden lg:flex flex-col justify-between p-12 z-10 overflow-hidden"
      >
        <ExpandingCircles />

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="relative z-20 flex items-center gap-3"
        >
          <img src="/logo only.svg" alt="Polysia" className="h-10 w-10" />
          <span className="font-heading text-2xl tracking-tight text-zinc-900">Polysia</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="relative z-20"
        >
          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">Logged in as</span>
            <span className="text-sm font-medium text-zinc-600 truncate max-w-full">
              {user?.email || "Guest"}
            </span>
          </div>
        </motion.div>
      </motion.div>

      {/* Right Side (75%) */}
      <div className="w-full lg:w-[75%] h-screen flex items-center justify-center p-2 lg:p-3">
        <motion.div
          initial={{ x: 80, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="h-full w-full bg-white rounded-2xl lg:rounded-3xl border border-zinc-200 overflow-hidden flex flex-col relative"
        >
          <div className="flex-1 flex flex-col p-8 sm:p-14 lg:p-20 overflow-y-auto">
            <div className="mx-auto w-full max-w-3xl flex flex-col h-full">
              {/* Inner Card Logo */}
              <div className="mb-14">
                <img src="/logo only.svg" alt="Polysia" className="h-12 w-12" />
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep.key}
                  initial={{ y: 15, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -15, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-10"
                >
                  <div className="space-y-3">
                    <h1 className="text-3xl sm:text-4xl font-heading tracking-tight text-zinc-900 leading-tight">
                      {currentStep.title}
                    </h1>
                    <p className="text-lg text-zinc-500 max-w-2xl leading-relaxed">
                      {currentStep.description}
                    </p>
                  </div>

                  {currentStep.key !== "payment" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-12">
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
                        <div className="sm:col-span-2 pt-2">
                          <button
                            type="button"
                            onClick={() => setProficiencyLevel("I don't know")}
                            className={cn(
                              "w-full p-4 rounded-xl border transition-all text-center font-medium text-sm",
                              proficiencyLevel === "I don't know"
                                ? "bg-zinc-900 text-white border-zinc-900"
                                : "bg-white text-zinc-500 border-zinc-200 hover:border-zinc-300"
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
                    <div className="space-y-5 pb-12">
                      {/* Trial card */}
                      <div className="rounded-2xl bg-zinc-900 p-8 text-white">
                        <div className="mb-6">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white/80 mb-4">
                            7-day free trial
                          </span>
                          <div className="flex items-baseline gap-2 mt-3">
                            <span className="text-4xl font-heading">$2.99</span>
                            <span className="text-zinc-400 text-sm">/month after trial</span>
                          </div>
                          <p className="mt-2 text-sm text-zinc-400">
                            No charge today. Cancel anytime before the trial ends.
                          </p>
                        </div>

                        <div className="space-y-3 mb-8">
                          {trialFeatures.map((feature) => (
                            <div key={feature} className="flex items-center gap-3">
                              <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                                <Check className="w-3 h-3 text-white" strokeWidth={3} />
                              </div>
                              <span className="text-sm text-zinc-200">{feature}</span>
                            </div>
                          ))}
                        </div>

                        <Button
                          type="button"
                          onClick={() => void handleStartCheckout("pro_monthly")}
                          disabled={activeCheckoutPlan !== null}
                          className="w-full h-14 text-base font-semibold bg-white text-black hover:bg-zinc-100 rounded-xl border-none shadow-lg"
                        >
                          {activeCheckoutPlan === "pro_monthly" ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin mr-2" />
                              Redirecting to checkout...
                            </>
                          ) : (
                            <>
                              Start 7-day free trial
                              <ChevronRight className="ml-1.5 w-4 h-4" />
                            </>
                          )}
                        </Button>

                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => void handleStartCheckout("lifetime")}
                          disabled={activeCheckoutPlan !== null}
                          className="mt-3 w-full h-12 rounded-xl border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white"
                        >
                          {activeCheckoutPlan === "lifetime" ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin mr-2" />
                              Redirecting to checkout...
                            </>
                          ) : (
                            "Prefer lifetime access? $44.99 one-time"
                          )}
                        </Button>
                      </div>

                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Footer Navigation */}
          <div className="p-8 sm:px-14 lg:px-20 border-t border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
            <div className="mx-auto w-full max-w-3xl flex items-center justify-between">
              <button
                onClick={handleBack}
                disabled={activeStep === 0 || currentStep.key === "payment"}
                className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-400 hover:text-zinc-600 disabled:opacity-0 transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
                Go back
              </button>

              <div className="flex items-center gap-8">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest hidden sm:block">
                  Step {activeStep + 1} of {steps.length}
                </span>

                {currentStep.key !== "payment" && (
                  <Button
                    onClick={() => void handleContinue()}
                    disabled={!canContinue || isSubmitting}
                    className="rounded-full px-8 h-12 text-base font-semibold shadow-lg shadow-primary/20 bg-primary text-primary-foreground hover:bg-primary/90 transition-all border-none"
                  >
                    {isSubmitting && currentStep.key === "referral" ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Saving...
                      </>
                    ) : (
                      <>
                        Continue
                        <ChevronRight className="ml-1.5 w-4 h-4" />
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
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
        "p-5 rounded-xl border-2 transition-all text-left flex items-center justify-between group",
        isSelected
          ? "border-primary bg-primary/5 shadow-sm"
          : "border-zinc-100 bg-white hover:border-zinc-200"
      )}
    >
      <div className="flex items-center gap-4">
        {icon && (
          <div className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center text-2xl bg-zinc-50 border border-zinc-100 transition-colors group-hover:bg-white",
            isSelected && "bg-primary/10 border-primary/20"
          )}>
            {icon}
          </div>
        )}
        <div className="flex flex-col gap-0.5">
          <span className={cn(
            "font-semibold text-base",
            isSelected ? "text-primary" : "text-zinc-700 group-hover:text-zinc-900"
          )}>
            {label}
          </span>
          {description && (
            <span className={cn(
              "text-xs font-medium uppercase tracking-wider",
              isSelected ? "text-primary/70" : "text-zinc-400"
            )}>
              {description}
            </span>
          )}
        </div>
      </div>
      <div className={cn(
        "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0",
        isSelected ? "border-primary bg-primary" : "border-zinc-200"
      )}>
        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
      </div>
    </button>
  );
}
