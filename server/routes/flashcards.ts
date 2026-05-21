import { Request, Response } from "express";
import { supabaseAdmin } from "../lib/supabase-admin.js";
import { readFile } from "node:fs/promises";
import path from "node:path";

const DICTIONARY_PATH = path.join(process.cwd(), "public", "chinese-dictionary-custom.json");

const HSK_VOCAB_SUFFIX_REGEX = /\(HSK level \d+ vocabulary\)\s*$/i;
const HSK_VOCAB_LABEL_REGEX = /^HSK level \d+ vocabulary$/i;
const HANZI_REGEX = /[\u3400-\u9fff]/;

const BRACKETED_ANNOTATION_REGEX = /^\(.*\)$/;

function parseExampleFromNotes(notes: string): { sentence: string; translation: string } {
  const cleanedNotes = (notes || "").replace(HSK_VOCAB_SUFFIX_REGEX, "").trim();
  if (!cleanedNotes) return { sentence: "", translation: "" };

  const parts = cleanedNotes.split("|").map((p) => p.trim()).filter(Boolean);
  
  // Filter out parts that are just bracketed annotations
  const contentParts = parts.filter(p => !BRACKETED_ANNOTATION_REGEX.test(p));
  
  const sentencePart = contentParts.find((p) => HANZI_REGEX.test(p)) ?? contentParts[0] ?? "";
  const translationPart = contentParts.find((p) => p !== sentencePart) ?? "";
  const sentence = (HSK_VOCAB_LABEL_REGEX.test(sentencePart) || BRACKETED_ANNOTATION_REGEX.test(sentencePart)) ? "" : sentencePart;

  return {
    sentence,
    translation: translationPart.replace(HSK_VOCAB_SUFFIX_REGEX, "").trim(),
  };
}

interface DictionaryEntry {
  s: string;
  t: string;
  p: string;
  e: string;
  g: string;
  n: string;
  h: string;
}

