import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";

export default function HeroSection() {
  const { isAuthenticated } = useAuth();

  return (
    <section className="dark-gradient-dither relative isolate w-full overflow-hidden px-6 py-16 sm:px-6 sm:py-24 lg:px-8 lg:py-32">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 h-[52rem] w-[100rem] -translate-x-1/2 -translate-y-[58%] rounded-full"
        style={{
          background:
            "radial-gradient(circle, hsl(var(--primary) / 0.15) 0%, hsl(var(--primary) / 0.1) 22%, hsl(var(--primary) / 0.05) 40%, transparent 70%)",
          filter: "blur(90px)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[36rem]"
        style={{
          opacity: 0.16,
          mixBlendMode: "multiply",
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180' viewBox='0 0 180 180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.95' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23n)' opacity='0.42'/%3E%3C/svg%3E\")",
          backgroundSize: "220px 220px",
          maskImage:
            "linear-gradient(to bottom, rgba(0,0,0,0.9), rgba(0,0,0,0.5) 55%, rgba(0,0,0,0))",
          WebkitMaskImage:
            "linear-gradient(to bottom, rgba(0,0,0,0.9), rgba(0,0,0,0.5) 55%, rgba(0,0,0,0))",
        }}
      />

      <div className="relative z-10 mx-auto max-w-6xl text-center">
        {/* Main Heading */}
        <h1 className="text-5xl sm:text-6xl lg:text-8xl font-heading font-bold mb-6 leading-[1.1] tracking-tight text-foreground">
          Learn Chinese with{" "}
          <span className="font-serif italic text-primary tracking-[0.015em]">confidence.</span>
        </h1>

        {/* Subheading */}
        <p className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
          Polysia is an AI-powered Chinese learning app for vocabulary, reading,
          and conversation practice. Build your personal word bank and remember
          more with spaced repetition.
        </p>

        {/* CTA Button */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            size="lg"
            asChild
            className="rounded-full px-8 h-12 text-base shadow-xl hover:shadow-primary/20 transition-all"
          >
            <Link to={isAuthenticated ? "/learning-hub" : "/signup"}>
              {isAuthenticated ? "Continue learning" : "Try for free"}
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
