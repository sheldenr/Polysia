import { HugeiconsIcon } from "@hugeicons/react";
import {
  Message01Icon,
  ZapIcon,
  Book02Icon,
  SparklesIcon,
} from "@hugeicons/core-free-icons";

export default function FeaturesSection() {
  const features = [
    {
      title: "Authentic Conversations",
      subtitle: "Practice real dialogue scenarios with adaptive AI prompts.",
      icon: Message01Icon,
    },
    {
      title: "HSK Vocabulary",
      subtitle: "Capture and learn words instantly from any lesson.",
      icon: ZapIcon,
    },
    {
      title: "AI-based Assistance",
      subtitle: "Get contextual help without breaking your flow.",
      icon: Book02Icon,
    },
    {
      title: "SRS-based Learning",
      subtitle: "Spaced repetition sessions that keep progress compounding.",
      icon: SparklesIcon,
    },
  ];

  return (
    <section className="w-full bg-secondary/10 px-6 py-24 transition-colors duration-300 sm:py-32 relative overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="mx-auto flex max-w-6xl flex-col items-center gap-16 lg:flex-row lg:items-stretch lg:gap-24 relative z-10">
        <div className="w-full text-center lg:text-left lg:w-3/5 flex flex-col justify-center">
          <div className="mb-12">
            <h2 className="mb-6 text-4xl font-heading text-foreground sm:text-5xl lg:text-6xl tracking-tight leading-[1.1]">
              Everything you need to{" "}
              <span className="italic-serif text-primary">learn</span> the
              language.
            </h2>
            <p className="mx-auto max-w-xl text-lg text-muted-foreground lg:mx-0 leading-relaxed">
              Learn more than just daily words through a daily course. Polysia makes it easily to learn the language in a way that feels natural and intuitive, without a tutor.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {features.map((feature, index) => {
              return (
                <div
                  key={index}
                  className="group flex flex-col justify-between p-6 rounded-3xl border border-border bg-card hover:bg-card hover:border-zinc-400 dark:hover:border-zinc-600 hover:shadow-xl hover:shadow-black/5 transition-all duration-300 min-h-[160px]"
                >
                  <h3 className="text-2xl font-medium text-foreground group-hover:text-black dark:group-hover:text-white transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {feature.subtitle}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-10 flex w-full justify-center sm:mt-12 lg:mt-0 lg:w-2/5">
          <div className="relative w-full max-w-sm flex flex-col gap-6 group/main">
            {/* Ambient Glow */}
            <div className="absolute -inset-4 bg-gradient-to-br from-zinc-400/20 to-transparent rounded-[3.5rem] blur-2xl opacity-50 transition-opacity duration-500 group-hover/main:opacity-80" />
            
            {/* The Main Card */}
            <div className="relative w-full h-full flex-1 rounded-[3rem] bg-card border border-border px-8 py-12 shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-all duration-300 overflow-hidden flex flex-col justify-between group-hover/main:border-zinc-400 dark:group-hover/main:border-zinc-600 group-hover/main:shadow-zinc-500/5">
              {/* Top: HSK Level */}
              <div className="text-center mb-6">
                <span className="text-[10px] font-bold text-black/40 dark:text-white/40 uppercase tracking-[0.2em]">
                  HSK Level 1
                </span>
              </div>

              {/* Center: Character, Pinyin, English */}
              <div className="text-center flex-1 flex flex-col justify-center">
                <div className="inline-block relative mb-6">
                  <span className="text-8xl text-foreground tracking-tighter">你好</span>
                </div>
                
                <div className="mb-6">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-xl bg-primary/5 border border-primary/10 text-primary tracking-wider text-[11px] mb-3">
                    Nǐ Hǎo
                  </div>
                  <p className="text-2xl font-medium text-foreground">
                    Hey; Hello
                  </p>
                </div>
              </div>

              {/* Bottom: Description */}
              <div className="p-4 rounded-xl bg-secondary/30 border border-border/50 text-left">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  A common versatile greeting used in both formal and informal
                  settings across the Chinese-speaking world.
                </p>
              </div>
            </div>

            {/* Buttons Below the Card */}
            <div className="grid grid-cols-4 gap-2 px-2 relative z-10">
              {[
                { label: "Again", interval: "1m" },
                { label: "Hard", interval: "15m" },
                { label: "Good", interval: "1d" },
                { label: "Easy", interval: "4d" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex flex-col h-12 items-center justify-center rounded-xl border border-border bg-card shadow-sm group hover:border-zinc-400 dark:hover:border-zinc-600 transition-all duration-200"
                >
                  <span className="text-[10px] font-bold text-foreground group-hover:text-black dark:group-hover:text-white transition-colors">
                    {item.label}
                  </span>
                  <span className="text-[9px] text-muted-foreground font-mono">
                    {item.interval}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
