import { useCallback, useEffect, useMemo, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  UserIcon,
  PaintBoardIcon,
  Logout01Icon,
  SunIcon,
  MoonIcon,
  CheckmarkCircle02Icon,
  Mail01Icon,
  Calendar01Icon,
  Target02Icon,
  Clock01Icon,
  Compass01Icon,
  Brain01Icon,
  BookOpen01Icon,
  StarIcon,
} from "@hugeicons/core-free-icons";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface ProfileData {
  onboarding_complete: boolean;
  onboarding_hsk_level: string | null;
  onboarding_goal: string | null;
  onboarding_reason: string | null;
  onboarding_age: number | null;
  onboarding_daily_minutes: number | null;
  daily_new_limit: number | null;
  daily_review_limit: number | null;
  onboarding_referral: string | null;
  onboarded_at: string | null;
}

interface SettingsPanelProps {
  className?: string;
  onLogout: () => Promise<void> | void;
}

type SettingsTab = "profile" | "learning" | "appearance";

function toInitial(value: string) {
  return value.slice(0, 1).toUpperCase();
}

function readInitialDarkMode(): boolean {
  if (typeof window === "undefined") return false;
  const saved = window.localStorage.getItem("theme");
  if (saved === "dark") return true;
  if (saved === "light") return false;
  if (document.documentElement.classList.contains("dark")) return true;
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
}

