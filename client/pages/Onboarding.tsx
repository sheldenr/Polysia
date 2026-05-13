import { FormEvent, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";
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

type OnboardingStep = "level" | "goal" | "reason" | "age" | "time" | "referral";

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
            filter: "blur(12px)", // Stronger motion blur feel
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
  const { user, refreshProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
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
      default:
        return false;
    }
  }, [age, currentStep.key, dailyMinutes, goal, proficiencyLevel, reason, referral]);

  useEffect(() => {
    if (!supabase || !user || isPreview) {
      return;
    }

    async function checkOnboardingStatus() {
      const { data, error } = await supabase
        .from("profiles")
        .select("onboarding_complete")
        .eq("id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Failed to check onboarding status", error);
        return;
      }

      if (data?.onboarding_complete) {
        navigate("/learning-hub", { replace: true });
      }
    }

    void checkOnboardingStatus();
  }, [navigate, user]);

  const handleContinue = () => {
    if (!canContinue) {
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

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!supabase || !user || !canContinue || dailyMinutes === null) {
      return;
    }

    if (isPreview) {
      setIsSubmitting(true);
      window.setTimeout(() => {
        setIsSubmitting(false);
        setIsFinishing(true);
        window.setTimeout(() => {
          navigate("/learning-hub", { replace: true });
        }, 1800);
      }, 1000);
      return;
    }

    setIsSubmitting(true);

    const { error: profileError } = await supabase.from("profiles").upsert(
      {
        id: user.id,
        onboarding_complete: true,
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
      setIsSubmitting(false);
      toast({
        variant: "blackDisclaimer",
        title: "Could not save onboarding",
        description: profileError.message,
      });
      return;
    }

    try {
      const response = await fetch("/chinese-dictionary-custom.json");
      const dictionary = await response.json();
      
      let hskTarget = 1;
      const levelObj = proficiencyLevels.find(l => l.label === proficiencyLevel);
      if (levelObj) {
        hskTarget = levelObj.hsk;
      } else {
        const hskMatch = proficiencyLevel.match(/HSK (\d+)/);
        if (hskMatch) {
          hskTarget = parseInt(hskMatch[1], 10);
        }
      }

      const seedCards = dictionary.filter((card: any) => {
        const match = card.h?.match(/hsk-L(\d+)/i) ?? card.n?.match(/HSK level (\d+)/i);
        const level = match ? parseInt(match[1], 10) : 1;
        return level <= hskTarget;
      });

      if (seedCards.length > 0) {
        const flashcardsToInsert = seedCards.map((card: any) => {
          const match = card.h?.match(/hsk-L(\d+)/i) ?? card.n?.match(/HSK level (\d+)/i);
          const level = match ? parseInt(match[1], 10) : 1;
          
          const isBelowTarget = level < hskTarget;
          
          // Extract example sentence from notes if it follows "Sentence | Translation" pattern
          let exampleSentence = "";
          if (card.n && card.n.includes("|")) {
            exampleSentence = card.n.split("|")[0].trim();
          }
          
          return {
            user_id: user.id,
            simplified: card.s,
            traditional: card.t,
            pinyin: card.p,
            english: card.e,
            grammar: card.g || "",
            notes: card.n || "",
            example_sentence: exampleSentence,
            hsk_level: level,
            state: isBelowTarget ? "REVIEW" : "NEW",
            repetition: isBelowTarget ? 5 : 0,
            interval: isBelowTarget ? 30 : 0,
            efactor: 2.5,
            due_date: isBelowTarget 
              ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() 
              : new Date().toISOString(),
            source_id: card.h || null,
            seen_at: isBelowTarget ? new Date().toISOString() : null,
          };
        });

        const chunkSize = 100;
        for (let i = 0; i < flashcardsToInsert.length; i += chunkSize) {
          const chunk = flashcardsToInsert.slice(i, i + chunkSize);
          await supabase.from("flashcards").insert(chunk);
        }
      }
    } catch (e) {
      console.error("Failed to seed flashcards:", e);
    }

    await refreshProfile();
    setIsSubmitting(false);
    setIsFinishing(true);
    window.setTimeout(() => {
      navigate("/learning-hub", { replace: true });
    }, 1800);
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
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Footer Navigation */}
          <div className="p-8 sm:px-14 lg:px-20 border-t border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
            <div className="mx-auto w-full max-w-3xl flex items-center justify-between">
              <button
                onClick={handleBack}
                disabled={activeStep === 0}
                className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-400 hover:text-zinc-600 disabled:opacity-0 transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
                Go back
              </button>

              <div className="flex items-center gap-8">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest hidden sm:block">
                  Step {activeStep + 1} of {steps.length}
                </span>
                
                {activeStep < steps.length - 1 ? (
                  <Button
                    onClick={handleContinue}
                    disabled={!canContinue}
                    className="rounded-full px-8 h-12 text-base font-semibold shadow-lg shadow-primary/20 bg-primary text-primary-foreground hover:bg-primary/90 transition-all border-none"
                  >
                    Continue
                    <ChevronRight className="ml-1.5 w-4 h-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={!canContinue || isSubmitting}
                    className="rounded-full px-10 h-12 text-base font-semibold shadow-lg shadow-primary/20 bg-primary text-primary-foreground hover:bg-primary/90 transition-all border-none"
                  >
                    {isSubmitting ? "Finalizing..." : "Start Learning"}
                    {!isSubmitting && <ChevronRight className="ml-1.5 w-4 h-4" />}
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
