import { useEffect, useMemo, useState } from "react";
import {
  DictionaryCollection,
  DictionaryLoader,
  DictionarySource,
  type DictionaryEntry,
} from "@alexamies/chinesedict-js";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const hanziRegex = /\p{Script=Han}/u;
const dictionarySource = new DictionarySource(
  "/chinese-dictionary.json",
  "Polysia Character Dictionary",
  "Core Chinese character dictionary for tooltip hints.",
);

let dictionaryPromise: Promise<DictionaryCollection> | null = null;

type CharacterDefinition = {
  pinyin: string;
  english: string;
};

type ChineseTooltipTextProps = {
  text: string;
  className?: string;
  characterClassName?: string;
};

function loadDictionaryCollection(): Promise<DictionaryCollection> {
  if (dictionaryPromise) {
    return dictionaryPromise;
  }

  dictionaryPromise = new Promise((resolve, reject) => {
    const dictionaries = new DictionaryCollection();
    const loader = new DictionaryLoader([dictionarySource], dictionaries, true);

    loader.loadDictionaries().subscribe({
      complete: () => resolve(dictionaries),
      error: reject,
    });
  });

  return dictionaryPromise;
}

function getDefinitionFromEntry(entry: DictionaryEntry): CharacterDefinition {
  return {
    pinyin: entry.getPinyin(),
    english: entry.getEnglish(),
  };
}

export default function ChineseTooltipText({
  text,
  className,
  characterClassName,
}: ChineseTooltipTextProps) {
  const [dictionaries, setDictionaries] = useState<DictionaryCollection | null>(null);
  const [loadError, setLoadError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    void loadDictionaryCollection()
      .then((loadedDictionaries) => {
        if (!cancelled) {
          setDictionaries(loadedDictionaries);
        }
      })
      .catch((error: unknown) => {
        const resolvedError =
          error instanceof Error
            ? error
            : new Error("Unable to load Chinese dictionary data.");
        console.error(resolvedError);
        if (!cancelled) {
          setLoadError(resolvedError);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const definitions = useMemo(() => {
    if (!dictionaries) {
      return new Map<string, CharacterDefinition | null>();
    }

    const lookupMap = new Map<string, CharacterDefinition | null>();

    for (const character of Array.from(text)) {
      if (!hanziRegex.test(character) || lookupMap.has(character)) {
        continue;
      }

      const entry = dictionaries.lookup(character).getEntries()[0];
      lookupMap.set(character, entry ? getDefinitionFromEntry(entry) : null);
    }

    return lookupMap;
  }, [dictionaries, text]);

  return (
    <span className={className}>
      {Array.from(text).map((character, index) => {
        if (!hanziRegex.test(character)) {
          return <span key={`${character}-${index}`}>{character}</span>;
        }

        if (!dictionaries && !loadError) {
          return (
            <span key={`${character}-${index}`} className={characterClassName}>
              {character}
            </span>
          );
        }

        const definition = definitions.get(character);
        const english = loadError
          ? "Dictionary unavailable."
          : definition?.english || "No dictionary entry found.";
        const pinyin = loadError ? "" : definition?.pinyin;

        return (
          <Tooltip key={`${character}-${index}`}>
            <TooltipTrigger asChild>
              <span className={cn("cursor-help", characterClassName)}>{character}</span>
            </TooltipTrigger>
            <TooltipContent
              sideOffset={8}
              className="pointer-events-none rounded-2xl border border-border/80 !bg-card !text-foreground shadow-2xl [&>svg]:hidden"
            >
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-semibold">{character}</span>
                {pinyin ? <span className="text-[11px] text-muted-foreground">{pinyin}</span> : null}
                <span className="text-xs text-muted-foreground">{english}</span>
              </div>
            </TooltipContent>
          </Tooltip>
        );
      })}
    </span>
  );
}
