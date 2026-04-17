import ChineseTooltipText from "@/components/ChineseTooltipText";

export default function CharacterScroller() {
  const characters = ["学", "式", "说", "会", "写", "听", "练", "脚"];

  const renderTrack = (trackKey: string) => (
    <div
      key={trackKey}
      className="marquee-track flex w-max shrink-0 items-center gap-6 pr-6"
      aria-hidden={trackKey !== "primary"}
    >
      {characters.map((character, index) => (
        <div
          key={`${trackKey}-${index}`}
          className="group flex-shrink-0 w-48 h-32 sm:w-64 sm:h-44 rounded-2xl border border-border bg-card flex items-center justify-center transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5"
        >
          <ChineseTooltipText
            text={character}
            className="text-4xl sm:text-6xl font-heading font-light text-foreground/40 transition-colors duration-300 group-hover:text-primary"
            enableTooltip={false}
          />
        </div>
      ))}
    </div>
  );

  return (
    <section className="w-full overflow-hidden bg-secondary/20 py-12 transition-colors duration-300">
      <div className="marquee-viewport py-2">
        <div className="marquee-strip flex w-max items-center">
          {renderTrack("primary")}
          {renderTrack("clone")}
          {renderTrack("clone-2")}
        </div>
      </div>
    </section>
  );
}
