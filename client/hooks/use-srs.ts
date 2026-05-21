import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth";

export type SRSRating = "AGAIN" | "HARD" | "GOOD" | "EASY"; 
export type SRSState = "NEW" | "LEARNING" | "REVIEW";

export interface Flashcard {
  id: string;
  h: string; // original sourceId/headwordId
  sourceId: string | null;
  s: string; // simplified
  t: string; // traditional
  p: string; // pinyin
  e: string; // english
  g: string; // grammar
  n: string; // notes
  exampleSentence: string;
  hskLevel: number;
  state: SRSState;
  stepIndex: number;
  interval: number;
  repetition: number;
  efactor: number;
  dueDate: string;
}

export interface HskProgress {
  currentLevel: number;
  learned: number;
  total: number;
  unlockedLevel: number;
  levelStats?: Record<number, { total: number; learned: number; active: number }>;
}

export function getProjectedIntervals(): Record<string, string> {
  return {
    "AGAIN": "Soon",
    "HARD": "Soon",
    "GOOD": "1d",
    "EASY": "4d",
  };
}

export function useSRS() {
  const { session } = useAuth();
  const [deck, setDeck] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState<{
    newLimit: number;
    reviewLimit: number;
    newStartedToday: number;
    reviewDueCount: number;
    learningDueCount: number;
    nextReviewDate: string | null;
    hskProgress?: {
      currentLevel: number;
      learned: number;
      total: number;
      levelStats: Record<number, { total: number; learned: number; active: number }>;
    };
  } | null>(null);

  const fetchFlashcards = useCallback(async () => {
    if (!session?.access_token) return;
    
    setLoading(true);
    try {
      const res = await fetch("/api/flashcards", {
        headers: {
          "Authorization": `Bearer ${session.access_token}`
        }
      });
      if (!res.ok) throw new Error("Failed to fetch flashcards");
      const data = await res.json();
      
      setMeta(data.meta || null);

      console.log("[SRS Hook] Received deck data:", {
        learning: data.learning.length,
        review: data.review.length,
        new: data.new.length,
        meta: data.meta
      });

      // Combine learning, review, and new cards into one deck for the session
      const combined = [
        ...data.learning,
        ...data.review,
        ...data.new
      ].map(c => ({
        ...c,
        // Map backend fields to frontend interface if needed
        h: c.source_id,
        sourceId: c.source_id,
        s: c.simplified,
        t: c.traditional,
        p: c.pinyin,
        e: c.english,
        g: c.grammar,
        n: c.notes,
        exampleSentence: c.example_sentence || "",
        hskLevel: c.hsk_level,
        dueDate: c.due_date
      }));

      setDeck(combined);
    } catch (err) {
      console.error("Failed to load deck", err);
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (session?.access_token) {
      void fetchFlashcards();
    }
  }, [fetchFlashcards, session]);

  const getDueCards = useCallback(() => deck, [deck]);

  const rateCard = useCallback(async (cardId: string, rating: SRSRating) => {
    if (!session?.access_token) return;

    // Determine if the card should stay in the current session
    // According to user request: "User needs to see each card until they select good or easy on them."
    const staysInSession = rating === "AGAIN" || rating === "HARD";

    setDeck(prev => {
      const cardIndex = prev.findIndex(c => c.id === cardId);
      if (cardIndex === -1) return prev;
      
      const newDeck = [...prev];
      const [card] = newDeck.splice(cardIndex, 1);
      
      if (staysInSession) {
        // Move to the end of the deck
        newDeck.push(card);
      }
      return newDeck;
    });

    try {
      const res = await fetch("/api/flashcards/answer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ cardId, rating })
      });
      if (!res.ok) throw new Error("Failed to submit answer");
    } catch (err) {
      console.error("Failed to rate card", err);
    }
  }, [session]);

  const refresh = useCallback(() => void fetchFlashcards(), [fetchFlashcards]);

  const hskProgress: HskProgress = {
    currentLevel: meta?.hskProgress?.currentLevel || 1,
    learned: meta?.hskProgress?.learned || 0,
    total: meta?.hskProgress?.total || 0,
    unlockedLevel: meta?.hskProgress?.currentLevel || 1,
    levelStats: meta?.hskProgress?.levelStats,
  };

  return { deck, loading, getDueCards, rateCard, hskProgress, refresh, meta };
}
