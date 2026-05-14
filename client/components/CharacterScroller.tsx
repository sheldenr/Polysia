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
    const constantSpeed = 0.02; // Pixels per ms (very slow)
    let currentOffset = 0;
    let lastTime = performance.now();

    const measure = () => {
      loopWidth = strip.scrollWidth / 2;
    };

    const animate = (time: number) => {
      const deltaTime = time - lastTime;
      lastTime = time;
      
      currentOffset = (currentOffset + constantSpeed * deltaTime) % loopWidth;
      strip.style.transform = `translate3d(${-currentOffset}px, 0, 0)`;
      rafId = window.requestAnimationFrame(animate);
    };

    measure();
    rafId = window.requestAnimationFrame(animate);

    const resizeObserver = new ResizeObserver(() => {
      measure();
    });
    resizeObserver.observe(strip);

    window.addEventListener("resize", measure);

    return () => {
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
      resizeObserver.disconnect();
      window.removeEventListener("resize", measure);
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
                className="text-4xl sm:text-6xl font-heading font-normal text-foreground/40 transition-colors duration-300 group-hover:text-primary-foreground antialiased"
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
                className="text-4xl sm:text-6xl font-heading font-normal text-foreground/40 transition-colors duration-300 group-hover:text-primary-foreground antialiased"
                enableTooltip={false}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
