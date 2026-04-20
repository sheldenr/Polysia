import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";

export type SRSRating = 1 | 2 | 3 | 4; // 1: Again, 2: Hard, 3: Good, 4: Easy
export type SRSState = "NEW" | "LEARNING" | "REVIEW" | "RELEARNING";

const MINUTE_MS = 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

const LEARNING_STEPS_MS = [1 * MINUTE_MS, 15 * MINUTE_MS] as const;
const RELEARNING_STEPS_MS = [1 * MINUTE_MS, 15 * MINUTE_MS] as const;

const START_EASE = 2.5;
const EASE_FLOOR = 1.3;
const INTERVAL_HARD_MULTIPLIER = 1.2;
const INTERVAL_EASY_BONUS = 1.3;
const INTERVAL_FUZZ = 0.05;

export interface Flashcard {
  id: string; // database id
  s: string; // simplified
  t: string; // traditional
  p: string; // pinyin
  e: string; // english
  g: string; // grammar
  n: string; // notes
  h: string; // database id (legacy field name used by UI)
  sourceId: string | null; // source dictionary id
  hskLevel: number;
  state: SRSState;
  stepIndex: number;
  seenAt: number | null;
  // SRS metadata
  interval: number; // in days
  repetition: number;
  efactor: number;
  dueDate: number; // timestamp
}

export interface HskProgress {
  currentLevel: number;
  learned: number;
  total: number;
  unlockedLevel: number;
}

interface FlashcardRow {
  id: string;
  simplified: string;
  traditional: string;
  pinyin: string;
  english: string;
  grammar: string | null;
  notes: string | null;
  interval: number | null;
  repetition: number | null;
  efactor: number | null;
  due_date: string;
  state?: string | null;
  step_index?: number | null;
  hsk_level?: number | null;
  source_id?: string | null;
  seen_at?: string | null;
}

interface DictionaryCard {
  s: string;
  t: string;
  p: string;
  e: string;
  g?: string;
  n?: string;
  h?: string;
}

function isKnownState(value: string | null | undefined): value is SRSState {
  return value === "NEW" || value === "LEARNING" || value === "REVIEW" || value === "RELEARNING";
}

function parseHskLevelFromText(value: string | null | undefined): number | null {
  if (!value) return null;
  const match = value.match(/hsk-L(\d+)/i) ?? value.match(/HSK level (\d+)/i);
  if (!match) return null;
  const level = Number.parseInt(match[1], 10);
  return Number.isFinite(level) && level > 0 ? level : null;
}

function normalizeState(
  rawState: string | null | undefined,
  repetition: number,
  interval: number,
): SRSState {
  if (isKnownState(rawState)) return rawState;
  if (repetition > 0 || interval > 0) return "REVIEW";
  return "NEW";
}

function isLearnedCard(card: Flashcard): boolean {
  return card.state === "REVIEW";
}

function withFuzz(days: number): number {
  if (days <= 2) return days;
  const jitter = 1 + (Math.random() * 2 - 1) * INTERVAL_FUZZ;
  return Math.max(2, days * jitter);
}

function buildLearningUpdate(
  card: Flashcard,
  rating: SRSRating,
  state: "LEARNING" | "RELEARNING",
  steps: readonly number[],
): Partial<Flashcard> {
  const now = Date.now();
  const currentStep = Math.max(0, Math.min(card.stepIndex, steps.length - 1));

  if (rating === 1) {
    return {
      state,
      stepIndex: 0,
      seenAt: card.seenAt ?? now,
      dueDate: now + steps[0],
    };
  }

  if (rating === 2) {
    return {
      state,
      stepIndex: currentStep,
      seenAt: card.seenAt ?? now,
      dueDate: now + steps[currentStep],
    };
  }

  const nextStep = currentStep + 1;
  if (nextStep >= steps.length) {
    return {
      state: "REVIEW",
      stepIndex: 0,
      interval: 1,
      repetition: Math.max(1, card.repetition),
      efactor: Math.max(EASE_FLOOR, card.efactor || START_EASE),
      seenAt: card.seenAt ?? now,
      dueDate: now + DAY_MS,
    };
  }

  return {
    state,
    stepIndex: nextStep,
    seenAt: card.seenAt ?? now,
    dueDate: now + steps[nextStep],
  };
}

