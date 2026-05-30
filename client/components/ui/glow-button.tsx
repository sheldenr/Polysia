import * as React from "react";
import { Slot } from "radix-ui";
import { cn } from "@/lib/utils";

interface GlowButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  glowColor?: string;
  className?: string;
  asChild?: boolean;
}

export const GlowButton = React.forwardRef<HTMLButtonElement, GlowButtonProps>(
  ({ children, glowColor = "rgba(255, 255, 255, 0.5)", className, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot.Root : "button";

    const content = (
      <>
        {/* Subtle Rotating Border Glow */}
        <div
          className="absolute inset-[-100%] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            background: `conic-gradient(from 0deg, transparent 0%, white 25%, transparent 50%, white 75%, transparent 100%)`,
            animation: "spin 4s linear infinite",
          }}
        />

        {/* Primary Blue Background */}
        <div className="absolute inset-[1.5px] rounded-[calc(0.75rem-1.5px)] bg-primary z-0" />

        {/* Minimal Hover Bloom */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-20 scale-100 group-hover:scale-110 blur-xl pointer-events-none transition-all duration-700 bg-white"
        />

        {/* Content */}
        <span className="relative z-10 flex items-center gap-2 text-white">
          {asChild ? (children as any).props.children : children}
        </span>

        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}} />
      </>
    );

    return (
      <Comp
        ref={ref as any}
        className={cn(
          "relative group overflow-hidden rounded-xl px-6 h-11 text-sm font-bold transition-all w-full sm:w-auto flex items-center justify-center bg-white/20 border border-white/40 shadow-sm active:scale-[0.98]",
          className
        )}
        {...props}
      >
        {asChild ? React.cloneElement(children as React.ReactElement, {}, content) : content}
      </Comp>
    );
  }
);

GlowButton.displayName = "GlowButton";
