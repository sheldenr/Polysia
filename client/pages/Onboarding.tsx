import { FormEvent, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const proficiencyLevels = [
  "HSK 1",
  "HSK 2",
  "HSK 3",
  "HSK 4",
  "HSK 5",
  "HSK 6",
  "HSK 7",
  "HSK 8",
  "HSK 9",
];
const learningGoals = [
  "Travel conversations",
  "Career growth",
  "Academic study",
  "Daily fluency",
  "Exam preparation",
];
const learningReasons = [
  "Family and relationships",
  "Work opportunities",
  "School or university",
  "Travel confidence",
  "Personal interest in Chinese culture",
];
const ageOptions = [
  { label: "Under 18", value: 16 },
  { label: "18-24", value: 21 },
  { label: "25-34", value: 29 },
  { label: "35-44", value: 39 },
  { label: "45-54", value: 49 },
  { label: "55+", value: 60 },
];
const dailyTimeOptions = [10, 20, 30, 45, 60, 90];

type OnboardingStep = "level" | "goal" | "reason" | "age" | "time";

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
      default:
        return false;
    }
  }, [age, currentStep.key, dailyMinutes, goal, proficiencyLevel, reason]);

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

    // 1. Save profile
    const { error: profileError } = await supabase.from("profiles").upsert(
      {
        id: user.id,
        onboarding_complete: true,
        onboarding_hsk_level: proficiencyLevel,
        onboarding_goal: goal,
        onboarding_reason: reason,
        onboarding_age: age,
        onboarding_daily_minutes: dailyMinutes,
        onboarded_at: new Date().toISOString(),
      },
      { onConflict: "id" },
    );

    if (profileError) {
      setIsSubmitting(false);
      toast({
        variant: "destructive",
        title: "Could not save onboarding",
        description: profileError.message,
      });
      return;
    }

    // 2. Seed initial flashcards based on level
    try {
      const response = await fetch("/chinese-dictionary-custom.json");
      const dictionary = await response.json();
      
      let hskTarget = 1;
      const hskMatch = proficiencyLevel.match(/HSK (\d+)/);
      if (hskMatch) {
        hskTarget = parseInt(hskMatch[1], 10);
      }

      // We'll seed all cards up to the target level.
      // Cards below the target level will be marked as "REVIEW" (mastered).
      // Cards at the target level will be marked as "NEW".
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
          
          return {
            user_id: user.id,
            simplified: card.s,
            traditional: card.t,
            pinyin: card.p,
            english: card.e,
            grammar: card.g || "",
            notes: card.n || "",
            hsk_level: level,
            state: isBelowTarget ? "REVIEW" : "NEW",
            repetition: isBelowTarget ? 5 : 0, // 5+ reps marks it as perfected/mastered
            interval: isBelowTarget ? 30 : 0,  // 30 days interval for mastered cards
            efactor: 2.5,
            due_date: isBelowTarget 
              ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() 
              : new Date().toISOString(),
            source_id: card.h || null,
            seen_at: isBelowTarget ? new Date().toISOString() : null,
          };
        });

        // Insert in chunks
        const chunkSize = 100;
        for (let i = 0; i < flashcardsToInsert.length; i += chunkSize) {
          const chunk = flashcardsToInsert.slice(i, i + chunkSize);
          await supabase.from("flashcards").insert(chunk);
        }
      }
    } catch (e) {
      console.error("Failed to seed flashcards:", e);
      // Non-critical, continue to hub
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
      <section className="min-h-screen bg-background px-6 py-16">
        <div className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center text-center">
          <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
          <h1 className="text-3xl font-heading">Building your learning plan...</h1>
          <p className="mt-3 text-muted-foreground">
            Setting up your daily path based on your goals and level.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-background px-4 py-10 sm:px-6">
      <div className="mx-auto flex min-h-[80vh] w-full max-w-2xl flex-col items-center justify-center">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <img src="/logo only.svg" alt="Polysia" className="h-12 w-12" />
          <h1 className="text-3xl font-heading text-foreground">Onboarding</h1>
          <p className="text-sm text-muted-foreground">Question {activeStep + 1} of {steps.length}</p>
        </div>

        <form onSubmit={handleSubmit} className="w-full">
          <Card className="rounded-3xl border-primary bg-card/95 shadow-xl shadow-primary/20">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">{currentStep.title}</CardTitle>
              <CardDescription className="mx-auto max-w-xl">{currentStep.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 text-center">
              {currentStep.key === "level" && (
                <div className="flex flex-col items-center justify-center gap-6">
                  <div className="w-full max-w-[280px] space-y-4">
                    <Select
                      value={proficiencyLevel.startsWith("HSK") ? proficiencyLevel : ""}
                      onValueChange={(value) => setProficiencyLevel(value)}
                    >
                      <SelectTrigger className="w-full h-12 rounded-2xl text-lg border-primary/30">
                        <SelectValue placeholder="Select HSK Level" />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl">
                        <SelectGroup>
                          {proficiencyLevels.map((level) => (
                            <SelectItem 
                              key={level} 
                              value={level}
                              className="text-lg py-3"
                            >
                              {level}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>

                    <button
                      type="button"
                      onClick={() => setProficiencyLevel("I don't know")}
                      className="text-sm font-medium text-primary hover:opacity-80 transition-opacity"
                    >
                      I don't know my level
                    </button>
                  </div>
                </div>
              )}

              {currentStep.key === "goal" && (
                <div className="flex flex-wrap items-center justify-center gap-3">
                  {learningGoals.map((item) => (
                    <Button
                      key={item}
                      type="button"
                      variant={goal === item ? "default" : "outline"}
                      className="min-w-[200px] rounded-xl border-primary text-center"
                      onClick={() => setGoal(item)}
                    >
                      {item}
                    </Button>
                  ))}
                </div>
              )}

              {currentStep.key === "reason" && (
                <div className="flex flex-wrap items-center justify-center gap-3">
                  {learningReasons.map((item) => (
                    <Button
                      key={item}
                      type="button"
                      variant={reason === item ? "default" : "outline"}
                      className="min-w-[220px] rounded-xl border-primary text-center"
                      onClick={() => setReason(item)}
                    >
                      {item}
                    </Button>
                  ))}
                </div>
              )}

              {currentStep.key === "age" && (
                <div className="flex flex-wrap items-center justify-center gap-3">
                  {ageOptions.map((option) => (
                    <Button
                      key={option.label}
                      type="button"
                      variant={age === option.value ? "default" : "outline"}
                      className="min-w-[130px] rounded-xl border-primary text-center"
                      onClick={() => setAge(option.value)}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              )}

              {currentStep.key === "time" && (
                <div className="flex flex-wrap items-center justify-center gap-3">
                  {dailyTimeOptions.map((minutes) => (
                    <Button
                      key={minutes}
                      type="button"
                      variant={dailyMinutes === minutes ? "default" : "outline"}
                      className="min-w-[130px] rounded-xl border-primary text-center"
                      onClick={() => setDailyMinutes(minutes)}
                    >
                      {minutes} min/day
                    </Button>
                  ))}
                </div>
              )}

              <div className="pt-2">
                <div className="mb-4 h-2 overflow-hidden rounded-full bg-zinc-200/50">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${((activeStep + 1) / steps.length) * 100}%` }}
                  />
                </div>
                <div className="flex items-center justify-center gap-3">
                  <Button type="button" variant="ghost" onClick={handleBack} disabled={activeStep === 0}>
                    Back
                  </Button>
                  {activeStep < steps.length - 1 ? (
                    <Button
                      type="button"
                      onClick={handleContinue}
                      disabled={!canContinue}
                      className="rounded-full px-6 shadow-lg shadow-primary/20"
                    >
                      Continue
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      disabled={!canContinue || isSubmitting}
                      className="rounded-full px-6 shadow-lg shadow-primary/20"
                    >
                      {isSubmitting ? "Saving..." : "Finish setup"}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </section>
  );
}
