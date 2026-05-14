import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import {
  BookOpen,
  Layers,
  MessageCircle,
  Settings,
  Sun,
  Moon,
  Eye,
  Flame,
  CheckCircle2,
  MessagesSquare,
  X,
  ChevronRight,
  Zap,
  BookMarked,
  Play,
  TrendingUp,
  Calendar,
  Clock,
  Target,
  Award,
  Activity,
  Home,
  LayoutDashboard,
  AlertCircle,
  RefreshCw,
  Volume2,
} from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { parseJsonResponse } from "@/lib/http";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useSRS, type SRSRating, getProjectedIntervals, type Flashcard } from "@/hooks/use-srs";
import ChineseTooltipText from "@/components/ChineseTooltipText";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type {
  DeepSeekMessage,
  DeepSeekReadingPromptResponse,
  DeepSeekV3Response,
} from "@shared/api";

import ActivityTracker from "@/components/ActivityTracker";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type View = "dashboard" | "flashcards" | "reading" | "roleplay";
const readingPromptTTL = 24 * 60 * 60 * 1000;
const readingPromptCacheVersion = "v3";
const defaultReadingContent = {
  titleZh: "咖啡店偶遇",
  titleEn: "A Chance Meeting at a Cafe",
  text: "今天下班后，我去小区旁边的新咖啡馆点了一杯热拿铁，顺便和店员聊了几句最近的天气，感觉中文表达越来越自然。",
  hskLevel: "Beginner",
  quiz: [
    {
      question: "The speaker visited a new cafe near home after work.",
      answer: true,
    },
    {
      question: "The speaker ordered iced tea.",
      answer: false,
    },
  ],
};
type LearningMode = "flashcards" | "reading" | "roleplay";

interface LearningActivity {
  id: string;
  mode: LearningMode;
  action: string;
  minutes_spent: number;
  created_at: string;
}

const defaultModeTargets: Record<LearningMode, number> = {
  flashcards: 50,
  reading: 1,
  roleplay: 5,
};
const DAILY_NEW_CARD_LIMIT = 10;
const SRS_DAY_ROLLOVER_HOUR = 4;

const statEventActions = {
  flashcardNew: "stat:flashcard-new",
  flashcardSuccess: "stat:flashcard-success",
  flashcardFailure: "stat:flashcard-failure",
  flashcardReview: "stat:flashcard-review",
  flashcardLearning: "stat:flashcard-learning",
  dialogueResponse: "stat:dialogue-response",
  wordsRead: "stat:words-read",
} as const;
const flashcardStatActions = [
  statEventActions.flashcardSuccess,
  statEventActions.flashcardFailure,
];

const textbookTopics = [
  "Ordering a coffee at a cafe",
  "Checking into a hotel",
  "Asking for directions to the train station",
  "Buying fruit at a local market",
  "Ordering food at a restaurant",
  "Taking a taxi to the airport",
  "Asking to work in at a machine",
  "Meeting an online friend for the first time",
];
const HSK_VOCAB_SUFFIX_REGEX = /\(HSK level \d+ vocabulary\)\s*$/i;
const HSK_VOCAB_LABEL_REGEX = /^HSK level \d+ vocabulary$/i;
const HANZI_REGEX = /[\u3400-\u9fff]/;

const BRACKETED_ANNOTATION_REGEX = /^\(.*\)$/;

function parseExampleFromNotes(notes: string): { sentence: string; translation: string } {
  const cleanedNotes = notes.replace(HSK_VOCAB_SUFFIX_REGEX, "").trim();
  if (!cleanedNotes) {
    return { sentence: "", translation: "" };
  }

  const parts = cleanedNotes
    .split("|")
    .map((part) => part.trim())
    .filter(Boolean);

  // Filter out parts that are just bracketed annotations
  const contentParts = parts.filter(p => !BRACKETED_ANNOTATION_REGEX.test(p));

  const sentencePart =
    contentParts.find((part) => HANZI_REGEX.test(part)) ??
    contentParts[0] ??
    "";
  const translationPart =
    contentParts.find((part) => part !== sentencePart) ??
    "";
  const sentence = (HSK_VOCAB_LABEL_REGEX.test(sentencePart) || BRACKETED_ANNOTATION_REGEX.test(sentencePart)) ? "" : sentencePart;

  return {
    sentence,
    translation: translationPart.replace(HSK_VOCAB_SUFFIX_REGEX, "").trim(),
  };
}

function getSrsDayStart(date: Date): Date {
  const dayStart = new Date(date);
  dayStart.setHours(SRS_DAY_ROLLOVER_HOUR, 0, 0, 0);
  if (date.getTime() < dayStart.getTime()) {
    dayStart.setDate(dayStart.getDate() - 1);
  }
  return dayStart;
}

