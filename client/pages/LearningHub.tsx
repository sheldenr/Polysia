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
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { parseJsonResponse } from "@/lib/http";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useSRS, type SRSRating, getProjectedIntervals } from "@/hooks/use-srs";
import ChineseTooltipText from "@/components/ChineseTooltipText";
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
  reading: 15,
  roleplay: 18,
};

const statEventActions = {
  flashcardSuccess: "stat:flashcard-success",
  dialogueResponse: "stat:dialogue-response",
  wordsRead: "stat:words-read",
} as const;

export default function LearningHub() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isFlowActive, setIsFlowActive] = useState(false);
  const [activeFlowIndex, setActiveFlowIndex] = useState(0);
  const [isRoleplayLoading, setIsRoleplayLoading] = useState(false);
  const [readingContent, setReadingContent] = useState(defaultReadingContent);
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

  // Learning State (Mocked)
  const [roleplayMessages, setRoleplayMessages] = useState<
    Array<{ role: "ai" | "user"; text: string }>
  >([
    {
      role: "ai",
      text: "你好！今天我们练习一个关于日常生活的对话。你能告诉我你今天做了什么吗？",
    },
  ]);
  const [roleplayInput, setRoleplayInput] = useState("");
  const [isFlashcardFlipped, setIsFlashcardFlipped] = useState(false);
  const [skipTransition, setSkipTransition] = useState(false);

  const { loading: srsLoading, getDueCards, rateCard, deck, hskProgress } = useSRS();

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

      if (row.action.startsWith("stat:")) {
        continue;
      }

      const mode = row.mode as LearningMode;
      nextWeeklyModeMinutes[mode] += row.minutes_spent ?? 0;

      if (new Date(row.created_at) >= dayStart) {
        if (mode === "flashcards") {
          nextTodayProgress.flashcards += 1;
        } else {
          nextTodayProgress[mode] += row.minutes_spent ?? 0;
        }
      }
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
        await logLearningActivity("flashcards", `Studied flashcards for ${minutesSpent} min`, minutesSpent);
      } else if (modeIndex === 1) {
        await logLearningActivity("reading", `Completed AI reading for ${minutesSpent} min`, minutesSpent);
      } else if (modeIndex === 2) {
        await logLearningActivity("roleplay", `Practiced AI roleplay for ${minutesSpent} min`, minutesSpent);
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
      label: "Flashcards",
      value: stats.flashcards.toLocaleString(),
      icon: Layers,
      color: "text-blue-500",
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

  useEffect(() => {
    const userKey = user?.id ?? "anonymous";
    const promptStorageKey = `reading-prompt:${readingPromptCacheVersion}:${userKey}`;
    const promptTimestampStorageKey = `reading-prompt-ts:${readingPromptCacheVersion}:${userKey}`;
    const lastPromptRaw = window.localStorage.getItem(promptStorageKey);
    const lastPromptTimestampRaw = window.localStorage.getItem(
      promptTimestampStorageKey,
    );
    const lastPromptTimestamp = lastPromptTimestampRaw
      ? Number(lastPromptTimestampRaw)
      : 0;
    const isFresh =
      !!lastPromptRaw &&
      Number.isFinite(lastPromptTimestamp) &&
      Date.now() - lastPromptTimestamp < readingPromptTTL;

    if (isFresh && lastPromptRaw) {
      try {
        const cached = JSON.parse(lastPromptRaw) as DeepSeekReadingPromptResponse;
        if (
          cached.titleZh &&
          cached.titleEn &&
          cached.text &&
          Array.isArray(cached.quiz) &&
          cached.quiz.length === 2
        ) {
          setReadingContent({
            titleZh: cached.titleZh,
            titleEn: cached.titleEn,
            text: cached.text,
            quiz: cached.quiz,
          });
          return;
        }
      } catch {
        // Ignore old cache format and fetch a fresh prompt.
      }
    }

    const fetchReadingPrompt = async () => {
      setIsReadingPromptLoading(true);

      try {
        const response = await fetch("/api/ai/reading-prompt");
        const payload = await parseJsonResponse<
          | DeepSeekReadingPromptResponse
          | { error?: string }
        >(response, {
          emptyMessage:
            "Could not load today's reading prompt: the server returned no response.",
          invalidMessage:
            "Could not load today's reading prompt: received an invalid server response.",
        });

        if (
          !response.ok ||
          !("titleZh" in payload) ||
          !("titleEn" in payload) ||
          !("text" in payload) ||
          !("quiz" in payload) ||
          !Array.isArray(payload.quiz) ||
          payload.quiz.length !== 2
        ) {
          throw new Error(
            "error" in payload
              ? payload.error
              : "Could not generate the reading prompt.",
          );
        }

        setReadingContent({
          titleZh: payload.titleZh,
          titleEn: payload.titleEn,
          text: payload.text,
          quiz: payload.quiz,
        });
        window.localStorage.setItem(promptStorageKey, JSON.stringify(payload));
        window.localStorage.setItem(
          promptTimestampStorageKey,
          String(Date.now()),
        );
      } catch (error) {
        toast({
          variant: "destructive",
          title: "AI reading unavailable",
          description:
            error instanceof Error
              ? error.message
              : "Could not load today's reading prompt.",
        });
      } finally {
        setIsReadingPromptLoading(false);
      }
    };

    void fetchReadingPrompt();
  }, [toast, user?.id]);

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
          "You are a Mandarin Chinese roleplay tutor. Stay in the cafe-ordering scenario, reply mostly in Chinese, keep responses short (1-3 sentences), and gently correct mistakes naturally.",
      },
      ...nextMessages.map<DeepSeekMessage>((message) => ({
        role: message.role === "ai" ? "assistant" : "user",
        content: message.text,
      })),
    ];

    try {
      const response = await fetch("/api/ai/roleplay", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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
        throw new Error(payload.error ?? "Roleplay request failed");
      }

      setRoleplayMessages((prev) => [...prev, { role: "ai", text: payload.content }]);
      void logLearningActivity("roleplay", statEventActions.dialogueResponse, 0);
      setStats((prev) => ({
        ...prev,
        dialogues: prev.dialogues + 1,
      }));
    } catch (error) {
      toast({
        variant: "destructive",
        title: "AI roleplay unavailable",
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
      name: "Flashcards",
      desc: "Strengthen recall with active spaced repetition.",
      icon: Zap,
      index: 0,
      objective: `${todayProgress.flashcards}/${modeTargets.flashcards} cards today`,
      progress: Math.min(100, Math.round((todayProgress.flashcards / modeTargets.flashcards) * 100)),
      eta: `${Math.max(modeTargets.flashcards - todayProgress.flashcards, 0)} left`,
    },
    {
      name: "AI Reading",
      desc: "Build comprehension with contextual short passages.",
      icon: BookMarked,
      index: 1,
      objective: `${todayProgress.reading}/${modeTargets.reading} min today`,
      progress: Math.min(100, Math.round((todayProgress.reading / modeTargets.reading) * 100)),
      eta: `${Math.max(modeTargets.reading - todayProgress.reading, 0)} min left`,
    },
    {
      name: "AI Roleplay",
      desc: "Practice natural speaking in guided scenarios.",
      icon: MessageCircle,
      index: 2,
      objective: `${todayProgress.roleplay}/${modeTargets.roleplay} min today`,
      progress: Math.min(100, Math.round((todayProgress.roleplay / modeTargets.roleplay) * 100)),
      eta: `${Math.max(modeTargets.roleplay - todayProgress.roleplay, 0)} min left`,
    },
  ];

  const weeklyModeRows = [
    { label: "Flashcards", minutes: weeklyModeMinutes.flashcards, icon: Layers },
    { label: "AI Reading", minutes: weeklyModeMinutes.reading, icon: BookOpen },
    { label: "AI Roleplay", minutes: weeklyModeMinutes.roleplay, icon: MessageCircle },
  ];

  const maxWeeklyModeMinutes = Math.max(...weeklyModeRows.map((item) => item.minutes), 1);

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
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
                  <Flame className="w-4 h-4 text-primary fill-primary" />
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
                      <span className="rounded-full border bg-background px-3 py-1 text-xs font-semibold text-muted-foreground">
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
                      <div className="h-2 overflow-hidden rounded-full bg-secondary">
                        <div
                          className="h-full rounded-full bg-primary transition-all duration-500"
                          style={{ width: `${mode.progress}%` }}
                        />
                      </div>
                    </div>
                    <Button onClick={() => enterFlow(mode.index)} className="mt-6 w-full rounded-xl">
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
                          <div className="h-2 overflow-hidden rounded-full bg-secondary">
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
                              <p className="text-sm font-medium">{activity.action}</p>
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
            <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full border bg-background/80 backdrop-blur-md shadow-lg">
              <img src="/logo only.svg" alt="Polysia" className="h-5 w-5" />
              <span className="text-xs uppercase tracking-widest text-muted-foreground">Learning Session</span>
            </div>
          </div>

          <div className="flow-shell" ref={flowContainerRef}>
            {/* Slide 1: Flashcards */}
            <section
              ref={(el) => (slideRefs.current[0] = el)}
              className="flow-slide flex flex-col items-center justify-center px-5 pt-12 pb-16 sm:px-8 sm:py-5 bg-gradient-to-b from-background to-secondary/10"
            >
              <div className="w-full max-w-[46rem] animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="mb-4 text-center">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">
                    HSK {hskProgress.currentLevel} Progress
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Learned {hskProgress.learned}/{hskProgress.total} · Unlocked through HSK {hskProgress.unlockedLevel}
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
                      Continue to Reading <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
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
                <div className="text-center space-y-3">
                  <h2 className="text-3xl sm:text-4xl font-heading tracking-tight">AI Reading</h2>
                  <p className="text-muted-foreground">Practice comprehension with context</p>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-12 items-start">
                  <div className="order-1 space-y-8 lg:order-1 lg:col-span-2">
                    <article className="max-h-[72vh] overflow-y-auto p-6 sm:max-h-none sm:overflow-visible sm:p-10 rounded-[1.5rem] sm:rounded-[2.5rem] border bg-card shadow-xl leading-relaxed text-base sm:text-2xl space-y-6 sm:space-y-9">
                      <h3 className="text-2xl sm:text-4xl mb-4 sm:mb-8 font-heading">
                        <ChineseTooltipText text={readingContent.titleZh} />
                      </h3>
                      <p className="-mt-3 text-sm font-medium tracking-wide text-muted-foreground sm:text-base">
                        {readingContent.titleEn}
                      </p>
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

            {/* Slide 3: AI Roleplay */}
            <section 
              ref={el => slideRefs.current[2] = el}
              className="flow-slide flex flex-col items-center justify-start sm:justify-center px-5 py-12 sm:px-8 sm:py-5 bg-gradient-to-b from-primary/5 to-background"
            >
              <div className="w-full max-w-4xl space-y-7 sm:space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="text-center">
                  <h2 className="text-3xl sm:text-4xl font-heading tracking-tight mb-2">AI Roleplay</h2>
                  <p className="text-muted-foreground">Scenario: Ordering food at a Shanghai cafe.</p>
                </div>

                <div className="h-[65vh] sm:h-[550px] flex flex-col rounded-[1.5rem] sm:rounded-[3rem] border bg-card overflow-hidden shadow-2xl relative">
                  <div className="flex-1 overflow-y-auto p-4 sm:p-10 space-y-4 sm:space-y-8">
                    {roleplayMessages.map((msg, idx) => (
                      <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[88%] sm:max-w-[80%] px-4 sm:px-8 py-3 sm:py-5 rounded-[1.25rem] sm:rounded-[2rem] text-base sm:text-lg ${
                          msg.role === "user" 
                          ? "bg-primary text-primary-foreground rounded-tr-none shadow-xl shadow-primary/20" 
                          : "bg-secondary text-foreground rounded-tl-none"
                        }`}>
                          <p className="leading-relaxed">
                            <ChineseTooltipText text={msg.text} />
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 sm:p-8 bg-secondary/30 border-t">
                    <form
                      className="flex gap-3 sm:gap-4"
                      onSubmit={(event) => {
                        event.preventDefault();
                        void handleRoleplaySubmit();
                      }}
                    >
                      <input
                        value={roleplayInput}
                        onChange={(e) => setRoleplayInput(e.target.value)}
                        placeholder="Type your response in Chinese..."
                        disabled={isRoleplayLoading}
                        className="flex-1 bg-card border rounded-2xl px-4 sm:px-8 py-3 sm:py-4 text-base sm:text-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm disabled:opacity-60"
                      />
                      <Button
                        type="submit"
                        size="icon"
                        disabled={isRoleplayLoading || !roleplayInput.trim()}
                        className="h-12 w-12 sm:h-16 sm:w-16 rounded-2xl shrink-0 shadow-lg"
                      >
                        <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
                      </Button>
                    </form>
                    {isRoleplayLoading && (
                      <p className="mt-3 text-sm text-muted-foreground">AI is responding...</p>
                    )}
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
