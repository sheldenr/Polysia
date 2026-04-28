import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { AlertCircle, ArrowRight } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function HeroSection() {
  const { isAuthenticated, supabaseConfigError } = useAuth();

  return (
    <section className="dark-gradient-dither relative isolate w-full overflow-hidden bg-background px-6 pb-8 pt-8 sm:px-6 sm:pb-12 sm:pt-16 lg:px-8 lg:pb-16 lg:pt-24">
      {supabaseConfigError && (
        <div className="mx-auto max-w-2xl mb-8">
          <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 text-destructive-foreground">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Configuration Error</AlertTitle>
            <AlertDescription className="text-xs">
              {supabaseConfigError}
            </AlertDescription>
          </Alert>
        </div>
      )}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 h-[52rem] w-[100rem] -translate-x-1/2 -translate-y-[58%] rounded-full opacity-100 dark:opacity-70"
        style={{
          background:
            "radial-gradient(circle, hsl(var(--primary) / 0.15) 0%, hsl(var(--primary) / 0.1) 22%, hsl(var(--primary) / 0.05) 40%, transparent 70%)",
          filter: "blur(90px)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[36rem] opacity-[0.16] mix-blend-multiply dark:opacity-[0.06] dark:mix-blend-soft-light"
        style={{
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
        {/* Launch Badge */}
        <div className="mb-8 flex justify-center">
          <div
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium text-black transition-transform hover:scale-[1.02] cursor-default dark:text-white"
            style={{ backgroundColor: 'rgba(0, 142, 194, 0.15)' }}
          >
            <span>Recently Launched</span>
            <ArrowRight className="h-3.5 w-3.5 stroke-[3]" />
          </div>
        </div>
        {/* Main Heading */}
        <h1 className="text-5xl sm:text-6xl lg:text-8xl font-heading mb-6 leading-[1.1] tracking-tight text-foreground">
          Study Chinese,
          <span className="block">reach <span className="italic-serif text-primary">real</span> fluency.</span>
        </h1>

        {/* Subheading */}
        <p className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
          Polysia lets you learn Chinese at your own pace, with words you can <span className="italic-serif">actually</span> read and understand.
        </p>

        {/* CTA Button */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            size="lg"
            asChild
            className="rounded-full px-10 h-14 text-lg font-medium bg-primary text-primary-foreground hover:bg-primary/90 shadow-none hover:shadow-xl hover:shadow-primary/20 transition-all duration-300 border-none"
          >
            <Link to={isAuthenticated ? "/learning-hub" : "/signup"}>
              {isAuthenticated ? "Continue your progress" : "Start learning now"}
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
