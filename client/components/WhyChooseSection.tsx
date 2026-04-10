import { Globe, Lightbulb, MessageCircle, TrendingUp } from "lucide-react";

export default function WhyChooseSection() {
  const reasons = [
    {
      title: "Authentic Conversations",
      description: "Learn with authentic dialogues you can use in real life",
      icon: MessageCircle,
      color: "from-primary/10 to-primary/5",
      iconColor: "text-primary",
    },
    {
      title: "Intelligent Feedback",
      description: "AI-powered insights tailored to your learning pace",
      icon: Lightbulb,
      color: "from-primary/10 to-primary/5",
      iconColor: "text-primary",
    },
    {
      title: "Track Progress",
      description:
        "See measurable improvements with our comprehensive analytics",
      icon: TrendingUp,
      color: "from-primary/10 to-primary/5",
      iconColor: "text-primary",
    },
    {
      title: "Cultural Context",
      description: "Understand language beyond flat objective translations",
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
              Philosophy
            </span>
          </div>
          <h2 className="text-4xl sm:text-6xl font-heading font-bold mb-6 tracking-tight text-foreground lg:max-w-3x1">
            Language learning reimagined for{" "}
            <span className="font-serif italic text-primary">efficiency.</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl leading-relaxed">
            Our approach combines modern cognitive science with cutting-edge AI to 
            create an immersive, intuitive experience that fits into your life.
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

                <div className="absolute right-5 top-5 text-xs font-semibold tracking-[0.22em] text-muted-foreground/70">
                  0{index + 1}
                </div>

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
