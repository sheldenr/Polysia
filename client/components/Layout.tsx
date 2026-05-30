import { ReactNode, useState, useEffect } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { GithubIcon, Cancel01Icon } from "@hugeicons/core-free-icons";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";

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
      {/* Main Content */}
      <main className="flex-1 w-full">{children}</main>

      {/* Footer */}
      {!hideFooter && (
        <footer className="w-full bg-white dark:bg-background transition-colors duration-300">
          <div className="mx-auto max-w-7xl px-6 py-12 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center justify-center gap-4 text-center">
              {/* Logo */}
              <Link
                to="/"
                className="flex flex-col items-center gap-2 hover:opacity-80 transition-opacity"
              >
                <img
                  src="/logo only.svg"
                  alt="Polysia logo"
                  className="w-10 h-10"
                />
                <span className="font-heading font-semibold text-xl tracking-tight">
                  Polysia
                </span>
              </Link>

              <p className="text-xs text-muted-foreground/80">
                © {new Date().getFullYear()} Polysia. Built for better learning.
              </p>

              {/* Links */}
              <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
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
                <a
                  href="https://github.com/sheldenr/polysia"
                  className="hover:text-primary transition-colors"
                  target="_blank"
                  rel="noreferrer"
                >
                  GitHub
                </a>
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
