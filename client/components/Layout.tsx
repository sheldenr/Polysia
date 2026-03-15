import { ReactNode, useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";
import { Link } from "react-router-dom";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [showBetaBanner, setShowBetaBanner] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("theme");
    const shouldUseDark = savedTheme ? savedTheme === "dark" : false;
    setIsDarkMode(shouldUseDark);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
    window.localStorage.setItem("theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  useEffect(() => {
    const targets = Array.from(
      document.querySelectorAll<HTMLElement>("section, nav, footer")
    );

    const isTransparent = (color: string) =>
      color === "transparent" || color === "rgba(0, 0, 0, 0)";

    const resolveBackgroundColor = (element: HTMLElement) => {
      let current: HTMLElement | null = element;

      while (current) {
        const color = window.getComputedStyle(current).backgroundColor;
        if (!isTransparent(color)) {
          return color;
        }
        current = current.parentElement;
      }

      return isDarkMode ? "rgb(9, 9, 11)" : "rgb(255, 255, 255)";
    };

    if (targets.length === 0) {
      const fallback = isDarkMode ? "rgb(9, 9, 11)" : "rgb(255, 255, 255)";
      document.documentElement.style.backgroundColor = fallback;
      document.body.style.backgroundColor = fallback;
      return;
    }

    let rafId: number | null = null;

    const syncOverscrollBackground = () => {
      const viewportCenter = window.innerHeight / 2;
      let nearest: HTMLElement | null = null;
      let nearestDistance = Number.POSITIVE_INFINITY;

      for (const target of targets) {
        const rect = target.getBoundingClientRect();
        const elementCenter = (rect.top + rect.bottom) / 2;
        const distance = Math.abs(elementCenter - viewportCenter);

        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearest = target;
        }
      }

      const color = nearest
        ? resolveBackgroundColor(nearest)
        : isDarkMode
          ? "rgb(9, 9, 11)"
          : "rgb(255, 255, 255)";

      document.documentElement.style.backgroundColor = color;
      document.body.style.backgroundColor = color;
    };

    const requestSync = () => {
      if (rafId !== null) {
        return;
      }
      rafId = window.requestAnimationFrame(() => {
        rafId = null;
        syncOverscrollBackground();
      });
    };

    syncOverscrollBackground();
    window.addEventListener("scroll", requestSync, { passive: true });
    window.addEventListener("resize", requestSync);

    return () => {
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
      window.removeEventListener("scroll", requestSync);
      window.removeEventListener("resize", requestSync);
    };
  }, [isDarkMode]);

  return (
    <div className="flex flex-col min-h-screen bg-white text-black dark:bg-zinc-950 dark:text-zinc-100 transition-colors duration-300">
      {/* Header: beta banner + nav */}
      <div className="z-50">
      {/* Top Notification Bar */}
      {showBetaBanner && (
        <div className="w-full bg-black text-white py-2 px-4 text-sm dark:bg-zinc-900">
          <div className="max-w-7xl mx-auto flex items-center">
            <p className="w-full text-center">Polysia is currently in alpha. This is a solo-development project, thanks for helping us improve.</p>
            <button
              type="button"
              onClick={() => setShowBetaBanner(false)}
              className="ml-3 shrink-0 px-1 text-white/80 hover:text-white"
              aria-label="Dismiss beta banner"
            >
              X
            </button>
          </div>
        </div>
      )}

      {/* Navigation Bar */}
      <nav className="w-full bg-white/90 backdrop-blur-md dark:bg-zinc-950/90 border-b border-black/5 dark:border-white/10 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2"
          >
            <img src="/logo only.svg" alt="Polysia logo" className="w-8 h-8" />
            <span className="font-sans font-semibold text-lg hidden sm:inline">Polysia</span>
          </Link>

          {/* Right Side - Login + Sign Up */}
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="px-4 py-2 text-black dark:text-zinc-100 hover:text-[#3491b2] transition-colors font-medium text-sm"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="px-4 py-2 bg-black text-white dark:bg-[#3491b2] dark:hover:bg-[#2b7f9d] text-sm font-medium rounded-full hover:bg-gray-800 transition-colors"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      </div>{/* end sticky header */}

      {/* Main Content */}
      <main className="flex-1 w-full">
        {children}
      </main>

      {/* Footer */}
      <footer className="w-full bg-white dark:bg-zinc-950 border-t border-gray-200 dark:border-zinc-800 mt-20 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Logo on Left */}
            <Link to="/" className="flex items-center gap-2">
              <img src="/logo only.svg" alt="Polysia logo" className="w-6 h-6" />
            </Link>

            {/* Links in Middle */}
            <div className="flex gap-6 text-sm text-gray-600 dark:text-zinc-400">
              <a href="#" className="hover:text-[#3491b2] transition-colors">Privacy</a>
              <a href="#" className="hover:text-[#3491b2] transition-colors">Terms</a>
              <a href="#" className="hover:text-[#3491b2] transition-colors">Contact</a>
            </div>

            {/* Github Icon on Right */}
            <a
              href="https://github.com/sheldenr/polysia"
              className="text-gray-600 dark:text-zinc-400 hover:text-[#3491b2] transition-colors"
              aria-label="GitHub"
            >
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v 3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
            </a>
          </div>
        </div>
      </footer>

      <button
        type="button"
        onClick={() => setIsDarkMode((prev) => !prev)}
        className="fixed bottom-5 left-5 z-50 w-11 h-11 rounded-full bg-white dark:bg-zinc-900 text-[#3491b2] dark:text-[#5db4ce] shadow-lg hover:shadow-xl border border-black/10 dark:border-white/10 flex items-center justify-center transition-all duration-300"
        aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
      >
        {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>
    </div>
  );
}
