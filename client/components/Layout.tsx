import { ReactNode, useState, useEffect } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { GithubIcon, Cancel01Icon } from "@hugeicons/core-free-icons";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import CharacterScroller from "@/components/CharacterScroller";

interface LayoutProps {
  children: ReactNode;
  hideFooter?: boolean;
}

export default function Layout({ children, hideFooter = false }: LayoutProps) {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const targets = Array.from(
      document.querySelectorAll<HTMLElement>("section, nav, footer"),
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

      return "rgb(255, 255, 255)";
    };

    if (targets.length === 0) {
      const fallback = "rgb(255, 255, 255)";
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
        // Skip sections that are way off-screen to save calculation
        if (rect.bottom < -100 || rect.top > window.innerHeight + 100) continue;

        const elementCenter = (rect.top + rect.bottom) / 2;
        const distance = Math.abs(elementCenter - viewportCenter);

        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearest = target;
        }
      }

      const color = nearest
        ? resolveBackgroundColor(nearest)
        : null;

      if (color) {
        document.documentElement.style.backgroundColor = color;
        document.body.style.backgroundColor = color;
      }
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
  }, []);

  return (
    <div className="site-animations flex min-h-screen flex-col bg-background text-foreground transition-colors duration-300 overflow-x-hidden">
      {/* Header: nav */}
      <div className="sticky top-0 z-50">
        {/* Navigation Bar */}
        <nav className="w-full bg-background/80 backdrop-blur-md border-b transition-colors duration-300">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 sm:px-6 lg:px-8">
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <img
                src="/logo only.svg"
                alt="Polysia logo"
                className="w-8 h-8"
              />
              <span className="font-heading font-semibold text-xl tracking-tight hidden sm:inline">
                Polysia
              </span>
            </Link>

            {/* Right Side - Auth actions */}
            <div className="flex items-center gap-4">
              {isAuthenticated ? (
                <Button asChild className="rounded-full bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90">
                  <Link to="/learning-hub">Learning Hub</Link>
                </Button>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    asChild
                    className="hidden sm:inline-flex rounded-full"
                  >
                    <Link to="/login">Login</Link>
                  </Button>
                  <Button asChild className="rounded-full bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90">
                    <Link to="/signup">Sign Up</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </nav>
      </div>
      {/* end sticky header */}

      {/* Main Content */}
      <main className="flex-1 w-full">{children}</main>

      {/* Footer */}
      {!hideFooter && (
        <footer className="w-full bg-background border-t mt-12 transition-colors duration-300">
          <div className="mx-auto max-w-7xl px-6 py-8 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              {/* Logo on Left */}
              <Link
                to="/"
                className="hidden md:flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                <img
                  src="/logo only.svg"
                  alt="Polysia logo"
                  className="w-6 h-6"
                />
                <span className="font-heading font-semibold text-lg">
                  Polysia
                </span>
              </Link>

              {/* Links in Middle */}
              <div className="flex gap-6 text-sm text-muted-foreground">
                <Link
                  to="/privacy"
                  className="hover:text-primary transition-colors"
                >
                  Privacy
                </Link>
                <Link
                  to="/terms"
                  className="hover:text-primary transition-colors"
                >
                  Terms
                </Link>
                <Link
                  to="/contact"
                  className="hover:text-primary transition-colors"
                >
                  Contact
                </Link>
                <Link
                  to="/developer"
                  className="hover:text-primary transition-colors"
                >
                  Developer
                </Link>
              </div>

              {/* Social Icons on Right */}
              <div className="hidden md:flex items-center gap-4">
                <a
                  href="https://github.com/sheldenr/polysia"
                  className="text-muted-foreground hover:text-primary transition-colors"
                  aria-label="GitHub"
                >
                  <HugeiconsIcon icon={GithubIcon} className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
