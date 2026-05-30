import { useState, useEffect } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { SunIcon, MoonIcon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";

function readInitialDarkMode(): boolean {
  if (typeof window === "undefined") return false;
  const saved = window.localStorage.getItem("theme");
  if (saved === "dark") return true;
  if (saved === "light") return false;
  if (document.documentElement.classList.contains("dark")) return true;
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
}

export function UserNav() {
  const [isDark, setIsDark] = useState(readInitialDarkMode);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    window.localStorage.setItem("theme", isDark ? "dark" : "light");
  }, [isDark]);

  return (
    <Button 
      variant="ghost" 
      size="icon"
      className="h-10 w-10 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-all shadow-none"
      onClick={() => setIsDark(!isDark)}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <HugeiconsIcon 
        icon={isDark ? SunIcon : MoonIcon} 
        className="h-5 w-5 transition-transform duration-500 rotate-0 hover:rotate-12" 
      />
    </Button>
  );
}

export default UserNav;
