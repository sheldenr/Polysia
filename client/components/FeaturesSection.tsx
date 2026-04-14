import { Check, Sparkles, BookOpen, MessageSquare, Zap } from "lucide-react";
import ChineseTooltipText from "@/components/ChineseTooltipText";

export default function FeaturesSection() {
  const features = [
    {
      title: "AI Roleplay Conversations",
      subtitle:
        "Practice realistic Mandarin scenarios with adaptive prompts and feedback.",
      icon: MessageSquare,
    },
    {
      title: "Personal Vocabulary Builder",
      subtitle: "Save any Chinese word or phrase and turn it into review cards.",
      icon: Zap,
    },
    {
      title: "Smart Chinese Reading",
      subtitle:
        "Read Chinese text with instant contextual support and definitions.",
      icon: BookOpen,
    },
    {
      title: "Daily Spaced Repetition",
      subtitle: "Use science-backed reviews to remember vocabulary long term.",
      icon: Sparkles,
    },
  ];

  return (
    <section className="w-full bg-[#fafafa] dark:bg-zinc-900/40 px-6 py-24 transition-colors duration-300 sm:py-32 relative overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="mx-auto flex max-w-6xl flex-col items-center gap-16 lg:flex-row lg:items-center lg:gap-24 relative z-10">
        <div className="w-full text-center lg:text-left lg:w-3/5">
          <div className="mb-12">
            <h2 className="mb-6 text-4xl font-heading font-bold text-foreground sm:text-5xl lg:text-6xl tracking-tight leading-[1.1]">
              Your all-in-one{" "}
              <span className="font-serif italic text-primary tracking-[0.015em]">
                Chinese learning hub.
              </span>
            </h2>
            <p className="mx-auto max-w-xl text-lg text-muted-foreground lg:mx-0 leading-relaxed">
              From beginner Mandarin vocabulary to advanced reading practice,
              Polysia gives you one place to study, review, and track progress.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="group flex flex-col items-center lg:items-start p-5 rounded-2xl border border-border bg-card hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-5 h-5" strokeWidth={2.5} />
                  </div>
                  <div className="text-center lg:text-left">
                    <h3 className="text-lg font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {feature.subtitle}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex w-full justify-center lg:w-2/5">
          <div className="relative w-full max-w-md sm:max-w-lg lg:max-w-sm">
            {/* Ambient Glow */}
            <div className="absolute -inset-4 bg-gradient-to-br from-primary/20 to-transparent rounded-[2.5rem] blur-2xl opacity-50" />
            
            {/* The Main Card */}
            <div className="relative w-full rounded-[2rem] bg-card border border-border px-8 pb-8 pt-16 sm:pt-20 shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-colors duration-300 overflow-hidden">
              <div className="text-center">
                <div className="inline-block relative mb-8">
                  <ChineseTooltipText
                    text="你好"
                    className="text-8xl font-bold text-foreground tracking-tighter"
                    enableTooltip={false}
                  />
                </div>
                
                <div className="mb-8">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-xl bg-primary/5 border border-primary/10 text-primary font-bold tracking-wider text-[11px] mb-3">
                    nǐ hǎo
                  </div>
                  <p className="text-2xl font-bold text-foreground">
                    hello
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-secondary/50 border border-border/50 text-left mb-8">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Use when greeting someone politely in most
                    everyday situations, especially with people you do not know
                    well.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                  <div className="h-full w-1/3 bg-primary rounded-full" />
                </div>
                <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  <span>Progress</span>
                  <span>33% Mastered</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
