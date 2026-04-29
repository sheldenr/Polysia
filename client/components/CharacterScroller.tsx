import { useEffect, useRef } from "react";
import ChineseTooltipText from "@/components/ChineseTooltipText";

export default function CharacterScroller() {
  const characters = ["学", "式", "说", "会", "写", "听", "练", "脚", "看", "想", "做", "爱", "心", "好"];
  const stripRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const strip = stripRef.current;
    if (!strip) return;

    let rafId: number | null = null;
    let loopWidth = 0;
    const speed = 0.4;

    const measure = () => {
      loopWidth = strip.scrollWidth / 2;
    };

    const syncPosition = () => {
      rafId = null;
      if (loopWidth <= 0) return;
      const scrollY = Math.max(window.scrollY, 0);
      const offset = (scrollY * speed) % loopWidth;
      strip.style.transform = `translate3d(${-offset}px, 0, 0)`;
    };

    const requestSync = () => {
      if (rafId !== null) return;
      rafId = window.requestAnimationFrame(syncPosition);
    };

    measure();
    syncPosition();

    const resizeObserver = new ResizeObserver(() => {
      measure();
      requestSync();
    });
    resizeObserver.observe(strip);

    window.addEventListener("scroll", requestSync, { passive: true });
    window.addEventListener("resize", requestSync);
    window.addEventListener("orientationchange", requestSync);

    return () => {
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
      resizeObserver.disconnect();
      window.removeEventListener("scroll", requestSync);
      window.removeEventListener("resize", requestSync);
      window.removeEventListener("orientationchange", requestSync);
    };
  }, []);

  return (
    <section 
      className="w-full overflow-hidden pb-8 pt-4 transition-colors duration-300 sm:pb-10 sm:pt-6 relative"
    >
      {/* Vignette Overlays */}
      <div className="absolute inset-y-0 left-0 w-12 sm:w-80 bg-gradient-to-r from-background via-background/70 to-transparent z-20 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-12 sm:w-80 bg-gradient-to-l from-background via-background/70 to-transparent z-20 pointer-events-none" />

      <div className="py-0">
        <div
          ref={stripRef}
          className="flex w-max items-center gap-6 px-6 will-change-transform"
        >
          {characters.map((character, index) => (
            <div
              key={index}
              className="group flex-shrink-0 w-48 h-32 sm:w-64 sm:h-44 rounded-2xl border border-border bg-primary/15 flex items-center justify-center transition-all duration-300 hover:bg-primary hover:border-primary hover:shadow-lg hover:shadow-primary/10"
            >
              <ChineseTooltipText
                text={character}
                className="text-4xl sm:text-6xl font-heading font-light text-foreground/40 transition-colors duration-300 group-hover:text-primary-foreground antialiased"
                enableTooltip={false}
              />
            </div>
          ))}
          {/* Duplicate characters to ensure seamless marquee loop */}
          {characters.map((character, index) => (
            <div
              key={`clone-${index}`}
              className="group flex-shrink-0 w-48 h-32 sm:w-64 sm:h-44 rounded-2xl border border-border bg-primary/15 flex items-center justify-center transition-all duration-300 hover:bg-primary hover:border-primary hover:shadow-lg hover:shadow-primary/10"
            >
              <ChineseTooltipText
                text={character}
                className="text-4xl sm:text-6xl font-heading font-light text-foreground/40 transition-colors duration-300 group-hover:text-primary-foreground antialiased"
                enableTooltip={false}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
