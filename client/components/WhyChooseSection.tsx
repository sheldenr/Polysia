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
            <span className="text-xs tracking-widest uppercase text-muted-foreground">
              Philosophy
            </span>
          </div>
          <h2 className="text-4xl sm:text-6xl font-heading mb-6 tracking-tight text-foreground lg:max-w-3x1">
            Language learning reimagined for{" "}
            <span className="font-serif italic text-primary">efficiency.</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl leading-relaxed">
            Our approach combines modern cognitive science with cutting-edge AI to
            create an immersive, intuitive experience that fits into your life.
          </p>
        </div>

        {/* Grid of Reasons */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {reasons.map((reason, index) => {
            const Icon = reason.icon;
            return (
              <div
                key={index}
                className="group relative flex flex-col p-6 rounded-2xl border border-border bg-card hover:border-primary/20 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${reason.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none`}
                />

                <div className="relative z-10">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-background mb-6 group-hover:scale-110 transition-all duration-500">
                    <Icon className={`w-6 h-6 ${reason.iconColor}`} strokeWidth={2} />
                  </div>

                  <h3 className="text-lg mb-3 text-foreground tracking-tight">
                    {reason.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
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
