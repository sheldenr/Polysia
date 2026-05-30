import { useEffect, useMemo, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  UserIcon,
  PaintBoardIcon,
  Logout01Icon,
  SunIcon,
  MoonIcon,
  CheckmarkCircle02Icon,
  Calendar01Icon,
} from "@hugeicons/core-free-icons";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SettingsPanelProps {
  className?: string;
  onLogout: () => Promise<void> | void;
  onReset?: () => void;
}

type SettingsTab = "profile" | "appearance";

function toInitial(value: string) {
  return value.slice(0, 1).toUpperCase();
}

type Theme = "light" | "dark" | "system";

function readInitialTheme(): Theme {
  if (typeof window === "undefined") return "system";
  const saved = window.localStorage.getItem("theme") as Theme | null;
  return saved || "system";
}

export default function SettingsPanel({ className, onLogout }: SettingsPanelProps) {
  const { user } = useAuth();
  const [theme, setTheme] = useState<Theme>(readInitialTheme);
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");

  useEffect(() => {
    const isDark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.classList.toggle("dark", isDark);
    window.localStorage.setItem("theme", theme);

    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = (e: MediaQueryListEvent) => {
        document.documentElement.classList.toggle("dark", e.matches);
      };
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, [theme]);

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

  const tabs: { id: SettingsTab; label: string; icon: typeof UserIcon }[] = [
    { id: "profile", label: "Profile", icon: UserIcon },
    { id: "appearance", label: "Appearance", icon: PaintBoardIcon },
  ];

  return (
    <div className={cn("flex flex-col h-full bg-card", className)}>
      {/* Tab Navigation */}
      <div className="shrink-0 border-b border-border/50 bg-secondary/20 p-2 sm:p-3">
        <nav className="flex gap-1 overflow-x-auto no-scrollbar max-w-2xl mx-auto">
          {tabs.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all whitespace-nowrap",
                  active
                    ? "bg-[rgba(129,173,184,0.12)] dark:bg-[rgba(129,173,184,0.16)] text-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
                )}
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
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 sm:p-8">
        <div className="max-w-2xl mx-auto space-y-8 pb-10">
          {activeTab === "profile" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-5 p-4 rounded-xl bg-secondary/10 border">
                <div className="h-14 w-14 shrink-0 rounded-xl border bg-card flex items-center justify-center text-xl font-heading shadow-sm relative overflow-hidden">
                   <div className="absolute inset-0 bg-primary/10 blur-xl"></div>
                   <span className="relative z-10">{userInitials}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-heading truncate">{displayName || "Your account"}</h3>
                  <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
                </div>
                <Button variant="outline" size="sm" className="rounded-xl h-8 px-3 text-xs" onClick={() => void onLogout()}>
                  <HugeiconsIcon icon={Logout01Icon} className="h-3.5 w-3.5 mr-1.5" /> Sign out
                </Button>
              </div>

              <Section title="Account details">
                <DefinitionList
                  items={[
                    { label: "Joined on", value: joinedDate ?? "N/A", icon: Calendar01Icon },
                    { label: "User ID", value: user?.id ?? "N/A", icon: UserIcon, mono: true },
                  ]}
                />
              </Section>
            </div>
          )}

          {activeTab === "appearance" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Section title="Theme preference">
                <div className="grid grid-cols-3 gap-3 sm:gap-4">
                  <ThemeOption
                    label="Light"
                    selected={theme === "light"}
                    onSelect={() => setTheme("light")}
                    preview={<div className="h-16 w-full rounded-xl bg-[#F3F7FF] border flex items-center justify-center text-amber-500"><HugeiconsIcon icon={SunIcon} className="h-6 w-6" /></div>}
                  />
                  <ThemeOption
                    label="Dark"
                    selected={theme === "dark"}
                    onSelect={() => setTheme("dark")}
                    preview={<div className="h-16 w-full rounded-xl bg-[#09090b] border flex items-center justify-center text-indigo-300"><HugeiconsIcon icon={MoonIcon} className="h-6 w-6" /></div>}
                  />
                  <ThemeOption
                    label="System"
                    selected={theme === "system"}
                    onSelect={() => setTheme("system")}
                    preview={<div className="h-16 w-full rounded-xl bg-gradient-to-br from-[#F3F7FF] to-[#09090b] border flex items-center justify-center text-muted-foreground"><HugeiconsIcon icon={PaintBoardIcon} className="h-6 w-6" /></div>}
                  />
                </div>
              </Section>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">{title}</h3>
      {children}
    </div>
  );
}

function DefinitionList({ items }: { items: Array<{ label: string; value: string; icon?: any; mono?: boolean }> }) {
  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      {items.map((item, i) => (
        <div key={item.label} className={cn("flex items-center justify-between p-4", i !== items.length - 1 && "border-b border-border/50")}>
          <div className="flex items-center gap-3">
             {item.icon && <HugeiconsIcon icon={item.icon} className="h-4 w-4 text-muted-foreground/60" />}
             <span className="text-xs font-semibold text-muted-foreground">{item.label}</span>
          </div>
          <span className={cn("text-sm font-medium", item.mono && "font-mono text-xs")}>{item.value}</span>
        </div>
      ))}
    </div>
  );
}

function ThemeOption({ label, selected, onSelect, preview }: { label: string; selected: boolean; onSelect: () => void; preview: React.ReactNode }) {
  return (
    <button onClick={onSelect} className={cn("flex flex-col gap-2 rounded-xl border p-2 transition-all", selected ? "border-primary bg-primary/5 ring-2 ring-primary/30" : "bg-card hover:border-border/80")}>
      {preview}
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-medium">{label}</span>
        {selected && <HugeiconsIcon icon={CheckmarkCircle02Icon} className="h-3.5 w-3.5 text-primary" />}
      </div>
    </button>
  );
}