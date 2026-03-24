export default function CharacterScroller() {
  const characters = ["学", "语", "说", "读", "写", "听", "练", "字"];

  const renderTrack = (trackKey: string) => (
    <div
      key={trackKey}
      className="marquee-track flex w-max shrink-0 items-center gap-4 pr-4"
      aria-hidden={trackKey !== "primary"}
    >
      {characters.map((character, index) => (
        <div
          key={`${trackKey}-${index}`}
          className="group flex-shrink-0 w-40 h-28 sm:w-52 sm:h-32 rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-800 flex items-center justify-center transition-colors duration-300"
        >
          <span className="text-3xl sm:text-4xl font-light text-black dark:text-zinc-100 leading-none select-none transition-colors duration-300 group-hover:text-[#3491b2]">
            {character}
          </span>
        </div>
      ))}
    </div>
  );

  return (
    <section className="w-full overflow-hidden bg-[#f5f5f5] px-6 py-16 transition-colors duration-300 dark:bg-zinc-900 sm:px-6 lg:px-8">
      <div className="marquee-viewport">
        <div className="marquee-strip flex w-max items-center">
        {renderTrack("primary")}
        {renderTrack("clone")}
        </div>
      </div>
    </section>
  );
}
