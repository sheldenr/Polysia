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
const customDictionarySource = new DictionarySource(
  "/chinese-dictionary-custom.json",
  "Polysia Custom Word Dictionary",
  "Common app vocabulary words for tooltip hints.",
);

let dictionaryPromise: Promise<DictionaryCollection> | null = null;

type CharacterDefinition = {
  pinyin: string;
  english: string;
};

type TokenWithDefinition = {
  token: string;
  definition: CharacterDefinition | null;
  isHanzi: boolean;
};

type ChineseTooltipTextProps = {
  text: string;
  className?: string;
  characterClassName?: string;
  enableTooltip?: boolean;
};

function loadDictionaryCollection(): Promise<DictionaryCollection> {
  if (dictionaryPromise) {
    return dictionaryPromise;
  }

  dictionaryPromise = new Promise((resolve, reject) => {
    const dictionaries = new DictionaryCollection();
    const loader = new DictionaryLoader(
      [dictionarySource, customDictionarySource],
      dictionaries,
      true,
    );

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

function lookupDefinition(
  dictionaries: DictionaryCollection,
  cache: Map<string, CharacterDefinition | null>,
  token: string,
): CharacterDefinition | null {
  if (cache.has(token)) {
    return cache.get(token) ?? null;
  }

  const entry = dictionaries.lookup(token).getEntries()[0];
  const definition = entry ? getDefinitionFromEntry(entry) : null;
  cache.set(token, definition);
  return definition;
}

export default function ChineseTooltipText({
  text,
  className,
  characterClassName,
  enableTooltip = true,
}: ChineseTooltipTextProps) {
  const [dictionaries, setDictionaries] = useState<DictionaryCollection | null>(null);
  const [loadError, setLoadError] = useState<Error | null>(null);

  useEffect(() => {
    if (!enableTooltip) {
      return;
    }

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
  }, [enableTooltip]);

  const tokensWithDefinitions = useMemo(() => {
    if (!dictionaries) {
      return Array.from(text).map<TokenWithDefinition>((character) => ({
        token: character,
        definition: null,
        isHanzi: hanziRegex.test(character),
      }));
    }

    const lookupCache = new Map<string, CharacterDefinition | null>();
    const resolvedTokens: TokenWithDefinition[] = [];
    const characters = Array.from(text);
    const maxWordLength = 6;
    const isPureHanziWord =
      characters.length > 1 && characters.every((character) => hanziRegex.test(character));

    if (isPureHanziWord) {
      const fullToken = characters.join("");
      const fullWordDefinition = lookupDefinition(dictionaries, lookupCache, fullToken);

      if (fullWordDefinition) {
        return [
          {
            token: fullToken,
            definition: fullWordDefinition,
            isHanzi: true,
          },
        ];
      }
    }

    for (let index = 0; index < characters.length;) {
      const character = characters[index];

      if (!hanziRegex.test(character)) {
        resolvedTokens.push({
          token: character,
          definition: null,
          isHanzi: false,
        });
        index += 1;
        continue;
      }

      const remaining = characters.length - index;
      const longestCandidate = Math.min(maxWordLength, remaining);
      let matchedToken = character;
      let matchedDefinition: CharacterDefinition | null = null;
      let matchedLength = 1;

      for (let length = longestCandidate; length >= 1; length -= 1) {
        const candidate = characters.slice(index, index + length).join("");
        const definition = lookupDefinition(dictionaries, lookupCache, candidate);

        if (definition) {
          matchedToken = candidate;
          matchedDefinition = definition;
          matchedLength = length;
          break;
        }
      }

      resolvedTokens.push({
        token: matchedToken,
        definition: matchedDefinition,
        isHanzi: true,
      });
      index += matchedLength;
    }

    return resolvedTokens;
  }, [dictionaries, text]);

  return (
    <span className={className}>
      {tokensWithDefinitions.map(({ token, isHanzi, definition }, index) => {
        if (!isHanzi) {
          return <span key={`${token}-${index}`}>{token}</span>;
        }

        if (!enableTooltip || (!dictionaries && !loadError)) {
          return (
            <span key={`${token}-${index}`} className={characterClassName}>
              {token}
            </span>
          );
        }

        const english = loadError
          ? "Dictionary unavailable."
          : definition?.english || "No dictionary entry found.";
        const pinyin = loadError ? "" : definition?.pinyin;

        return (
          <Tooltip key={`${token}-${index}`}>
            <TooltipTrigger asChild>
              <span
                className={cn(
                  "inline-block cursor-help px-[1px] -mx-[1px]",
                  characterClassName,
                )}
              >
                {token}
              </span>
            </TooltipTrigger>
            <TooltipContent
              sideOffset={8}
              className="pointer-events-none rounded-2xl border border-border/80 !bg-card !text-foreground shadow-2xl [&>svg]:hidden"
            >
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-semibold">{token}</span>
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