function buildReviewUpdate(card: Flashcard, rating: SRSRating): Partial<Flashcard> {
  const now = Date.now();
  const interval = Math.max(1, card.interval);
  const efactor = Math.max(EASE_FLOOR, card.efactor || START_EASE);

  if (rating === 1) {
    return {
      state: "RELEARNING",
      stepIndex: 0,
      interval: 1,
      repetition: 0,
      dueDate: now + RELEARNING_STEPS_MS[0],
    };
  }

  if (rating === 2) {
    const nextInterval = Math.max(1, Math.round(withFuzz(interval * INTERVAL_HARD_MULTIPLIER)));
    return {
      state: "REVIEW",
      stepIndex: 0,
      interval: nextInterval,
      repetition: card.repetition + 1,
      efactor: Math.max(EASE_FLOOR, efactor - 0.15),
      dueDate: now + nextInterval * DAY_MS,
    };
  }

  if (rating === 3) {
    const nextInterval = Math.max(1, Math.round(withFuzz(interval * efactor)));
    return {
      state: "REVIEW",
      stepIndex: 0,
      interval: nextInterval,
      repetition: card.repetition + 1,
      efactor,
      dueDate: now + nextInterval * DAY_MS,
    };
  }

  const boostedEase = efactor + 0.15;
  const nextInterval = Math.max(1, Math.round(withFuzz(interval * efactor * INTERVAL_EASY_BONUS)));
  return {
    state: "REVIEW",
    stepIndex: 0,
    interval: nextInterval,
    repetition: card.repetition + 1,
    efactor: boostedEase,
    dueDate: now + nextInterval * DAY_MS,
  };
}

function calculateNextReview(card: Flashcard, rating: SRSRating): Partial<Flashcard> {
  if (card.state === "NEW") {
    return buildLearningUpdate({ ...card, state: "LEARNING", stepIndex: 0 }, rating, "LEARNING", LEARNING_STEPS_MS);
  }

  if (card.state === "LEARNING") {
    return buildLearningUpdate(card, rating, "LEARNING", LEARNING_STEPS_MS);
  }

  if (card.state === "RELEARNING") {
    return buildLearningUpdate(card, rating, "RELEARNING", RELEARNING_STEPS_MS);
  }

  return buildReviewUpdate(card, rating);
}

function mapDbRowToFlashcard(row: FlashcardRow): Flashcard {
  const repetition = row.repetition ?? 0;
  const interval = row.interval ?? 0;
  const state = normalizeState(row.state, repetition, interval);
  const inferredLevel =
    row.hsk_level ??
    parseHskLevelFromText(row.source_id) ??
    parseHskLevelFromText(row.notes) ??
    1;

  return {
    id: row.id,
    h: row.id,
    sourceId: row.source_id ?? null,
    s: row.simplified,
    t: row.traditional,
    p: row.pinyin,
    e: row.english,
    g: row.grammar ?? "",
    n: row.notes ?? "",
    hskLevel: inferredLevel,
    state,
    stepIndex: row.step_index ?? 0,
    seenAt: row.seen_at ? new Date(row.seen_at).getTime() : state !== "NEW" ? Date.now() : null,
    interval,
    repetition,
    efactor: Math.max(EASE_FLOOR, row.efactor ?? START_EASE),
    dueDate: new Date(row.due_date).getTime(),
  };
}

function getUnlockedLevel(cards: Flashcard[]): number {
  const levels = Array.from(new Set(cards.map((card) => card.hskLevel).filter((level) => level > 0)));
  return levels.length ? Math.max(...levels) : 1;
}

function getCurrentProgressLevel(cards: Flashcard[]): number {
  const sortedLevels = Array.from(
    new Set(cards.map((card) => card.hskLevel).filter((level) => level > 0)),
  ).sort((a, b) => a - b);
  return sortedLevels.find((level) => cards.some((card) => card.hskLevel === level && !isLearnedCard(card)))
    ?? getUnlockedLevel(cards);
}

