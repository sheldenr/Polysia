import { useEffect, useMemo, useState } from "react";
import { LogOut, Moon, Palette, Sun, UserRound } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SettingsPanelProps {
  className?: string;
  onLogout: () => Promise<void> | void;
}

type SettingsTab = "profile" | "appearance";

function toInitial(value: string) {
  return value.slice(0, 1).toUpperCase();
}

export default function SettingsPanel({ className, onLogout }: SettingsPanelProps) {
  const { user } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("theme");
    setIsDarkMode(savedTheme === "dark");
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
    window.localStorage.setItem("theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

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
            <UserRound className="h-4 w-4" />
            Profile
          </Button>
          <Button
            type="button"
            variant={activeTab === "appearance" ? "default" : "ghost"}
            className="rounded-xl"
            onClick={() => setActiveTab("appearance")}
          >
            <Palette className="h-4 w-4" />
            Appearance
          </Button>
        </div>

        <Button
          type="button"
          variant="destructive"
          className="rounded-xl"
          onClick={() => void onLogout()}
        >
          <LogOut className="h-4 w-4" />
          Log out
        </Button>
      </div>

      {activeTab === "profile" ? (
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
              {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              {isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
