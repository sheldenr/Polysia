import { ReactNode, useState, useEffect, useLayoutEffect } from "react";
import { Github, X } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { isAuthenticated } = useAuth();
  const [showBetaBanner, setShowBetaBanner] = useState(true);

  useLayoutEffect(() => {
    const isMobileViewport = window.matchMedia("(max-width: 767px)").matches;

    if (isMobileViewport) {
      return;
    }

    const supportsObserver = typeof IntersectionObserver !== "undefined";
    const revealTargets = Array.from(
      document.querySelectorAll<HTMLElement>("main > *, main section, nav"),
    );
    let revealRafId: number | null = null;

    if (revealTargets.length === 0) {
      return;
    }

    revealTargets.forEach((target, index) => {
      target.classList.add("reveal-on-scroll");
      target.style.setProperty(
        "--reveal-delay",
        `${Math.min(index * 55, 330)}ms`,
      );
    });

    if (!supportsObserver) {
      revealRafId = window.requestAnimationFrame(() => {
        revealTargets.forEach((target) => target.classList.add("is-visible"));
      });

      return () => {
        if (revealRafId !== null) {
          window.cancelAnimationFrame(revealRafId);
        }
        revealTargets.forEach((target) => {
          target.classList.remove("reveal-on-scroll", "is-visible");
          target.style.removeProperty("--reveal-delay");
        });
      };
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -8% 0px",
      },
    );

    revealRafId = window.requestAnimationFrame(() => {
      revealTargets.forEach((target) => observer.observe(target));
    });

    return () => {
      if (revealRafId !== null) {
        window.cancelAnimationFrame(revealRafId);
      }
      observer.disconnect();
      revealTargets.forEach((target) => {
        target.classList.remove("reveal-on-scroll", "is-visible");
        target.style.removeProperty("--reveal-delay");
      });
    };
  }, []);

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
        const elementCenter = (rect.top + rect.bottom) / 2;
        const distance = Math.abs(elementCenter - viewportCenter);

        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearest = target;
        }
      }

      const color = nearest
        ? resolveBackgroundColor(nearest)
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
  }, []);

  return (
    <div className="site-animations flex min-h-screen flex-col bg-background text-foreground transition-colors duration-300">
      {/* Header: beta banner + nav */}
      <div className="sticky top-0 z-50">
        {/* Top Notification Bar */}
        {showBetaBanner && (
          <div className="w-full bg-black border-b border-white/10 px-6 py-2 text-sm text-white sm:px-4">
            <div className="mx-auto flex max-w-7xl items-center gap-3">
              <div className="min-w-0 flex-1">
                <div className="marquee-viewport sm:hidden">
                  <div className="marquee-strip flex w-max items-center gap-10 pr-10 whitespace-nowrap">
                    <p className="m-0 inline-flex items-center text-white/90">
                      <span className="font-bold">Note: </span>
                      <span className="ml-1">
                        Polysia is currently in alpha. This is a
                        solo-development project, thanks for helping us improve.
                      </span>
                    </p>
                    <p
                      className="m-0 inline-flex items-center text-white/90"
                      aria-hidden="true"
                    >
                      <span className="font-bold">Note: </span>
                      <span className="ml-1">
                        Polysia is currently in alpha. This is a
                        solo-development project, thanks for helping us improve.
                      </span>
                    </p>
                  </div>
                </div>
                <p className="hidden w-full text-center sm:block text-white/90">
                  <span className="font-bold">Note: </span>
                  Polysia is currently in alpha. This is a solo-development
                  project, thanks for helping us improve.
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => setShowBetaBanner(false)}
                className="text-white hover:bg-white/20"
                aria-label="Dismiss beta banner"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

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
                <Button asChild className="rounded-full">
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
                  <Button asChild className="rounded-full">
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
      <footer className="w-full bg-card border-t mt-12 transition-colors duration-300">
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
            </div>

            {/* Social Icons on Right */}
            <div className="hidden md:flex items-center gap-4">
              <a
                href="https://github.com/sheldenr/polysia"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="GitHub"
              >
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
