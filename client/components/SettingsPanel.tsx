import { useEffect, useMemo, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  UserIcon,
  PaintBoardIcon,
  Logout01Icon,
  SunIcon,
  MoonIcon,
  CheckmarkCircle02Icon,
} from "@hugeicons/core-free-icons";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ProfileData {
  onboarding_complete: boolean;
  onboarding_hsk_level: string | null;
  onboarding_goal: string | null;
  onboarding_reason: string | null;
  onboarding_age: number | null;
  onboarding_daily_minutes: number | null;
  onboarding_referral: string | null;
  onboarded_at: string | null;
}

interface SettingsPanelProps {
  className?: string;
  onLogout: () => Promise<void> | void;
}

function toInitial(value: string) {
  return value.slice(0, 1).toUpperCase();
}

export default function SettingsPanel({ className, onLogout }: SettingsPanelProps) {
  const { user } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "appearance">("profile");
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("theme");
    setIsDarkMode(savedTheme === "dark");
  }, []);

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
      }
      setIsLoadingProfile(false);
    }

    void fetchProfile();
  }, [user]);

  const userInitials = useMemo(() => {
    const metadata = user?.user_metadata ?? {};
    const displayName = metadata.full_name ?? metadata.name ?? "";

    if (displayName.trim()) {
      return displayName
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((name: string) => toInitial(name))
        .join("");
    }

    if (!user?.email) return "U";
    return toInitial(user.email);
  }, [user]);

  return (
    <div className={cn("space-y-6", className)}>
      <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border bg-card text-lg font-semibold">
        {userInitials}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-card p-2">
        <div className="inline-flex items-center gap-2">
          <Button
            type="button"
            variant={activeTab === "profile" ? "default" : "ghost"}
            className="rounded-xl"
            onClick={() => setActiveTab("profile")}
          >
            <HugeiconsIcon icon={UserIcon} className="h-4 w-4" />
            Profile
          </Button>
          <Button
            type="button"
            variant={activeTab === "appearance" ? "default" : "ghost"}
            className="rounded-xl"
            onClick={() => setActiveTab("appearance")}
          >
            <HugeiconsIcon icon={PaintBoardIcon} className="h-4 w-4" />
            Appearance
          </Button>
        </div>

        <Button
          type="button"
          variant="destructive"
          className="rounded-xl"
          onClick={() => void onLogout()}
        >
          <HugeiconsIcon icon={Logout01Icon} className="h-4 w-4" />
          Log out
        </Button>
      </div>

      {activeTab === "profile" ? (
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Account</CardTitle>
              <CardDescription>Basic account details for your profile.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <p className="text-muted-foreground">Email</p>
                <p className="font-medium">{user?.email ?? "Not available"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">User ID</p>
                <p className="font-mono text-xs break-all">{user?.id ?? "Not available"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Joined</p>
                <p className="font-medium">
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString() : "Not available"}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Learning Profile
                {profileData?.onboarding_complete && (
                  <HugeiconsIcon icon={CheckmarkCircle02Icon} className="h-4 w-4 text-emerald-500" />
                )}
              </CardTitle>
              <CardDescription>Preferences collected during your onboarding.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              {isLoadingProfile ? (
                <div className="flex justify-center py-4">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
              ) : profileData ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-muted-foreground">HSK Level</p>
                    <p className="font-medium">{profileData.onboarding_hsk_level ?? "Not set"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Primary Goal</p>
                    <p className="font-medium">{profileData.onboarding_goal ?? "Not set"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Learning Reason</p>
                    <p className="font-medium">{profileData.onboarding_reason ?? "Not set"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Daily Commitment</p>
                    <p className="font-medium">
                      {profileData.onboarding_daily_minutes ? `${profileData.onboarding_daily_minutes} minutes` : "Not set"}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Age Group</p>
                    <p className="font-medium">
                      {profileData.onboarding_age ? `${profileData.onboarding_age}` : "Not set"}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Discovery Source</p>
                    <p className="font-medium">{profileData.onboarding_referral ?? "Not set"}</p>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground italic">No learning profile found. Complete onboarding to personalize your experience.</p>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>Choose your preferred theme.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              type="button"
              variant="outline"
              className="rounded-xl"
              onClick={() => setIsDarkMode((prev) => !prev)}
            >
              {isDarkMode ? (
                <HugeiconsIcon icon={SunIcon} className="h-4 w-4" />
              ) : (
                <HugeiconsIcon icon={MoonIcon} className="h-4 w-4" />
              )}
              {isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
