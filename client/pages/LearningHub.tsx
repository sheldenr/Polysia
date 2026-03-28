import { useEffect, useRef, useState } from "react";
import {
  BookOpen,
  Circle,
  Clock3,
  Layers,
  MessageCircle,
  Mic,
  Moon,
  Settings,
  Sun,
  User,
  Eye,
  Flame,
  CheckCircle2,
  MessagesSquare,
  RefreshCcw,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";

type Mode = "dashboard" | "flow";

const slideModes = [
  { label: "Flashcards", icon: Layers },
  { label: "Reading", icon: BookOpen },
  { label: "Roleplay", icon: MessageCircle },
] as const;
const FLOW_SLIDE_ACTIVATION_THRESHOLD = 0.9;

export default function LearningHub() {
  const streakDays = 14;
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [mode, setMode] = useState<Mode>("dashboard");
  const [activeSlide, setActiveSlide] = useState(0);
  const [contentVisible, setContentVisible] = useState([false, false, false]);
  const flowContainerRef = useRef<HTMLDivElement | null>(null);
  const slideRefs = useRef<Array<HTMLElement | null>>([]);

  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [selectedReviewOption, setSelectedReviewOption] = useState<number | null>(null);
  const [roleplayMessages, setRoleplayMessages] = useState<Array<{ role: "ai" | "user"; text: string }>>([{ role: "ai", text: "你好！今天我们练习一个关于日常生活的对话。你能告诉我你今天做了什么吗？" }]);
  const [selectedScenario, setSelectedScenario] = useState("daily");
  const [customScenario, setCustomScenario] = useState("");
  const [roleplayInput, setRoleplayInput] = useState("");
  const [selectedReadingTf, setSelectedReadingTf] = useState<Record<number, "true" | "false">>({});

  const reviewOptions = [
    { label: "Again", key: "1", classes: "bg-[#edf4f8] text-[#24586f] hover:bg-[#e2edf4] dark:bg-zinc-800/80 dark:text-zinc-100 dark:hover:bg-zinc-700/85" },
    { label: "Poor", key: "2", classes: "bg-[#e5f0f6] text-[#1f5369] hover:bg-[#dbe9f2] dark:bg-zinc-800/80 dark:text-zinc-100 dark:hover:bg-zinc-700/85" },
    { label: "Good", key: "3", classes: "bg-[#d7e9f3] text-[#1a4f64] hover:bg-[#cee4f0] dark:bg-zinc-800/80 dark:text-zinc-100 dark:hover:bg-zinc-700/85" },
    { label: "Perfect", key: "4", classes: "bg-[#cbe3ef] text-[#184a5e] hover:bg-[#c1dcea] dark:bg-zinc-800/80 dark:text-zinc-100 dark:hover:bg-zinc-700/85" },
  ] as const;

  const flashcardStats = [
    { label: "Total Cards", value: "248", classes: "bg-[#dfe9ef] text-[#1d5268] dark:bg-zinc-800 dark:text-zinc-100", icon: Layers },
    { label: "Mastered", value: "126", classes: "bg-[#d4e7f2] text-[#184d62] dark:bg-zinc-800 dark:text-zinc-100", icon: CheckCircle2 },
    { label: "In Progress", value: "82", classes: "bg-[#c9e1ed] text-[#16485c] dark:bg-zinc-800 dark:text-zinc-100", icon: Clock3 },
    { label: "Not Started", value: "40", classes: "bg-[#bddaea] text-[#133f52] dark:bg-zinc-800 dark:text-zinc-100", icon: Circle },
  ] as const;

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
    if (mode !== "flow") {
      return;
    }

    const container = flowContainerRef.current;
    const slides = slideRefs.current.filter(Boolean) as HTMLElement[];
    if (!container || slides.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        let nextActive = activeSlide;
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio >= FLOW_SLIDE_ACTIVATION_THRESHOLD) {
            const idx = Number(entry.target.getAttribute("data-slide-index") ?? 0);
            nextActive = idx;
          }
        }
        if (nextActive !== activeSlide) {
          setActiveSlide(nextActive);
        }
      },
      {
        root: container,
        threshold: [0.6, FLOW_SLIDE_ACTIVATION_THRESHOLD, 0.98],
      }
    );

    for (const slide of slides) {
      observer.observe(slide);
    }

    return () => {
      observer.disconnect();
    };
  }, [mode, activeSlide]);

  useEffect(() => {
    if (mode !== "flow") {
      return;
    }

    const timeout = window.setTimeout(() => {
      setContentVisible((prev) => prev.map((_, index) => index === activeSlide));
    }, 150);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [activeSlide, mode]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMode("dashboard");
        setContentVisible([false, false, false]);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  useEffect(() => {
    if (mode !== "flow" || activeSlide !== 0) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) {
        return;
      }

      const optionIndex = Number(event.key) - 1;
      if (optionIndex < 0 || optionIndex > 3) {
        return;
      }

      event.preventDefault();
      setSelectedReviewOption(optionIndex);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [mode, activeSlide]);

  const enterFlow = (slideIndex: number) => {
    setMode("flow");
    setActiveSlide(slideIndex);
    setContentVisible([false, false, false]);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const target = slideRefs.current[slideIndex];
        target?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  };

  const exitFlow = () => {
    setMode("dashboard");
    setContentVisible([false, false, false]);
  };

  const goToSlide = (index: number) => {
    slideRefs.current[index]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const streakMotivation =
    streakDays >= 30
      ? "Momentum like this creates real fluency."
      : streakDays >= 14
      ? "Keep it up. You are building a strong rhythm."
      : "Great start. Stay steady and build your streak.";

  const statItems = [
    { label: "Total flashcards reviewed", value: "1,248" },
    { label: "Total words perfected", value: "376" },
    { label: "Conversations had", value: "42" },
    { label: "Words read", value: "7,930" },
  ] as const;

  const learningModes = [
    {
      name: "Flashcards",
      description: "Review and lock in vocabulary with quick spaced repetition.",
      icon: Layers,
      onClick: () => enterFlow(0),
    },
    {
      name: "AI Reading",
      description: "Read short passages with instant help for unfamiliar words.",
      icon: BookOpen,
      onClick: () => enterFlow(1),
    },
    {
      name: "AI Roleplay",
      description: "Practice realistic conversation prompts and spoken responses.",
      icon: MessageCircle,
      onClick: () => enterFlow(2),
    },
  ] as const;

  const roleplayScenarios = [
    { id: "daily", name: "Daily Life" },
    { id: "restaurant", name: "Restaurant" },
    { id: "shopping", name: "Shopping" },
    { id: "meeting", name: "Meeting Friends" },
  ] as const;

  const handleRoleplaySubmit = () => {
    if (!roleplayInput.trim()) {
      return;
    }

    const userMessage = roleplayInput.trim();
    setRoleplayMessages((prev) => [...prev, { role: "user", text: userMessage }]);
    setRoleplayInput("");

    setTimeout(() => {
      setRoleplayMessages((prev) => [
        ...prev,
        { role: "ai", text: "那很好！你能再告诉我更多的细节吗?" },
      ]);
    }, 500);
  };

  const readingTrueFalse = [
    {
      id: 1,
      statement: "The speaker never talks with people at the market.",
    },
    {
      id: 2,
      statement: "The speaker sometimes invites friends over for dinner.",
    },
  ] as const;

  return (
    <>
      <style>{`
        .flow-shell {
          width: 100vw;
          height: 100vh;
          overflow-y: auto;
          overflow-x: hidden;
          scroll-snap-type: y mandatory;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }

        .flow-shell::-webkit-scrollbar {
          display: none;
          width: 0;
          height: 0;
        }

        .flow-slide {
          width: 100vw;
          height: 100vh;
          scroll-snap-align: center;
          scroll-snap-stop: always;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .entry-item {
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 420ms ease, transform 420ms ease;
        }

        .entry-item.is-visible {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>

      {mode === "dashboard" ? (
        <div className="flex min-h-screen flex-col bg-[#eef4f8] text-[#102f40] transition-colors dark:bg-zinc-950 dark:text-zinc-100">
          <nav className="fixed inset-x-0 top-0 z-40 w-full border-b border-[#bdd6e2]/70 bg-[#f7fbfe]/75 backdrop-blur-md dark:border-white/10 dark:bg-zinc-950/90">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 sm:px-6 lg:px-8">
              <Link to="/" className="flex items-center gap-1.5" aria-label="Go to landing page">
                <img src="/logo only.svg" alt="Polysia logo" className="h-8 w-8" />
                <span className="hidden text-lg font-medium text-[#12364a] sm:inline dark:text-zinc-100">Polysia</span>
              </Link>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-full border border-[#b8d3df] bg-[#f8fcfe]/90 px-3 py-1.5 text-[#1f4f63] backdrop-blur dark:border-white/10 dark:bg-zinc-900/85 dark:text-zinc-100"
                  aria-label="Profile information"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#dceaf1] text-[#2d6780] dark:bg-zinc-800 dark:text-zinc-200">
                    <User className="h-4 w-4" />
                  </span>
                  <span className="text-sm font-medium text-[#1f4f63] dark:text-zinc-100">Shelden R.</span>
                </button>
                <button
                  type="button"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-[#b8d3df] bg-[#f8fcfe]/90 text-[#1f4f63] backdrop-blur dark:border-white/10 dark:bg-zinc-900/85 dark:text-zinc-100"
                  onClick={() => setIsDarkMode((prev) => !prev)}
                  aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
                >
                  {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </button>
                <button
                  type="button"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-[#b8d3df] bg-[#f8fcfe]/90 text-[#1f4f63] backdrop-blur dark:border-white/10 dark:bg-zinc-900/85 dark:text-zinc-100"
                  aria-label="Settings"
                >
                  <Settings className="h-4 w-4" />
                </button>
              </div>
            </div>
          </nav>

          <main className="flex-1 px-6 pb-10 pt-28 sm:px-6 sm:pb-12 lg:px-8">
            <div className="mx-auto max-w-6xl">
              <header className="mb-6 sm:mb-7">
                <p className="text-sm font-medium uppercase tracking-[0.1em] text-[#4f7689] dark:text-zinc-400">Learning Hub</p>
                  <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[#103346] dark:text-zinc-100 sm:text-3xl">
                  Keep your learning momentum.
                </h1>
              </header>

              <div className="mb-5 flex min-h-[132px] items-center rounded-2xl border border-[#c8dce6] bg-[#dfe9ef] p-5 dark:border-white/10 dark:bg-zinc-900 sm:min-h-[146px] sm:p-6">
                <div className="flex min-w-0 items-center gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#f7fbfe]/85 dark:bg-zinc-800 sm:h-16 sm:w-16">
                    <Flame className="h-7 w-7 text-[#3491b2] sm:h-8 sm:w-8" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-2xl font-semibold tracking-tight text-[#103346] dark:text-zinc-100 sm:text-3xl">
                      {streakDays}-day streak, keep it up
                    </p>
                    <p className="mt-2 text-sm text-[#44697b] dark:text-zinc-300">{streakMotivation}</p>
                  </div>
                </div>
              </div>

              <div className="mb-6 rounded-2xl border border-[#c8dce6] bg-[#f9fcfe] p-4 shadow-sm dark:border-white/10 dark:bg-zinc-900 sm:hidden">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#4f7689] dark:text-zinc-400">Quick Stats</p>
                <div className="mt-3 grid grid-cols-2 gap-2.5">
                  {statItems.map((item, index) => (
                    <article
                      key={`mobile-${item.label}`}
                      className="rounded-xl border border-[#d7e5ec] bg-[#f3f8fb] px-3 py-2.5 dark:border-white/10 dark:bg-zinc-800"
                    >
                      <div className="flex items-center gap-1.5">
                        {index === 0 && <Layers className="h-3.5 w-3.5 text-[#3491b2]" />}
                        {index === 1 && <CheckCircle2 className="h-3.5 w-3.5 text-[#3491b2]" />}
                        {index === 2 && <MessagesSquare className="h-3.5 w-3.5 text-[#3491b2]" />}
                        {index === 3 && <Eye className="h-3.5 w-3.5 text-[#3491b2]" />}
                        <p className="text-base font-semibold leading-none text-[#103346] dark:text-zinc-100">{item.value}</p>
                      </div>
                      <p className="mt-1 text-[11px] leading-snug text-[#547b8e] dark:text-zinc-400">{item.label}</p>
                    </article>
                  ))}
                </div>
              </div>

              <div className="mb-8 hidden auto-rows-fr grid-cols-1 gap-3 sm:grid sm:grid-cols-2 lg:grid-cols-4">
                {statItems.map((item, index) => (
                  <article
                    key={item.label}
                    className="flex h-full flex-col rounded-2xl border border-[#c8dce6] bg-[#f9fcfe] p-4 shadow-sm dark:border-white/10 dark:bg-zinc-900 sm:p-5"
                  >
                    <p className="text-sm text-[#547b8e] dark:text-zinc-400">{item.label}</p>
                    <div className="mt-3 flex items-center gap-2">
                      {index === 0 && <Layers className="h-4 w-4 text-[#3491b2]" />}
                      {index === 1 && <CheckCircle2 className="h-4 w-4 text-[#3491b2]" />}
                      {index === 2 && <MessagesSquare className="h-4 w-4 text-[#3491b2]" />}
                      {index === 3 && <Eye className="h-4 w-4 text-[#3491b2]" />}
                      <p className="text-2xl font-semibold tracking-tight text-[#103346] dark:text-zinc-100 sm:text-3xl">{item.value}</p>
                    </div>
                  </article>
                ))}
              </div>

              <div>
                <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-[#4f7689] dark:text-zinc-400">
                  Learning Modes
                </h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {learningModes.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.name}
                        type="button"
                        onClick={item.onClick}
                        className="group overflow-hidden rounded-2xl border border-[#c8dce6] text-left shadow-sm transition-transform hover:-translate-y-0.5 dark:border-white/10"
                      >
                        <div className="flex h-44 items-center justify-center bg-[#dfe9ef] p-6 dark:bg-zinc-900">
                          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[#f7fbfe]/85 dark:bg-zinc-800">
                            <Icon className="h-9 w-9 text-[#3491b2]" />
                          </div>
                        </div>
                        <div className="min-h-[150px] bg-[#f9fcfe] px-5 py-5 dark:bg-zinc-900">
                          <h3 className="text-xl font-semibold text-[#103346] dark:text-zinc-100">{item.name}</h3>
                          <p className="mt-2 text-sm leading-relaxed text-[#44697b] dark:text-zinc-300">{item.description}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </main>

          <footer className="border-t border-[#c8dce6] px-6 py-6 dark:border-zinc-800 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-6xl">
              <div className="flex flex-col gap-4 text-sm text-[#547b8e] dark:text-zinc-400 sm:flex-row sm:items-center sm:justify-between">
                <p>2026 Polysia. Keep learning, one day at a time.</p>
                <div className="flex items-center gap-4">
                  <Link to="/privacy" className="transition-colors hover:text-[#2b7f9d]">Privacy</Link>
                  <Link to="/terms" className="transition-colors hover:text-[#2b7f9d]">Terms</Link>
                  <Link to="/contact" className="transition-colors hover:text-[#2b7f9d]">Contact</Link>
                </div>
              </div>
            </div>
          </footer>
        </div>
      ) : (
        <div className="relative text-[#102f40] dark:text-zinc-100">
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-30 pointer-events-none flex items-center gap-2">
            <img src="/logo only.svg" alt="Polysia logo" className="w-7 h-7" />
            <span className="text-xl font-semibold tracking-tight text-[#103346] dark:text-zinc-100">Polysia</span>
          </div>

          <button
            type="button"
            onClick={exitFlow}
            className="fixed top-5 left-5 z-40 flex h-10 w-10 items-center justify-center rounded-full border border-[#b9d4e0] bg-[#f8fcfe]/90 text-[#12384b] backdrop-blur transition-colors hover:bg-[#f1f8fc] dark:border-white/10 dark:bg-zinc-900/90 dark:text-zinc-100 dark:hover:bg-zinc-800"
            aria-label="Exit learning flow"
          >
            <X className="h-5 w-5 shrink-0" />
          </button>

          <div className="fixed bottom-4 left-1/2 z-40 w-[calc(100vw-1.5rem)] max-w-md -translate-x-1/2 p-2.5 sm:bottom-auto sm:left-auto sm:right-1 sm:top-1/2 sm:w-56 sm:max-w-none sm:-translate-x-0 sm:-translate-y-1/2 sm:p-3">
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-1 sm:gap-2">
              {slideModes.map((item, index) => {
                const active = activeSlide === index;
                const Icon = item.icon;
                return (
                  <button
                    key={`elevator-${index}`}
                    type="button"
                    onClick={() => goToSlide(index)}
                    className={`flex items-center justify-center rounded-lg px-2 py-2 text-left text-xs font-medium transition-colors sm:justify-between sm:px-3 sm:text-sm ${
                      active
                        ? "bg-[#e7f2f8] text-[#1f5670] dark:bg-zinc-800 dark:text-zinc-100"
                        : "text-[#4f7689] hover:bg-[#eff6fa] dark:text-zinc-400 dark:hover:bg-zinc-900"
                    }`}
                    aria-label={`Go to ${item.label}`}
                  >
                    <span className="inline-flex items-center gap-2">
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="hidden sm:inline">{item.label}</span>
                    </span>
                    <span className={`hidden h-2 w-2 rounded-full sm:inline ${active ? "bg-[#3491b2]" : "bg-[#b7d2de] dark:bg-zinc-600"}`} />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flow-shell dark-gradient-dither bg-gradient-to-b from-[#eef5f9] to-[#ddeaf2] dark:from-zinc-950 dark:to-zinc-900" ref={flowContainerRef}>
            <section
              ref={(el) => {
                slideRefs.current[0] = el;
              }}
              data-slide-index={0}
              className="flow-slide"
            >
              <div className="w-full h-full flex items-center justify-center px-6 py-8 sm:px-6 lg:px-8">
                <div className="max-w-6xl w-full grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_280px]">
                  <div className="min-w-0">
                  <div
                    className={`entry-item flex min-h-[440px] w-full cursor-pointer flex-col items-center justify-center rounded-2xl border border-[#bfd7e3] bg-[#f9fcfe] p-8 text-center shadow-sm transition-all duration-300 dark:border-white/10 dark:bg-zinc-900 sm:min-h-[520px] sm:p-12 ${
                      contentVisible[0] ? "is-visible" : ""
                    }`}
                    style={{ transitionDelay: "90ms" }}
                    onClick={() => setIsCardFlipped(!isCardFlipped)}
                  >
                    {!isCardFlipped ? (
                      <div className="text-center">
                          <p className="mb-6 text-6xl font-bold text-[#0f3447] dark:text-zinc-100 sm:text-7xl">你好</p>
                          <p className="mb-2 text-base text-[#44697b] dark:text-zinc-300">他每天都向朋友说「你好」。</p>
                      </div>
                    ) : (
                      <div className="w-full space-y-8 text-center">
                        <div className="space-y-3">
                          <p className="text-5xl font-bold text-[#0f3447] dark:text-zinc-100 sm:text-6xl">你好</p>
                          <p className="text-3xl font-semibold text-[#103346] dark:text-zinc-100 sm:text-4xl">nǐ hǎo</p>
                          <p className="text-base text-[#315e74] dark:text-zinc-300">Hello; How are you?</p>
                        </div>
                        <div className="space-y-3">
                          <p className="text-base text-[#214f65] dark:text-zinc-200">他每天都向朋友说「你好」。</p>
                          <p className="text-sm text-[#4b7183] dark:text-zinc-400">Tā měi tiān dōu xiàng péngyou shuō "nǐ hǎo".</p>
                          <p className="text-base text-[#315e74] dark:text-zinc-300">He greets his friend with "hello" every day.</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div
                    className={`entry-item mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 ${
                      contentVisible[0] ? "is-visible" : ""
                    }`}
                    style={{ transitionDelay: "160ms" }}
                  >
                    {reviewOptions.map((option, index) => {
                      const isSelected = selectedReviewOption === index;
                      return (
                        <button
                          key={option.label}
                          type="button"
                          onClick={() => setSelectedReviewOption(index)}
                          className={`rounded-xl border px-4 py-3 text-sm font-semibold transition-all sm:text-base ${option.classes} ${
                            isSelected
                              ? "border-[#3491b2] ring-2 ring-[#3491b2]/45"
                              : "border-[#b9d4e0] dark:border-white/10"
                          }`}
                          aria-label={`${option.label} review quality`}
                        >
                          <span className="mr-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded bg-white/75 px-1 text-xs font-bold text-[#2d637b] dark:bg-zinc-900 dark:text-zinc-100">
                            {option.key}
                          </span>
                          {option.label}
                        </button>
                      );
                    })}
                  </div>

                  </div>

                  <aside
                    className={`entry-item rounded-2xl border border-[#bfd7e3] bg-[#f9fcfe]/95 p-4 shadow-sm dark:border-white/10 dark:bg-zinc-900/95 ${
                      contentVisible[0] ? "is-visible" : ""
                    }`}
                    style={{ transitionDelay: "210ms" }}
                  >
                    <p className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-[#4f7689] dark:text-zinc-400">Study Stats</p>
                    <div className="space-y-2.5">
                      {flashcardStats.map((stat) => {
                        const Icon = stat.icon;
                        return (
                          <article key={stat.label} className={`relative overflow-hidden rounded-xl px-3 py-3 ${stat.classes}`}>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] opacity-80">{stat.label}</p>
                            <p className="mt-1 text-2xl font-semibold leading-none">{stat.value}</p>
                            <Icon className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 opacity-85" />
                          </article>
                        );
                      })}
                    </div>
                  </aside>
                </div>
              </div>
            </section>

            <section
              ref={(el) => {
                slideRefs.current[1] = el;
              }}
              data-slide-index={1}
              className="flow-slide"
            >
              <div className="h-full w-full overflow-y-auto px-6 py-8 sm:px-6 lg:px-8">
                <div className="mx-auto flex h-full w-full max-w-6xl flex-col justify-center">
                  <div
                    className={`entry-item grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:gap-6 ${
                      contentVisible[1] ? "is-visible" : ""
                    }`}
                    style={{ transitionDelay: "90ms" }}
                  >
                    <article className="min-h-[340px] rounded-2xl border border-[#bfd7e3] bg-[#f9fcfe] p-6 text-left shadow-sm dark:border-white/10 dark:bg-zinc-900 sm:p-8 lg:min-h-[420px]">
                      <h3 className="mb-2 text-3xl font-semibold tracking-tight text-[#103346] dark:text-zinc-100 sm:text-4xl">
                        早市日常
                      </h3>
                      <div className="h-full overflow-y-auto pr-1">
                        <p className="mb-6 text-lg leading-relaxed text-[#315e74] dark:text-zinc-300">
                          每天早上，我都会去附近的市场买新鲜的水果。在回家的路上，我通常会练习一个简短的对话，复习新的词汇。有时候，我还会和市场上的商人用中文聊天，这样可以帮助我提高我的听力和口语能力。
                        </p>
                        <p className="mb-6 text-lg leading-relaxed text-[#315e74] dark:text-zinc-300">
                          午餐后，我喜欢在公园里散步。在那里，我看到很多人在做各种运动，比如太极拳、跑步和打羽毛球。有一次我和一个老奶奶聊天，她用非常清楚的中文告诉我关于她年轻时的故事。这些对话让我学到了很多新的短语和表达方式。
                        </p>
                        <p className="text-lg leading-relaxed text-[#315e74] dark:text-zinc-300">
                          傍晚时，我通常会回家准备晚餐。我喜欢做一些简单的中国菜，比如炒菜和汤。有时候我会邀请朋友来我家吃饭，我们一起吃饭、聊天和分享我们学习中文的经验。这是一个很好的方式来练习中文，同时也能享受美食和友谊。
                        </p>
                      </div>
                    </article>

                    <aside className="min-h-[340px] rounded-2xl border border-[#bfd7e3] bg-[#f9fcfe] p-5 shadow-sm dark:border-white/10 dark:bg-zinc-900 sm:p-6 lg:min-h-[420px]">
                      <div className="h-full overflow-y-auto pr-1">
                        <h4 className="mb-4 text-xl font-semibold text-[#103346] dark:text-zinc-100">True / False</h4>
                        <div className="space-y-3">
                          {readingTrueFalse.map((item) => (
                            <div key={item.id} className="rounded-xl border border-[#cfe1ea] bg-[#f4f9fc] p-3.5 dark:border-white/10 dark:bg-zinc-800">
                              <p className="mb-3 text-sm font-semibold text-[#1f4f63] dark:text-zinc-100">
                                {item.id}. {item.statement}
                              </p>
                              <div className="flex gap-2">
                                {[
                                  { label: "True", value: "true" as const },
                                  { label: "False", value: "false" as const },
                                ].map((option) => {
                                  const isSelected = selectedReadingTf[item.id] === option.value;
                                  return (
                                    <button
                                      key={option.value}
                                      type="button"
                                      onClick={() => setSelectedReadingTf((prev) => ({ ...prev, [item.id]: option.value }))}
                                      className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                                        isSelected
                                          ? "border-[#3491b2] bg-[#dcecf4] text-[#10394d] dark:bg-zinc-700 dark:text-zinc-100"
                                          : "border-[#c1d8e4] bg-[#fbfdff] text-[#315e74] hover:bg-[#eef6fb] dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
                                      }`}
                                    >
                                      {option.label}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </aside>
                  </div>
                </div>
              </div>
            </section>

            <section
              ref={(el) => {
                slideRefs.current[2] = el;
              }}
              data-slide-index={2}
              className="flow-slide"
            >
              <div className="h-full w-full overflow-y-auto px-6 py-8 sm:px-6 lg:px-8">
                <div className="mx-auto flex h-full w-full max-w-6xl flex-col justify-center">
                  <div
                    className={`entry-item grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:gap-6 ${
                      contentVisible[2] ? "is-visible" : ""
                    }`}
                    style={{ transitionDelay: "90ms" }}
                  >
                    <article className="min-h-[320px] rounded-2xl border border-[#bfd7e3] bg-[#f9fcfe] p-5 shadow-sm dark:border-white/10 dark:bg-zinc-900 sm:p-6 lg:min-h-[390px]">
                      <div className="mb-4 h-[185px] overflow-y-auto space-y-4 px-2 py-1 sm:h-[220px]">
                        {roleplayMessages.map((msg, idx) => (
                          <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                            {msg.role === "user" ? (
                              <div className="max-w-xs rounded-2xl bg-[#3491b2] px-4 py-3 text-base text-white">{msg.text}</div>
                            ) : (
                              <p className="max-w-[92%] text-base leading-relaxed text-[#2f5f75] dark:text-zinc-300">{msg.text}</p>
                            )}
                          </div>
                        ))}
                      </div>

                      <textarea
                        value={roleplayInput}
                        onChange={(e) => setRoleplayInput(e.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" && !event.shiftKey) {
                            event.preventDefault();
                            handleRoleplaySubmit();
                          }
                        }}
                        placeholder="Type your response... (Press Enter to send, Shift+Enter for a new line)"
                        className="h-24 w-full resize-none rounded-xl border border-[#b9d4e0] bg-[#f9fcfe] px-4 py-3 text-[#12384b] placeholder-[#7297a8] focus:border-[#3491b2] focus:outline-none dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder-zinc-500"
                      />
                    </article>

                    <aside className="min-h-[340px] rounded-2xl border border-[#bfd7e3] bg-[#f9fcfe] p-5 shadow-sm dark:border-white/10 dark:bg-zinc-900 sm:p-6 lg:min-h-[420px]">
                      <p className="mb-4 text-xs font-medium uppercase tracking-widest text-[#4f7689] dark:text-zinc-400">Scenarios</p>
                      <div className="space-y-2">
                        {roleplayScenarios.map((scenario) => (
                          <button
                            key={scenario.id}
                            onClick={() => setSelectedScenario(scenario.id)}
                            className={`w-full rounded-lg px-4 py-2 text-left text-sm font-medium transition-all ${
                              selectedScenario === scenario.id
                                ? "bg-[#3491b2] text-white"
                                : "bg-[#e3eef4] text-[#1d4e63] hover:bg-[#d8e8f1] dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
                            }`}
                          >
                            {scenario.name}
                          </button>
                        ))}

                        <div className="mt-4 border-t border-[#c6dbe6] pt-4 dark:border-zinc-700">
                          <label htmlFor="custom-scenario" className="mb-2 block text-xs font-medium uppercase tracking-widest text-[#4f7689] dark:text-zinc-400">
                            Custom Scenario
                          </label>
                          <textarea
                            id="custom-scenario"
                            value={customScenario}
                            onChange={(e) => {
                              const nextValue = e.target.value;
                              setCustomScenario(nextValue);
                              if (nextValue.trim()) {
                                setSelectedScenario("custom");
                              }
                            }}
                            placeholder="Describe your personal scenario..."
                            className="h-24 w-full resize-none rounded-lg border border-[#b9d4e0] bg-[#f9fcfe] px-3 py-2 text-sm text-[#12384b] placeholder-[#7297a8] focus:border-[#3491b2] focus:outline-none dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder-zinc-500"
                          />
                        </div>
                      </div>
                    </aside>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      )}
    </>
  );
}
