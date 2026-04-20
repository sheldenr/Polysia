import { FormEvent, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

const proficiencyLevels = ["Beginner", "Intermediate", "Advanced"];
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
  const { user } = useAuth();
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

    const { error } = await supabase.from("profiles").upsert(
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

    if (error) {
      setIsSubmitting(false);
      toast({
        variant: "destructive",
        title: "Could not save onboarding",
        description: error.message,
      });
      return;
    }

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
                <div className="flex flex-wrap items-center justify-center gap-3">
                  {proficiencyLevels.map((level) => (
                    <Button
                      key={level}
                      type="button"
                      variant={proficiencyLevel === level ? "default" : "outline"}
                      className="min-w-[150px] rounded-xl border-primary text-center"
                      onClick={() => setProficiencyLevel(level)}
                    >
                      {level}
                    </Button>
                  ))}
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
                <div className="mb-4 h-2 overflow-hidden rounded-full bg-secondary">
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
