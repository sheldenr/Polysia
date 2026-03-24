export default function FeaturesSection() {
  const features = [
    {
      title: "Roleplay Simulator",
      subtitle: "Practice real dialogue scenarios with adaptive prompts.",
    },
    {
      title: "On-Demand Vocab",
      subtitle: "Capture and learn words instantly from any lesson.",
    },
    {
      title: "Smart Reading",
      subtitle: "Get contextual help without breaking your flow.",
    },
    {
      title: "Daily Review",
      subtitle: "Spaced repetition sessions that keep progress compounding.",
    },
  ];

  return (
    <section className="w-full bg-[#f5f5f5] px-6 pb-24 pt-28 transition-colors duration-300 dark:bg-zinc-900 sm:px-6 sm:pb-32 sm:pt-36 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-12 md:flex-row md:items-start md:gap-16">
          <div className="w-full text-center md:text-left lg:w-3/5">
            <div className="mb-10">
              <h2 className="mb-4 text-4xl font-bold text-black dark:text-zinc-100 sm:text-5xl">
                Everything you need to <span className="font-serif italic text-[#3491b2]">master</span> the language.
              </h2>
              <p className="mx-auto max-w-xl text-base text-gray-700 dark:text-zinc-300 sm:text-lg md:mx-0">
                Our interface hides a powerful engine designed to optimize your learning curve.
              </p>
            </div>

            <div className="space-y-5">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start justify-start gap-4 p-0">
                <div className="flex-shrink-0 mt-1">
                  <svg
                    className="w-6 h-6 text-[#3491b2] font-bold"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="text-lg font-semibold text-black dark:text-zinc-100">{feature.title}</p>
                  <p className="text-sm text-gray-600 dark:text-zinc-300">{feature.subtitle}</p>
                </div>
              </div>
            ))}
            </div>
          </div>

          <div className="mt-8 flex w-full justify-center md:mt-0 md:self-center lg:w-2/5 lg:justify-end">
            <div className="w-full max-w-sm rounded-[1.75rem] bg-white dark:bg-zinc-800 px-10 py-16 text-center shadow-[0_42px_95px_-26px_rgba(0,0,0,0.4),0_18px_40px_-24px_rgba(52,145,178,0.22)] dark:shadow-[0_42px_95px_-26px_rgba(0,0,0,0.62),0_18px_40px_-24px_rgba(52,145,178,0.2)] transition-colors duration-300">
              <p className="text-5xl font-bold text-black dark:text-zinc-100 mb-6">你好</p>
              <p className="text-base text-gray-700 dark:text-zinc-200 leading-relaxed">
                hello / hi
              </p>
              <p className="text-sm text-gray-500 dark:text-zinc-400 mt-8 leading-relaxed">
                A common versatile greeting used in formal and informal settings.
              </p>
            </div>
          </div>
        </div>
    </section>
  );
}
