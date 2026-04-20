import { HugeiconsIcon } from "@hugeicons/react";
import {
  Chat01Icon,
  Idea01Icon,
  Analytics01Icon,
  GlobalIcon,
} from "@hugeicons/core-free-icons";

export default function WhyChooseSection() {
  const reasons = [
    {
      title: "Authentic Conversations",
      description: "Learn with authentic dialogues you can use in real life",
      icon: Chat01Icon,
      cardClass: "bg-black dark:bg-muted border-none",
      titleClass: "text-white dark:text-foreground",
      descriptionClass: "text-white/80 dark:text-muted-foreground",
      iconColor: "text-white dark:text-primary",
    },
    {
      title: "Intelligent Feedback",
      description: "AI-powered insights tailored to your learning pace",
      icon: Idea01Icon,
      cardClass: "bg-secondary border-none",
      titleClass: "text-primary",
      descriptionClass: "text-primary",
      iconColor: "text-primary",
    },
    {
      title: "Track Progress",
      description:
        "See measurable improvements with our comprehensive analytics",
      icon: Analytics01Icon,
      cardClass: "bg-transparent border border-border/60",
      titleClass: "text-foreground",
      descriptionClass: "text-muted-foreground",
      iconColor: "text-primary",
    },
    {
      title: "Cultural Context",
      description: "Understand language beyond flat objective translations",
      icon: GlobalIcon,
      cardClass: "bg-transparent border border-border/60",
      titleClass: "text-foreground",
      descriptionClass: "text-muted-foreground",
      iconColor: "text-primary",
    },
  ];

  return (
    <section className="w-full overflow-hidden px-6 pb-24 pt-20 transition-colors duration-300 sm:pb-32 sm:pt-24">
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
            <span className="italic-serif text-primary">efficiency.</span>
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
                className={`group relative flex flex-col p-6 rounded-2xl transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl ${reason.cardClass}`}
              >
                <div className="relative z-10">
                  <div className="mb-6 flex h-12 w-12 items-center justify-center transition-all duration-500 group-hover:scale-110">
                    <HugeiconsIcon
                      icon={Icon}
                      className={`w-6 h-6 ${reason.iconColor}`}
                      strokeWidth={2}
                    />
                  </div>

                  <h3 className={`mb-3 text-lg tracking-tight ${reason.titleClass}`}>
                    {reason.title}
                  </h3>
                  <p className={`text-sm leading-relaxed ${reason.descriptionClass}`}>
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
