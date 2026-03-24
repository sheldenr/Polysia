import { Globe, Lightbulb, MessageCircle, TrendingUp } from "lucide-react";

export default function WhyChooseSection() {
  const reasons = [
    {
      title: "Authentic Conversations",
      description: "Learn with authentic dialogues you can use in real life",
      icon: MessageCircle,
      iconClassName: "text-[#3491b2]",
    },
    {
      title: "Intelligent Feedback",
      description: "AI-powered insights tailored to your learning pace",
      icon: Lightbulb,
      iconClassName: "text-[#3491b2]",
    },
    {
      title: "Track Progress",
      description: "See measurable improvements with our comprehensive analytics",
      icon: TrendingUp,
      iconClassName: "text-[#3491b2]",
    },
    {
      title: "Cultural Context",
      description: "Understand language beyond flat objective translations",
      icon: Globe,
      iconClassName: "text-[#3491b2]",
    },
  ];

  return (
    <section className="w-full px-6 py-16 transition-colors duration-300 sm:px-6 sm:py-24 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Section Title */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-black dark:text-zinc-100">
            Why Choose <span className="font-serif italic text-[#3491b2]">Polysia?</span>
          </h2>
          <p className="text-gray-600 dark:text-zinc-300 text-lg max-w-2xl mx-auto">
            We've reimagined language learning from the ground up
          </p>
        </div>

        {/* Grid of Reasons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {reasons.map((reason, index) => {
            const Icon = reason.icon;
            return (
            <div
              key={index}
              className="rounded-2xl bg-[#f5f5f5] p-6 text-center transition-colors duration-300 dark:bg-zinc-900 sm:p-8 md:text-left"
            >
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm transition-colors duration-300 dark:bg-zinc-800 md:mx-0">
                <Icon className={`w-5 h-5 ${reason.iconClassName}`} strokeWidth={2.1} />
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold mb-2 text-black dark:text-zinc-100">
                {reason.title}
              </h3>

              {/* Description */}
              <p className="text-gray-600 dark:text-zinc-300 leading-relaxed">
                {reason.description}
              </p>
            </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
