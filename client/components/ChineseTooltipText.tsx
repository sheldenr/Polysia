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
  highlightText?: string;
  variant?: "default" | "reading" | "landing-hero";
  showPinyin?: boolean;
  onTokenHover?: (token: string, definition: CharacterDefinition | null) => void;
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
  highlightText,
  variant = "default",
  showPinyin = false,
  onTokenHover,
}: ChineseTooltipTextProps) {
  const [dictionaries, setDictionaries] = useState<DictionaryCollection | null>(null);
  const [loadError, setLoadError] = useState<Error | null>(null);
  const [openTooltipKey, setOpenTooltipKey] = useState<string | null>(null);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

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

  useEffect(() => {
    setOpenTooltipKey(null);
  }, [text]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(hover: none), (pointer: coarse)");
    const updateTouchMode = () => setIsTouchDevice(mediaQuery.matches);

    updateTouchMode();
    mediaQuery.addEventListener("change", updateTouchMode);

    return () => mediaQuery.removeEventListener("change", updateTouchMode);
  }, []);

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
    <span className={cn(
      "inline-flex flex-wrap items-baseline", 
      variant === "reading" ? "gap-x-0.5" : "gap-0",
      className
    )}>
      {tokensWithDefinitions.map(({ token, isHanzi, definition }, index) => {
        if (!isHanzi) {
          return (
            <span 
              key={`${token}-${index}`} 
              className={cn(variant === "reading" && "opacity-40")}
            >
              {token}
            </span>
          );
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
        const tokenKey = `${token}-${index}`;

        if (variant === "landing-hero") {
          // Check if token matches the highlight text
          const isHighlighted = !!(highlightText && token.includes(highlightText));
          
          return (
            <span key={tokenKey} className="inline-flex flex-col items-center relative group/token">
              <span className="text-[10px] sm:text-xs text-primary/60 font-bold h-4 select-none mb-1">{pinyin}</span>
              <span className={cn(
                "text-3xl sm:text-4xl lg:text-5xl font-heading font-medium leading-none transition-colors duration-300", 
                characterClassName,
                isHighlighted ? "text-[#008EC2]" : "text-foreground"
              )}>
                {token}
              </span>
              {isHighlighted && (
                <motion.div 
                  layoutId="hero-underline"
                  className="absolute -bottom-2 inset-x-0 h-[3px] bg-[#008EC2] rounded-full" 
                  initial={{ opacity: 0, scaleX: 0 }}
                  animate={{ opacity: 1, scaleX: 1 }}
                  transition={{ duration: 0.3 }}
                />
              )}
            </span>
          );
        }

        return (
          <Tooltip
            key={tokenKey}
            open={isTouchDevice ? openTooltipKey === tokenKey : undefined}
            onOpenChange={(nextOpen) => {
              if (!isTouchDevice) {
                return;
              }
              setOpenTooltipKey(nextOpen ? tokenKey : null);
            }}
          >
            <TooltipTrigger asChild>
              <span
                className={cn(
                  "inline-flex items-baseline cursor-help relative",
                  isTouchDevice && "cursor-pointer",
                  variant === "reading" && token.length > 1 && "after:content-[''] after:absolute after:-bottom-[2px] after:left-0 after:right-0 after:h-[3px] after:bg-primary after:rounded-full",
                  characterClassName,
                )}
                onMouseEnter={() => !isTouchDevice && onTokenHover?.(token, definition)}
                onMouseLeave={() => !isTouchDevice && onTokenHover?.("", null)}
                onClick={(event) => {
                  if (!isTouchDevice) {
                    return;
                  }
                  event.preventDefault();
                  event.stopPropagation();
                  setOpenTooltipKey((current) => (current === tokenKey ? null : tokenKey));
                }}
              >
                {token}
              </span>
            </TooltipTrigger>
            <TooltipContent
              sideOffset={8}
              className={cn(
                "pointer-events-none border border-border/80 !bg-card !text-foreground shadow-xl [&>svg]:hidden",
                variant === "reading" ? "rounded-xl max-w-xs" : "rounded-2xl shadow-2xl"
              )}
            >
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-semibold">{token}</span>
                {pinyin ? <span className="text-[11px] text-muted-foreground">{pinyin}</span> : null}
                <span className="text-xs text-muted-foreground leading-relaxed">{english}</span>
              </div>
            </TooltipContent>
          </Tooltip>
        );
      })}
    </span>
  );
}