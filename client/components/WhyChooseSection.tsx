import { Globe, Lightbulb, MessageCircle, TrendingUp } from "lucide-react";

export default function WhyChooseSection() {
  const reasons = [
    {
      title: "Real-World Mandarin",
      description:
        "Practice useful Chinese for travel, work, and everyday conversations.",
      icon: MessageCircle,
      color: "from-primary/10 to-primary/5",
      iconColor: "text-primary",
    },
    {
      title: "AI Explanations",
      description:
        "Get instant feedback on vocabulary, meaning, and natural usage.",
      icon: Lightbulb,
      color: "from-primary/10 to-primary/5",
      iconColor: "text-primary",
    },
    {
      title: "Spaced-Repetition Reviews",
      description:
        "Review words at the right time to improve long-term retention.",
      icon: TrendingUp,
      color: "from-primary/10 to-primary/5",
      iconColor: "text-primary",
    },
    {
      title: "Cultural + Context Notes",
      description:
        "Learn when and why native speakers choose specific words and phrases.",
      icon: Globe,
      color: "from-primary/10 to-primary/5",
      iconColor: "text-primary",
    },
  ];

  return (
    <section className="w-full px-6 py-24 transition-colors duration-300 sm:py-32 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        {/* Section Title */}
        <div className="mb-16 sm:mb-20">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-1 w-8 bg-primary rounded-full" />
            <span className="text-xs font-bold tracking-widest uppercase text-muted-foreground">
              Why Polysia
            </span>
          </div>
          <h2 className="text-4xl sm:text-6xl font-heading font-bold mb-6 tracking-tight text-foreground lg:max-w-3x1">
            What makes Polysia a better way to{" "}
            <span className="font-serif italic text-primary tracking-[0.015em]">
              learn Chinese?
            </span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl leading-relaxed">
            Polysia combines AI guidance with proven memory science so you can
            build practical Mandarin skills faster and retain more over time.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
          {reasons.map((reason, index) => {
            const Icon = reason.icon;
            return (
              <div
                key={index}
                className="group relative overflow-hidden rounded-3xl border border-border/70 bg-card px-6 py-7 sm:px-8 sm:py-9 transition-all duration-500 hover:-translate-y-1 hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/10"
              >
                <div 
                  className={`absolute inset-0 bg-gradient-to-br ${reason.color} opacity-0 transition-opacity duration-500 group-hover:opacity-100 pointer-events-none`} 
                />

                <div className="relative z-10 flex h-full flex-col items-center text-center">
                  <div className="mb-5 flex h-12 w-12 items-center justify-center bg-transparent transition-all duration-500 group-hover:scale-110">
                    <Icon className={`h-6 w-6 ${reason.iconColor}`} strokeWidth={2} />
                  </div>
                  <h3 className="mb-3 text-xl font-bold tracking-tight text-foreground">
                    {reason.title}
                  </h3>
                  <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
                    {reason.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