export function LearningHub() {
  const { user, session, supabaseConfigError } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [hasReadStoredTheme, setHasReadStoredTheme] = useState(false);
  const [isFlowActive, setIsFlowActive] = useState(false);
  const [activeFlowIndex, setActiveFlowIndex] = useState(0);

  // Handle payment success redirect from Stripe
  useEffect(() => {
    const checkoutState = searchParams.get("checkout");
    if (checkoutState === "success") {
      toast({
        title: "Payment successful!",
        description: "Your account access has been updated. Welcome to Pro!",
      });
      // Clear the query params without reloading the page
      const newParams = new URLSearchParams(searchParams);
      newParams.delete("checkout");
      newParams.delete("plan");
      setSearchParams(newParams, { replace: true });
    }
  }, [searchParams, setSearchParams, toast]);
  const [isRoleplayLoading, setIsRoleplayLoading] = useState(false);
  const [dailyCommitment, setDailyCommitment] = useState<number>(20); // Default 20 mins
  const [dailyReviewLimit, setDailyReviewLimit] = useState<number>(50);
  const [dailyNewCardLimit, setDailyNewCardLimit] = useState<number>(DAILY_NEW_CARD_LIMIT);
  const [readingContent, setReadingContent] = useState<{
    titleZh: string;
    titleEn: string;
    text: string;
    hskLevel?: string;
    quiz: Array<{ question: string; answer: boolean }>;
  }>(defaultReadingContent);
  const [isReadingPromptLoading, setIsReadingPromptLoading] = useState(false);
  const [isReadingTTSLoading, setIsReadingTTSLoading] = useState(false);
  const [readingSpeed, setReadingSpeed] = useState(1.0);
  const [showReadingPinyin, setShowReadingPinyin] = useState(true);
  const [streakDays, setStreakDays] = useState(0);
  const [retentionRate, setRetentionRate] = useState(0);
  const [showHsk1Intro, setShowHsk1Intro] = useState(false);

  const modeTargets = useMemo(() => {
    // Scale targets based on daily commitment (base is 20 minutes)
    const scale = dailyCommitment / 20;
    return {
      flashcards: dailyReviewLimit,
      reading: Math.max(1, Math.round(defaultModeTargets.reading * scale)),
      roleplay: Math.max(2, Math.round(defaultModeTargets.roleplay * scale)),
    };
  }, [dailyCommitment, dailyReviewLimit]);
  const [stats, setStats] = useState({
    flashcards: 0,
    perfected: 0,
    dialogues: 0,
    wordsRead: 0
  });
  const [weeklyModeMinutes, setWeeklyModeMinutes] = useState<Record<LearningMode, number>>({
    flashcards: 0,
    reading: 0,
    roleplay: 0,
  });
  const [todayProgress, setTodayProgress] = useState<Record<LearningMode, number>>({
    flashcards: 0,
    reading: 0,
    roleplay: 0,
  });
  const [todayNewFlashcards, setTodayNewFlashcards] = useState(0);
  const [todayReviewedReviewCards, setTodayReviewedReviewCards] = useState(0);
  const [seenCharactersCount, setSeenCharactersCount] = useState(0);
  const sessionFlashcardsRef = useRef(0);
  const sessionExchangesRef = useRef(0);
  const audioCacheRef = useRef<Record<string, string>>({});
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const [recentActivity, setRecentActivity] = useState<LearningActivity[]>([]);
  const [allActivities, setAllActivities] = useState<LearningActivity[]>([]);
  const [readingQuizAnswers, setReadingQuizAnswers] = useState<Array<boolean | null>>(
    Array(defaultReadingContent.quiz.length).fill(null),
  );
  const [readingQuizStatus, setReadingQuizStatus] = useState<"idle" | "correct" | "incorrect">("idle");
  const [hasLoggedWordsForCurrentReading, setHasLoggedWordsForCurrentReading] = useState(false);

  const flowContainerRef = useRef<HTMLDivElement | null>(null);
  const slideRefs = useRef<Array<HTMLElement | null>>([]);
  const flowModeEntryTimestampRef = useRef<number | null>(null);
  const activeModeIndexRef = useRef<number>(0);
  const hasShownMandarinVoiceWarningRef = useRef(false);

  // Learning State
  const [roleplayMessages, setRoleplayMessages] = useState<
    Array<{ role: "ai" | "user"; text: string }>
  >([]);
  const [roleplayInput, setRoleplayInput] = useState("");
  const [roleplayTopic, setRoleplayTopic] = useState("");
  const [isTopicSelected, setIsTopicSelected] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [isFlashcardFlipped, setIsFlashcardFlipped] = useState(false);
  const [skipTransition, setSkipTransition] = useState(false);

  // Stop audio when moving between slides or exiting flow
  useEffect(() => {
    return () => {
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current.currentTime = 0;
      }
    };
  }, [activeFlowIndex, isFlowActive]);

  const { loading: srsLoading, getDueCards, rateCard, deck, hskProgress, refresh } = useSRS();

  useEffect(() => {
    if (isTopicSelected || !isFlowActive || activeFlowIndex !== 2) return;
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % textbookTopics.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [isTopicSelected, isFlowActive, activeFlowIndex]);

  const handleStartRoleplay = useCallback(async (topic: string) => {
    const selectedTopic = topic.trim() || textbookTopics[0];
    setRoleplayTopic(selectedTopic);
    setIsTopicSelected(true);
    setIsRoleplayLoading(true);

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (session?.access_token) {
        headers["Authorization"] = `Bearer ${session.access_token}`;
      }

      const response = await fetch("/api/ai/roleplay", {
        method: "POST",
        headers,
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content: `You are a person in this real-life scenario: "${selectedTopic}". This is a one-on-one natural conversation in Mandarin Chinese. Stay fully in character. Reply mostly in Chinese, keep responses short (1-3 sentences) as a person would in conversation. Start the conversation naturally based on the scenario.`,
            },
          ],
          temperature: 0.7,
          max_tokens: 220,
        }),
      });
      
      const payload = await parseJsonResponse<DeepSeekV3Response & { error?: string }>(
        response,
        {
          emptyMessage: "Roleplay start failed: the server returned no response.",
          invalidMessage: "Roleplay start failed: received an invalid server response.",
        },
      );

      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to start conversation");
      }

      setRoleplayMessages([{ role: "ai", text: payload.content }]);
      setRoleplayInput("");
    } catch (error) {
      toast({
        variant: "blackDisclaimer",
        title: "Could not start conversation",
        description: error instanceof Error ? error.message : "AI tutor is unavailable.",
      });
      setIsTopicSelected(false);
    } finally {
      setIsRoleplayLoading(false);
    }
  }, [session, toast]);

  const formatRelativeTime = useCallback((isoTimestamp: string) => {
    const timestamp = new Date(isoTimestamp).getTime();
    const diffMs = Date.now() - timestamp;
    const diffMinutes = Math.max(1, Math.floor(diffMs / (1000 * 60)));

    if (diffMinutes < 60) {
      return `${diffMinutes}m ago`;
    }

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) {
      return `${diffHours}h ago`;
    }

    const diffDays = Math.floor(diffHours / 24);
    return diffDays === 1 ? "Yesterday" : `${diffDays}d ago`;
  }, []);

  const countReadingWords = useCallback((text: string) => {
    const chineseCharacters = text.match(/[\u4e00-\u9fff]/g);
    if (chineseCharacters?.length) {
      return chineseCharacters.length;
    }

    return text
      .trim()
      .split(/\s+/)
      .filter(Boolean).length;
  }, []);

  const refreshLearningMetrics = useCallback(async () => {
    if (!supabase || !user) {
      return;
    }

    const trackerStart = new Date();
    trackerStart.setDate(trackerStart.getDate() - 365);

    const now = new Date();
    const dayStart = getSrsDayStart(now);
    const weekStart = new Date(dayStart);
    weekStart.setDate(weekStart.getDate() - 7);

    const { data, error } = await supabase
      .from("learning_activity")
      .select("id, mode, action, minutes_spent, created_at")
      .eq("user_id", user.id)
      .gte("created_at", trackerStart.toISOString())
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to load learning activity", error);
      return;
    }

    const [flashcardSuccessResult, dialoguesResult, perfectedResult, wordsReadResult, totalSeenResult] =
      await Promise.all([
        supabase
          .from("learning_activity")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id)
          .in("action", flashcardStatActions),
        supabase
          .from("learning_activity")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id)
          .eq("action", statEventActions.dialogueResponse),
        supabase
          .from("flashcards")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id)
          .gte("repetition", 5),
        supabase
          .from("learning_activity")
          .select("minutes_spent")
          .eq("user_id", user.id)
          .eq("action", statEventActions.wordsRead),
        supabase
          .from("flashcards")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id)
          .neq("state", "NEW"),
      ]);

    if (
      flashcardSuccessResult.error ||
      dialoguesResult.error ||
      perfectedResult.error ||
      wordsReadResult.error ||
      totalSeenResult.error
    ) {
      console.error("Failed to load learning stats", {
        flashcards: flashcardSuccessResult.error,
        dialogues: dialoguesResult.error,
        perfected: perfectedResult.error,
        wordsRead: wordsReadResult.error,
        seen: totalSeenResult.error,
      });
    }

    setSeenCharactersCount(totalSeenResult.count ?? 0);

    const rows = (data ?? []) as LearningActivity[];
    setAllActivities(rows);

    const nextWeeklyModeMinutes: Record<LearningMode, number> = {
      flashcards: 0,
      reading: 0,
      roleplay: 0,
    };
    const nextTodayProgress: Record<LearningMode, number> = {
      flashcards: 0,
      reading: 0,
      roleplay: 0,
    };
    let nextTodayNewFlashcards = 0;
    let nextTodayReviewFlashcards = 0;

    for (const row of rows) {
      if (!(row.mode in nextWeeklyModeMinutes)) {
        continue;
      }

      const mode = row.mode as LearningMode;
      const createdAt = new Date(row.created_at);
      const isToday = createdAt >= dayStart;
      const isThisWeek = createdAt >= weekStart;

      if (row.action.startsWith("stat:")) {
        if (isToday) {
          if (row.action === statEventActions.dialogueResponse) {
            nextTodayProgress.roleplay += 1;
          } else if (row.action === statEventActions.wordsRead) {
            nextTodayProgress.reading += 1;
          } else if (row.action === statEventActions.flashcardNew) {
            nextTodayNewFlashcards += 1;
          } else if (row.action === statEventActions.flashcardReview) {
            nextTodayReviewFlashcards += 1;
          } else if ((flashcardStatActions as readonly string[]).includes(row.action)) {
            nextTodayProgress.flashcards += 1;
          }
        }
        continue;
      }

      if (isThisWeek) {
        nextWeeklyModeMinutes[mode] += row.minutes_spent ?? 0;
      }
    }

    setTodayNewFlashcards(nextTodayNewFlashcards);
    setTodayReviewedReviewCards(nextTodayReviewFlashcards);
    setWeeklyModeMinutes(nextWeeklyModeMinutes);
    setTodayProgress(nextTodayProgress);
    setRecentActivity(
      rows
        .filter((row) => {
          if (row.action.startsWith("stat:")) return false;
          // Filter out activities with zero counts
          if (row.action.includes(" 0 ")) return false;
          return true;
        })
        .slice(0, 3)
    );

    // Calculate streak from activity history as a fallback/verification
    const activityDates = Array.from(
      new Set(
        rows
          .filter(r => !r.action.startsWith("stat:"))
          .map(r => new Date(r.created_at).toLocaleDateString())
      )
    ).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    let calculatedStreak = 0;
    if (activityDates.length > 0) {
      const todayStr = new Date().toLocaleDateString();
      const yesterdayStr = new Date(Date.now() - 86400000).toLocaleDateString();
      
      // Streak continues if active today or yesterday
      if (activityDates[0] === todayStr || activityDates[0] === yesterdayStr) {
        calculatedStreak = 1;
        for (let i = 0; i < activityDates.length - 1; i++) {
          const current = new Date(activityDates[i]);
          const next = new Date(activityDates[i + 1]);
          const diffDays = Math.round((current.getTime() - next.getTime()) / 86400000);
          
          if (diffDays === 1) {
            calculatedStreak++;
          } else {
            break;
          }
        }
      }
    }

    const totalWordsRead = (wordsReadResult.data ?? []).reduce(
      (sum, row) => sum + (row.minutes_spent ?? 0),
      0,
    );
    setStats((prev) => ({
      ...prev,
      flashcards: flashcardSuccessResult.count ?? 0,
      dialogues: dialoguesResult.count ?? 0,
      perfected: perfectedResult.count ?? 0,
      wordsRead: totalWordsRead,
    }));

    // Refresh streak from profile
    const { data: profileData } = await supabase
      .from("profiles")
      .select("streak_days, last_activity_date")
      .eq("id", user.id)
      .maybeSingle();
    
    // Check if the streak is still alive (activity today or yesterday)
    const lastActivity = profileData?.last_activity_date;
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const isAlive = lastActivity === today || lastActivity === yesterday || calculatedStreak > 0;

    // Use the maximum of calculated and stored streak to be safe and accurate, but only if alive
    const finalStreak = isAlive ? Math.max(calculatedStreak, profileData?.streak_days || 0) : 0;
    setStreakDays(finalStreak);

    // Calculate Retention Rate (Successes / Total attempts)
    const totalAttempts = rows.filter(r => r.action.startsWith("stat:flashcard")).length;
    const successes = rows.filter(r => r.action === statEventActions.flashcardSuccess).length;
    setRetentionRate(totalAttempts > 0 ? Math.round((successes / totalAttempts) * 100) : 0);
  }, [user]);

  const logLearningActivity = useCallback(
    async (mode: LearningMode, action: string, minutesSpent: number) => {
      if (!supabase || !user) {
        return;
      }

      const { error } = await supabase.from("learning_activity").insert({
        user_id: user.id,
        mode,
        action,
        minutes_spent: minutesSpent,
      });

      if (error) {
        console.error("Failed to log learning activity", error);
        return;
      }

      await refreshLearningMetrics();
    },
    [refreshLearningMetrics, user],
  );

  const trackModeTime = useCallback(
    async (modeIndex: number, minutesSpent: number) => {
      if (minutesSpent <= 0) {
        return;
      }

      if (modeIndex === 0) {
        await logLearningActivity(
          "flashcards",
          `Studied ${sessionFlashcardsRef.current} cards`,
          minutesSpent,
        );
      } else if (modeIndex === 1) {
        await logLearningActivity(
          "reading",
          "Read 1 passage",
          minutesSpent,
        );
      } else if (modeIndex === 2) {
        await logLearningActivity(
          "roleplay",
          `Had ${sessionExchangesRef.current} exchanges`,
          minutesSpent,
        );
      }
    },
    [logLearningActivity],
  );

  // Load profile data
  useEffect(() => {
    async function loadProfile() {
      if (!supabase || !user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (error) {
        console.error("[Supabase Error] Failed to load profile:", error);
        return;
      }

      if (data) {
        // Check if the streak is still alive (activity today or yesterday)
        const lastActivity = data.last_activity_date;
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        const isAlive = lastActivity === today || lastActivity === yesterday;
        
        setStreakDays(isAlive ? (data.streak_days || 0) : 0);
        
        if (data.onboarding_daily_minutes) {
          setDailyCommitment(data.onboarding_daily_minutes);
        }
        if (Number.isFinite(data.daily_review_limit) && data.daily_review_limit > 0) {
          setDailyReviewLimit(data.daily_review_limit);
        }
        if (Number.isFinite(data.daily_new_limit) && data.daily_new_limit > 0) {
          setDailyNewCardLimit(data.daily_new_limit);
        }

        if (data.onboarding_hsk_level) {
          // Auto-generate or load correct level reading prompt
          void fetchReadingPrompt(false, data.onboarding_hsk_level);
        }

        if (data.onboarding_hsk_level === "HSK 1" || data.onboarding_hsk_level === "Total Beginner") {
          const storageKey = `polysia.hsk1IntroSeen.${user.id}`;
          if (typeof window !== "undefined" && !window.localStorage.getItem(storageKey)) {
            setShowHsk1Intro(true);
          }
        }
      }
    }
    loadProfile();
  }, [navigate, user]);

  const dismissHsk1Intro = useCallback(() => {
    if (typeof window !== "undefined" && user) {
      window.localStorage.setItem(`polysia.hsk1IntroSeen.${user.id}`, "1");
    }
    setShowHsk1Intro(false);
  }, [user]);

  // Keep perfected count responsive while cards are being rated.
  useEffect(() => {
    setStats(prev => ({
      ...prev,
      perfected: deck.filter(c => c.repetition >= 5).length
    }));
  }, [deck]);

  useEffect(() => {
    void refreshLearningMetrics();
  }, [refreshLearningMetrics]);

  // Refresh metrics when window gains focus or every 5 minutes to ensure daily reset
  useEffect(() => {
    const handleFocus = () => {
      void refreshLearningMetrics();
    };
    window.addEventListener("focus", handleFocus);
    
    const interval = setInterval(() => {
      void refreshLearningMetrics();
    }, 5 * 60 * 1000); // 5 minutes

    return () => {
      window.removeEventListener("focus", handleFocus);
      clearInterval(interval);
    };
  }, [refreshLearningMetrics]);

  useEffect(() => {
    setReadingQuizAnswers(Array(readingContent.quiz.length).fill(null));
    setReadingQuizStatus("idle");
    setHasLoggedWordsForCurrentReading(false);
  }, [readingContent.titleZh, readingContent.titleEn, readingContent.text, readingContent.quiz.length]);

  const handleReadingQuizChoice = useCallback((questionIndex: number, answer: boolean) => {
    setReadingQuizAnswers((prev) => {
      const next = [...prev];
      next[questionIndex] = answer;
      return next;
    });
    setReadingQuizStatus("idle");
  }, []);

  const handleReadingQuizCheck = useCallback(() => {
    if (readingQuizAnswers.some((answer) => answer === null)) {
      return;
    }

    const allCorrect = readingContent.quiz.every(
      (question, index) => readingQuizAnswers[index] === question.answer,
    );
    setReadingQuizStatus(allCorrect ? "correct" : "incorrect");

    if (!allCorrect || hasLoggedWordsForCurrentReading) {
      return;
    }

    const wordsReadForPassage = countReadingWords(readingContent.text);
    setHasLoggedWordsForCurrentReading(true);
    setStats((prev) => ({
      ...prev,
      wordsRead: prev.wordsRead + wordsReadForPassage,
    }));
    void logLearningActivity("reading", statEventActions.wordsRead, wordsReadForPassage);
  }, [
    countReadingWords,
    hasLoggedWordsForCurrentReading,
    logLearningActivity,
    readingContent.quiz,
    readingContent.text,
    readingQuizAnswers,
  ]);

  const statItems = [
    {
      label: "Retention Rate",
      value: `${retentionRate}%`,
      icon: Layers,
      color: "text-primary",
    },
    {
      label: "Streak",
      value: `${streakDays} days`,
      icon: Flame,
      color: "text-orange-500",
    },
    {
      label: "Dialogues",
      value: stats.dialogues.toString(),
      icon: MessagesSquare,
      color: "text-amber-500",
    },
    { label: "Words Read", value: stats.wordsRead.toLocaleString(), icon: Eye, color: "text-purple-500" },
  ];

  // sessionTick forces getDueCards to re-evaluate Date.now() every second in flashcard flow
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const allDueCards = useMemo(() => getDueCards(), [getDueCards]);

  const dueCards = useMemo(() => {
    return allDueCards;
  }, [allDueCards]);

  const currentCard = dueCards[0];

  const handleRate = useCallback(
    async (rating: SRSRating) => {
      if (!currentCard) return;
      
      setIsFlashcardFlipped(false);
      setSkipTransition(true);

      rateCard(currentCard.id, rating);

      sessionFlashcardsRef.current += 1;

      setStats((prev) => ({
        ...prev,
        flashcards: prev.flashcards + 1,
      }));

      setTimeout(() => setSkipTransition(false), 50);
    },
    [currentCard, rateCard],
  );

  const prefetchTTS = useCallback(async (text: string) => {
    const content = text.trim();
    if (!content || audioCacheRef.current[content]) return;

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (session?.access_token) {
        headers["Authorization"] = `Bearer ${session.access_token}`;
      }

      const response = await fetch("/api/ai/tts", {
        method: "POST",
        headers,
        body: JSON.stringify({
          text: content,
        }),
      });

      if (!response.ok) return;

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      audioCacheRef.current[content] = url;
    } catch (error) {
      console.error("TTS prefetch error:", error);
    }
  }, [session]);

  const playInworldTTS = useCallback(async (text: string, speed = 1.0) => {
    const content = text.trim();
    if (!content) return;

    // Stop any currently playing audio
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
    }

    try {
      let url = audioCacheRef.current[content];

      if (!url) {
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };
        if (session?.access_token) {
          headers["Authorization"] = `Bearer ${session.access_token}`;
        }

        const response = await fetch("/api/ai/tts", {
          method: "POST",
          headers,
          body: JSON.stringify({
            text: content,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || errorData.error || `TTS failed with status ${response.status}`);
        }

        const blob = await response.blob();
        url = URL.createObjectURL(blob);
        audioCacheRef.current[content] = url;
      }

      const audio = new Audio(url);
      audio.playbackRate = speed;
      currentAudioRef.current = audio;
      await audio.play();
    } catch (error) {
      console.error("Inworld TTS error:", error);
      toast({
        variant: "blackDisclaimer",
        title: "Speech unavailable",
        description: error instanceof Error ? error.message : "Could not generate audio at this time.",
      });
    }
  }, [session, toast]);

  useEffect(() => {
    if (readingContent.text) {
      void prefetchTTS(readingContent.text);
    }
  }, [readingContent.text, prefetchTTS]);

  const handleReadingTTS = useCallback(async () => {
    setIsReadingTTSLoading(true);
    try {
      await playInworldTTS(readingContent.text, readingSpeed);
    } finally {
      setIsReadingTTSLoading(false);
    }
  }, [playInworldTTS, readingContent.text, readingSpeed]);

  const handleFlashcardFlip = useCallback(() => {
    const next = !isFlashcardFlipped;
    setIsFlashcardFlipped(next);

    if (next && currentCard) {
      const hanziPattern = /[\u3400-\u9fff]/;
      const spokenText =
        (hanziPattern.test(currentCard.s) && currentCard.s) ||
        (hanziPattern.test(currentCard.t) && currentCard.t) ||
        "";

      if (spokenText) {
        void playInworldTTS(spokenText);
      }
    }
    }, [isFlashcardFlipped, currentCard, playInworldTTS]);

    useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {

      if (!isFlowActive || activeFlowIndex !== 0) return;

      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        handleFlashcardFlip();
      } else if (isFlashcardFlipped && ["1", "2", "3", "4"].includes(e.key)) {
        const ratings: Record<string, SRSRating> = {
          "1": "AGAIN",
          "2": "HARD",
          "3": "GOOD",
          "4": "EASY"
        };
        handleRate(ratings[e.key]);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFlowActive, activeFlowIndex, isFlashcardFlipped, handleRate, handleFlashcardFlip]);

  useEffect(() => {
    return () => {
      // Clean up audio cache URLs
      Object.values(audioCacheRef.current).forEach((url) => URL.revokeObjectURL(url));
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
      }
    };
  }, []);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("theme");
    const shouldUseDark = savedTheme
      ? savedTheme === "dark"
      : document.documentElement.classList.contains("dark");
    setIsDarkMode(shouldUseDark);
    setHasReadStoredTheme(true);
  }, []);

  useEffect(() => {
    if (!hasReadStoredTheme) return;
    document.documentElement.classList.toggle("dark", isDarkMode);
    window.localStorage.setItem("theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode, hasReadStoredTheme]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFlowActive) {
        exitFlow();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isFlowActive]);

  const fetchReadingPrompt = useCallback(async (ignoreCache = false, targetHskLevel?: string) => {
    setIsReadingPromptLoading(true);

    const userKey = user?.id ?? "anonymous";
    const promptStorageKey = `reading-prompt:${readingPromptCacheVersion}:${userKey}`;
    const promptTimestampStorageKey = `reading-prompt-ts:${readingPromptCacheVersion}:${userKey}`;

    if (!ignoreCache) {
      const lastPromptRaw = window.localStorage.getItem(promptStorageKey);
      const lastPromptTimestampRaw = window.localStorage.getItem(promptTimestampStorageKey);
      const lastPromptTimestamp = lastPromptTimestampRaw ? Number(lastPromptTimestampRaw) : 0;
      const isFresh = !!lastPromptRaw && Number.isFinite(lastPromptTimestamp) && Date.now() - lastPromptTimestamp < readingPromptTTL;

      if (isFresh && lastPromptRaw) {
        try {
          const cached = JSON.parse(lastPromptRaw) as DeepSeekReadingPromptResponse;
          
          // If a target level is provided, ensure the cached prompt matches it
          const levelMatches = !targetHskLevel || cached.hskLevel === targetHskLevel;

          if (levelMatches && cached.titleZh && cached.titleEn && cached.text && Array.isArray(cached.quiz) && cached.quiz.length === 2) {
            setReadingContent({
              titleZh: cached.titleZh,
              titleEn: cached.titleEn,
              text: cached.text,
              hskLevel: cached.hskLevel,
              quiz: cached.quiz,
            });
            setIsReadingPromptLoading(false);
            return;
          }
        } catch {
          // Fall through to fetch
        }
      }
    }

    try {
      const headers: Record<string, string> = {};
      if (session?.access_token) {
        headers["Authorization"] = `Bearer ${session.access_token}`;
      }

      const response = await fetch("/api/ai/reading-prompt", { headers });
      const payload = await parseJsonResponse<DeepSeekReadingPromptResponse | { error?: string }>(response, {
        emptyMessage: "Could not load today's reading prompt: the server returned no response.",
        invalidMessage: "Could not load today's reading prompt: received an invalid server response.",
      });

      if (!response.ok || !("titleZh" in payload) || !("titleEn" in payload) || !("text" in payload) || !("quiz" in payload) || !Array.isArray(payload.quiz) || payload.quiz.length !== 2) {
        throw new Error("error" in payload ? payload.error : "Could not generate the reading prompt.");
      }

      setReadingContent({
        titleZh: payload.titleZh,
        titleEn: payload.titleEn,
        text: payload.text,
        hskLevel: payload.hskLevel,
        quiz: payload.quiz,
      });
      window.localStorage.setItem(promptStorageKey, JSON.stringify(payload));
      window.localStorage.setItem(promptTimestampStorageKey, String(Date.now()));
    } catch (error) {
      toast({
        variant: "blackDisclaimer",
        title: "Tailored reading unavailable",
        description: error instanceof Error ? error.message : "Could not load today's reading prompt.",
      });
    } finally {
      setIsReadingPromptLoading(false);
    }
  }, [session, toast, user?.id]);

  useEffect(() => {
    if (!isFlowActive) {
      return;
    }

    const flowContainer = flowContainerRef.current;
    if (!flowContainer) {
      return;
    }

    let rafId: number | null = null;

    const updateActiveSlide = () => {
      const containerTop = flowContainer.getBoundingClientRect().top;
      let nearestIndex = 0;
      let nearestDistance = Number.POSITIVE_INFINITY;

      slideRefs.current.forEach((slide, index) => {
        if (!slide) {
          return;
        }

        const distance = Math.abs(slide.getBoundingClientRect().top - containerTop);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestIndex = index;
        }
      });

      setActiveFlowIndex(nearestIndex);
    };

    const handleFlowScroll = () => {
      if (rafId !== null) {
        return;
      }

      rafId = window.requestAnimationFrame(() => {
        rafId = null;
        updateActiveSlide();
      });
    };

    updateActiveSlide();
    flowContainer.addEventListener("scroll", handleFlowScroll, { passive: true });

    return () => {
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
      flowContainer.removeEventListener("scroll", handleFlowScroll);
    };
  }, [isFlowActive]);

  const enterFlow = (index: number = 0) => {
    setIsFlowActive(true);
    setActiveFlowIndex(index);
    activeModeIndexRef.current = index;
    flowModeEntryTimestampRef.current = Date.now();
    setIsFlashcardFlipped(false);
    sessionFlashcardsRef.current = 0;
    sessionExchangesRef.current = 0;
    setTimeout(() => {
      slideRefs.current[index]?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const exitFlow = () => {
    const startedAt = flowModeEntryTimestampRef.current;
    if (startedAt !== null) {
      const minutesSpent = Math.max(1, Math.round((Date.now() - startedAt) / 60000));
      void trackModeTime(activeModeIndexRef.current, minutesSpent);
    }
    flowModeEntryTimestampRef.current = null;
    setIsFlowActive(false);
    
    // Reset roleplay state
    setIsTopicSelected(false);
    setRoleplayMessages([]);
    setRoleplayTopic("");
    setRoleplayInput("");
  };

  useEffect(() => {
    if (!isFlowActive) {
      return;
    }

    if (flowModeEntryTimestampRef.current === null) {
      flowModeEntryTimestampRef.current = Date.now();
      activeModeIndexRef.current = activeFlowIndex;
      return;
    }

    if (activeModeIndexRef.current !== activeFlowIndex) {
      const now = Date.now();
      const minutesSpent = Math.max(
        1,
        Math.round((now - flowModeEntryTimestampRef.current) / 60000),
      );
      void trackModeTime(activeModeIndexRef.current, minutesSpent);
      activeModeIndexRef.current = activeFlowIndex;
      flowModeEntryTimestampRef.current = now;
      sessionFlashcardsRef.current = 0;
      sessionExchangesRef.current = 0;
    }
  }, [activeFlowIndex, isFlowActive, trackModeTime]);

  const handleSimulateNextDay = useCallback(async () => {
    if (!session?.access_token) return;

    try {
      const res = await fetch("/api/flashcards/simulate-next-day", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${session.access_token}`
        }
      });

      if (res.ok) {
        toast({
          title: "Time shifted!",
          description: "Simulated the next day. Refreshing your deck...",
        });
        // Refresh flashcards
        refresh();
        // Refresh profile and stats
        void refreshLearningMetrics();
      } else {
        throw new Error("Failed to simulate next day");
      }
    } catch (error) {
      toast({
        variant: "blackDisclaimer",
        title: "Simulation failed",
        description: error instanceof Error ? error.message : "Could not simulate next day.",
      });
    }
  }, [session, toast, refresh, refreshLearningMetrics]);

  const handleRoleplaySubmit = async () => {
    if (!roleplayInput.trim() || isRoleplayLoading) {
      return;
    }

    const userMessage = roleplayInput.trim();
    const nextMessages = [...roleplayMessages, { role: "user" as const, text: userMessage }];

    setRoleplayMessages(nextMessages);
    setRoleplayInput("");
    setIsRoleplayLoading(true);

    const deepSeekMessages: DeepSeekMessage[] = [
      {
        role: "system",
        content:
          `You are a person in this real-life scenario: "${roleplayTopic}". This is a natural one-on-one conversation. Reply mostly in Chinese. If the user makes a grammatical mistake or uses awkward phrasing, provide a very brief correction in English at the start of your response in brackets, e.g., "[Correction: ...]". Then continue the conversation naturally in Chinese. Keep responses short and human-like (1-3 sentences).`,
      },
      ...nextMessages.map<DeepSeekMessage>((message) => ({
        role: message.role === "ai" ? "assistant" : "user",
        content: message.text,
      })),
    ];

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (session?.access_token) {
        headers["Authorization"] = `Bearer ${session.access_token}`;
      }

      const response = await fetch("/api/ai/roleplay", {
        method: "POST",
        headers,
        body: JSON.stringify({
          messages: deepSeekMessages,
          temperature: 0.7,
          max_tokens: 220,
        }),
      });
      const payload = await parseJsonResponse<DeepSeekV3Response & { error?: string }>(
        response,
        {
          emptyMessage: "Roleplay request failed: the server returned no response.",
          invalidMessage: "Roleplay request failed: received an invalid server response.",
        },
      );

      if (!response.ok) {
        throw new Error(payload.error ?? "Conversation request failed");
      }

      setRoleplayMessages((prev) => [...prev, { role: "ai", text: payload.content }]);
      sessionExchangesRef.current += 1;
      void logLearningActivity("roleplay", statEventActions.dialogueResponse, 0);
      setStats((prev) => ({
        ...prev,
        dialogues: prev.dialogues + 1,
      }));
    } catch (error) {
      toast({
        variant: "blackDisclaimer",
        title: "Practice conversations unavailable",
        description:
          error instanceof Error
            ? error.message
            : "We could not get a response from DeepSeek.",
      });
    } finally {
      setIsRoleplayLoading(false);
    }
  };

  const modeCards = [
    {
      name: "Character Flashcards",
      desc: "Strengthen recall with active spaced repetition.",
      icon: Zap,
      index: 0,
      objective: `${todayReviewedReviewCards}/${modeTargets.flashcards} reviews today · ${todayNewFlashcards}/${dailyNewCardLimit} new`,
      progress: Math.min(100, Math.round((todayReviewedReviewCards / modeTargets.flashcards) * 100)),
    },
    {
      name: "Tailored Reading",
      desc: "Build comprehension with contextual short passages.",
      icon: BookMarked,
      index: 1,
      objective: `${todayProgress.reading}/${modeTargets.reading} passage today`,
      progress: Math.min(100, Math.round((todayProgress.reading / modeTargets.reading) * 100)),
      restricted: seenCharactersCount < 100,
    },
    {
      name: "Practice Conversations",
      desc: "Practice natural speaking in guided scenarios.",
      icon: MessageCircle,
      index: 2,
      objective: `${todayProgress.roleplay}/${modeTargets.roleplay} exchanges today`,
      progress: Math.min(100, Math.round((todayProgress.roleplay / modeTargets.roleplay) * 100)),
      restricted: seenCharactersCount < 100,
    },
  ];

  const weeklyModeRows = [
    { label: "Character Flashcards", minutes: weeklyModeMinutes.flashcards, icon: Layers },
    { label: "Tailored Reading", minutes: weeklyModeMinutes.reading, icon: BookOpen },
    { label: "Practice Conversations", minutes: weeklyModeMinutes.roleplay, icon: MessageCircle },
  ];

  const maxWeeklyModeMinutes = Math.max(...weeklyModeRows.map((item) => item.minutes), 1);

  const MasteryBoard = ({ cards }: { cards: Flashcard[] }) => {
    const [filter, setFilter] = useState<"all" | "mastered" | "learning">("all");
    
    const filteredCards = useMemo(() => {
      let base = cards.filter(c => c.state !== "NEW");
      switch (filter) {
        case "mastered": base = base.filter(c => c.repetition >= 5); break;
        case "learning": base = base.filter(c => c.repetition < 5); break;
      }
      return base.sort((a, b) => b.repetition - a.repetition);
    }, [cards, filter]);

    return (
      <div className="space-y-4 rounded-3xl border bg-card p-5 sm:p-6 transition-all duration-300 hover:border-zinc-400 dark:hover:border-zinc-600 hover:shadow-lg hover:shadow-black/5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-xl font-heading">Vocabulary mastery board</h2>
          <div className="flex p-1 bg-secondary/30 rounded-xl self-start sm:self-center border border-border/50">
            {(["all", "mastered", "learning"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={cn(
                  "px-3 py-1 text-xs font-medium rounded-lg transition-all capitalize border",
                  filter === t 
                    ? "bg-card text-foreground shadow-sm border-border/50" 
                    : "text-muted-foreground hover:text-foreground border-transparent"
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-6 xl:grid-cols-8 gap-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
          {filteredCards.length > 0 ? (
            filteredCards.map((card) => {
              const mastery = Math.min(5, card.repetition);
              const dotColor =
                mastery >= 5 ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" :
                mastery >= 3 ? "bg-sky-500" :
                mastery >= 1 ? "bg-amber-500" :
                "bg-rose-400";

              return (
                <Tooltip key={card.id}>
                  <TooltipTrigger asChild>
                    <div className="aspect-square flex flex-col items-center justify-center p-1 rounded-xl border border-border/50 hover:border-primary/30 transition-all hover:bg-secondary/10 group cursor-default relative">
                      <span className={cn(
                        "leading-none font-medium text-foreground transition-transform group-hover:scale-110 mb-1",
                        card.s.length > 2 ? "text-sm sm:text-base" : "text-lg"
                      )}>
                        {card.s.slice(0, 3)}
                      </span>
                      <div className={cn("w-1.5 h-1.5 rounded-full", dotColor)} />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs font-semibold">{card.p}</p>
                    <p className="text-[10px] text-muted-foreground">{card.e}</p>
                  </TooltipContent>
                </Tooltip>
              );
            })
          ) : (
            <div className="col-span-full py-12 text-center bg-secondary/5 rounded-2xl border border-dashed">
              <p className="text-sm text-muted-foreground">No vocabulary in this category yet.</p>
            </div>
          )}
        </div>

      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <Dialog open={showHsk1Intro} onOpenChange={(open) => { if (!open) dismissHsk1Intro(); }}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">
              <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Before you begin
            </div>
            <DialogTitle className="text-2xl font-heading leading-tight">
              Welcome! A quick primer for HSK 1.
            </DialogTitle>
            <DialogDescription>
              You picked HSK 1, so you're starting from the beginning. Spend a few minutes with these foundations — they'll make every flashcard, story, and dialogue click much faster.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 text-sm">
            <section className="rounded-2xl border border-border/60 bg-secondary/20 p-4">
              <h3 className="font-heading text-base mb-2">1. The four tones (+ neutral)</h3>
              <p className="text-muted-foreground mb-3">
                Mandarin is tonal — the pitch of a syllable changes the word. Practice these out loud:
              </p>
              <ul className="space-y-1.5 text-foreground">
                <li><span className="font-mono text-emerald-600 dark:text-emerald-400">mā</span> — 1st tone, high &amp; flat (妈 "mom")</li>
                <li><span className="font-mono text-blue-600 dark:text-blue-400">má</span> — 2nd tone, rising (麻 "hemp")</li>
                <li><span className="font-mono text-amber-600 dark:text-amber-400">mǎ</span> — 3rd tone, dip down then up (马 "horse")</li>
                <li><span className="font-mono text-rose-600 dark:text-rose-400">mà</span> — 4th tone, sharp falling (骂 "scold")</li>
                <li><span className="font-mono text-muted-foreground">ma</span> — neutral, light &amp; unstressed (吗 question particle)</li>
              </ul>
            </section>

            <section className="rounded-2xl border border-border/60 bg-secondary/20 p-4">
              <h3 className="font-heading text-base mb-2">2. Pinyin — your training wheels</h3>
              <p className="text-muted-foreground">
                Pinyin spells out Chinese sounds using Latin letters, with marks (¯ ´ ˇ `) showing the tone. A few sounds aren't intuitive:
              </p>
              <ul className="mt-2 space-y-1 text-foreground">
                <li><span className="font-mono">q</span> ≈ "ch" (light, tongue forward)</li>
                <li><span className="font-mono">x</span> ≈ "sh" (light, tongue forward)</li>
                <li><span className="font-mono">zh / ch / sh</span> — pulled back, retroflex</li>
                <li><span className="font-mono">c</span> ≈ "ts" in "cats"</li>
                <li><span className="font-mono">ü</span> — say "ee" with rounded lips</li>
              </ul>
            </section>

            <section className="rounded-2xl border border-border/60 bg-secondary/20 p-4">
              <h3 className="font-heading text-base mb-2">3. Characters vs words</h3>
              <p className="text-muted-foreground">
                Each character (汉字) is one syllable with its own meaning. Many words are pairs — e.g. 你好 (nǐ hǎo, "hello") = 你 "you" + 好 "good". Don't panic about memorizing strokes; recognition comes first.
              </p>
            </section>

            <section className="rounded-2xl border border-border/60 bg-secondary/20 p-4">
              <h3 className="font-heading text-base mb-2">4. How to use Polysia</h3>
              <ul className="space-y-1 text-muted-foreground">
                <li>• <span className="text-foreground">Flashcards</span> — daily reviews; tap a character to hear it.</li>
                <li>• <span className="text-foreground">Reading</span> — short stories with pinyin support and audio.</li>
                <li>• <span className="text-foreground">Roleplay</span> — try simple conversations once you know ~30 words.</li>
              </ul>
            </section>

            <p className="text-xs text-muted-foreground">
              Tip: keep YouTube tabs open for tone drills (search "Mandarin tones practice"). 10 minutes a day is plenty to start.
            </p>
          </div>

          <DialogFooter>
            <Button className="rounded-xl" onClick={dismissHsk1Intro}>
              Got it — let's start
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Configuration Error Overlay */}
      {supabaseConfigError && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/95 backdrop-blur-md p-4">
          <div className="max-w-md w-full shadow-2xl">
            <Alert variant="destructive" className="bg-card border-destructive p-6">
              <AlertCircle className="h-6 w-6 mb-2" />
              <AlertTitle className="text-xl font-heading mb-4">Supabase Configuration Required</AlertTitle>
              <AlertDescription className="mt-2 space-y-4">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {supabaseConfigError}
                </p>
                <div className="pt-4 flex flex-col gap-2">
                  <Button variant="default" className="w-full rounded-xl" onClick={() => window.location.reload()}>
                    Retry Connection
                  </Button>
                  <Button variant="outline" asChild className="w-full rounded-xl">
                    <a href="https://github.com/sheldenr/polysia#supabase-setup" target="_blank" rel="noreferrer">
                      View Setup Guide
                    </a>
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          </div>
        </div>
      )}
      <style>{`
        .flow-shell {
          height: 100vh;
          overflow-y: auto;
          scroll-snap-type: y mandatory;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .flow-shell::-webkit-scrollbar { display: none; }
        .flow-slide {
          height: 100vh;
          scroll-snap-align: start;
          scroll-snap-stop: always;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(var(--primary-rgb), 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(var(--primary-rgb), 0.2);
        }
      `}</style>

      {!isFlowActive ? (
        <div className="flex flex-col min-h-screen overflow-x-hidden">
          {/* Top Bar */}
          <header className="border-b bg-background/50 backdrop-blur-sm px-6 py-4 sticky top-0 z-40">
            <div className="flex items-center justify-between max-w-7xl mx-auto">
              <div className="flex items-center gap-4">
                <Link to="/" className="flex items-center gap-2">
                  <img src="/logo only.svg" alt="Polysia" className="h-8 w-8" />
                  <span className="font-heading text-xl tracking-tight hidden sm:inline">
                    Polysia
                  </span>
                </Link>
              </div>
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full border border-primary/20">
                  <Flame className={`w-4 h-4 text-primary ${streakDays > 0 ? "fill-primary" : ""}`} />
                  <span className="text-xs text-primary">{streakDays} days</span>
                </div>
                <button
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className="p-2 hover:bg-secondary rounded-full transition-colors"
                >
                  {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
                <button
                  aria-label="Simulate next day"
                  className="p-2 hover:bg-secondary rounded-full transition-colors text-muted-foreground hover:text-foreground"
                  onClick={handleSimulateNextDay}
                >
                  <Calendar className="w-5 h-5" />
                </button>
                <button
                  aria-label="Open settings"
                  className="p-2 hover:bg-secondary rounded-full transition-colors"
                  onClick={() => navigate("/settings")}
                >
                  <Settings className="w-5 h-5" />
                </button>
              </div>
            </div>
          </header>

          {/* Dashboard Content */}
          <main className="p-4 sm:p-6 pb-24 sm:pb-32 animate-in fade-in duration-700">
            <div className="mx-auto max-w-7xl space-y-6 sm:space-y-8">
              <section className="space-y-3 pt-2">
                <h1 className="text-3xl font-heading tracking-tight sm:text-5xl">
                  Start your learning session
                </h1>
                <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                  Move through flashcards, reading, and roleplay to keep your daily practice balanced.
                </p>
              </section>

              <section className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
                {modeCards.map((mode) => (
                  <button
                    key={mode.name}
                    type="button"
                    onClick={() => enterFlow(mode.index)}
                    className="group flex h-full flex-col overflow-hidden rounded-3xl border bg-card transition-all duration-300 hover:border-zinc-400 dark:hover:border-zinc-600 hover:shadow-xl hover:shadow-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                  >
                    {/* Top Section: Icon and Background */}
                    <div className="flex aspect-[21/9] w-full items-center justify-center bg-background transition-colors group-hover:bg-primary/5">
                      <div className="relative h-12 w-12">
                        <svg
                          className="h-full w-full -rotate-90"
                          viewBox="0 0 100 100"
                          aria-hidden="true"
                        >
                          <circle
                            cx="50"
                            cy="50"
                            r="42"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="6"
                            className="text-zinc-100 dark:text-white/5"
                          />
                          <circle
                            cx="50"
                            cy="50"
                            r="42"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="6"
                            strokeLinecap="round"
                            className="text-primary transition-all duration-500"
                            strokeDasharray={263.89}
                            strokeDashoffset={263.89 * (1 - mode.progress / 100)}
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <mode.icon className="h-6 w-6 text-primary" />
                        </div>
                      </div>
                    </div>

                    {/* Bottom Section: Details */}
                    <div className="flex flex-1 flex-col p-6 text-left bg-zinc-50/50 dark:bg-transparent transition-colors border-t border-border/50">
                      <div className="flex-1">
                        <h3 className="text-xl font-heading tracking-tight sm:text-2xl">{mode.name}</h3>
                        <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                          {mode.desc}
                        </p>
                        <div className="mt-4 flex items-center justify-between">
                          <span className="text-[10px] text-muted-foreground">
                            {mode.objective}
                          </span>
                        </div>
                      </div>
                      
                      <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-primary">
                        Choose Mode
                        <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  </button>
                ))}
              </section>

              <section className="grid grid-cols-2 gap-6 lg:grid-cols-4">
                {statItems.map((item) => {
                  return (
                    <div
                      key={item.label}
                      className="rounded-3xl border bg-card p-6 text-center transition-all duration-300 hover:border-zinc-400 dark:hover:border-zinc-600 hover:shadow-lg hover:shadow-black/5 flex flex-col justify-center items-center gap-1"
                    >
                      <p className="text-3xl font-heading tracking-tight">{item.value}</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">{item.label}</p>
                    </div>
                  );
                })}
              </section>

              <section className="grid grid-cols-1 gap-6 lg:grid-cols-[1.2fr,0.8fr] animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
                <div className="space-y-6">
                  <MasteryBoard cards={deck} />
                </div>

                <div className="space-y-6 flex flex-col">
                  <ActivityTracker activities={allActivities} variant="compact" />
                  
                  <div className="space-y-4 rounded-3xl border bg-card p-5 sm:p-6 transition-all duration-300 hover:border-zinc-400 dark:hover:border-zinc-600 hover:shadow-lg hover:shadow-black/5 flex-1 flex flex-col">
                    <h2 className="text-xl font-heading">Recent activity</h2>
                  <div className="space-y-3 flex-1">
                    {recentActivity.length > 0 ? (
                      recentActivity.map((activity) => {
                        const ActivityIcon =
                          activity.mode === "flashcards"
                            ? CheckCircle2
                            : activity.mode === "reading"
                              ? BookOpen
                              : MessageCircle;

                        return (
                          <div
                            key={activity.id}
                            className="flex items-center gap-3 rounded-2xl border bg-secondary/30 p-3"
                          >
                            <div className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                              <ActivityIcon className="h-4 w-4 text-primary" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-foreground">
                                {activity.action.includes("min")
                                  ? activity.mode === "flashcards"
                                    ? "Studied flashcards"
                                    : activity.mode === "reading"
                                      ? "Read passage"
                                      : "Had practice conversation"
                                  : activity.action}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatRelativeTime(activity.created_at)}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <p className="rounded-2xl border bg-background p-3 text-sm text-muted-foreground">
                        No activity yet. Start a session to sync your progress.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </section>
            </div>
          </main>
        </div>
      ) : (
        <div className="relative h-screen w-full overflow-hidden bg-background">
          {/* Fixed Decorative Background */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] bg-primary/[0.07] blur-[120px] rounded-full" />
            <div className="absolute bottom-[10%] -right-[10%] w-[50%] h-[50%] bg-primary/[0.05] blur-[120px] rounded-full" />
          </div>

          {/* Flow Controls */}
          <div className="fixed top-4 left-4 sm:top-6 sm:left-6 z-50 flex items-center gap-3 sm:gap-4">
            <button
              onClick={exitFlow}
              className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full border bg-background/80 backdrop-blur-md shadow-xl hover:bg-secondary transition-all group"
              aria-label="Exit flow"
            >
              <X className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </button>
          </div>

          <div className="flow-shell relative z-10" ref={flowContainerRef}>
            {/* Slide 1: Character Flashcards */}
            <section
              ref={(el) => (slideRefs.current[0] = el)}
              className="flow-slide flex flex-col items-center justify-center px-5 py-10 sm:px-8"
            >
              <div className="w-full max-w-[46rem] animate-in fade-in slide-in-from-bottom-8 duration-700">
                {srsLoading ? (
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    <p className="text-sm text-muted-foreground">Loading cards...</p>
                  </div>
                ) : dueCards.length > 0 ? (
                  <>
                    <div className="mb-8 text-center">
                      <p className="mb-4 text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
                        HSK {hskProgress.currentLevel}
                      </p>
                      <h2 className="text-2xl sm:text-3xl font-heading tracking-tight mb-1">Character Flashcards</h2>
                      <p className="text-sm text-muted-foreground max-w-md mx-auto">
                        Review characters with spaced repetition. Cards you struggle with come back sooner, cards you know push further out.
                      </p>
                    </div>
                    <div className="space-y-8 sm:space-y-12">
                      <div className="relative aspect-[4/3] sm:aspect-[16/10] group perspective-1000">
                        <div className="absolute inset-0 bg-primary/20 blur-3xl opacity-20 -z-10" />
                        <button
                          type="button"
                          onClick={handleFlashcardFlip}
                          className="relative w-full h-full bg-card border-2 border-border rounded-[2rem] sm:rounded-[3rem] shadow-2xl p-5 sm:p-10 text-center transition-all duration-500 hover:border-zinc-400 dark:hover:border-zinc-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 overflow-hidden"
                          aria-label="Flip flashcard"
                          aria-pressed={isFlashcardFlipped}
                        >
                          <div
                            className={`absolute inset-0 flex flex-col items-center justify-center ${
                              skipTransition ? "" : "transition-opacity duration-300"
                            } ${isFlashcardFlipped ? "opacity-0" : "opacity-100"}`}
                          >
                            <div className="relative w-full h-full flex flex-col items-center justify-center gap-8">
                              <span className="text-7xl sm:text-9xl tracking-tighter">
                                {currentCard.s}
                              </span>
                              <div className="px-4 text-center">
                                <p className="text-lg sm:text-2xl font-medium leading-relaxed max-w-xl">
                                  <ChineseTooltipText 
                                    text={(() => {
                                      const storedSentence = currentCard.exampleSentence.trim();
                                      if (storedSentence && !HSK_VOCAB_LABEL_REGEX.test(storedSentence)) {
                                        return storedSentence;
                                      }
                                      const parsed = parseExampleFromNotes(currentCard.n);
                                      if (parsed.sentence) return parsed.sentence;
                                      return `这是关于${currentCard.s}的一个例子。`;
                                    })()} 
                                    highlightText={currentCard.s}
                                  />
                                </p>
                              </div>
                            </div>
                          </div>
                          <div
                            className={`absolute inset-0 flex flex-col items-center justify-center ${
                              skipTransition ? "" : "transition-opacity duration-300"
                            } ${isFlashcardFlipped ? "opacity-100" : "opacity-0"}`}
                          >
                            <div className="flex flex-col items-center gap-6 sm:gap-10">
                              <div className="space-y-1 text-center">
                                <span className="text-2xl sm:text-4xl tracking-tight block text-muted-foreground">
                                  {currentCard.p}
                                </span>
                                <span className="text-xl sm:text-3xl font-medium max-w-md block text-muted-foreground">
                                  {currentCard.e}
                                </span>
                                {parseExampleFromNotes(currentCard.n).translation && (
                                  <span className="text-base sm:text-lg italic mt-4 block text-muted-foreground/80 max-w-lg px-4">
                                    &quot;{parseExampleFromNotes(currentCard.n).translation}&quot;
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </button>
                      </div>

                      <div className="flex items-center justify-center gap-10 text-sm font-medium">
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-primary text-lg">{sessionFlashcardsRef.current + 1}</span>
                          <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Cards Seen</span>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-zinc-400 text-lg">{dueCards.length}</span>
                          <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Remaining</span>
                        </div>
                      </div>

                      <div
                        className={`hidden grid-cols-4 gap-3 transition-all duration-300 sm:grid ${
                          isFlashcardFlipped ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
                        }`}
                      >
                        {(() => {
                          const intervals = getProjectedIntervals();
                          return [
                            { label: "Again", rating: "AGAIN" as const },
                            { label: "Hard", rating: "HARD" as const },
                            { label: "Good", rating: "GOOD" as const },
                            { label: "Easy", rating: "EASY" as const },
                          ].map((item, idx) => (
                            <button
                              key={item.label}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRate(item.rating);
                              }}
                              className="flex flex-col items-center gap-1 p-3 sm:p-4 rounded-2xl border bg-card hover:border-zinc-400 dark:hover:border-zinc-600 hover:bg-secondary transition-all"
                            >
                              <span className="text-xs text-muted-foreground uppercase tracking-widest leading-none mb-1">
                                {idx + 1}
                              </span>
                              <span className="font-medium">{item.label}</span>
                              <span className="text-[10px] sm:text-xs text-muted-foreground font-mono">
                                {intervals[item.rating]}
                              </span>
                            </button>
                          ));
                        })()}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center space-y-6">
                    <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                      <CheckCircle2 className="h-10 w-10 text-primary" />
                    </div>
                    <div className="text-center">
                      <h3 className="text-2xl mb-2">Daily Goal Reached!</h3>
                      <p className="text-muted-foreground max-w-sm mx-auto">
                        You've finished your cards for today. Want to learn more? Increase your daily limits in Settings.
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button onClick={() => navigate("/settings")} className="rounded-full shadow-lg">
                        Adjust Daily Limits <Settings className="ml-2 h-4 w-4" />
                      </Button>
                      <Button onClick={exitFlow} variant="outline" className="rounded-full">
                        Return to Dashboard
                      </Button>
                    </div>
                  </div>
                )}

              </div>

              {/* Mobile controls inside the slide when cards are present */}
              {dueCards.length > 0 && (
                <div
                  className={`fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 p-2 backdrop-blur transition-all duration-300 sm:hidden ${
                    activeFlowIndex === 0 && isFlashcardFlipped
                      ? "translate-y-0 opacity-100"
                      : "translate-y-full opacity-0 pointer-events-none"
                  }`}
                >
                  <div className="mx-auto grid max-w-md grid-cols-4 gap-2">
                    {(() => {
                      const intervals = getProjectedIntervals();
                      return [
                        { label: "Again", rating: "AGAIN" as const },
                        { label: "Hard", rating: "HARD" as const },
                        { label: "Good", rating: "GOOD" as const },
                        { label: "Easy", rating: "EASY" as const },
                      ].map((item, idx) => (
                        <button
                          key={`mobile-${item.label}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRate(item.rating);
                          }}
                          className="flex flex-col items-center gap-0.5 rounded-xl border bg-card px-2 py-2 hover:bg-secondary transition-all"
                        >
                          <span className="text-[10px] text-muted-foreground uppercase tracking-wide leading-none">
                            {idx + 1}
                          </span>
                          <span className="text-xs font-medium whitespace-nowrap">
                            {item.label}{" "}
                            <span className="text-[9px] text-muted-foreground font-mono font-normal">
                              ({intervals[item.rating]})
                            </span>
                          </span>
                        </button>
                      ));
                    })()}
                  </div>
                </div>
              )}
            </section>

            {/* Slide 2: AI Reading */}
            <section 
              ref={el => slideRefs.current[1] = el}
              className="flow-slide flex flex-col items-center justify-start sm:justify-center px-5 py-12 sm:px-8 sm:py-5"
            >
              <div className="w-full max-w-6xl space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="text-center space-y-3 relative">
                  <h2 className="text-3xl sm:text-4xl font-heading tracking-tight">Tailored Reading</h2>
                  <p className="text-muted-foreground max-w-xl mx-auto">
                    Read short passages generated for your level, then check comprehension with a quick quiz. Tap any character for pinyin and meaning.
                  </p>
                  
                  <div className="flex justify-center mt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => void fetchReadingPrompt(true)}
                      disabled={isReadingPromptLoading}
                      className="text-xs h-8 gap-2 rounded-full hover:bg-primary/5"
                    >
                      <RefreshCw className={`w-3 h-3 ${isReadingPromptLoading ? "animate-spin" : ""}`} />
                      {isReadingPromptLoading ? "Generating..." : "Get New Prompt"}
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-10 items-start">
                  <div className="order-1 space-y-6 lg:order-1 lg:col-span-2">
                    <article className="p-5 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] border bg-card shadow-lg leading-[2.5] text-base sm:text-2xl space-y-3 sm:space-y-4">
                      <h3 className="text-xl sm:text-3xl mb-1 sm:mb-2 font-heading flex items-center gap-3 flex-wrap">
                        {readingContent.titleEn}
                        <div className="flex items-center gap-2 ml-auto lg:ml-0">
                          <TooltipProvider>
                            <div className="flex items-center gap-2 px-2 py-1 bg-secondary/50 rounded-full">
                              <span className="text-[10px] font-mono w-8 text-center">{readingSpeed}x</span>
                              <input 
                                type="range" 
                                min="0.5" 
                                max="2.0" 
                                step="0.1" 
                                value={readingSpeed}
                                onChange={(e) => setReadingSpeed(parseFloat(e.target.value))}
                                className="w-16 h-1 accent-primary"
                              />
                            </div>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => void handleReadingTTS()}
                                  disabled={isReadingTTSLoading || isReadingPromptLoading || !readingContent.text}
                                  className="h-8 w-8 rounded-full"
                                >
                                  <Volume2 className={`h-4 w-4 ${isReadingTTSLoading ? "animate-pulse" : ""}`} />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Listen at {readingSpeed}x</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </h3>
                      <p>
                        <ChineseTooltipText 
                          text={readingContent.text} 
                          variant="reading" 
                          showPinyin={showReadingPinyin}
                        />
                      </p>
                      {isReadingPromptLoading && (
                        <p className="text-xs text-muted-foreground">Generating today's prompt...</p>
                      )}
                    </article>

                    {/* Mobile Quiz Section */}
                    <div id="reading-quiz" className="space-y-5 border-t pt-5 sm:hidden scroll-mt-24">
                      <div className="space-y-3">
                        <h3 className="text-base font-medium">Context Quiz</h3>
                        <div className="p-4 rounded-xl bg-secondary/30 border space-y-3 shadow-sm">
                          {readingContent.quiz.map((quizItem, quizIndex) => (
                            <div key={`mobile-reading-quiz-${quizIndex}`} className="space-y-1.5">
                              <p className="text-xs font-medium leading-relaxed">{quizItem.question}</p>
                              <div className="flex gap-2">
                                <Button
                                  variant={readingQuizAnswers[quizIndex] === true ? "default" : "outline"}
                                  size="sm"
                                  className="flex-1 rounded-lg h-9 text-xs"
                                  onClick={() => handleReadingQuizChoice(quizIndex, true)}
                                >
                                  True
                                </Button>
                                <Button
                                  variant={readingQuizAnswers[quizIndex] === false ? "default" : "outline"}
                                  size="sm"
                                  className="flex-1 rounded-lg h-9 text-xs"
                                  onClick={() => handleReadingQuizChoice(quizIndex, false)}
                                >
                                  False
                                </Button>
                              </div>
                            </div>
                          ))}
                          <Button
                            variant="default"
                            size="sm"
                            className="w-full rounded-lg h-10 text-xs mt-2"
                            disabled={readingQuizAnswers.some((answer) => answer === null)}
                            onClick={handleReadingQuizCheck}
                          >
                            Check answers
                          </Button>
                          {readingQuizStatus === "correct" && (
                            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 text-center font-medium">
                              Correct! Your stats have been updated.
                            </p>
                          )}
                          {readingQuizStatus === "incorrect" && (
                            <p className="text-[10px] text-destructive text-center font-medium">Not quite. Try again!</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <aside className="order-2 hidden space-y-5 sm:block lg:order-2">
                    <div className="p-5 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] border bg-card space-y-4 sm:space-y-5">
                      <h3 className="text-base sm:text-lg font-medium">Context Quiz</h3>
                      <div className="space-y-3">
                        <div className="p-4 rounded-xl bg-secondary/30 border space-y-4">
                          {readingContent.quiz.map((quizItem, quizIndex) => (
                            <div key={`desktop-reading-quiz-${quizIndex}`} className="space-y-1.5">
                              <p className="text-xs font-medium leading-relaxed">{quizItem.question}</p>
                              <div className="flex gap-2">
                                <Button
                                  variant={readingQuizAnswers[quizIndex] === true ? "default" : "outline"}
                                  size="sm"
                                  className="flex-1 rounded-lg h-8 text-xs"
                                  onClick={() => handleReadingQuizChoice(quizIndex, true)}
                                >
                                  True
                                </Button>
                                <Button
                                  variant={readingQuizAnswers[quizIndex] === false ? "default" : "outline"}
                                  size="sm"
                                  className="flex-1 rounded-lg h-8 text-xs"
                                  onClick={() => handleReadingQuizChoice(quizIndex, false)}
                                >
                                  False
                                </Button>
                              </div>
                            </div>
                          ))}
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full rounded-lg h-9 text-xs"
                            disabled={readingQuizAnswers.some((answer) => answer === null)}
                            onClick={handleReadingQuizCheck}
                          >
                            Check answers
                          </Button>
                          {readingQuizStatus === "correct" && (
                            <p className="text-[10px] text-emerald-600 dark:text-emerald-400">
                              Correct. Words read were added to your stats.
                            </p>
                          )}
                          {readingQuizStatus === "incorrect" && (
                            <p className="text-[10px] text-destructive">Not quite. Try again.</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </aside>
                </div>
              </div>
            </section>

            {/* Slide 3: Practice Conversations */}
            <section
              ref={el => slideRefs.current[2] = el}
              className="flow-slide flex flex-col items-center justify-start sm:justify-center px-5 py-12 sm:px-8 sm:py-5"
            >
              <div className="w-full max-w-4xl space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="text-center">
                  <h2 className="text-2xl sm:text-3xl font-heading tracking-tight mb-1">Practice Conversations</h2>
                  <p className="text-sm text-muted-foreground">
                    {isTopicSelected ? `Scenario: ${roleplayTopic}` : "Practice speaking naturally in real-life scenarios."}
                  </p>
                </div>

                <div
                  className={`flex flex-col rounded-3xl border bg-card overflow-hidden shadow-xl relative transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                    isTopicSelected ? "h-[80vh] sm:h-[550px]" : "h-[75px] sm:h-[90px]"
                  }`}
                >
                  <div
                    className={`overflow-y-auto transition-all duration-700 ${
                      isTopicSelected
                        ? "flex-1 p-4 sm:p-6 opacity-100"
                        : "h-0 p-0 opacity-0 pointer-events-none"
                    }`}
                  >
                    <div className="space-y-4">
                      {roleplayMessages.map((msg, idx) => {
                        const correctionMatch = msg.text.match(/^\[Correction: (.*?)\]\s*([\s\S]*)$/i);
                        const hasCorrection = msg.role === "ai" && correctionMatch;
                        const correctionText = hasCorrection ? correctionMatch[1] : null;
                        const mainText = hasCorrection ? correctionMatch[2] : msg.text;

                        return (
                          <div key={idx} className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
                            {hasCorrection && (
                              <div className="mb-2 max-w-[90%] sm:max-w-[85%] px-3 py-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200/50 dark:border-amber-800/50 rounded-xl text-xs text-amber-800 dark:text-amber-200 animate-in fade-in slide-in-from-bottom-1">
                                <span className="font-bold mr-1">Tip:</span>
                                {correctionText}
                              </div>
                            )}
                            <div className={`max-w-[90%] sm:max-w-[85%] px-4 py-2.5 rounded-2xl text-sm sm:text-base ${
                              msg.role === "user"
                              ? "bg-primary text-primary-foreground rounded-tr-none"
                              : "bg-secondary text-foreground rounded-tl-none"
                            }`}>
                              <p className="leading-relaxed">
                                <ChineseTooltipText text={mainText} />
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className={`p-3 sm:p-4 bg-secondary/10 transition-all ${isTopicSelected ? "border-t" : "flex-1 flex items-center"}`}>
                    <form
                      className="flex gap-2 sm:gap-3 w-full"
                      onSubmit={(event) => {
                        event.preventDefault();
                        if (!isTopicSelected) {
                          handleStartRoleplay(roleplayInput || textbookTopics[placeholderIndex]);
                        } else {
                          void handleRoleplaySubmit();
                        }
                      }}
                    >
                      <input
                        value={roleplayInput}
                        onChange={(e) => setRoleplayInput(e.target.value)}
                        placeholder={
                          isTopicSelected 
                            ? "Type in Chinese..." 
                            : `Try: ${textbookTopics[placeholderIndex]}`
                        }
                        disabled={isRoleplayLoading}
                        className="flex-1 bg-card border rounded-xl px-3 sm:px-4 py-2.5 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all disabled:opacity-60"
                      />
                      <Button
                        type="submit"
                        size="sm"
                        disabled={isRoleplayLoading || (isTopicSelected && !roleplayInput.trim())}
                        className="h-10 px-3 sm:px-4 rounded-xl shrink-0 shadow-sm"
                      >
                        {isTopicSelected ? "Send" : "Start"}
                        <ChevronRight className="ml-0.5 sm:ml-1 w-4 h-4" />
                      </Button>
                    </form>
                  </div>
                </div>
              </div>
            </section>          </div>
        </div>
      )}

    </div>
  );
}

export default LearningHub;
