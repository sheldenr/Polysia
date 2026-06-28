import path$1 from "path";
import "dotenv/config";
import * as express from "express";
import express__default from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
const handleDemo = (req, res) => {
  const response = {
    message: "Hello from Express server"
  };
  res.status(200).json(response);
};
const supabaseUrl$1 = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE;
const supabaseAdmin = supabaseUrl$1 && supabaseServiceKey ? createClient(supabaseUrl$1, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
}) : null;
if (!supabaseAdmin) {
  console.warn("⚠️ Supabase service role key is missing (SUPABASE_SERVICE_ROLE_KEY or SUPABASE_SERVICE_ROLE). Webhooks and admin tasks will fail.");
}
const handleProfile = async (req, res) => {
  const userId = req.userId;
  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
  try {
    const { data: profile, error: profileError } = await supabaseAdmin.from("profiles").select("*").eq("id", userId).maybeSingle();
    if (profileError) {
      console.error("Error fetching profile:", profileError);
      return res.status(500).json({ success: false, message: "Error fetching profile" });
    }
    if (!profile) {
      return res.status(404).json({ success: false, message: "Profile not found" });
    }
    if (profile.stripe_customer_id) {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
      const subscriptions = await stripe.subscriptions.list({
        customer: profile.stripe_customer_id,
        status: "active",
        limit: 1
      });
      const isStillActive = subscriptions.data.length > 0;
      const currentDbStatus = profile.subscription_status;
      const newStatus = isStillActive ? "active" : "inactive";
      if (currentDbStatus === "active" && !isStillActive) {
        await supabaseAdmin.from("profiles").update({ subscription_status: "inactive" }).eq("id", userId);
        profile.subscription_status = "inactive";
        console.log(`[Stripe Sync] Deactivated subscription for user ${userId}`);
      } else if (currentDbStatus !== "active" && isStillActive) {
        await supabaseAdmin.from("profiles").update({ subscription_status: "active" }).eq("id", userId);
        profile.subscription_status = "active";
        console.log(`[Stripe Sync] Reactivated subscription for user ${userId}`);
      }
    }
    return res.json({
      success: true,
      user: {
        id: userId,
        email: req.user?.email,
        createdAt: req.user?.created_at,
        metadata: req.user?.user_metadata
      },
      profile: {
        streakDays: profile.streak_days,
        onboardingComplete: profile.onboarding_complete,
        subscriptionStatus: profile.subscription_status,
        subscriptionPlan: profile.subscription_plan,
        paymentBypassUntil: profile.payment_bypass_until
      }
    });
  } catch (error) {
    console.error("Profile handler error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};
const DICTIONARY_PATH = path.join(process.cwd(), "public", "chinese-dictionary-custom.json");
const HSK_VOCAB_SUFFIX_REGEX = /\(HSK level \d+ vocabulary\)\s*$/i;
const HSK_VOCAB_LABEL_REGEX = /^HSK level \d+ vocabulary$/i;
const HANZI_REGEX = /[\u3400-\u9fff]/;
const BRACKETED_ANNOTATION_REGEX = /^\(.*\)$/;
function parseExampleFromNotes(notes) {
  const cleanedNotes = (notes || "").replace(HSK_VOCAB_SUFFIX_REGEX, "").trim();
  if (!cleanedNotes) return { sentence: "", translation: "" };
  const parts = cleanedNotes.split("|").map((p) => p.trim()).filter(Boolean);
  const contentParts = parts.filter((p) => !BRACKETED_ANNOTATION_REGEX.test(p));
  const sentencePart = contentParts.find((p) => HANZI_REGEX.test(p)) ?? contentParts[0] ?? "";
  const translationPart = contentParts.find((p) => p !== sentencePart) ?? "";
  const sentence = HSK_VOCAB_LABEL_REGEX.test(sentencePart) || BRACKETED_ANNOTATION_REGEX.test(sentencePart) ? "" : sentencePart;
  return {
    sentence,
    translation: translationPart.replace(HSK_VOCAB_SUFFIX_REGEX, "").trim()
  };
}
async function handleGetReviews(req, res) {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  console.log(`[Reviews] Fetching for user: ${userId}`);
  try {
    if (!supabaseAdmin) {
      throw new Error("Supabase admin client not initialized");
    }
    const { data: profile, error: profileError } = await supabaseAdmin.from("profiles").select("id, onboarding_hsk_level, daily_new_limit, daily_review_limit, streak_days").eq("id", userId).single();
    if (profileError) throw profileError;
    const proficiencyToHsk = {
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
      "HSK 9": 9
    };
    const userLevelLabel = profile.onboarding_hsk_level || "HSK 1";
    const now = /* @__PURE__ */ new Date();
    const rolloverHour = 3;
    const srsDayStart = new Date(now);
    if (now.getHours() < rolloverHour) {
      srsDayStart.setDate(srsDayStart.getDate() - 1);
    }
    srsDayStart.setHours(rolloverHour, 0, 0, 0);
    console.log(`[Reviews] SRS Day Start: ${srsDayStart.toISOString()} (Now: ${now.toISOString()})`);
    const { data: existingCards, error: cardsError } = await supabaseAdmin.from("reviews").select("*").eq("user_id", userId).lte("due_date", now.toISOString()).order("due_date", { ascending: true });
    if (cardsError) throw cardsError;
    const learningDue = existingCards.filter((c) => c.state === "LEARNING" || c.state === "RELEARNING");
    const reviewLimit = profile.daily_review_limit || 50;
    const reviewDue = existingCards.filter((c) => c.state === "REVIEW").slice(0, reviewLimit);
    console.log(`[Reviews] Existing due: learning=${learningDue.length}, review=${reviewDue.length} (limit=${reviewLimit})`);
    const newLimit = profile.daily_new_limit || 10;
    const { count: newStartedToday, error: newTodayError } = await supabaseAdmin.from("reviews").select("*", { count: "exact", head: true }).eq("user_id", userId).gte("created_at", srsDayStart.toISOString()).neq("state", "NEW");
    if (newTodayError) throw newTodayError;
    console.log(`[Reviews] New cards started today: ${newStartedToday || 0} (limit=${newLimit})`);
    const { data: existingNew, error: existingNewError } = await supabaseAdmin.from("reviews").select("*").eq("user_id", userId).eq("state", "NEW").order("created_at", { ascending: true });
    if (existingNewError) throw existingNewError;
    console.log(`[Reviews] Existing NEW cards in DB: ${existingNew.length}`);
    let sessionNewCards = [...existingNew];
    const canPullMore = (newStartedToday || 0) < newLimit;
    let newNeeded = 0;
    if (canPullMore) {
      newNeeded = Math.max(0, newLimit - (newStartedToday || 0) - existingNew.length);
    }
    console.log(`[Reviews] canPullMore=${canPullMore}, newNeeded=${newNeeded}`);
    if (newNeeded > 0) {
      try {
        const dictionaryRaw2 = await readFile(DICTIONARY_PATH, "utf-8");
        const dictionary2 = JSON.parse(dictionaryRaw2);
        let targetHskLevel = proficiencyToHsk[userLevelLabel];
        if (!targetHskLevel) {
          const match = userLevelLabel.match(/\d+/);
          targetHskLevel = match ? parseInt(match[0], 10) : 1;
        }
        let allLevelCards = [];
        for (let i = targetHskLevel; i <= 7; i++) {
          const levelKey = `hsk-L${i}`;
          allLevelCards.push(...dictionary2.filter((d) => d.h.startsWith(levelKey)));
        }
        if (allLevelCards.length < newNeeded) {
          for (let i = targetHskLevel - 1; i >= 1; i--) {
            const levelKey = `hsk-L${i}`;
            allLevelCards.push(...dictionary2.filter((d) => d.h.startsWith(levelKey)));
          }
        }
        if (allLevelCards.length === 0) {
          allLevelCards = dictionary2.filter((d) => d.h.startsWith("hsk-L"));
        }
        const { data: userCardSourceIds } = await supabaseAdmin.from("reviews").select("source_id").eq("user_id", userId);
        const existingSourceIds = new Set((userCardSourceIds || []).map((c) => c.source_id));
        const availableCards = allLevelCards.filter((c) => !existingSourceIds.has(c.h));
        const newEntries = availableCards.slice(0, newNeeded);
        if (newEntries.length > 0) {
          const inserts = newEntries.map((entry) => {
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
              due_date: now.toISOString()
            };
          });
          const { data: insertedCards, error: insertError } = await supabaseAdmin.from("reviews").insert(inserts).select();
          if (insertError) throw insertError;
          if (insertedCards) {
            sessionNewCards.push(...insertedCards);
          }
        }
      } catch (dictErr) {
        console.error("Dictionary pull error:", dictErr);
      }
    }
    const dictionaryRaw = await readFile(DICTIONARY_PATH, "utf-8");
    const dictionary = JSON.parse(dictionaryRaw);
    const { data: hskStats } = await supabaseAdmin.from("reviews").select("hsk_level, state, due_date").eq("user_id", userId);
    const levelStats = {};
    for (let i = 1; i <= 7; i++) {
      const totalInDict = dictionary.filter((d) => d.h.startsWith(`hsk-L${i}`)).length;
      const userCardsForLevel = (hskStats || []).filter((c) => c.hsk_level === i);
      const learned = userCardsForLevel.filter((c) => c.state === "REVIEW").length;
      const active = userCardsForLevel.filter((c) => c.state !== "NEW").length;
      levelStats[i] = {
        total: totalInDict,
        learned,
        active
      };
    }
    const hskLearned = (hskStats || []).filter((c) => c.state === "REVIEW").length;
    const hskTotal = hskStats?.length || 0;
    const currentHskLevel = hskStats?.length ? Math.min(...hskStats.map((c) => c.hsk_level)) : proficiencyToHsk[userLevelLabel] || 1;
    res.json({
      learning: learningDue,
      review: reviewDue,
      new: sessionNewCards.slice(0, Math.max(0, newLimit - (newStartedToday || 0))),
      meta: {
        newLimit,
        reviewLimit,
        streak: profile.streak_days || 0,
        newStartedToday: newStartedToday || 0,
        reviewDueCount: (hskStats || []).filter((c) => c.state === "REVIEW" && new Date(c.due_date) <= now).length,
        learningDueCount: learningDue.length,
        nextReviewDate: existingCards.length === 0 ? (await supabaseAdmin.from("reviews").select("due_date").eq("user_id", userId).gt("due_date", now.toISOString()).order("due_date", { ascending: true }).limit(1).single()).data?.due_date : null,
        hskProgress: {
          currentLevel: currentHskLevel,
          learned: hskLearned,
          total: hskTotal,
          levelStats
        }
      }
    });
  } catch (error) {
    console.error("Error in handleGetReviews:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
async function handleSubmitAnswer(req, res) {
  const userId = req.user?.id;
  const { cardId, rating } = req.body;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  if (!cardId || !rating) return res.status(400).json({ error: "Missing cardId or rating" });
  try {
    if (!supabaseAdmin) {
      throw new Error("Supabase admin client not initialized");
    }
    const { data: card, error: cardError } = await supabaseAdmin.from("reviews").select("*").eq("id", cardId).eq("user_id", userId).single();
    if (cardError) throw cardError;
    let newState = card.state;
    let newStepIndex = card.step_index;
    let newInterval = card.interval;
    let newEfactor = card.efactor || 2.5;
    let newRepetition = card.repetition || 0;
    let newDueDate;
    const now = /* @__PURE__ */ new Date();
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
        newDueDate = now;
      } else if (rating === "HARD") {
        newStepIndex = Math.max(0, newStepIndex);
        newState = "LEARNING";
        newDueDate = now;
      } else if (rating === "GOOD") {
        newStepIndex += 1;
        if (newStepIndex >= 2) {
          newState = "REVIEW";
          newInterval = 1;
          newStepIndex = 0;
          newRepetition += 1;
          newDueDate = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1e3);
          newDueDate.setHours(4, 0, 0, 0);
        } else {
          newState = "LEARNING";
          newDueDate = now;
        }
      } else if (rating === "EASY") {
        newState = "REVIEW";
        newInterval = 4;
        newStepIndex = 0;
        newRepetition += 1;
        newDueDate = new Date(now.getTime() + 4 * 24 * 60 * 60 * 1e3);
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
        newDueDate = now;
      } else if (rating === "HARD") {
        newInterval = Math.max(1, Math.round((card.interval || 1) * 1.2));
        newEfactor = Math.max(1.3, newEfactor - 0.15);
        newRepetition += 1;
        newDueDate = new Date(now.getTime() + newInterval * 24 * 60 * 60 * 1e3);
        newDueDate.setHours(4, 0, 0, 0);
      } else if (rating === "GOOD") {
        newInterval = Math.max(1, Math.round((card.interval || 1) * newEfactor));
        newRepetition += 1;
        newDueDate = new Date(now.getTime() + newInterval * 24 * 60 * 60 * 1e3);
        newDueDate.setHours(4, 0, 0, 0);
      } else if (rating === "EASY") {
        newInterval = Math.max(1, Math.round((card.interval || 1) * newEfactor * 1.3));
        newEfactor = Math.min(3, newEfactor + 0.15);
        newRepetition += 1;
        newDueDate = new Date(now.getTime() + newInterval * 24 * 60 * 60 * 1e3);
        newDueDate.setHours(4, 0, 0, 0);
      } else {
        newDueDate = nextRollover;
      }
    } else {
      newDueDate = nextRollover;
    }
    const { error: updateError } = await supabaseAdmin.from("reviews").update({
      state: newState,
      step_index: newStepIndex,
      interval: newInterval,
      due_date: newDueDate.toISOString(),
      efactor: newEfactor,
      repetition: newRepetition,
      seen_at: now.toISOString()
    }).eq("id", cardId);
    if (updateError) throw updateError;
    let actionType = "learning";
    if (card.state === "NEW") actionType = "new";
    else if (card.state === "REVIEW") actionType = "review";
    const actionResult = rating === "AGAIN" ? "failure" : "success";
    const action = `stat:review-${actionType}-${actionResult}`;
    await supabaseAdmin.from("learning_activity").insert({
      user_id: userId,
      mode: "review",
      action,
      minutes_spent: 0
    });
    res.json({ success: true });
  } catch (error) {
    console.error("Error in handleSubmitAnswer:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
async function handleSimulateNextDay(req, res) {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  try {
    if (!supabaseAdmin) {
      throw new Error("Supabase admin client not initialized");
    }
    const { data: cards } = await supabaseAdmin.from("reviews").select("id, due_date, created_at").eq("user_id", userId);
    if (cards) {
      for (const card of cards) {
        const newDueDate = new Date(new Date(card.due_date).getTime() - 24 * 60 * 60 * 1e3);
        const newCreatedAt = new Date(new Date(card.created_at).getTime() - 24 * 60 * 60 * 1e3);
        await supabaseAdmin.from("reviews").update({
          due_date: newDueDate.toISOString(),
          created_at: newCreatedAt.toISOString()
        }).eq("id", card.id);
      }
    }
    const yesterday = /* @__PURE__ */ new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];
    await supabaseAdmin.from("profiles").update({ last_activity_date: yesterdayStr }).eq("id", userId);
    res.json({ success: true });
  } catch (error) {
    console.error("Error in handleSimulateNextDay:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
async function handleResetProgress(req, res) {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  console.log(`[Reviews] Resetting progress for user: ${userId}`);
  try {
    if (!supabaseAdmin) {
      throw new Error("Supabase admin client not initialized");
    }
    console.log(`[Reset] Deleting reviews for ${userId}...`);
    const { error: reviewsError } = await supabaseAdmin.from("reviews").delete().eq("user_id", userId);
    if (reviewsError) {
      console.error("[Reset] Reviews delete error:", reviewsError);
      throw reviewsError;
    }
    console.log(`[Reset] Deleting learning activity for ${userId}...`);
    const { error: activityError } = await supabaseAdmin.from("learning_activity").delete().eq("user_id", userId);
    if (activityError) {
      console.error("[Reset] Activity delete error:", activityError);
      throw activityError;
    }
    console.log(`[Reset] Updating profile for ${userId}...`);
    const { error: profileError } = await supabaseAdmin.from("profiles").update({
      streak_days: 0,
      last_activity_date: null,
      current_word_index: 1
    }).eq("id", userId);
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
async function handleAddToReview(req, res) {
  const userId = req.user?.id;
  const { text } = req.body;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  if (!text) return res.status(400).json({ error: "Missing text" });
  try {
    if (!supabaseAdmin) {
      throw new Error("Supabase admin client not initialized");
    }
    const dictionaryRaw = await readFile(DICTIONARY_PATH, "utf-8");
    const dictionary = JSON.parse(dictionaryRaw);
    let entry = dictionary.find((d) => d.s === text || d.t === text);
    let insertData;
    if (entry) {
      const parsed = parseExampleFromNotes(entry.n);
      insertData = {
        user_id: userId,
        simplified: entry.s,
        traditional: entry.t,
        pinyin: entry.p,
        english: entry.e,
        grammar: entry.g,
        notes: entry.n,
        example_sentence: parsed.sentence || "",
        source_id: entry.h,
        hsk_level: parseInt(entry.h.match(/L(\d+)/)?.[1] || "1")
      };
    } else {
      return res.status(404).json({ error: "Word not found in dictionary" });
    }
    const { data, error } = await supabaseAdmin.from("reviews").upsert({
      ...insertData,
      state: "NEW",
      due_date: (/* @__PURE__ */ new Date()).toISOString()
    }, { onConflict: "user_id, source_id" }).select().single();
    if (error) throw error;
    res.json({ success: true, card: data });
  } catch (error) {
    console.error("Error in handleAddToReview:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
async function handleGetStories(req, res) {
  try {
    if (!supabaseAdmin) {
      throw new Error("Supabase admin client not initialized");
    }
    const { data, error } = await supabaseAdmin.from("stories").select("*").order("hsk_level", { ascending: true }).order("storyline_id", { ascending: true }).order("chapter_number", { ascending: true });
    if (error) throw error;
    const mappedData = (data || []).map((story) => {
      const parts = (story.content_zh || "").split("|||");
      return {
        ...story,
        content_zh: parts[0]?.trim(),
        content_en: parts[1]?.trim() || ""
      };
    });
    res.json(mappedData);
  } catch (error) {
    console.error("Error in handleGetStories:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
async function handleGetStoryById(req, res) {
  const { id } = req.params;
  try {
    if (!supabaseAdmin) {
      throw new Error("Supabase admin client not initialized");
    }
    const { data, error } = await supabaseAdmin.from("stories").select("*").eq("id", id).single();
    if (error) throw error;
    if (data) {
      const parts = (data.content_zh || "").split("|||");
      data.content_zh = parts[0]?.trim();
      data.content_en = parts[1]?.trim() || "";
    }
    res.json(data);
  } catch (error) {
    console.error("Error in handleGetStoryById:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
const deepSeekRequestSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(["system", "user", "assistant"]),
      content: z.string().min(1)
    })
  ).min(1).max(20),
  temperature: z.number().min(0).max(2).optional(),
  max_tokens: z.number().int().min(1).max(1e3).optional()
});
async function parseDeepSeekUpstreamBody$1(response) {
  const rawBody = await response.text();
  if (!rawBody) {
    return {
      body: {},
      parseError: false,
      rawBody: ""
    };
  }
  try {
    return {
      body: JSON.parse(rawBody),
      parseError: false,
      rawBody
    };
  } catch {
    return {
      body: {},
      parseError: true,
      rawBody
    };
  }
}
const handleDeepSeekRoleplay = async (req, res) => {
  console.log("[DeepSeek Roleplay] Received request");
  const parsed = deepSeekRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: parsed.error.errors[0]?.message ?? "Invalid request payload"
    });
  }
  const userId = req.userId;
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    console.error("[DeepSeek Roleplay] Missing DEEPSEEK_API_KEY");
    return res.status(500).json({
      error: "DeepSeek is not configured. Add DEEPSEEK_API_KEY to your environment."
    });
  }
  let knownVocab = [];
  let hskNum = 1;
  if (userId && supabaseAdmin) {
    const { data: flashcards } = await supabaseAdmin.from("flashcards").select("simplified, hsk_level").eq("user_id", userId).neq("state", "NEW");
    if (flashcards) {
      knownVocab = flashcards.map((f) => f.simplified);
      hskNum = Math.max(1, ...flashcards.map((f) => f.hsk_level || 1));
    } else {
      const { data: profile } = await supabaseAdmin.from("profiles").select("onboarding_hsk_level").eq("id", userId).maybeSingle();
      const onboardingLevel = profile?.onboarding_hsk_level || "HSK 1";
      const hskMatch = onboardingLevel.match(/HSK (\d+)/i);
      if (hskMatch) {
        hskNum = parseInt(hskMatch[1], 10);
      } else {
        const mapping = {
          "Total Beginner": 1,
          "Beginner": 1,
          "Elementary": 2,
          "Intermediate": 4,
          "Advanced": 7
        };
        hskNum = mapping[onboardingLevel] || 1;
      }
    }
  }
  const vocabList = knownVocab.length > 0 ? knownVocab.join(", ") : "basic HSK 1";
  const hskConstraint = hskNum <= 1 ? "HSK 1" : hskNum >= 7 ? "Advanced" : `HSK ${hskNum}`;
  const vocabConstraint = knownVocab.length > 0 ? `The user is at ${hskConstraint} level and knows these Chinese characters/words: [${vocabList}]. Heavily prioritize using these known words in your responses. You can introduce a very small amount of new vocabulary (1-2 new words per response) if necessary for the context, but keep it mostly within their level and known set. DO NOT include any emojis in your response. ALWAYS follow your Chinese response with a new line containing the English translation enclosed in square brackets, for example:
你好！
[Hello!]` : `The user is a beginner at ${hskConstraint} level. Use only very basic vocabulary appropriate for this level. DO NOT include any emojis in your response. ALWAYS follow your Chinese response with a new line containing the English translation enclosed in square brackets, for example:
你好！
[Hello!]`;
  const messages = [...parsed.data.messages];
  const systemMessageIdx = messages.findIndex((m) => m.role === "system");
  if (systemMessageIdx !== -1) {
    messages[systemMessageIdx].content = `${vocabConstraint} ${messages[systemMessageIdx].content}`;
  } else {
    messages.unshift({
      role: "system",
      content: vocabConstraint
    });
  }
  const model = process.env.DEEPSEEK_MODEL ?? "deepseek-chat";
  const timeoutMs = Number(process.env.DEEPSEEK_TIMEOUT_MS ?? 25e3);
  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => controller.abort(),
    Number.isFinite(timeoutMs) && timeoutMs > 0 ? timeoutMs : 25e3
  );
  try {
    const upstream = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      signal: controller.signal,
      body: JSON.stringify({
        model,
        messages,
        temperature: parsed.data.temperature ?? 0.7,
        max_tokens: parsed.data.max_tokens ?? 220
      })
    });
    const { body: upstreamBody, parseError, rawBody } = await parseDeepSeekUpstreamBody$1(upstream);
    if (!upstream.ok) {
      console.error(
        `[DeepSeek Roleplay] API error (${upstream.status}):`,
        upstreamBody.error ?? rawBody.slice(0, 300)
      );
      return res.status(502).json({
        error: upstreamBody.error?.message ?? `DeepSeek request failed with status ${upstream.status}.`,
        debug: false ? upstreamBody : void 0
      });
    }
    if (parseError) {
      console.error("[DeepSeek Roleplay] Upstream returned non-JSON body:", rawBody.slice(0, 300));
      return res.status(502).json({
        error: "DeepSeek returned a non-JSON response."
      });
    }
    const content = upstreamBody.choices?.[0]?.message?.content?.trim();
    if (!content) {
      console.error("[DeepSeek Roleplay] Empty response choices:", upstreamBody.choices);
      return res.status(502).json({
        error: "DeepSeek returned an empty response.",
        debug: false ? upstreamBody : void 0
      });
    }
    const response = {
      content,
      model: upstreamBody.model ?? model,
      usage: upstreamBody.usage
    };
    return res.status(200).json(response);
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      console.error("[DeepSeek Roleplay] Request timed out");
      return res.status(504).json({
        error: "DeepSeek took too long to respond. Please try again."
      });
    }
    console.error("DeepSeek roleplay error:", error);
    return res.status(500).json({
      error: "Unable to reach DeepSeek right now."
    });
  } finally {
    clearTimeout(timeoutId);
  }
};
const randomTopics = [
  "a surprising street food discovery",
  "a rainy-day commute mishap",
  "a weekend mountain hike",
  "an unexpected bookstore conversation",
  "a neighborhood festival moment",
  "a train station delay story",
  "a first visit to a night market",
  "a small act of kindness from a stranger",
  "trying a new hobby class",
  "a day working from a cafe"
];
function normalizeReadingText(text) {
  const compact = text.replace(/\s+/g, "").trim();
  if (compact.length <= 230) {
    return compact;
  }
  const trimmed = compact.slice(0, 220);
  return trimmed.replace(/[，。！？；、]*$/, "。");
}
function stripCodeFences(raw) {
  let content = raw.trim();
  if (!content.startsWith("{")) {
    const match = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (match && match[1]) {
      content = match[1].trim();
    }
  }
  if (!content.startsWith("{")) {
    const match = content.match(/(\{[\s\S]*\})/);
    if (match && match[1]) {
      content = match[1].trim();
    }
  }
  return content.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
}
async function parseDeepSeekUpstreamBody(response) {
  const rawBody = await response.text();
  if (!rawBody) {
    return {
      body: {},
      parseError: false,
      rawBody: ""
    };
  }
  try {
    return {
      body: JSON.parse(rawBody),
      parseError: false,
      rawBody
    };
  } catch {
    return {
      body: {},
      parseError: true,
      rawBody
    };
  }
}
const handleDeepSeekReading = async (req, res) => {
  console.log("[DeepSeek Reading] Received request for reading prompt");
  const userId = req.userId;
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    console.error("[DeepSeek Reading] Missing DEEPSEEK_API_KEY");
    return res.status(500).json({
      error: "DeepSeek is not configured. Add DEEPSEEK_API_KEY to your environment."
    });
  }
  let hskNum = 1;
  let hskLevel = "HSK 1";
  if (userId && supabaseAdmin) {
    const { data: levelData } = await supabaseAdmin.from("flashcards").select("hsk_level").eq("user_id", userId).neq("state", "NEW").order("hsk_level", { ascending: false }).limit(1).maybeSingle();
    if (levelData?.hsk_level) {
      hskNum = levelData.hsk_level;
      hskLevel = `HSK ${hskNum}`;
    } else {
      const { data: profile } = await supabaseAdmin.from("profiles").select("onboarding_hsk_level").eq("id", userId).maybeSingle();
      const onboardingLevel = profile?.onboarding_hsk_level || "HSK 1";
      const hskMatch = onboardingLevel.match(/HSK (\d+)/i);
      if (hskMatch) {
        hskNum = parseInt(hskMatch[1], 10);
      } else {
        const mapping = {
          "Total Beginner": 1,
          "Beginner": 1,
          "Elementary": 2,
          "Intermediate": 4,
          "Advanced": 7
        };
        hskNum = mapping[onboardingLevel] || 1;
      }
      hskLevel = `HSK ${hskNum}`;
    }
  }
  let hskConstraint = "";
  if (hskNum <= 1) {
    hskConstraint = "The user is at HSK 1 level. Use only HSK 1 vocabulary and basic grammar.";
  } else if (hskNum === 2) {
    hskConstraint = "The user is at HSK 2 level. Use vocabulary and grammar structures appropriate for HSK 2.";
  } else if (hskNum === 3) {
    hskConstraint = "The user is at HSK 3 level. Use vocabulary and grammar structures appropriate for HSK 3.";
  } else if (hskNum <= 6) {
    hskConstraint = `The user is at HSK ${hskNum} level. Use vocabulary and grammar structures appropriate for HSK ${hskNum}.`;
  } else {
    hskConstraint = `The user is at an Advanced level (HSK ${hskNum}). Use natural, complex vocabulary and grammar.`;
  }
  const vocabConstraint = `${hskConstraint} Ensure the text is natural but accessible for this level.`;
  const model = process.env.DEEPSEEK_MODEL ?? "deepseek-chat";
  const timeoutMs = Number(process.env.DEEPSEEK_TIMEOUT_MS ?? 25e3);
  const selectedTopic = randomTopics[Math.floor(Math.random() * randomTopics.length)];
  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => controller.abort(),
    Number.isFinite(timeoutMs) && timeoutMs > 0 ? timeoutMs : 25e3
  );
  try {
    console.log(`[DeepSeek Reading] Fetching from DeepSeek with topic: ${selectedTopic}`);
    const upstream = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      signal: controller.signal,
      body: JSON.stringify({
        model,
        temperature: 0.6,
        // Slightly lower temperature for faster/more stable generation
        max_tokens: 400,
        // Slightly more tokens to avoid truncation
        messages: [
          {
            role: "system",
            content: `You are a Chinese reading tutor. ${vocabConstraint} Return strict JSON only (no markdown): {"titleZh":"...","titleEn":"...","text":"...","quiz":[{"question":"...","answer":true},{"question":"...","answer":false}]}. titleZh should be a concise Chinese topic title (4-12 chars). titleEn should be the natural English translation of that Chinese title. text must be a single Mandarin passage between 180 and 220 Chinese characters. text must contain only Chinese (no English, no pinyin, no bullets). quiz must contain exactly 2 true/false questions that are directly based on details from text. Each question must be in English and each answer must be a boolean.`
          },
          {
            role: "user",
            content: `Create today's reading passage for the user. Use a random topic around: ${selectedTopic}.`
          }
        ]
      })
    });
    const { body: upstreamBody, parseError, rawBody } = await parseDeepSeekUpstreamBody(upstream);
    if (!upstream.ok) {
      console.error("[DeepSeek Reading] Upstream error:", upstream.status, upstreamBody.error ?? rawBody.slice(0, 300));
      return res.status(502).json({
        error: upstreamBody.error?.message ?? `DeepSeek reading prompt request failed with status ${upstream.status}.`
      });
    }
    if (parseError) {
      console.error("[DeepSeek Reading] Upstream returned non-JSON body:", rawBody.slice(0, 300));
      return res.status(502).json({
        error: "DeepSeek returned a non-JSON response."
      });
    }
    const content = upstreamBody.choices?.[0]?.message?.content?.trim();
    if (!content) {
      console.error("[DeepSeek Reading] Empty content from DeepSeek");
      return res.status(502).json({
        error: "DeepSeek returned an empty reading prompt."
      });
    }
    console.log("[DeepSeek Reading] Successfully received response from DeepSeek");
    let parsed = null;
    const strippedContent = stripCodeFences(content);
    try {
      parsed = JSON.parse(strippedContent);
    } catch (err) {
      console.error("DeepSeek JSON Parse Error:", err);
      console.error("Raw Content:", content);
      console.error("Stripped Content:", strippedContent);
      return res.status(502).json({
        error: "DeepSeek returned an invalid reading payload.",
        debug: false ? { content, err: String(err) } : void 0
      });
    }
    const titleZh = parsed.titleZh?.trim();
    const titleEn = parsed.titleEn?.trim();
    const text = parsed.text?.trim();
    const quiz = parsed.quiz;
    if (!titleZh || !titleEn || !text || !Array.isArray(quiz) || quiz.length !== 2 || quiz.some((item) => !item.question?.trim() || typeof item.answer !== "boolean")) {
      console.error("DeepSeek Validation Error: Missing required fields");
      console.error("Parsed Data:", parsed);
      return res.status(502).json({
        error: "DeepSeek reading payload is missing required fields.",
        debug: false ? { parsed } : void 0
      });
    }
    const response = {
      titleZh,
      titleEn,
      text: normalizeReadingText(text),
      quiz: quiz.map((item) => ({
        question: item.question.trim(),
        answer: item.answer
      })),
      model: upstreamBody.model ?? model,
      hskLevel
    };
    return res.status(200).json(response);
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      console.error("[DeepSeek Reading] Request timed out");
      return res.status(504).json({
        error: "DeepSeek took too long to respond. Please try again in a moment."
      });
    }
    console.error("DeepSeek reading prompt error:", error);
    return res.status(500).json({
      error: "Unable to generate reading prompt right now."
    });
  } finally {
    clearTimeout(timeoutId);
  }
};
const ttsRequestSchema = z.object({
  text: z.string().min(1),
  voice_id: z.string().optional().default("Yichen")
  // Use Yichen as the default Chinese voice
});
const handleTTS = async (req, res) => {
  const parsed = ttsRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: parsed.error.errors[0]?.message ?? "Invalid request payload"
    });
  }
  const hasChinese = /[\u4e00-\u9fff]/.test(parsed.data.text);
  let voice_id = parsed.data.voice_id;
  if (hasChinese && (voice_id === "Sarah" || !voice_id)) {
    voice_id = "Yichen";
  }
  const auth = process.env.INWORLD_TTS_AUTH;
  if (!auth) {
    console.error("[Inworld TTS] Missing INWORLD_TTS_AUTH environment variable");
    return res.status(500).json({ error: "TTS configuration error" });
  }
  try {
    const body = {
      text: parsed.data.text,
      voice_id,
      audio_config: {
        audio_encoding: "MP3"
      },
      model_id: "inworld-tts-1.5-max"
    };
    console.log(`[Inworld TTS] Sending request to Inworld:`, JSON.stringify(body, null, 2));
    const response = await fetch("https://api.inworld.ai/tts/v1/voice:stream", {
      method: "POST",
      headers: {
        "Authorization": auth,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });
    console.log(`[Inworld TTS] Response status: ${response.status}`);
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Inworld TTS] API error (${response.status}):`, errorText);
      return res.status(response.status).json({
        error: "TTS request failed",
        message: errorText
      });
    }
    if (!response.body) {
      return res.status(500).json({
        error: "TTS request failed",
        message: "Empty response body from Inworld"
      });
    }
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Transfer-Encoding", "chunked");
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    try {
      res.setHeader("Content-Type", "audio/mpeg");
      res.setHeader("Transfer-Encoding", "chunked");
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let startIdx = buffer.indexOf("{");
        while (startIdx !== -1) {
          let depth = 0;
          let endIdx = -1;
          for (let i = startIdx; i < buffer.length; i++) {
            if (buffer[i] === "{") depth++;
            else if (buffer[i] === "}") {
              depth--;
              if (depth === 0) {
                endIdx = i;
                break;
              }
            }
          }
          if (endIdx !== -1) {
            const part = buffer.slice(startIdx, endIdx + 1);
            buffer = buffer.slice(endIdx + 1);
            try {
              const json = JSON.parse(part);
              const base64Audio = json.result?.audioContent;
              if (base64Audio) {
                res.write(Buffer.from(base64Audio, "base64"));
              }
            } catch (err) {
              console.error("[Inworld TTS] JSON parse error:", err);
            }
            startIdx = buffer.indexOf("{");
          } else {
            break;
          }
        }
      }
    } catch (readError) {
      console.error("[Inworld TTS] Stream read error:", readError);
    } finally {
      reader.releaseLock();
      res.end();
    }
  } catch (error) {
    console.error("[Inworld TTS] error:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: "Internal server error" });
    } else {
      res.end();
    }
  }
};
const checkoutRequestSchema = z.object({
  plan: z.enum(["pro_monthly", "lifetime"]),
  customerEmail: z.string().email().optional()
});
const planPriceMap = {
  pro_monthly: process.env.STRIPE_PRICE_PRO_MONTHLY,
  lifetime: process.env.STRIPE_PRICE_LIFETIME
};
function getBaseUrl(req) {
  const rawOrigin = req.headers.origin;
  const origin = Array.isArray(rawOrigin) ? rawOrigin[0] : rawOrigin;
  if (origin && /^https?:\/\//i.test(origin)) {
    return origin;
  }
  const host = req.get("host");
  const protocol = req.protocol || "https";
  return host ? `${protocol}://${host}` : "http://localhost:8080";
}
const handleCreateCheckoutSession = async (req, res) => {
  const parsed = checkoutRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: parsed.error.errors[0]?.message ?? "Invalid checkout payload."
    });
  }
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return res.status(500).json({
      error: "Stripe is not configured. Add STRIPE_SECRET_KEY."
    });
  }
  const stripe = new Stripe(secretKey);
  const payload = parsed.data;
  const priceId = planPriceMap[payload.plan];
  if (!priceId) {
    return res.status(500).json({
      error: payload.plan === "pro_monthly" ? "Missing STRIPE_PRICE_PRO_MONTHLY." : "Missing STRIPE_PRICE_LIFETIME."
    });
  }
  const baseUrl = getBaseUrl(req);
  const successUrl = process.env.STRIPE_SUCCESS_URL ?? `${baseUrl}/onboarding?checkout=success&plan=${payload.plan}&session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = process.env.STRIPE_CANCEL_URL ?? `${baseUrl}/onboarding?checkout=cancelled&plan=${payload.plan}`;
  try {
    const session = await stripe.checkout.sessions.create({
      mode: payload.plan === "pro_monthly" ? "subscription" : "payment",
      client_reference_id: req.userId,
      line_items: [
        {
          price: priceId,
          quantity: 1
        }
      ],
      subscription_data: payload.plan === "pro_monthly" ? {
        trial_period_days: 7
      } : void 0,
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: payload.customerEmail,
      allow_promotion_codes: true,
      billing_address_collection: "auto",
      metadata: {
        product_plan: payload.plan,
        user_id: req.userId ?? ""
      }
    });
    if (!session.url) {
      return res.status(502).json({
        error: "Stripe did not return a checkout URL."
      });
    }
    const response = {
      checkoutUrl: session.url
    };
    return res.status(200).json(response);
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return res.status(500).json({
      error: "Unable to start checkout right now."
    });
  }
};
const handleStripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!sig || !webhookSecret) {
    return res.status(400).send("Webhook Secret or Signature missing.");
  }
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  console.log(`[Stripe Webhook] Received event: ${event.type}`);
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const userId = session.client_reference_id || session.metadata?.user_id;
    const plan = session.metadata?.product_plan;
    if (!userId) {
      console.error("[Stripe Webhook] No userId found in session.");
      return res.status(400).send("No userId found.");
    }
    if (!supabaseAdmin) {
      console.error("[Stripe Webhook] Supabase Admin client not initialized.");
      return res.status(500).send("Server configuration error.");
    }
    const { error } = await supabaseAdmin.from("profiles").update({
      subscription_status: "active",
      subscription_plan: plan,
      stripe_customer_id: session.customer,
      onboarding_complete: true,
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    }).eq("id", userId);
    if (error) {
      console.error("[Stripe Webhook] Error updating profile:", error);
      return res.status(500).send("Database update failed.");
    }
    console.log(`[Stripe Webhook] Successfully updated subscription for user ${userId}`);
  }
  res.json({ received: true });
};
const verifySessionSchema = z.object({
  sessionId: z.string().min(1)
});
const handleVerifyCheckoutSession = async (req, res) => {
  const parsed = verifySessionSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "sessionId is required" });
  }
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return res.status(500).json({ error: "Stripe is not configured." });
  }
  if (!supabaseAdmin) {
    return res.status(500).json({ error: "Server is not configured for billing verification." });
  }
  const userId = req.userId;
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const stripe = new Stripe(secretKey);
  try {
    console.log(`[Verify Session] Verifying session ${parsed.data.sessionId} for user ${userId}`);
    const session = await stripe.checkout.sessions.retrieve(parsed.data.sessionId);
    const sessionUserId = session.client_reference_id || session.metadata?.user_id;
    if (sessionUserId !== userId) {
      console.error(`[Verify Session] Session owner mismatch. Session: ${sessionUserId}, Current: ${userId}`);
      return res.status(403).json({ error: "Session does not belong to this user." });
    }
    const isPaid = session.payment_status === "paid" || session.status === "complete";
    if (!isPaid) {
      console.log(`[Verify Session] Session not paid yet. Status: ${session.status}, Payment: ${session.payment_status}`);
      return res.status(200).json({ verified: false });
    }
    const plan = session.metadata?.product_plan;
    const subscriptionStatus = session.mode === "subscription" ? "trialing" : "active";
    console.log(`[Verify Session] Updating DB for user ${userId} with status ${subscriptionStatus}`);
    const { error } = await supabaseAdmin.from("profiles").update({
      subscription_status: subscriptionStatus,
      subscription_plan: plan,
      stripe_customer_id: session.customer,
      onboarding_complete: true,
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    }).eq("id", userId);
    if (error) {
      console.error("[Verify Session] DB update failed:", error);
      return res.status(500).json({ error: `Database update failed: ${error.message}` });
    }
    console.log(`[Verify Session] Success for user ${userId}`);
    return res.status(200).json({ verified: true, subscriptionStatus });
  } catch (err) {
    console.error("[Verify Session] Error:", err);
    return res.status(500).json({ error: "Unable to verify session." });
  }
};
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseApiKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE;
if (!supabaseUrl || !supabaseApiKey) {
  console.warn("⚠️ Supabase environment variables are missing. Auth will fail.");
}
async function verifySupabaseToken(token) {
  if (!supabaseUrl || !supabaseApiKey) {
    console.error("Auth failed: Supabase credentials are missing.");
    return null;
  }
  try {
    const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        apikey: supabaseApiKey
      }
    });
    if (!response.ok) {
      return null;
    }
    const payload = await response.json();
    if (!payload?.id) {
      return null;
    }
    return {
      id: payload.id,
      email: payload.email ?? null,
      created_at: payload.created_at,
      user_metadata: payload.user_metadata && typeof payload.user_metadata === "object" ? payload.user_metadata : null
    };
  } catch (err) {
    console.error("Supabase token verification error:", err);
    return null;
  }
}
const requireAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "No token provided" });
  }
  const token = authHeader.substring(7);
  const user = await verifySupabaseToken(token);
  if (!user) {
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
  req.user = user;
  req.userId = user.id;
  next();
};
function createServer() {
  const app2 = express__default();
  app2.use(cors());
  app2.use(cookieParser());
  app2.post("/api/billing/webhook", express__default.raw({ type: "application/json" }), handleStripeWebhook);
  app2.use(express__default.json());
  app2.use(express__default.urlencoded({ extended: true }));
  app2.use((req, _res, next) => {
    next();
  });
  const apiRouter = express__default.Router();
  apiRouter.get("/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });
  apiRouter.get("/demo", handleDemo);
  apiRouter.post("/ai/roleplay", requireAuth, handleDeepSeekRoleplay);
  apiRouter.get("/ai/reading-prompt", requireAuth, handleDeepSeekReading);
  apiRouter.post("/ai/tts", requireAuth, handleTTS);
  apiRouter.post("/billing/checkout", requireAuth, handleCreateCheckoutSession);
  apiRouter.post("/billing/verify-session", requireAuth, handleVerifyCheckoutSession);
  apiRouter.get("/profile", requireAuth, handleProfile);
  apiRouter.get("/reviews", requireAuth, handleGetReviews);
  apiRouter.post("/reviews/answer", requireAuth, handleSubmitAnswer);
  apiRouter.post("/reviews/add", requireAuth, handleAddToReview);
  apiRouter.post("/reviews/simulate-next-day", requireAuth, handleSimulateNextDay);
  apiRouter.post("/reviews/reset", requireAuth, handleResetProgress);
  apiRouter.get("/stories", requireAuth, handleGetStories);
  apiRouter.get("/stories/:id", requireAuth, handleGetStoryById);
  app2.use("/api", apiRouter);
  app2.use(apiRouter);
  app2.use((err, _req, res, _next) => {
    console.error("Express error:", err);
    res.status(500).json({
      error: "Internal server error",
      message: err instanceof Error ? err.message : String(err)
    });
  });
  return app2;
}
const app = createServer();
const port = process.env.PORT || 3e3;
const __dirname = import.meta.dirname;
const distPath = path$1.join(__dirname, "../spa");
app.use(express.static(distPath));
app.get("*", (req, res) => {
  if (req.path.startsWith("/api/") || req.path.startsWith("/health")) {
    return res.status(404).json({ error: "API endpoint not found" });
  }
  res.sendFile(path$1.join(distPath, "index.html"));
});
app.listen(port, () => {
  console.log(`🚀 Fusion Starter server running on port ${port}`);
  console.log(`📱 Frontend: http://localhost:${port}`);
  console.log(`🔧 API: http://localhost:${port}/api`);
});
process.on("SIGTERM", () => {
  console.log("🛑 Received SIGTERM, shutting down gracefully");
  process.exit(0);
});
process.on("SIGINT", () => {
  console.log("🛑 Received SIGINT, shutting down gracefully");
  process.exit(0);
});
//# sourceMappingURL=node-build.mjs.map
