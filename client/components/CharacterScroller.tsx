import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import ChineseTooltipText from "@/components/ChineseTooltipText";

export default function CharacterScroller() {
  const containerRef = useRef<HTMLDivElement>(null);
  const characters = ["学", "式", "说", "会", "写", "听", "练", "脚", "看", "想", "做", "爱", "心", "好"];

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  // Slow horizontal movement
  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-7.5%"]);

  return (
    <section 
      ref={containerRef}
      className="w-full overflow-hidden pb-8 pt-4 transition-colors duration-300 sm:pb-10 sm:pt-6 relative"
    >
      {/* Vignette Overlays */}
      <div className="absolute inset-y-0 left-0 w-32 sm:w-80 bg-gradient-to-r from-background via-background/70 to-transparent z-20 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-32 sm:w-80 bg-gradient-to-l from-background via-background/70 to-transparent z-20 pointer-events-none" />

      <div className="py-0">
        <motion.div 
          style={{ x }}
          className="flex w-max items-center gap-6 px-6"
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
          {/* Duplicate some to ensure coverage during scroll */}
          {characters.slice(0, 4).map((character, index) => (
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
        </motion.div>
      </div>
    </section>
  );
}