export async function handleGetFlashcards(req: Request, res: Response) {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  console.log(`[Flashcards] Fetching for user: ${userId}`);

  try {
    if (!supabaseAdmin) {
      throw new Error("Supabase admin client not initialized");
    }

    // 1. Get user profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("id, onboarding_hsk_level, daily_new_limit, daily_review_limit")
      .eq("id", userId)
      .single();

    if (profileError) throw profileError;

    // 2. Determine SRS Day Rollover (3:00 AM)
    const now = new Date();
    const rolloverHour = 3;
    const srsDayStart = new Date(now);
    if (now.getHours() < rolloverHour) {
      srsDayStart.setDate(srsDayStart.getDate() - 1);
    }
    srsDayStart.setHours(rolloverHour, 0, 0, 0);

    console.log(`[Flashcards] SRS Day Start: ${srsDayStart.toISOString()} (Now: ${now.toISOString()})`);

    // 3. Fetch existing due cards (Learning & Review)
    // We fetch all cards where due_date <= now
    const { data: existingCards, error: cardsError } = await supabaseAdmin
      .from("flashcards")
      .select("*")
      .eq("user_id", userId)
      .lte("due_date", now.toISOString())
      .order("due_date", { ascending: true });

    if (cardsError) throw cardsError;

    // Filter into buckets
    const learningDue = existingCards.filter(c => c.state === 'LEARNING' || c.state === 'RELEARNING');
    const reviewLimit = profile.daily_review_limit || 50;
    
    // We want a total session of ~50 cards. 
    // If we have learning cards, they take priority.
    // Then review cards.
    // Then new cards.
    const reviewDue = existingCards.filter(c => c.state === 'REVIEW').slice(0, reviewLimit);

    console.log(`[Flashcards] Existing due: learning=${learningDue.length}, review=${reviewDue.length} (limit=${reviewLimit})`);

    // 4. Check if we should pull New cards
    const newLimit = profile.daily_new_limit || 10;
    
    // Check how many cards were moved from NEW today
    const { count: newStartedToday, error: newTodayError } = await supabaseAdmin
      .from("flashcards")
      .select("*", { count: 'exact', head: true })
      .eq("user_id", userId)
      .gte("created_at", srsDayStart.toISOString())
      .neq("state", "NEW");

    if (newTodayError) throw newTodayError;

    console.log(`[Flashcards] New cards started today: ${newStartedToday || 0} (limit=${newLimit})`);

    // Also check if they already have NEW cards sitting in the DB
    const { data: existingNew, error: existingNewError } = await supabaseAdmin
      .from("flashcards")
      .select("*")
      .eq("user_id", userId)
      .eq("state", "NEW")
      .order("created_at", { ascending: true });

    if (existingNewError) throw existingNewError;

    console.log(`[Flashcards] Existing NEW cards in DB: ${existingNew.length}`);

    let sessionNewCards = [...existingNew];
    
    // We only pull new cards from the dictionary if:
    // 1. They haven't reached their daily_new_limit today
    // 2. OR they have absolutely NO cards to study (learning, review, and existing new are all empty)
    
    const canPullMore = (newStartedToday || 0) < newLimit;
    
    let newNeeded = 0;
    if (canPullMore) {
      // We only pull enough to reach the daily limit, 
      // accounting for both what we already started today AND what we already have sitting in NEW state.
      newNeeded = Math.max(0, newLimit - (newStartedToday || 0) - existingNew.length);
    }

    console.log(`[Flashcards] canPullMore=${canPullMore}, newNeeded=${newNeeded}`);

    if (newNeeded > 0) {
      try {
        const dictionaryRaw = await readFile(DICTIONARY_PATH, "utf-8");
        const dictionary: DictionaryEntry[] = JSON.parse(dictionaryRaw);
        
        const proficiencyToHsk: Record<string, number> = {
          "Total Beginner": 1,
          "Beginner": 1,
          "Elementary": 2,
          "Intermediate": 4,
          "Advanced": 7,
          "HSK 1": 1,
          "HSK 2": 2,
          "HSK 3": 3,
          "HSK 4": 4,
          "HSK 5": 5,
          "HSK 6": 6,
          "HSK 7": 7,
          "HSK 8": 8,
          "HSK 9": 9,
        };

        const userLevelLabel = profile.onboarding_hsk_level || "HSK 1";
        let targetHskLevel = proficiencyToHsk[userLevelLabel];
        
        if (!targetHskLevel) {
          const match = userLevelLabel.match(/\d+/);
          targetHskLevel = match ? parseInt(match[0], 10) : 1;
        }

        // Pull from targetHskLevel up to the maximum available (7)
        let allLevelCards: DictionaryEntry[] = [];
        for (let i = targetHskLevel; i <= 7; i++) {
          const levelKey = `hsk-L${i}`;
          allLevelCards.push(...dictionary.filter(d => d.h.startsWith(levelKey)));
        }
        
        // If we didn't find enough cards (e.g. user finished all levels from targetHskLevel up),
        // fallback to lower levels just in case.
        if (allLevelCards.length < newNeeded) {
          for (let i = targetHskLevel - 1; i >= 1; i--) {
            const levelKey = `hsk-L${i}`;
            allLevelCards.push(...dictionary.filter(d => d.h.startsWith(levelKey)));
          }
        }

        if (allLevelCards.length === 0) {
          allLevelCards = dictionary.filter(d => d.h.startsWith("hsk-L"));
        }

        // We need to skip cards that the user already has
        const { data: userCardSourceIds } = await supabaseAdmin
          .from("flashcards")
          .select("source_id")
          .eq("user_id", userId);
        
        const existingSourceIds = new Set((userCardSourceIds || []).map(c => c.source_id));
        const availableCards = allLevelCards.filter(c => !existingSourceIds.has(c.h));
        
        const newEntries = availableCards.slice(0, newNeeded);
        
        if (newEntries.length > 0) {
          const inserts = newEntries.map(entry => {
            const parsed = parseExampleFromNotes(entry.n);
            return {
              user_id: userId,
              simplified: entry.s,
              traditional: entry.t,
              pinyin: entry.p,
              english: entry.e,
              grammar: entry.g,
              notes: entry.n,
              example_sentence: parsed.sentence || "",
              source_id: entry.h,
              hsk_level: parseInt(entry.h.match(/L(\d+)/)?.[1] || "1"),
              state: "NEW",
              due_date: now.toISOString(),
            };
          });

          const { data: insertedCards, error: insertError } = await supabaseAdmin
            .from("flashcards")
            .insert(inserts)
            .select();

          if (insertError) throw insertError;
          if (insertedCards) {
            sessionNewCards.push(...insertedCards);
          }
        }
      } catch (dictErr) {
        console.error("Dictionary pull error:", dictErr);
      }
    }

    // 5. Calculate HSK progress for meta
    const dictionaryRaw = await readFile(DICTIONARY_PATH, "utf-8");
    const dictionary: DictionaryEntry[] = JSON.parse(dictionaryRaw);

    const { data: hskStats } = await supabaseAdmin
      .from("flashcards")
      .select("hsk_level, state")
      .eq("user_id", userId);

    const levelStats: Record<number, { total: number; learned: number; active: number }> = {};
    for (let i = 1; i <= 7; i++) {
      const totalInDict = dictionary.filter(d => d.h.startsWith(`hsk-L${i}`)).length;
      const userCardsForLevel = (hskStats || []).filter(c => c.hsk_level === i);
      const learned = userCardsForLevel.filter(c => c.state === 'REVIEW').length;
      const active = userCardsForLevel.filter(c => c.state !== 'NEW').length;
      
      levelStats[i] = {
        total: totalInDict,
        learned,
        active,
      };
    }

    const hskLearned = (hskStats || []).filter(c => c.state === 'REVIEW').length;
    const hskTotal = hskStats?.length || 0;
    const currentHskLevel = hskStats?.length 
      ? Math.min(...hskStats.map(c => c.hsk_level))
      : (proficiencyToHsk[userLevelLabel] || 1);

    res.json({
      learning: learningDue,
      review: reviewDue,
      new: sessionNewCards.slice(0, Math.max(0, newLimit - (newStartedToday || 0))),
      meta: {
        newLimit,
        reviewLimit,
        newStartedToday: newStartedToday || 0,
        reviewDueCount: existingCards.filter(c => c.state === 'REVIEW').length,
        learningDueCount: learningDue.length,
        nextReviewDate: existingCards.length === 0 ? (await supabaseAdmin.from("flashcards").select("due_date").eq("user_id", userId).gt("due_date", now.toISOString()).order("due_date", { ascending: true }).limit(1).single()).data?.due_date : null,
        hskProgress: {
          currentLevel: currentHskLevel,
          learned: hskLearned,
          total: hskTotal,
          levelStats,
        }
      }
    });
  } catch (error) {
    console.error("Error in handleGetFlashcards:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function handleSubmitAnswer(req: Request, res: Response) {
  const userId = req.user?.id;
  const { cardId, rating } = req.body; // rating: 'AGAIN' | 'HARD' | 'GOOD' | 'EASY'

  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  if (!cardId || !rating) return res.status(400).json({ error: "Missing cardId or rating" });

  try {
    if (!supabaseAdmin) {
      throw new Error("Supabase admin client not initialized");
    }

    const { data: card, error: cardError } = await supabaseAdmin
      .from("flashcards")
      .select("*")
      .eq("id", cardId)
      .eq("user_id", userId)
      .single();

    if (cardError) throw cardError;

    let newState = card.state;
    let newStepIndex = card.step_index;
    let newInterval = card.interval;
    let newEfactor = card.efactor || 2.5;
    let newRepetition = card.repetition || 0;
    let newDueDate: Date;

    const now = new Date();
    
    // Calculate next rollover (Next 3:00 AM)
    const nextRollover = new Date(now);
    if (now.getHours() < 3) {
      nextRollover.setHours(3, 0, 0, 0);
    } else {
      nextRollover.setDate(nextRollover.getDate() + 1);
      nextRollover.setHours(3, 0, 0, 0);
    }

    if (card.state === "NEW" || card.state === "LEARNING" || card.state === "RELEARNING") {
      if (rating === "AGAIN") {
        newStepIndex = 0;
        newState = "LEARNING";
        // Keep it due NOW so it stays in the session
        newDueDate = now;
      } else if (rating === "HARD") {
        // Hard in learning: stay in learning, maybe move to next step but keep it due soon
        newStepIndex = Math.max(0, newStepIndex); 
        newState = "LEARNING";
        newDueDate = now;
      } else if (rating === "GOOD") {
        newStepIndex += 1;
        if (newStepIndex >= 2) {
          // Graduate to Review
          newState = "REVIEW";
          newInterval = 1;
          newStepIndex = 0;
          newRepetition += 1;
          newDueDate = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000);
          newDueDate.setHours(4, 0, 0, 0);
        } else {
          newState = "LEARNING";
          newDueDate = now; // Still in learning session
        }
      } else if (rating === "EASY") {
        newState = "REVIEW";
        newInterval = 4;
        newStepIndex = 0;
        newRepetition += 1;
        newDueDate = new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000);
        newDueDate.setHours(4, 0, 0, 0);
      } else {
        newDueDate = nextRollover;
      }
    } else if (card.state === "REVIEW") {
      if (rating === "AGAIN") {
        newState = "RELEARNING";
        newStepIndex = 0;
        newInterval = 0;
        newEfactor = Math.max(1.3, newEfactor - 0.2);
        newDueDate = now; // Stay in session
      } else if (rating === "HARD") {
        newInterval = Math.max(1, Math.round((card.interval || 1) * 1.2));
        newEfactor = Math.max(1.3, newEfactor - 0.15);
        newRepetition += 1;
        newDueDate = new Date(now.getTime() + newInterval * 24 * 60 * 60 * 1000);
        newDueDate.setHours(4, 0, 0, 0);
      } else if (rating === "GOOD") {
        newInterval = Math.max(1, Math.round((card.interval || 1) * newEfactor));
        newRepetition += 1;
        newDueDate = new Date(now.getTime() + newInterval * 24 * 60 * 60 * 1000);
        newDueDate.setHours(4, 0, 0, 0);
      } else if (rating === "EASY") {
        newInterval = Math.max(1, Math.round((card.interval || 1) * newEfactor * 1.3));
        newEfactor = Math.min(3.0, newEfactor + 0.15);
        newRepetition += 1;
        newDueDate = new Date(now.getTime() + newInterval * 24 * 60 * 60 * 1000);
        newDueDate.setHours(4, 0, 0, 0);
      } else {
        newDueDate = nextRollover;
      }
    } else {
      newDueDate = nextRollover;
    }

    const { error: updateError } = await supabaseAdmin
      .from("flashcards")
      .update({
        state: newState,
        step_index: newStepIndex,
        interval: newInterval,
        due_date: newDueDate.toISOString(),
        efactor: newEfactor,
        repetition: newRepetition,
        seen_at: now.toISOString(),
      })
      .eq("id", cardId);

    if (updateError) throw updateError;


    // Log activity for stats tracking
    let actionType = "learning";
    if (card.state === "NEW") actionType = "new";
    else if (card.state === "REVIEW") actionType = "review";
    
    const actionResult = rating === "AGAIN" ? "failure" : "success";
    const action = `stat:flashcard-${actionType}-${actionResult}`;

    await supabaseAdmin.from("learning_activity").insert({
      user_id: userId,
      mode: "flashcards",
      action: action,
      minutes_spent: 0,
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Error in handleSubmitAnswer:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function handleSimulateNextDay(req: Request, res: Response) {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  try {
    if (!supabaseAdmin) {
      throw new Error("Supabase admin client not initialized");
    }

    // Shift all flashcard due dates and creation times back by 24 hours
    // This makes tomorrow's cards due today AND resets the "new cards started today" count
    const { data: cards } = await supabaseAdmin
      .from("flashcards")
      .select("id, due_date, created_at")
      .eq("user_id", userId);
    
    if (cards) {
      for (const card of cards) {
        const newDueDate = new Date(new Date(card.due_date).getTime() - 24 * 60 * 60 * 1000);
        const newCreatedAt = new Date(new Date(card.created_at).getTime() - 24 * 60 * 60 * 1000);
        await supabaseAdmin
          .from("flashcards")
          .update({ 
            due_date: newDueDate.toISOString(),
            created_at: newCreatedAt.toISOString()
          })
          .eq("id", card.id);
      }
    }

    // 2. Set last_activity_date to yesterday so rollover logic triggers
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    await supabaseAdmin
      .from("profiles")
      .update({ last_activity_date: yesterdayStr })
      .eq("id", userId);

    res.json({ success: true });
  } catch (error) {
    console.error("Error in handleSimulateNextDay:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function handleResetProgress(req: Request, res: Response) {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  console.log(`[Flashcards] Resetting progress for user: ${userId}`);

  try {
    if (!supabaseAdmin) {
      throw new Error("Supabase admin client not initialized");
    }

    // 1. Delete all flashcards for the user
    console.log(`[Reset] Deleting flashcards for ${userId}...`);
    const { error: flashcardsError } = await supabaseAdmin
      .from("flashcards")
      .delete()
      .eq("user_id", userId);

    if (flashcardsError) {
      console.error("[Reset] Flashcards delete error:", flashcardsError);
      throw flashcardsError;
    }

    // 2. Delete all learning activity for the user
    console.log(`[Reset] Deleting learning activity for ${userId}...`);
    const { error: activityError } = await supabaseAdmin
      .from("learning_activity")
      .delete()
      .eq("user_id", userId);

    if (activityError) {
      console.error("[Reset] Activity delete error:", activityError);
      throw activityError;
    }

    // 3. Reset profile stats (streak, etc.)
    console.log(`[Reset] Updating profile for ${userId}...`);
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .update({
        streak_days: 0,
        last_activity_date: null,
        current_word_index: 1
      })
      .eq("id", userId);

    if (profileError) {
      console.error("[Reset] Profile update error:", profileError);
      throw profileError;
    }

    res.json({ success: true, message: "Progress reset successfully" });
  } catch (error) {
    console.error("Error in handleResetProgress:", error);
    res.status(500).json({ 
      error: "Internal server error", 
      message: error instanceof Error ? error.message : String(error) 
    });
  }
}
