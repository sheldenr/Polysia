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
  ({ children, glowColor, className, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot.Root : "button";

    const content = (
      <span className="relative z-10 flex items-center gap-2 text-white">
        {asChild ? (children as any).props.children : children}
      </span>
    );

    return (
      <Comp
        ref={ref as any}
        className={cn(
          "relative rounded-xl px-6 h-11 text-sm font-bold transition-all duration-200 w-full sm:w-auto flex items-center justify-center bg-primary hover:bg-primary/95 hover:shadow-md text-white active:scale-[0.99]",
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