export default function SettingsPanel({ className, onLogout }: SettingsPanelProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isDarkMode, setIsDarkMode] = useState<boolean>(readInitialDarkMode);
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [newLimitInput, setNewLimitInput] = useState("10");
  const [reviewLimitInput, setReviewLimitInput] = useState("50");
  const [isSavingLimits, setIsSavingLimits] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
    window.localStorage.setItem("theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  useEffect(() => {
    if (!user || !supabase) return;

    async function fetchProfile() {
      setIsLoadingProfile(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user!.id)
        .maybeSingle();

      if (!error && data) {
        setProfileData(data);
        const nextLimit =
          Number.isFinite(data.daily_review_limit) && (data.daily_review_limit ?? 0) > 0
            ? String(data.daily_review_limit)
            : "50";
        const nextNewLimit =
          Number.isFinite(data.daily_new_limit) && (data.daily_new_limit ?? 0) > 0
            ? String(data.daily_new_limit)
            : "10";
        setNewLimitInput(nextNewLimit);
        setReviewLimitInput(nextLimit);
      }
      setIsLoadingProfile(false);
    }

    void fetchProfile();
  }, [user]);

  const handleSaveDailyLimits = useCallback(async () => {
    if (!supabase || !user) return;

    const parsedReviewLimit = Number.parseInt(reviewLimitInput, 10);
    const parsedNewLimit = Number.parseInt(newLimitInput, 10);
    if (!Number.isFinite(parsedReviewLimit) || parsedReviewLimit < 1 || parsedReviewLimit > 500) {
      toast({
        title: "Invalid review limit",
        description: "Please enter a number between 1 and 500.",
      });
      return;
    }
    if (!Number.isFinite(parsedNewLimit) || parsedNewLimit < 1 || parsedNewLimit > 100) {
      toast({
        title: "Invalid new-card limit",
        description: "Please enter a number between 1 and 100.",
      });
      return;
    }

    setIsSavingLimits(true);
    const { data, error } = await supabase
      .from("profiles")
      .upsert(
        {
          id: user.id,
          daily_new_limit: parsedNewLimit,
          daily_review_limit: parsedReviewLimit,
        },
        { onConflict: "id" },
      )
      .select("*")
      .single();

    if (error) {
      toast({
        title: "Could not save review limit",
        description: "Please try again.",
      });
    } else if (data) {
      setProfileData(data);
      setNewLimitInput(String(data.daily_new_limit ?? parsedNewLimit));
      setReviewLimitInput(String(data.daily_review_limit ?? parsedReviewLimit));
      toast({
        title: "Daily limits updated",
        description: `New: ${data.daily_new_limit ?? parsedNewLimit} · Review: ${data.daily_review_limit ?? parsedReviewLimit}`,
      });
    }

    setIsSavingLimits(false);
  }, [newLimitInput, reviewLimitInput, toast, user]);

  const handleResetEverything = useCallback(async () => {
    if (!supabase || !user || isResetting) return;

    setIsResetting(true);
    try {
      const [activityResult, flashcardsResult, profileResult] = await Promise.all([
        supabase.from("learning_activity").delete().eq("user_id", user.id),
        supabase.from("flashcards").delete().eq("user_id", user.id),
        supabase
          .from("profiles")
          .upsert(
            {
              id: user.id,
              streak_days: 0,
              last_activity_date: null,
            },
            { onConflict: "id" },
          )
          .select("*")
          .single(),
      ]);

      if (activityResult.error || flashcardsResult.error || profileResult.error) {
        throw activityResult.error ?? flashcardsResult.error ?? profileResult.error;
      }

      if (profileResult.data) {
        setProfileData(profileResult.data);
        setNewLimitInput(String(profileResult.data.daily_new_limit ?? 10));
        setReviewLimitInput(String(profileResult.data.daily_review_limit ?? 50));
      }

      toast({
        title: "All learning data reset",
        description: "Your flashcards, activity history, and streak were cleared. Onboarding details were kept.",
      });
    } catch (error) {
      console.error("Failed to reset user data", error);
      toast({
        title: "Reset failed",
        description: "We couldn't reset your data right now. Please try again.",
      });
    } finally {
      setIsResetting(false);
    }
  }, [isResetting, toast, user]);

  const displayName = useMemo(() => {
    const metadata = user?.user_metadata ?? {};
    return (metadata.full_name ?? metadata.name ?? "").trim();
  }, [user]);

  const userInitials = useMemo(() => {
    if (displayName) {
      return displayName
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((name: string) => toInitial(name))
        .join("");
    }
    if (!user?.email) return "U";
    return toInitial(user.email);
  }, [displayName, user]);

  const joinedDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  const heroPills = [
    profileData?.onboarding_hsk_level
      ? { label: profileData.onboarding_hsk_level, icon: Brain01Icon }
      : null,
    profileData?.onboarding_daily_minutes
      ? { label: `${profileData.onboarding_daily_minutes} min/day`, icon: Clock01Icon }
      : null,
    joinedDate ? { label: `Joined ${joinedDate}`, icon: Calendar01Icon } : null,
  ].filter(Boolean) as { label: string; icon: typeof Brain01Icon }[];

  const tabs: { id: SettingsTab; label: string; icon: typeof UserIcon }[] = [
    { id: "profile", label: "Profile", icon: UserIcon },
    { id: "learning", label: "Learning", icon: BookOpen01Icon },
    { id: "appearance", label: "Appearance", icon: PaintBoardIcon },
  ];

  return (
    <div className={cn("flex flex-col gap-8", className)}>
      {/* Hero */}
      <header className="relative overflow-hidden rounded-3xl border bg-gradient-to-br from-primary/10 via-card to-secondary/30 p-6 sm:p-8">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-primary/20 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-secondary/40 blur-3xl"
        />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="relative flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl border bg-card text-xl sm:text-2xl font-heading shadow-sm">
              {userInitials}
              <span className="absolute -bottom-1 -right-1 inline-flex h-4 w-4 items-center justify-center rounded-full border-2 border-card bg-emerald-500" />
            </div>
            <div className="min-w-0">
              <h2 className="truncate font-heading text-xl sm:text-2xl tracking-tight">
                {displayName || user?.email?.split("@")[0] || "Your account"}
              </h2>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                <HugeiconsIcon icon={Mail01Icon} className="h-3.5 w-3.5" />
                <span className="truncate">{user?.email ?? "Not signed in"}</span>
              </p>
              {heroPills.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {heroPills.map((pill) => (
                    <span
                      key={pill.label}
                      className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-card/80 px-2.5 py-1 text-[11px] font-medium text-muted-foreground backdrop-blur-sm"
                    >
                      <HugeiconsIcon icon={pill.icon} className="h-3 w-3" />
                      {pill.label}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Button
              type="button"
              variant="outline"
              className="rounded-xl"
              onClick={() => void onLogout()}
            >
              <HugeiconsIcon icon={Logout01Icon} className="h-4 w-4" />
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        {/* Sidebar nav */}
        <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible -mx-1 px-1 lg:mx-0 lg:px-0">
          {tabs.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-all whitespace-nowrap",
                  active
                    ? "bg-primary/10 text-foreground ring-1 ring-primary/30"
                    : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
                )}
                aria-current={active ? "page" : undefined}
              >
                <HugeiconsIcon
                  icon={tab.icon}
                  className={cn("h-4 w-4", active ? "text-primary" : "")}
                />
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Content */}
        <div className="min-w-0">
          {activeTab === "profile" && (
            <SectionCard
              title="Account"
              description="Your sign-in details and identifiers."
            >
              <DefinitionList
                items={[
                  {
                    label: "Email",
                    value: user?.email ?? "Not available",
                    icon: Mail01Icon,
                  },
                  {
                    label: "User ID",
                    value: user?.id ?? "Not available",
                    icon: UserIcon,
                    mono: true,
                  },
                  {
                    label: "Joined",
                    value: joinedDate ?? "Not available",
                    icon: Calendar01Icon,
                  },
                ]}
              />
            </SectionCard>
          )}

          {activeTab === "learning" && (
            <SectionCard
              title="Learning profile"
              description="Preferences captured during onboarding."
              titleAccessory={
                profileData?.onboarding_complete ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                    <HugeiconsIcon icon={CheckmarkCircle02Icon} className="h-3 w-3" />
                    Complete
                  </span>
                ) : null
              }
            >
              {isLoadingProfile ? (
                <div className="flex justify-center py-8">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
              ) : profileData ? (
                <>
                  <DefinitionList
                    items={[
                      {
                        label: "HSK level",
                        value: profileData.onboarding_hsk_level ?? "Not set",
                        icon: Brain01Icon,
                      },
                      {
                        label: "Primary goal",
                        value: profileData.onboarding_goal ?? "Not set",
                        icon: Target02Icon,
                      },
                      {
                        label: "Learning reason",
                        value: profileData.onboarding_reason ?? "Not set",
                        icon: StarIcon,
                      },
                      {
                        label: "Daily commitment",
                        value: profileData.onboarding_daily_minutes
                          ? `${profileData.onboarding_daily_minutes} minutes`
                          : "Not set",
                        icon: Clock01Icon,
                      },
                      {
                        label: "Daily new-card limit",
                        value: `${profileData.daily_new_limit ?? 10} cards`,
                        icon: BookOpen01Icon,
                      },
                      {
                        label: "Daily review limit",
                        value: `${profileData.daily_review_limit ?? 50} cards`,
                        icon: BookOpen01Icon,
                      },
                      {
                        label: "Age group",
                        value: profileData.onboarding_age
                          ? `${profileData.onboarding_age}`
                          : "Not set",
                        icon: UserIcon,
                      },
                      {
                        label: "Discovery source",
                        value: profileData.onboarding_referral ?? "Not set",
                        icon: Compass01Icon,
                      },
                    ]}
                  />
                  <div className="mt-6 rounded-2xl border border-border/60 bg-muted/20 p-4">
                    <p className="text-xs uppercase tracking-widest text-muted-foreground">Daily flashcard limits</p>
                    <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
                      <Input
                        type="number"
                        min={1}
                        max={100}
                        value={newLimitInput}
                        onChange={(event) => setNewLimitInput(event.target.value)}
                        className="sm:max-w-[180px]"
                      />
                      <Input
                        type="number"
                        min={1}
                        max={500}
                        value={reviewLimitInput}
                        onChange={(event) => setReviewLimitInput(event.target.value)}
                        className="sm:max-w-[180px]"
                      />
                      <Button
                        type="button"
                        onClick={() => void handleSaveDailyLimits()}
                        disabled={isSavingLimits}
                        className="sm:w-auto"
                      >
                        {isSavingLimits ? "Saving..." : "Save limits"}
                      </Button>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      First field: new cards/day. Second field: review cards/day.
                    </p>
                  </div>
                  <div className="mt-6 rounded-2xl border border-destructive/30 bg-destructive/5 p-4">
                    <p className="text-xs uppercase tracking-widest text-destructive">Danger zone</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Reset all learning progress for this account. This clears flashcards, activity history, and streak, but keeps onboarding details.
                    </p>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          type="button"
                          variant="destructive"
                          className="mt-4"
                          disabled={isResetting}
                        >
                          {isResetting ? "Resetting..." : "Reset everything"}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent size="sm">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Reset everything?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This permanently deletes your learning progress (cards, activity, streak) and cannot be undone. Your onboarding details stay intact.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel disabled={isResetting}>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            variant="destructive"
                            disabled={isResetting}
                            onClick={() => void handleResetEverything()}
                          >
                            {isResetting ? "Resetting..." : "Yes, reset everything"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </>
              ) : (
                <p className="py-6 text-sm italic text-muted-foreground">
                  No learning profile found. Complete onboarding to personalize your experience.
                </p>
              )}
            </SectionCard>
          )}

          {activeTab === "appearance" && (
            <SectionCard
              title="Appearance"
              description="Switch between light and dark themes."
            >
              <div
                role="radiogroup"
                aria-label="Theme"
                className="grid grid-cols-2 gap-3 sm:max-w-md"
              >
                <ThemeOption
                  label="Light"
                  selected={!isDarkMode}
                  onSelect={() => setIsDarkMode(false)}
                  preview={
                    <div className="flex h-20 w-full items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-900">
                      <HugeiconsIcon icon={SunIcon} className="h-7 w-7" />
                    </div>
                  }
                />
                <ThemeOption
                  label="Dark"
                  selected={isDarkMode}
                  onSelect={() => setIsDarkMode(true)}
                  preview={
                    <div className="flex h-20 w-full items-center justify-center rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-50">
                      <HugeiconsIcon icon={MoonIcon} className="h-7 w-7" />
                    </div>
                  }
                />
              </div>
            </SectionCard>
          )}
        </div>
      </div>
    </div>
  );
}

function SectionCard({
  title,
  description,
  titleAccessory,
  children,
}: {
  title: string;
  description?: string;
  titleAccessory?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border bg-card p-5 sm:p-7">
      <header className="mb-5 flex flex-wrap items-start justify-between gap-3 border-b border-border/50 pb-4">
        <div>
          <h3 className="font-heading text-lg tracking-tight flex items-center gap-2">
            {title}
            {titleAccessory}
          </h3>
          {description && (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      </header>
      {children}
    </section>
  );
}

function DefinitionList({
  items,
}: {
  items: Array<{
    label: string;
    value: string;
    icon?: typeof UserIcon;
    mono?: boolean;
  }>;
}) {
  return (
    <dl className="divide-y divide-border/50">
      {items.map((item) => (
        <div
          key={item.label}
          className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-[180px_1fr] sm:items-center sm:gap-4"
        >
          <dt className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
            {item.icon && (
              <HugeiconsIcon icon={item.icon} className="h-3.5 w-3.5" />
            )}
            {item.label}
          </dt>
          <dd
            className={cn(
              "text-sm text-foreground",
              item.mono && "font-mono text-xs break-all",
            )}
          >
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function ThemeOption({
  label,
  selected,
  onSelect,
  preview,
}: {
  label: string;
  selected: boolean;
  onSelect: () => void;
  preview: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={cn(
        "flex flex-col items-start gap-3 rounded-2xl border p-3 text-left transition-all",
        selected
          ? "border-primary bg-primary/5 ring-2 ring-primary/30"
          : "border-border/60 bg-card hover:border-zinc-400 dark:hover:border-zinc-600",
      )}
    >
      {preview}
      <div className="flex w-full items-center justify-between">
        <span className="text-sm font-medium">{label}</span>
        {selected && (
          <HugeiconsIcon icon={CheckmarkCircle02Icon} className="h-4 w-4 text-primary" />
        )}
      </div>
    </button>
  );
}
