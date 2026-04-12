import { useEffect, useRef, useState } from "react";
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
import { useToast } from "@/hooks/use-toast";
import ChineseTooltipText from "@/components/ChineseTooltipText";
import type {
  DeepSeekMessage,
  DeepSeekReadingPromptResponse,
  DeepSeekV3Response,
} from "@shared/api";

type View = "dashboard" | "flashcards" | "reading" | "roleplay";
const readingPromptTTL = 24 * 60 * 60 * 1000;
const readingPromptCacheVersion = "v2";
const defaultReadingPrompt =
  "今天下班后，我去小区旁边的新咖啡馆点了一杯热拿铁，顺便和店员聊了几句最近的天气，感觉中文表达越来越自然。";

export default function LearningHub() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isFlowActive, setIsFlowActive] = useState(false);
  const [activeFlowIndex, setActiveFlowIndex] = useState(0);
  const [isRoleplayLoading, setIsRoleplayLoading] = useState(false);
  const [readingPrompt, setReadingPrompt] = useState(defaultReadingPrompt);
  const [isReadingPromptLoading, setIsReadingPromptLoading] = useState(false);
  const flowContainerRef = useRef<HTMLDivElement | null>(null);
  const slideRefs = useRef<Array<HTMLElement | null>>([]);

  // Stats & Progress
  const streakDays = 14;
  const statItems = [
    { label: "Flashcards", value: "1,248", icon: Layers, color: "text-blue-500" },
    { label: "Perfected", value: "376", icon: CheckCircle2, color: "text-emerald-500" },
    { label: "Dialogues", value: "42", icon: MessagesSquare, color: "text-amber-500" },
    { label: "Words Read", value: "7,930", icon: Eye, color: "text-purple-500" },
  ];

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
    const lastPrompt = window.localStorage.getItem(promptStorageKey);
    const lastPromptTimestampRaw = window.localStorage.getItem(
      promptTimestampStorageKey,
    );
    const lastPromptTimestamp = lastPromptTimestampRaw
      ? Number(lastPromptTimestampRaw)
      : 0;
    const isFresh =
      !!lastPrompt &&
      Number.isFinite(lastPromptTimestamp) &&
      Date.now() - lastPromptTimestamp < readingPromptTTL;

    if (isFresh && lastPrompt) {
      setReadingPrompt(lastPrompt);
      return;
    }

    const fetchReadingPrompt = async () => {
      setIsReadingPromptLoading(true);

      try {
        const response = await fetch("/api/ai/reading-prompt");
        const payload = (await response.json()) as
          | DeepSeekReadingPromptResponse
          | { error?: string };

        if (!response.ok || !("prompt" in payload)) {
          throw new Error(
            "error" in payload
              ? payload.error
              : "Could not generate the reading prompt.",
          );
        }

        setReadingPrompt(payload.prompt);
        window.localStorage.setItem(promptStorageKey, payload.prompt);
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
    setIsFlashcardFlipped(false);
    setTimeout(() => {
      slideRefs.current[index]?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const exitFlow = () => setIsFlowActive(false);

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

      const payload = (await response.json()) as DeepSeekV3Response & { error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Roleplay request failed");
      }

      setRoleplayMessages((prev) => [...prev, { role: "ai", text: payload.content }]);
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
                  <span className="font-heading font-bold text-xl tracking-tight hidden sm:inline">
                    Polysia
                  </span>
                </Link>
              </div>
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full border border-primary/20">
                  <Flame className="w-4 h-4 text-primary fill-primary" />
                  <span className="text-xs font-bold text-primary">{streakDays} days</span>
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
                <h1 className="text-3xl font-heading font-bold tracking-tight sm:text-5xl">
                  Start your learning session
                </h1>
                <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                  Move through flashcards, reading, and roleplay to keep your daily practice balanced.
                </p>
              </section>

              <section className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
                {[
                  {
                    name: "Flashcards",
                    desc: "Strengthen recall with active spaced repetition.",
                    icon: Zap,
                    index: 0,
                    objective: "20 cards due today",
                    progress: 65,
                    eta: "12 min",
                  },
                  {
                    name: "AI Reading",
                    desc: "Build comprehension with contextual short passages.",
                    icon: BookMarked,
                    index: 1,
                    objective: "2 passages planned",
                    progress: 50,
                    eta: "15 min",
                  },
                  {
                    name: "AI Roleplay",
                    desc: "Practice natural speaking in guided scenarios.",
                    icon: MessageCircle,
                    index: 2,
                    objective: "1 dialogue scenario",
                    progress: 0,
                    eta: "18 min",
                  },
                ].map((mode) => (
                  <article
                    key={mode.name}
                    className="group flex h-full flex-col rounded-3xl border bg-card p-5 transition-all duration-300 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10 sm:p-6"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10">
                          <mode.icon className="h-5 w-5 text-primary" />
                        </div>
                        <h3 className="text-2xl font-heading font-bold">{mode.name}</h3>
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
                    <h2 className="text-xl font-heading font-bold">Mode balance this week</h2>
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                      On track
                    </span>
                  </div>
                  <div className="space-y-4">
                    {[
                      { label: "Flashcards", minutes: 74, icon: Layers },
                      { label: "AI Reading", minutes: 68, icon: BookOpen },
                      { label: "AI Roleplay", minutes: 62, icon: MessageCircle },
                    ].map((item) => (
                      <div key={item.label} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-2 font-medium">
                            <item.icon className="h-4 w-4 text-primary" />
                            {item.label}
                          </span>
                          <span className="text-muted-foreground">{item.minutes} min</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-secondary">
                          <div
                            className="h-full rounded-full bg-primary/80"
                            style={{ width: `${Math.min(item.minutes, 80)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4 rounded-3xl border bg-card p-5 sm:p-6">
                  <h2 className="text-xl font-heading font-bold">Recent activity</h2>
                  <div className="space-y-3">
                    {[
                      { time: "2h ago", action: "Completed 15 flashcards", icon: CheckCircle2 },
                      { time: "5h ago", action: "Finished one reading passage", icon: BookOpen },
                      { time: "Yesterday", action: "Practiced cafe dialogue", icon: MessageCircle },
                    ].map((activity) => (
                      <div key={activity.action} className="flex items-start gap-3 rounded-2xl border bg-background p-3">
                        <div className="mt-0.5 rounded-xl bg-primary/10 p-2">
                          <activity.icon className="h-4 w-4 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium">{activity.action}</p>
                          <p className="text-xs text-muted-foreground">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {statItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.label}
                      className="rounded-2xl border bg-card p-4 transition-colors duration-300 hover:border-primary/30"
                    >
                      <div className="mb-3 flex items-start justify-between">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <TrendingUp className="h-4 w-4 text-primary" />
                      </div>
                      <p className="text-2xl font-heading font-bold">{item.value}</p>
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
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Learning Session</span>
            </div>
          </div>

          <div className="flow-shell" ref={flowContainerRef}>
            {/* Slide 1: Flashcards */}
            <section 
              ref={el => slideRefs.current[0] = el}
              className="flow-slide flex flex-col items-center justify-center px-5 pt-24 pb-32 sm:px-8 sm:py-10 bg-gradient-to-b from-background to-secondary/10"
            >
              <div className="w-full max-w-3xl space-y-8 sm:space-y-14 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="text-center space-y-3">
                  <h2 className="text-3xl sm:text-4xl font-heading font-bold tracking-tight">Flashcards</h2>
                  <p className="text-muted-foreground">Session progress: 8 of 24 cards</p>
                </div>
                
                <div className="relative aspect-[4/3] sm:aspect-[16/10] group perspective-1000">
                  <div className="absolute inset-0 bg-primary/20 blur-3xl opacity-20 -z-10" />
                  <button
                    type="button"
                    onClick={() => setIsFlashcardFlipped((prev) => !prev)}
                    onKeyDown={(event) => {
                      if (event.key === " " || event.key === "Spacebar") {
                        event.preventDefault();
                        setIsFlashcardFlipped((prev) => !prev);
                      }
                    }}
                    className="relative w-full h-full bg-card border-2 border-border rounded-[2rem] sm:rounded-[3rem] shadow-2xl p-6 sm:p-12 text-center transition-all duration-500 hover:border-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 overflow-hidden"
                    aria-label="Flip flashcard"
                    aria-pressed={isFlashcardFlipped}
                  >
                    <div
                      className={`absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-300 ${
                        isFlashcardFlipped ? "opacity-0" : "opacity-100"
                      }`}
                    >
                      <div className="relative w-full h-full">
                        <p className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[calc(100%+4.5rem)] sm:-translate-y-[calc(100%+5.5rem)] text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
                          Character
                        </p>
                        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-6xl sm:text-9xl font-bold tracking-tighter">
                          你好
                        </span>
                      </div>
                    </div>
                    <div
                      className={`absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-300 ${
                        isFlashcardFlipped ? "opacity-100" : "opacity-0"
                      }`}
                    >
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground mb-6 sm:mb-12">
                          Meaning
                        </p>
                        <span className="text-3xl sm:text-6xl font-bold tracking-tight mb-3">
                          Hello
                        </span>
                        <span className="text-base sm:text-2xl text-muted-foreground font-medium">
                          nǐ hǎo
                        </span>
                      </div>
                    </div>
                  </button>
                </div>

                <div className="hidden sm:grid sm:grid-cols-4 gap-4">
                  {["Again", "Hard", "Good", "Easy"].map((label, idx) => (
                    <button
                      key={label}
                      className="flex flex-col items-center gap-2 p-3 sm:p-4 rounded-2xl border bg-card hover:border-primary/30 hover:bg-secondary transition-all"
                    >
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{idx + 1}</span>
                      <span className="font-bold">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div
                className={`fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 p-2 backdrop-blur transition-opacity sm:hidden ${
                  activeFlowIndex === 0 ? "opacity-100" : "pointer-events-none opacity-0"
                }`}
              >
                <div className="mx-auto grid max-w-md grid-cols-4 gap-2">
                  {["Again", "Hard", "Good", "Easy"].map((label, idx) => (
                    <button
                      key={`mobile-${label}`}
                      className="flex flex-col items-center gap-1 rounded-xl border bg-card px-2 py-2 hover:border-primary/30 hover:bg-secondary transition-all"
                    >
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                        {idx + 1}
                      </span>
                      <span className="text-xs font-bold">{label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* Slide 2: AI Reading */}
            <section 
              ref={el => slideRefs.current[1] = el}
              className="flow-slide flex flex-col items-center justify-start sm:justify-center px-5 py-24 sm:px-8 sm:py-10 bg-gradient-to-b from-secondary/10 to-primary/5"
            >
              <div className="w-full max-w-6xl space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="text-center space-y-3">
                  <h2 className="text-3xl sm:text-4xl font-heading font-bold tracking-tight">AI Reading</h2>
                  <p className="text-muted-foreground">Practice comprehension with context</p>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-12 items-start">
                  <div className="order-1 space-y-8 lg:order-1 lg:col-span-2">
                    <article className="max-h-[72vh] overflow-y-auto p-6 sm:max-h-none sm:overflow-visible sm:p-10 rounded-[1.5rem] sm:rounded-[2.5rem] border bg-card shadow-xl leading-relaxed text-base sm:text-2xl space-y-6 sm:space-y-9">
                      <h3 className="text-2xl sm:text-4xl font-bold mb-4 sm:mb-8 font-heading">
                        <ChineseTooltipText text="每日阅读" />
                      </h3>
                      <p>
                        <ChineseTooltipText text={readingPrompt} />
                      </p>
                      {isReadingPromptLoading && (
                        <p className="text-sm text-muted-foreground">Generating today's prompt...</p>
                      )}

                      <div className="space-y-6 border-t pt-6 sm:hidden">
                        <div className="space-y-4">
                          <h3 className="font-bold text-lg">Context Quiz</h3>
                          <div className="p-4 rounded-2xl bg-secondary/50 border space-y-4">
                            <p className="text-sm font-medium leading-relaxed">
                              The speaker never talks with people at the market.
                            </p>
                            <div className="flex gap-2">
                              <Button variant="outline" className="flex-1 rounded-xl">
                                True
                              </Button>
                              <Button variant="outline" className="flex-1 rounded-xl">
                                False
                              </Button>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h3 className="font-bold text-lg">Key Vocabulary</h3>
                          <div className="flex flex-wrap gap-2">
                            {["市场", "对话", "复习", "能力", "提高"].map((word) => (
                              <span
                                key={`mobile-${word}`}
                                className="px-4 py-2 rounded-xl bg-secondary border text-sm font-medium cursor-pointer hover:border-primary/30 transition-colors"
                              >
                                <ChineseTooltipText text={word} />
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </article>
                  </div>

                  <aside className="order-2 hidden space-y-6 sm:block sm:space-y-8 lg:order-2">
                    <div className="p-5 sm:p-8 rounded-[1.5rem] sm:rounded-[2.5rem] border bg-card space-y-4 sm:space-y-6">
                      <h3 className="font-bold text-lg sm:text-xl">Context Quiz</h3>
                      <div className="space-y-4">
                        <div className="p-5 rounded-2xl bg-secondary/50 border space-y-4">
                          <p className="text-sm font-medium leading-relaxed">The speaker never talks with people at the market.</p>
                          <div className="flex gap-2">
                            <Button variant="outline" className="flex-1 rounded-xl">True</Button>
                            <Button variant="outline" className="flex-1 rounded-xl">False</Button>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-5 sm:p-8 rounded-[1.5rem] sm:rounded-[2.5rem] border bg-card">
                      <h3 className="font-bold mb-4 text-lg">Key Vocabulary</h3>
                      <div className="flex flex-wrap gap-2">
                        {["市场", "对话", "复习", "能力", "提高"].map(word => (
                          <span key={word} className="px-4 py-2 rounded-xl bg-secondary border text-sm font-medium cursor-pointer hover:border-primary/30 transition-colors">
                            <ChineseTooltipText text={word} />
                          </span>
                        ))}
                      </div>
                    </div>
                  </aside>
                </div>
              </div>
            </section>

            {/* Slide 3: AI Roleplay */}
            <section 
              ref={el => slideRefs.current[2] = el}
              className="flow-slide flex flex-col items-center justify-start sm:justify-center px-5 py-24 sm:px-8 sm:py-10 bg-gradient-to-b from-primary/5 to-background"
            >
              <div className="w-full max-w-4xl space-y-7 sm:space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="text-center">
                  <h2 className="text-3xl sm:text-4xl font-heading font-bold tracking-tight mb-2">AI Roleplay</h2>
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
