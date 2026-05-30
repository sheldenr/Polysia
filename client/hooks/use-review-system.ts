import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

export interface ReviewCard {
  id: string;
  simplified: string;
  traditional: string;
  pinyin: string;
  english: string;
  grammar: string;
  notes: string;
  example_sentence: string;
  state: "NEW" | "LEARNING" | "REVIEW" | "RELEARNING";
  hsk_level: number;
  due_date: string;
  repetition: number;
}

export interface ReviewMeta {
  newLimit: number;
  reviewLimit: number;
  streak: number;
  newStartedToday: number;
  reviewDueCount: number;
  learningDueCount: number;
  nextReviewDate: string | null;
  hskProgress: {
    currentLevel: number;
    learned: number;
    total: number;
    levelStats: Record<number, { total: number; learned: number; active: number }>;
  };
}

export function useReviewSystem() {
  const [deck, setDeck] = useState<ReviewCard[]>([]);
  const [meta, setMeta] = useState<ReviewMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDeck = useCallback(async () => {
    setLoading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) return;

      const res = await fetch("/api/reviews", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch reviews");
      const data = await res.json();
      setDeck(data.learning.concat(data.review, data.new));
      setMeta(data.meta);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  const submitAnswer = async (cardId: string, rating: "AGAIN" | "HARD" | "GOOD" | "EASY") => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) return;

      const res = await fetch("/api/reviews/answer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ cardId, rating }),
      });
      if (!res.ok) throw new Error("Failed to submit answer");
      await fetchDeck();
    } catch (err) {
      console.error(err);
    }
  };

  const addToReview = async (text: string) => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) return;

      const res = await fetch("/api/reviews/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to add to reviews");
      }
      await fetchDeck();
      return true;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  useEffect(() => {
    void fetchDeck();
  }, [fetchDeck]);

  return {
    deck,
    meta,
    loading,
    error,
    refresh: fetchDeck,
    submitAnswer,
    addToReview,
  };
}
