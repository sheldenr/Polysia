import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";

export type SRSRating = 1 | 2 | 3 | 4; // 1: Again, 2: Hard, 3: Good, 4: Easy

export interface Flashcard {
  s: string; // simplified
  t: string; // traditional
  p: string; // pinyin
  e: string; // english
  g: string; // grammar
  n: string; // notes
  h: string; // id
  // SRS metadata
  interval: number; // in days
  repetition: number;
  efactor: number;
  dueDate: number; // timestamp
}

// Simple SM-2 like algorithm
function calculateNextReview(card: Flashcard, rating: SRSRating): Partial<Flashcard> {
  let { interval, repetition, efactor } = card;

  if (rating >= 3) { // Good or Easy
    if (repetition === 0) {
      interval = 1;
    } else if (repetition === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * efactor);
    }
    repetition++;
  } else { // Again or Hard
    repetition = 0;
    interval = 1;
  }

  const qMap = { 1: 0, 2: 2, 3: 4, 4: 5 };
  const q = qMap[rating];
  efactor = efactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
  if (efactor < 1.3) efactor = 1.3;

  const dueDate = Date.now() + interval * 24 * 60 * 60 * 1000;

  return { interval, repetition, efactor, dueDate };
}

export function useSRS() {
  const { user } = useAuth();
  const [deck, setDeck] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(true);

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

        if (data && data.length > 0) {
          // Map DB columns back to Flashcard interface
          const mappedDeck: Flashcard[] = data.map((item: any) => ({
            s: item.simplified,
            t: item.traditional,
            p: item.pinyin,
            e: item.english,
            g: item.grammar,
            n: item.notes,
            h: item.id,
            interval: item.interval,
            repetition: item.repetition,
            efactor: item.efactor,
            dueDate: new Date(item.due_date).getTime(),
          }));
          setDeck(mappedDeck);
        } else {
          // Initialize with default HSK cards if empty
          const res = await fetch("/chinese-dictionary-custom.json");
          const dictData: any[] = await res.json();
          const hskCards = dictData
            .filter((item) => item.n && item.n.includes("HSK level 1"))
            .map((item) => ({
              ...item,
              interval: 0,
              repetition: 0,
              efactor: 2.5,
              dueDate: Date.now(),
            }));
          
          // Bulk insert initial cards to Supabase
          const { error: insertError } = await supabase
            .from("flashcards")
            .insert(hskCards.map(card => ({
              user_id: user.id,
              simplified: card.s,
              traditional: card.t,
              pinyin: card.p,
              english: card.e,
              grammar: card.g,
              notes: card.n,
              interval: card.interval,
              repetition: card.repetition,
              efactor: card.efactor,
              due_date: new Date(card.dueDate).toISOString(),
            })));

          if (insertError) console.error("Failed to seed cards", insertError);
          setDeck(hskCards);
        }
      } catch (err) {
        console.error("Failed to load deck from Supabase", err);
      } finally {
        setLoading(false);
      }
    }

    loadDeck();
  }, [user]);

  const getDueCards = useCallback(() => {
    const now = Date.now();
    return deck
      .filter((card) => card.dueDate <= now)
      .sort((a, b) => a.dueDate - b.dueDate);
  }, [deck]);

  const rateCard = useCallback(async (cardId: string, rating: SRSRating) => {
    if (!supabase || !user) return;

    const card = deck.find(c => c.h === cardId);
    if (!card) return;

    const updates = calculateNextReview(card, rating);
    const updatedCard = { ...card, ...updates };

    // Optimistic update
    setDeck(prev => prev.map(c => c.h === cardId ? updatedCard : c));

    // Update Supabase
    try {
      const { error } = await supabase
        .from("flashcards")
        .update({
          interval: updates.interval,
          repetition: updates.repetition,
          efactor: updates.efactor,
          due_date: updates.dueDate ? new Date(updates.dueDate).toISOString() : undefined,
        })
        .eq("id", cardId)
        .eq("user_id", user.id);

      if (error) throw error;
    } catch (err) {
      console.error("Failed to update card in Supabase", err);
      // Rollback on error? For now just log.
    }
  }, [deck, user]);

  return { deck, loading, getDueCards, rateCard };
}
