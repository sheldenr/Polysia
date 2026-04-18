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
      title: "Roleplay Simulator",
      subtitle: "Practice real dialogue scenarios with adaptive AI prompts.",
      icon: Message01Icon,
    },
    {
      title: "On-Demand Vocab",
      subtitle: "Capture and learn words instantly from any lesson.",
      icon: ZapIcon,
    },
    {
      title: "Smart Reading",
      subtitle: "Get contextual help without breaking your flow.",
      icon: Book02Icon,
    },
    {
      title: "Daily Review",
      subtitle: "Spaced repetition sessions that keep progress compounding.",
      icon: SparklesIcon,
    },
  ];

  return (
    <section className="w-full bg-secondary/10 px-6 py-24 transition-colors duration-300 sm:py-32 relative overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="mx-auto flex max-w-6xl flex-col items-center gap-16 lg:flex-row lg:items-center lg:gap-24 relative z-10">
        <div className="w-full text-center lg:text-left lg:w-3/5">
          <div className="mb-12">
            <h2 className="mb-6 text-4xl font-heading text-foreground sm:text-5xl lg:text-6xl tracking-tight leading-[1.1]">
              Everything you need to{" "}
              <span className="italic-serif text-primary">master</span> the
              language.
            </h2>
            <p className="mx-auto max-w-xl text-lg text-muted-foreground lg:mx-0 leading-relaxed">
              The interface learning curve and make retention effortless.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="group flex flex-col items-center lg:items-start p-5 rounded-2xl border border-border bg-card/50 hover:bg-card hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary mb-4 group-hover:scale-110 transition-transform duration-300">
                    <HugeiconsIcon icon={Icon} className="w-5 h-5" strokeWidth={2.5} />
                  </div>
                  <div className="text-center lg:text-left">
                    <h3 className="text-lg text-foreground mb-1 group-hover:text-primary transition-colors">
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

        <div className="mt-10 flex w-full justify-center sm:mt-12 lg:mt-0 lg:w-2/5">
          <div className="relative w-full max-w-sm">
            {/* Ambient Glow */}
            <div className="absolute -inset-4 bg-gradient-to-br from-primary/20 to-transparent rounded-[2.5rem] blur-2xl opacity-50" />
            
            {/* The Main Card */}
            <div className="relative w-full rounded-[2rem] bg-card border border-border px-8 pb-8 pt-20 shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-colors duration-300 overflow-hidden">
              <div className="text-center">
                <div className="inline-block relative mb-8">
                  <span className="text-8xl text-foreground tracking-tighter">你好</span>
                </div>
                
                <div className="mb-8">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-xl bg-primary/5 border border-primary/10 text-primary tracking-wider text-[11px] mb-3">
                    nǐ hǎo
                  </div>
                  <p className="text-2xl text-foreground">
                    hello
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-secondary/50 border border-border/50 text-left mb-8">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    A common versatile greeting used in both formal and informal
                    settings across the Chinese-speaking world.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                  <div className="h-full w-1/3 bg-primary rounded-full" />
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground uppercase tracking-wider">
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
