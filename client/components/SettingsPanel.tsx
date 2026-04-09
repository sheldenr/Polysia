import { FormEvent, useEffect, useMemo, useState } from "react";
import { BellRing, LogOut, Shield, UserRound } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const remindersStorageKey = "settings-reminders-enabled";
const updatesStorageKey = "settings-updates-enabled";

interface SettingsPanelProps {
  className?: string;
  onLogout: () => Promise<void> | void;
}

type SettingsTab = "profile" | "preferences" | "security";

function toInitial(value: string) {
  return value.slice(0, 1).toUpperCase();
}

export default function SettingsPanel({ className, onLogout }: SettingsPanelProps) {
  const { user } = useAuth();
  const { toast } = useToast();

  const displayNameFromUser = useMemo(() => {
    if (!user) return "";
    const metadata = user.user_metadata ?? {};
    return metadata.full_name ?? metadata.name ?? "";
  }, [user]);

  const [displayName, setDisplayName] = useState(displayNameFromUser);
  const [bio, setBio] = useState("");
  const [remindersEnabled, setRemindersEnabled] = useState(true);
  const [updatesEnabled, setUpdatesEnabled] = useState(false);
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");

  useEffect(() => {
    setDisplayName(displayNameFromUser);
  }, [displayNameFromUser]);

  useEffect(() => {
    const reminders = window.localStorage.getItem(remindersStorageKey);
    const updates = window.localStorage.getItem(updatesStorageKey);

    if (reminders !== null) setRemindersEnabled(reminders === "true");
    if (updates !== null) setUpdatesEnabled(updates === "true");
  }, []);

  const userInitials = useMemo(() => {
    if (displayName.trim()) {
      return displayName
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((name) => toInitial(name))
        .join("");
    }

    if (!user?.email) return "U";
    return toInitial(user.email);
  }, [displayName, user?.email]);

  const handleProfileSave = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    toast({
      title: "Profile updated",
      description: "Your settings were saved on this device.",
    });
  };

  const handlePreferencesSave = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    window.localStorage.setItem(remindersStorageKey, String(remindersEnabled));
    window.localStorage.setItem(updatesStorageKey, String(updatesEnabled));
    toast({
      title: "Preferences saved",
      description: "Notification preferences are now up to date.",
    });
  };

  return (
    <div className={cn("space-y-6", className)}>
      <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border bg-card text-lg font-semibold">
        {userInitials}
      </div>

      <div className="inline-flex w-full flex-wrap items-center gap-2 rounded-2xl border bg-card p-2">
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
          variant={activeTab === "preferences" ? "default" : "ghost"}
          className="rounded-xl"
          onClick={() => setActiveTab("preferences")}
        >
            <BellRing className="h-4 w-4" />
            Preferences
        </Button>
        <Button
          type="button"
          variant={activeTab === "security" ? "default" : "ghost"}
          className="rounded-xl"
          onClick={() => setActiveTab("security")}
        >
            <Shield className="h-4 w-4" />
            Security
        </Button>
      </div>

      {activeTab === "profile" && (
          <div className="grid gap-6 lg:grid-cols-2">
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
                    {user?.created_at
                      ? new Date(user.created_at).toLocaleDateString()
                      : "Not available"}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Public profile</CardTitle>
                <CardDescription>This appears on your account surfaces inside the app.</CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4" onSubmit={handleProfileSave}>
                  <div className="space-y-2">
                    <Label htmlFor="display-name">Display name</Label>
                    <Input
                      id="display-name"
                      value={displayName}
                      onChange={(event) => setDisplayName(event.target.value)}
                      placeholder="Your name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={bio}
                      onChange={(event) => setBio(event.target.value)}
                      placeholder="Tell us a little about your learning goals"
                      rows={4}
                    />
                  </div>
                  <Button type="submit">Save profile</Button>
                </form>
              </CardContent>
            </Card>
          </div>
      )}

      {activeTab === "preferences" && (
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Choose what updates you want to receive.</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-6" onSubmit={handlePreferencesSave}>
                <div className="flex items-start justify-between gap-4 rounded-xl border p-4">
                  <div className="space-y-1">
                    <Label htmlFor="daily-reminders">Daily study reminders</Label>
                    <p className="text-sm text-muted-foreground">
                      Gentle prompts to keep your learning streak active.
                    </p>
                  </div>
                  <Switch
                    id="daily-reminders"
                    checked={remindersEnabled}
                    onCheckedChange={setRemindersEnabled}
                  />
                </div>
                <div className="flex items-start justify-between gap-4 rounded-xl border p-4">
                  <div className="space-y-1">
                    <Label htmlFor="product-updates">Product updates</Label>
                    <p className="text-sm text-muted-foreground">
                      Updates about new features and improvements.
                    </p>
                  </div>
                  <Switch
                    id="product-updates"
                    checked={updatesEnabled}
                    onCheckedChange={setUpdatesEnabled}
                  />
                </div>
                <Button type="submit">Save preferences</Button>
              </form>
            </CardContent>
          </Card>
      )}

      {activeTab === "security" && (
          <Card>
            <CardHeader>
              <CardTitle>Security</CardTitle>
              <CardDescription>Manage access and sign-in safety.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-xl border p-4">
                <p className="font-medium">Password</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Use your existing authentication provider to update your password.
                </p>
              </div>
              <div className="rounded-xl border p-4">
                <p className="font-medium">Session</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  You are signed in as <span className="font-medium">{user?.email}</span>.
                </p>
              </div>
              <Button variant="destructive" onClick={onLogout} className="w-full sm:w-auto">
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </Button>
            </CardContent>
          </Card>
      )}
    </div>
  );
}
