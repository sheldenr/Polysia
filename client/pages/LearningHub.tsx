import { useEffect, useRef, useState, useCallback } from "react";
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
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { parseJsonResponse } from "@/lib/http";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useSRS, type SRSRating, getProjectedIntervals } from "@/hooks/use-srs";
import ChineseTooltipText from "@/components/ChineseTooltipText";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type {
  DeepSeekMessage,
  DeepSeekReadingPromptResponse,
  DeepSeekV3Response,
} from "@shared/api";

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

const modeTargets: Record<LearningMode, number> = {
  flashcards: 20,
  reading: 1,
  roleplay: 5,
};

const statEventActions = {
  flashcardSuccess: "stat:flashcard-success",
  dialogueResponse: "stat:dialogue-response",
  wordsRead: "stat:words-read",
} as const;

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

export default function LearningHub() {
  const { user, session, supabaseConfigError } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isFlowActive, setIsFlowActive] = useState(false);
  const [activeFlowIndex, setActiveFlowIndex] = useState(0);
  const [isRoleplayLoading, setIsRoleplayLoading] = useState(false);
  const [readingContent, setReadingContent] = useState<{
    titleZh: string;
    titleEn: string;
    text: string;
    hskLevel?: string;
    quiz: Array<{ question: string; answer: boolean }>;
  }>(defaultReadingContent);
  const [isReadingPromptLoading, setIsReadingPromptLoading] = useState(false);
  const [streakDays, setStreakDays] = useState(0);
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
  const sessionFlashcardsRef = useRef(0);
  const sessionExchangesRef = useRef(0);
  const [recentActivity, setRecentActivity] = useState<LearningActivity[]>([]);
  const [readingQuizAnswers, setReadingQuizAnswers] = useState<Array<boolean | null>>(
    Array(defaultReadingContent.quiz.length).fill(null),
  );
  const [readingQuizStatus, setReadingQuizStatus] = useState<"idle" | "correct" | "incorrect">("idle");
  const [hasLoggedWordsForCurrentReading, setHasLoggedWordsForCurrentReading] = useState(false);

  const flowContainerRef = useRef<HTMLDivElement | null>(null);
  const slideRefs = useRef<Array<HTMLElement | null>>([]);
  const flowModeEntryTimestampRef = useRef<number | null>(null);
  const activeModeIndexRef = useRef<number>(0);

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

  const { loading: srsLoading, getDueCards, rateCard, deck, hskProgress } = useSRS();

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
              content: `You are a Mandarin Chinese roleplay tutor. Start a conversation based on the topic: "${selectedTopic}". Reply mostly in Chinese, keep responses short (1-3 sentences), and gently correct mistakes naturally. Start by introducing the scenario and asking the user an initial question.`,
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
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Could not start conversation",
        description: error instanceof Error ? error.message : "AI tutor is unavailable.",
      });
      setIsTopicSelected(false);
    } finally {
      setIsRoleplayLoading(false);
    }
  }, [session, toast]);

  const seenCharacters = deck.filter((card) => card.state !== "NEW").length;

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

    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);

    const dayStart = new Date();
    dayStart.setHours(0, 0, 0, 0);

    const { data, error } = await supabase
      .from("learning_activity")
      .select("id, mode, action, minutes_spent, created_at")
      .eq("user_id", user.id)
      .gte("created_at", weekStart.toISOString())
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to load learning activity", error);
      return;
    }

    const [flashcardSuccessResult, dialoguesResult, perfectedResult, wordsReadResult] =
      await Promise.all([
        supabase
          .from("learning_activity")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id)
          .eq("action", statEventActions.flashcardSuccess),
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
      ]);

    if (
      flashcardSuccessResult.error ||
      dialoguesResult.error ||
      perfectedResult.error ||
      wordsReadResult.error
    ) {
      console.error("Failed to load learning stats", {
        flashcards: flashcardSuccessResult.error,
        dialogues: dialoguesResult.error,
        perfected: perfectedResult.error,
        wordsRead: wordsReadResult.error,
      });
    }

    const rows = (data ?? []) as LearningActivity[];
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

    for (const row of rows) {
      if (!(row.mode in nextWeeklyModeMinutes)) {
        continue;
      }

      const mode = row.mode as LearningMode;
      const isToday = new Date(row.created_at) >= dayStart;

      if (row.action.startsWith("stat:")) {
        if (isToday) {
          if (row.action === statEventActions.flashcardSuccess) {
            nextTodayProgress.flashcards += 1;
          } else if (row.action === statEventActions.dialogueResponse) {
            nextTodayProgress.roleplay += 1;
          } else if (row.action === statEventActions.wordsRead) {
            nextTodayProgress.reading += 1;
          }
        }
        continue;
      }

      nextWeeklyModeMinutes[mode] += row.minutes_spent ?? 0;
    }

    setWeeklyModeMinutes(nextWeeklyModeMinutes);
    setTodayProgress(nextTodayProgress);
    setRecentActivity(rows.filter((row) => !row.action.startsWith("stat:")).slice(0, 3));

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
      .select("streak_days")
      .eq("id", user.id)
      .maybeSingle();
    
    if (profileData) {
      setStreakDays(profileData.streak_days || 0);
    }
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
        setStreakDays(data.streak_days || 0);
        if (!data.onboarding_complete) {
          navigate("/onboarding", { replace: true });
          return;
        }
      }
    }
    loadProfile();
  }, [navigate, user]);

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
      label: "Character Flashcards",
      value: stats.flashcards.toLocaleString(),
      icon: Layers,
      color: "text-primary",
    },
    {
      label: "Perfected",
      value: stats.perfected.toLocaleString(),
      icon: CheckCircle2,
      color: "text-emerald-500",
    },
    {
      label: "Dialogues",
      value: stats.dialogues.toString(),
      icon: MessagesSquare,
      color: "text-amber-500",
    },
    { label: "Words Read", value: stats.wordsRead.toLocaleString(), icon: Eye, color: "text-purple-500" },
  ];

  const dueCards = getDueCards();
  const currentCard = dueCards[0];

  const handleRate = useCallback(
    (rating: SRSRating) => {
      if (!currentCard) return;
      setSkipTransition(true);
      rateCard(currentCard.h, rating);
      
      sessionFlashcardsRef.current += 1;

      if (rating === 3 || rating === 4) {
        setStats((prev) => ({
          ...prev,
          flashcards: prev.flashcards + 1,
        }));
        void logLearningActivity("flashcards", statEventActions.flashcardSuccess, 0);
      }
      setIsFlashcardFlipped(false);
      setTimeout(() => setSkipTransition(false), 50);
    },
    [currentCard, logLearningActivity, rateCard],
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isFlowActive || activeFlowIndex !== 0) return;

      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        setIsFlashcardFlipped((prev) => !prev);
      } else if (isFlashcardFlipped && ["1", "2", "3", "4"].includes(e.key)) {
        handleRate(Number(e.key) as SRSRating);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFlowActive, activeFlowIndex, isFlashcardFlipped, handleRate]);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("theme");
    const shouldUseDark = savedTheme ? savedTheme === "dark" : false;
    setIsDarkMode(shouldUseDark);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
    window.localStorage.setItem("theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFlowActive) {
        exitFlow();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isFlowActive]);

  const fetchReadingPrompt = useCallback(async (ignoreCache = false) => {
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
          if (cached.titleZh && cached.titleEn && cached.text && Array.isArray(cached.quiz) && cached.quiz.length === 2) {
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
        variant: "destructive",
        title: "Tailored reading unavailable",
        description: error instanceof Error ? error.message : "Could not load today's reading prompt.",
      });
    } finally {
      setIsReadingPromptLoading(false);
    }
  }, [session, toast, user?.id]);

  useEffect(() => {
    void fetchReadingPrompt();
  }, [fetchReadingPrompt]);

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
          `You are a Mandarin Chinese roleplay tutor. Stay in the scenario: "${roleplayTopic}". Reply mostly in Chinese. If the user makes a grammatical mistake or uses awkward phrasing, provide a very brief correction in English at the start of your response in brackets, e.g., "[Correction: ...]". Then continue the conversation in Chinese. Keep responses short (1-3 sentences).`,
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
        variant: "destructive",
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
      objective: `${todayProgress.flashcards}/${modeTargets.flashcards} cards today`,
      progress: Math.min(100, Math.round((todayProgress.flashcards / modeTargets.flashcards) * 100)),
      eta: `${Math.max(modeTargets.flashcards - todayProgress.flashcards, 0)} left`,
    },
    {
      name: "Tailored Reading",
      desc: "Build comprehension with contextual short passages.",
      icon: BookMarked,
      index: 1,
      objective: `${todayProgress.reading}/${modeTargets.reading} passage today`,
      progress: Math.min(100, Math.round((todayProgress.reading / modeTargets.reading) * 100)),
      eta: `${Math.max(modeTargets.reading - todayProgress.reading, 0)} left`,
      restricted: seenCharacters < 100,
    },
    {
      name: "Practice Conversations",
      desc: "Practice natural speaking in guided scenarios.",
      icon: MessageCircle,
      index: 2,
      objective: `${todayProgress.roleplay}/${modeTargets.roleplay} exchanges today`,
      progress: Math.min(100, Math.round((todayProgress.roleplay / modeTargets.roleplay) * 100)),
      eta: `${Math.max(modeTargets.roleplay - todayProgress.roleplay, 0)} left`,
      restricted: seenCharacters < 100,
    },
  ];

  const weeklyModeRows = [
    { label: "Character Flashcards", minutes: weeklyModeMinutes.flashcards, icon: Layers },
    { label: "Tailored Reading", minutes: weeklyModeMinutes.reading, icon: BookOpen },
    { label: "Practice Conversations", minutes: weeklyModeMinutes.roleplay, icon: MessageCircle },
  ];

  const maxWeeklyModeMinutes = Math.max(...weeklyModeRows.map((item) => item.minutes), 1);

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
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
      `}</style>

      {!isFlowActive ? (
        <div className="flex flex-col min-h-screen animate-in fade-in duration-700">
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
          <main className="flex-1 overflow-y-auto p-4 sm:p-6">
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
                  <article
                    key={mode.name}
                    className="group flex h-full flex-col rounded-3xl border bg-card p-5 transition-all duration-300 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10 sm:p-6"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10">
                          <mode.icon className="h-5 w-5 text-primary" />
                        </div>

                        <h3 className="text-2xl font-heading">{mode.name}</h3>
                      </div>
                      <span className="shrink-0 whitespace-nowrap rounded-full border bg-background px-3 py-1 text-xs font-semibold text-muted-foreground">
                        {mode.eta}
                      </span>
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground">{mode.desc}</p>
                    <div className="mt-5 rounded-2xl border bg-background p-4">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Objective</p>
                      <p className="mt-1 text-sm font-medium">{mode.objective}</p>
                    </div>
                    <div className="mt-5 space-y-2">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Today&apos;s progress</span>
                        <span className="font-semibold text-foreground">{mode.progress}%</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-zinc-200/50">
                        <div
                          className="h-full rounded-full bg-primary transition-all duration-500"
                          style={{ width: `${mode.progress}%` }}
                        />
                      </div>
                    </div>
                    <Button 
                      onClick={() => enterFlow(mode.index)} 
                      className="mt-6 h-11 w-full rounded-xl bg-primary hover:bg-black text-primary-foreground hover:text-white transition-all duration-300 border-none"
                    >
                      Start session
                    </Button>
                  </article>
                ))}
              </section>

              <section className="grid grid-cols-1 gap-6 lg:grid-cols-[1.2fr,0.8fr]">
                  <div className="space-y-4 rounded-3xl border bg-card p-5 sm:p-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-heading">Mode balance this week</h2>
                      <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                        Synced
                      </span>
                    </div>
                    <div className="space-y-4">
                      {weeklyModeRows.map((item) => (
                        <div key={item.label} className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="flex items-center gap-2 font-medium leading-none">
                              <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-primary/10">
                                <item.icon className="h-3.5 w-3.5 text-primary" />
                              </span>
                              {item.label}
                            </span>

                           <span className="text-muted-foreground">{item.minutes} min</span>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-zinc-200/50">
                            <div
                              className="h-full rounded-full bg-primary/80"
                              style={{ width: `${Math.round((item.minutes / maxWeeklyModeMinutes) * 100)}%` }}
                            />
                          </div>
                        </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4 rounded-3xl border bg-card p-5 sm:p-6">
                  <h2 className="text-xl font-heading">Recent activity</h2>
                  <div className="space-y-3">
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
                            className="flex items-center gap-3 rounded-2xl border bg-background p-3"
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
              </section>

              <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {statItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.label}
                      className="rounded-2xl border bg-card p-4 text-left transition-colors duration-300 hover:border-primary/30"
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <div className="-ml-1 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <TrendingUp className="h-4 w-4 shrink-0 text-primary" />
                      </div>
                      <p className="text-2xl font-heading">{item.value}</p>
                      <p className="text-xs text-muted-foreground">{item.label}</p>
                    </div>
                  );
                })}
              </section>

              <footer className="border-t pt-5 text-center sm:pt-6">
                <p className="text-xs text-muted-foreground">
                  © {new Date().getFullYear()} Polysia · Keep your daily momentum.
                </p>
              </footer>
            </div>
          </main>
        </div>
      ) : (
        <div className="relative h-screen w-screen overflow-hidden bg-background">
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

          <div className="flow-shell" ref={flowContainerRef}>
            {/* Slide 1: Character Flashcards */}
            <section
              ref={(el) => (slideRefs.current[0] = el)}
              className="flow-slide flex flex-col items-center justify-center px-5 pt-12 pb-16 sm:px-8 sm:py-5 bg-gradient-to-b from-background to-secondary/10"
            >
              <div className="w-full max-w-[46rem] animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="mb-4 text-center">
                  <h2 className="text-2xl sm:text-3xl font-heading tracking-tight mb-1">Character Flashcards</h2>
                  <p className="text-sm text-muted-foreground">
                    Learning HSK {hskProgress.currentLevel} set · Learned {hskProgress.learned}/{hskProgress.total}
                  </p>
                </div>
                {dueCards.length > 0 ? (
                  <div className="space-y-8 sm:space-y-14">
                    <div className="relative aspect-[4/3] sm:aspect-[16/10] group perspective-1000">
                      <div className="absolute inset-0 bg-primary/20 blur-3xl opacity-20 -z-10" />
                      <button
                        type="button"
                        onClick={() => setIsFlashcardFlipped((prev) => !prev)}
                        className="relative w-full h-full bg-card border-2 border-border rounded-[2rem] sm:rounded-[3rem] shadow-2xl p-5 sm:p-10 text-center transition-all duration-500 hover:border-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 overflow-hidden"
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
                                  text={currentCard.n.includes("HSK") ? `这是关于${currentCard.s}的一个例子。` : currentCard.n} 
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
                            </div>
                          </div>
                        </div>
                      </button>
                    </div>

                    <div
                      className={`hidden grid-cols-4 gap-4 transition-all duration-300 sm:grid ${
                        isFlashcardFlipped ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
                      }`}
                    >
                      {(() => {
                        const intervals = currentCard ? getProjectedIntervals(currentCard) : null;
                        return [
                          { label: "Again", rating: 1 },
                          { label: "Hard", rating: 2 },
                          { label: "Good", rating: 3 },
                          { label: "Easy", rating: 4 },
                        ].map((item, idx) => (
                          <button
                            key={item.label}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRate(item.rating as SRSRating);
                            }}
                            className="flex flex-col items-center gap-1 p-3 sm:p-4 rounded-2xl border bg-card hover:border-primary/30 hover:bg-secondary transition-all"
                          >
                            <span className="text-xs text-muted-foreground uppercase tracking-widest leading-none mb-1">
                              {idx + 1}
                            </span>
                            <span className="font-medium">{item.label}</span>
                            <span className="text-[10px] sm:text-xs text-muted-foreground font-mono">
                              {intervals?.[item.rating as SRSRating] ?? "--"}
                            </span>
                          </button>

                        ));
                      })()}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center space-y-6">
                    <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                      <CheckCircle2 className="h-10 w-10 text-primary" />
                    </div>
                    <div className="text-center">
                      <h3 className="text-2xl mb-2">You're all caught up!</h3>
                      <p className="text-muted-foreground">Come back later for your next reviews.</p>
                    </div>
                    <Button onClick={() => setActiveFlowIndex(1)} variant="outline" className="rounded-full">
                      Continue to Tailored Reading <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>                  </div>
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
                      const intervals = currentCard ? getProjectedIntervals(currentCard) : null;
                      return [
                        { label: "Again", rating: 1 },
                        { label: "Hard", rating: 2 },
                        { label: "Good", rating: 3 },
                        { label: "Easy", rating: 4 },
                      ].map((item, idx) => (
                        <button
                          key={`mobile-${item.label}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRate(item.rating as SRSRating);
                          }}
                          className="flex flex-col items-center gap-0.5 rounded-xl border bg-card px-2 py-2 hover:border-primary/30 hover:bg-secondary transition-all"
                        >
                          <span className="text-[10px] text-muted-foreground uppercase tracking-wide leading-none">
                            {idx + 1}
                          </span>
                          <span className="text-xs font-medium whitespace-nowrap">
                            {item.label}{" "}
                            <span className="text-[9px] text-muted-foreground font-mono font-normal">
                              ({intervals?.[item.rating as SRSRating] ?? "--"})
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
              className="flow-slide flex flex-col items-center justify-start sm:justify-center px-5 py-12 sm:px-8 sm:py-5 bg-gradient-to-b from-secondary/10 to-primary/5"
            >
              <div className="w-full max-w-6xl space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="text-center space-y-3 relative">
                  <h2 className="text-3xl sm:text-4xl font-heading tracking-tight">Tailored Reading</h2>
                  <p className="text-muted-foreground">
                    Practice authentic reading at your {readingContent.hskLevel || "Beginner"} level.
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
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-12 items-start">
                  <div className="order-1 space-y-8 lg:order-1 lg:col-span-2">
                    <article className="max-h-[72vh] overflow-y-auto p-6 sm:max-h-none sm:overflow-visible sm:p-10 rounded-[1.5rem] sm:rounded-[2.5rem] border bg-card shadow-xl leading-relaxed text-base sm:text-2xl space-y-6 sm:space-y-9">
                      <h3 className="text-2xl sm:text-4xl mb-4 sm:mb-8 font-heading flex items-center gap-3 flex-wrap">
                        <ChineseTooltipText text={readingContent.titleZh} />
                        <span className="text-sm sm:text-lg font-normal text-muted-foreground">
                          ({readingContent.titleEn})
                        </span>
                      </h3>
                      <p>
                        <ChineseTooltipText text={readingContent.text} />
                      </p>
                      {isReadingPromptLoading && (
                        <p className="text-sm text-muted-foreground">Generating today's prompt...</p>
                      )}

                      <div className="space-y-6 border-t pt-6 sm:hidden">
                        <div className="space-y-4">
                          <h3 className="text-lg">Context Quiz</h3>
                          <div className="p-4 rounded-2xl bg-secondary/50 border space-y-4">
                            {readingContent.quiz.map((quizItem, quizIndex) => (
                              <div key={`mobile-reading-quiz-${quizIndex}`} className="space-y-2">
                                <p className="text-sm font-medium leading-relaxed">{quizItem.question}</p>
                                <div className="flex gap-2">
                                  <Button
                                    variant={readingQuizAnswers[quizIndex] === true ? "default" : "outline"}
                                    className="flex-1 rounded-xl"
                                    onClick={() => handleReadingQuizChoice(quizIndex, true)}
                                  >
                                    True
                                  </Button>
                                  <Button
                                    variant={readingQuizAnswers[quizIndex] === false ? "default" : "outline"}
                                    className="flex-1 rounded-xl"
                                    onClick={() => handleReadingQuizChoice(quizIndex, false)}
                                  >
                                    False
                                  </Button>
                                </div>
                              </div>
                            ))}
                            <Button
                              variant="outline"
                              className="w-full rounded-xl"
                              disabled={readingQuizAnswers.some((answer) => answer === null)}
                              onClick={handleReadingQuizCheck}
                            >
                              Check answers
                            </Button>
                            {readingQuizStatus === "correct" && (
                              <p className="text-xs text-emerald-600 dark:text-emerald-400">
                                Correct. Words read were added to your stats.
                              </p>
                            )}
                            {readingQuizStatus === "incorrect" && (
                              <p className="text-xs text-destructive">Not quite. Try again.</p>
                            )}
                          </div>
                        </div>

                      </div>
                    </article>
                  </div>

                  <aside className="order-2 hidden space-y-6 sm:block sm:space-y-8 lg:order-2">
                    <div className="p-5 sm:p-8 rounded-[1.5rem] sm:rounded-[2.5rem] border bg-card space-y-4 sm:space-y-6">
                      <h3 className="text-lg sm:text-xl">Context Quiz</h3>
                      <div className="space-y-4">
                        <div className="p-5 rounded-2xl bg-secondary/50 border space-y-4">
                          {readingContent.quiz.map((quizItem, quizIndex) => (
                            <div key={`desktop-reading-quiz-${quizIndex}`} className="space-y-2">
                              <p className="text-sm font-medium leading-relaxed">{quizItem.question}</p>
                              <div className="flex gap-2">
                                <Button
                                  variant={readingQuizAnswers[quizIndex] === true ? "default" : "outline"}
                                  className="flex-1 rounded-xl"
                                  onClick={() => handleReadingQuizChoice(quizIndex, true)}
                                >
                                  True
                                </Button>
                                <Button
                                  variant={readingQuizAnswers[quizIndex] === false ? "default" : "outline"}
                                  className="flex-1 rounded-xl"
                                  onClick={() => handleReadingQuizChoice(quizIndex, false)}
                                >
                                  False
                                </Button>
                              </div>
                            </div>
                          ))}
                          <Button
                            variant="outline"
                            className="w-full rounded-xl"
                            disabled={readingQuizAnswers.some((answer) => answer === null)}
                            onClick={handleReadingQuizCheck}
                          >
                            Check answers
                          </Button>
                          {readingQuizStatus === "correct" && (
                            <p className="text-xs text-emerald-600 dark:text-emerald-400">
                              Correct. Words read were added to your stats.
                            </p>
                          )}
                          {readingQuizStatus === "incorrect" && (
                            <p className="text-xs text-destructive">Not quite. Try again.</p>
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
              className="flow-slide flex flex-col items-center justify-start sm:justify-center px-5 py-12 sm:px-8 sm:py-5 bg-gradient-to-b from-primary/5 to-background"
            >
              <div className="w-full max-w-4xl space-y-7 sm:space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="text-center">
                  <h2 className="text-3xl sm:text-4xl font-heading tracking-tight mb-2">Practice Conversations</h2>
                  <p className="text-muted-foreground">
                    {isTopicSelected ? `Scenario: ${roleplayTopic}` : "Practice speaking naturally in real-life scenarios. Start by selecting a topic."}
                  </p>
                </div>

                <div 
                  className={`flex flex-col rounded-[1.5rem] sm:rounded-[3rem] border bg-card overflow-hidden shadow-2xl relative transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                    isTopicSelected ? "h-[65vh] sm:h-[550px]" : "h-[82px] sm:h-[116px]"
                  }`}
                >
                  <div 
                    className={`overflow-y-auto transition-all duration-700 ${
                      isTopicSelected 
                        ? "flex-1 p-4 sm:p-10 opacity-100" 
                        : "h-0 p-0 opacity-0 pointer-events-none"
                    }`}
                  >
                    <div className="space-y-4 sm:space-y-8">
                      {roleplayMessages.map((msg, idx) => {
                        const correctionMatch = msg.text.match(/^\[Correction: (.*?)\]\s*([\s\S]*)$/i);
                        const hasCorrection = msg.role === "ai" && correctionMatch;
                        const correctionText = hasCorrection ? correctionMatch[1] : null;
                        const mainText = hasCorrection ? correctionMatch[2] : msg.text;

                        return (
                          <div key={idx} className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
                            {hasCorrection && (
                              <div className="mb-2 max-w-[85%] px-4 py-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200/50 dark:border-amber-800/50 rounded-xl text-xs sm:text-sm text-amber-800 dark:text-amber-200 animate-in fade-in slide-in-from-bottom-1">
                                <span className="font-bold mr-1">Tip:</span>
                                {correctionText}
                              </div>

                            )}
                            <div className={`max-w-[88%] sm:max-w-[80%] px-4 sm:px-8 py-3 sm:py-5 rounded-[1.25rem] sm:rounded-[2rem] text-base sm:text-lg ${
                              msg.role === "user" 
                              ? "bg-primary text-primary-foreground rounded-tr-none shadow-xl shadow-primary/20" 
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

                  <div className={`p-3 sm:p-6 bg-secondary/30 transition-all ${isTopicSelected ? "border-t" : "flex-1 flex items-center"}`}>
                    <form
                      className="flex gap-3 sm:gap-4 w-full"
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
                            ? "Type your response in Chinese..." 
                            : `e.g., ${textbookTopics[placeholderIndex]}...`
                        }
                        disabled={isRoleplayLoading}
                        className="flex-1 bg-card border rounded-2xl px-4 sm:px-8 py-3 sm:py-4 text-base sm:text-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm disabled:opacity-60"
                      />
                      <Button
                        type="submit"
                        size="icon"
                        disabled={isRoleplayLoading || (isTopicSelected && !roleplayInput.trim())}
                        className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl shrink-0 shadow-lg bg-black hover:bg-black/90 text-white border-none"
                      >
                        <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
                      </Button>
                    </form>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      )}

    </div>
  );
}