export function formatInterval(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return "<1m";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

export function getProjectedIntervals(card: Flashcard): Record<SRSRating, string> {
  const now = Date.now();
  const ratings: SRSRating[] = [1, 2, 3, 4];
  const result: Partial<Record<SRSRating, string>> = {};

  for (const rating of ratings) {
    const updates = calculateNextReview(card, rating);
    const dueDate = updates.dueDate ?? now;
    result[rating] = formatInterval(dueDate - now);
  }

  return result as Record<SRSRating, string>;
}

export function useSRS() {
  const { user } = useAuth();
  const [deck, setDeck] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(true);
  const dictionaryCacheRef = useRef<DictionaryCard[] | null>(null);

  const loadDictionary = useCallback(async () => {
    if (dictionaryCacheRef.current) {
      return dictionaryCacheRef.current;
    }

    const res = await fetch("/chinese-dictionary-custom.json");
    if (!res.ok) {
      throw new Error("Could not load dictionary source");
    }

    const raw = (await res.json()) as unknown;
    const cards = Array.isArray(raw) ? (raw as DictionaryCard[]) : [];
    dictionaryCacheRef.current = cards;
    return cards;
  }, []);

  const seedHskLevel = useCallback(
    async (level: number, currentDeck: Flashcard[]) => {
      if (!supabase || !user) return currentDeck;

      const dictionary = await loadDictionary();
      const existingSourceIds = new Set(currentDeck.map((card) => card.sourceId).filter(Boolean));
      const existingKeys = new Set(currentDeck.map((card) => `${card.s}::${card.t}`));

      const cardsForLevel = dictionary.filter((item) => parseHskLevelFromText(item.h) === level);
      if (!cardsForLevel.length) return currentDeck;

      const rowsToInsert = cardsForLevel
        .filter((item) => {
          const sourceId = item.h ?? null;
          const key = `${item.s}::${item.t}`;
          return !existingSourceIds.has(sourceId) && !existingKeys.has(key);
        })
        .map((item) => ({
          user_id: user.id,
          simplified: item.s,
          traditional: item.t,
          pinyin: item.p,
          english: item.e,
          grammar: item.g ?? "",
          notes: item.n ?? "",
          interval: 0,
          repetition: 0,
          efactor: START_EASE,
          due_date: new Date().toISOString(),
          state: "NEW",
          step_index: 0,
          hsk_level: level,
          source_id: item.h ?? null,
          seen_at: null,
        }));

      if (!rowsToInsert.length) return currentDeck;

      const { data, error } = await supabase
        .from("flashcards")
        .insert(rowsToInsert)
        .select("*");

      if (error) {
        throw error;
      }

      const insertedRows = (data ?? []) as FlashcardRow[];
      const insertedCards = insertedRows.map(mapDbRowToFlashcard);
      return [...currentDeck, ...insertedCards];
    },
    [loadDictionary, user],
  );

  const unlockNextLevelIfNeeded = useCallback(
    async (currentDeck: Flashcard[]) => {
      let nextDeck = currentDeck;
      let levelToCheck = getUnlockedLevel(nextDeck);

      while (true) {
        const levelCards = nextDeck.filter((card) => card.hskLevel === levelToCheck);
        if (!levelCards.length) break;

        const allLearned = levelCards.every(isLearnedCard);
        if (!allLearned) break;

        const nextLevel = levelToCheck + 1;
        const seededDeck = await seedHskLevel(nextLevel, nextDeck);
        if (seededDeck.length === nextDeck.length) {
          break;
        }

        nextDeck = seededDeck;
        levelToCheck = nextLevel;
      }

      return nextDeck;
    },
    [seedHskLevel],
  );

  // Initialize deck from Supabase
  useEffect(() => {
    async function loadDeck() {
      if (!supabase || !user) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("flashcards")
          .select("*")
          .eq("user_id", user.id);

        if (error) throw error;

        let mappedDeck: Flashcard[] = ((data ?? []) as FlashcardRow[]).map(mapDbRowToFlashcard);
        if (!mappedDeck.length) {
          mappedDeck = await seedHskLevel(1, []);
        }

        mappedDeck = await unlockNextLevelIfNeeded(mappedDeck);
        setDeck(mappedDeck);
      } catch (err) {
        console.error("Failed to load deck from Supabase", err);
      } finally {
        setLoading(false);
      }
    }

    void loadDeck();
  }, [seedHskLevel, unlockNextLevelIfNeeded, user]);

  const getDueCards = useCallback(() => {
    const now = Date.now();
    return deck
      .filter((card) => card.dueDate <= now)
      .sort((a, b) => {
        if (a.dueDate !== b.dueDate) return a.dueDate - b.dueDate;
        return a.hskLevel - b.hskLevel;
      });
  }, [deck]);

  const hskProgress: HskProgress = (() => {
    if (!deck.length) {
      return { currentLevel: 1, learned: 0, total: 0, unlockedLevel: 1 };
    }

    const currentLevel = getCurrentProgressLevel(deck);
    const currentLevelCards = deck.filter((card) => card.hskLevel === currentLevel);
    const learned = currentLevelCards.filter(isLearnedCard).length;

    return {
      currentLevel,
      learned,
      total: currentLevelCards.length,
      unlockedLevel: getUnlockedLevel(deck),
    };
  })();

  const rateCard = useCallback(async (cardId: string, rating: SRSRating) => {
    if (!supabase || !user) return;

    const card = deck.find(c => c.h === cardId);
    if (!card) return;

    const updates = calculateNextReview(card, rating);
    const updatedCard = { ...card, ...updates };

    // Optimistic update
    const optimisticDeck = deck.map((c) => (c.h === cardId ? updatedCard : c));
    setDeck(optimisticDeck);

    // Update Supabase
    try {
      const { error } = await supabase
        .from("flashcards")
        .update({
          interval: updates.interval,
          repetition: updates.repetition,
          efactor: updates.efactor,
          state: updates.state,
          step_index: updates.stepIndex,
          seen_at: updates.seenAt ? new Date(updates.seenAt).toISOString() : undefined,
          due_date: updates.dueDate ? new Date(updates.dueDate).toISOString() : undefined,
        })
        .eq("id", cardId)
        .eq("user_id", user.id);

      if (error) throw error;
      const maybeUnlockedDeck = await unlockNextLevelIfNeeded(optimisticDeck);
      if (maybeUnlockedDeck.length !== optimisticDeck.length) {
        setDeck(maybeUnlockedDeck);
      }
    } catch (err) {
      console.error("Failed to update card in Supabase", err);
      // Rollback on error? For now just log.
    }
  }, [deck, unlockNextLevelIfNeeded, user]);

  return { deck, loading, getDueCards, rateCard, hskProgress };
}
