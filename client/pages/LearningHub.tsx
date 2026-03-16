import { useEffect, useRef, useState } from "react";
import {
  BookOpen,
  Flame,
  Layers,
  MessageCircle,
  Mic,
  RefreshCcw,
  X,
} from "lucide-react";

type Mode = "dashboard" | "flow";

const slideIcons = [Layers, BookOpen, MessageCircle] as const;

export default function LearningHub() {
  const [mode, setMode] = useState<Mode>("dashboard");
  const [activeSlide, setActiveSlide] = useState(0);
  const [contentVisible, setContentVisible] = useState([false, false, false]);
  const flowContainerRef = useRef<HTMLDivElement | null>(null);
  const slideRefs = useRef<Array<HTMLElement | null>>([]);

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
          if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
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
        threshold: [0.4, 0.6, 0.8],
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
          background: linear-gradient(180deg, #f5f5f5 0%, #ececec 100%);
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
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem 1rem;
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
        <section className="min-h-screen bg-[#f5f5f5] px-4 sm:px-6 lg:px-8 pt-10 pb-8 sm:pb-10">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-center gap-2 mb-6 sm:mb-7">
              <img src="/logo only.svg" alt="Polysia logo" className="w-8 h-8" />
              <span className="text-2xl sm:text-[1.65rem] font-semibold tracking-tight text-black">Polysia</span>
            </div>

            <header className="flex items-center justify-between mb-6 sm:mb-8">
              <div>
                <p className="text-sm text-gray-500">Learning Hub</p>
                <h1 className="text-2xl sm:text-3xl font-semibold text-black">Ready to build momentum?</h1>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-zinc-200 to-zinc-300 flex items-center justify-center text-sm font-semibold text-zinc-700">
                SR
              </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 auto-rows-[170px] sm:auto-rows-[190px]">
              <div className="group md:col-span-2 rounded-2xl p-6 sm:p-7 bg-white border border-black/10 shadow-sm">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <p className="text-sm text-gray-500">Consistency</p>
                    <h2 className="text-2xl sm:text-3xl font-semibold text-black mt-1">14-Day Streak</h2>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                    <Flame className="w-5 h-5 text-[#3491b2] transition-all duration-300 group-hover:opacity-80 group-hover:-translate-y-0.5" />
                  </div>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-200 overflow-hidden">
                  <div className="h-full w-[68%] bg-gradient-to-r from-[#3491b2] to-[#2b7f9d]" />
                </div>
              </div>

              <button
                type="button"
                onClick={() => enterFlow(0)}
                className="group text-left rounded-2xl p-6 sm:p-7 bg-white border border-black/10 text-black shadow-sm hover:scale-[1.01] hover:bg-blue-50 hover:border-[#3491b2]/40 transition-all"
              >
                <Layers className="w-6 h-6 mb-7 text-[#3491b2] transition-all duration-300 group-hover:opacity-80 group-hover:-translate-y-0.5" />
                <p className="text-sm text-gray-600">Mode</p>
                <h3 className="text-2xl font-semibold">Flashcards</h3>
              </button>

              <button
                type="button"
                onClick={() => enterFlow(1)}
                className="group text-left rounded-2xl p-6 sm:p-7 bg-white border border-black/10 text-black shadow-sm hover:scale-[1.01] hover:bg-blue-50 hover:border-[#3491b2]/40 transition-all"
              >
                <BookOpen className="w-6 h-6 mb-7 text-[#3491b2] transition-all duration-300 group-hover:opacity-80 group-hover:-translate-y-0.5" />
                <p className="text-sm text-gray-600">Mode</p>
                <h3 className="text-2xl font-semibold">AI Reading</h3>
              </button>

              <button
                type="button"
                onClick={() => enterFlow(2)}
                className="group md:col-span-2 text-left rounded-2xl p-6 sm:p-7 bg-white border border-black/10 text-black shadow-sm hover:scale-[1.01] hover:bg-blue-50 hover:border-[#3491b2]/40 transition-all"
              >
                <MessageCircle className="w-6 h-6 mb-7 text-[#3491b2] transition-all duration-300 group-hover:opacity-80 group-hover:-translate-y-0.5" />
                <p className="text-sm text-gray-600">Feature</p>
                <h3 className="text-2xl font-semibold">AI Roleplay</h3>
              </button>
            </div>
          </div>
        </section>
      ) : (
        <div className="relative">
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-30 pointer-events-none flex items-center gap-2">
            <img src="/logo only.svg" alt="Polysia logo" className="w-7 h-7" />
            <span className="text-xl font-semibold tracking-tight text-black">Polysia</span>
          </div>

          <button
            type="button"
            onClick={exitFlow}
            className="fixed top-5 left-5 z-40 w-10 h-10 rounded-full bg-white/80 backdrop-blur border border-black/10 flex items-center justify-center text-black hover:bg-white transition-colors"
            aria-label="Exit learning flow"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="fixed right-4 sm:right-6 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-3">
            {slideIcons.map((Icon, index) => {
              const active = activeSlide === index;
              return (
                <button
                  key={`elevator-${index}`}
                  type="button"
                  onClick={() => goToSlide(index)}
                  className={`w-10 h-10 rounded-full border border-black/10 backdrop-blur flex items-center justify-center transition-all ${
                    active
                      ? "opacity-100 bg-white text-[#3491b2] shadow-[0_0_18px_rgba(52,145,178,0.35)]"
                      : "opacity-30 bg-white/70 text-black"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                >
                  <Icon className="w-5 h-5" />
                </button>
              );
            })}
          </div>

          <div className="flow-shell" ref={flowContainerRef}>
            <section
              ref={(el) => {
                slideRefs.current[0] = el;
              }}
              data-slide-index={0}
              className="flow-slide"
            >
              <div className="w-full max-w-xl space-y-4 text-center">
                <p
                  className={`entry-item text-xs uppercase tracking-[0.2em] text-gray-500 ${
                    contentVisible[0] ? "is-visible" : ""
                  }`}
                  style={{ transitionDelay: "0ms" }}
                >
                  Flashcards
                </p>
                <div
                  className={`entry-item relative rounded-3xl border border-white/40 bg-white/30 backdrop-blur-xl shadow-[0_30px_90px_-40px_rgba(0,0,0,0.4)] p-10 sm:p-14 ${
                    contentVisible[0] ? "is-visible" : ""
                  }`}
                  style={{ transitionDelay: "90ms" }}
                >
                  <p className="text-5xl sm:text-6xl font-semibold text-black">你好</p>
                  <p className="mt-3 text-sm text-gray-600">Tap to reveal meaning</p>
                  <RefreshCcw className="absolute bottom-4 right-4 w-4 h-4 text-gray-500" />
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
              <div className="w-full max-w-2xl space-y-4 text-center">
                <p
                  className={`entry-item text-xs uppercase tracking-[0.2em] text-gray-500 ${
                    contentVisible[1] ? "is-visible" : ""
                  }`}
                  style={{ transitionDelay: "0ms" }}
                >
                  AI Reading
                </p>
                <div
                  className={`entry-item rounded-3xl bg-white/75 border border-black/5 p-7 sm:p-10 text-left shadow-[0_30px_90px_-40px_rgba(0,0,0,0.35)] ${
                    contentVisible[1] ? "is-visible" : ""
                  }`}
                  style={{ transitionDelay: "90ms" }}
                >
                  <p className="text-lg leading-relaxed text-gray-700">
                    In the morning, I walk to the neighborhood market and buy fresh <span className="text-[#3491b2] underline decoration-[#3491b2]/40">fruit</span>.
                    On the way home, I usually practice one short <span className="text-[#3491b2] underline decoration-[#3491b2]/40">dialogue</span> from my lesson and review the new
                    <span className="text-[#3491b2] underline decoration-[#3491b2]/40"> vocabulary</span> before lunch.
                  </p>
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
              <div className="w-full max-w-xl space-y-4 text-center">
                <p
                  className={`entry-item text-xs uppercase tracking-[0.2em] text-gray-500 ${
                    contentVisible[2] ? "is-visible" : ""
                  }`}
                  style={{ transitionDelay: "0ms" }}
                >
                  AI Roleplay
                </p>

                <div
                  className={`entry-item rounded-3xl bg-white/80 border border-black/5 p-6 sm:p-7 shadow-[0_30px_90px_-40px_rgba(0,0,0,0.35)] ${
                    contentVisible[2] ? "is-visible" : ""
                  }`}
                  style={{ transitionDelay: "90ms" }}
                >
                  <div className="flex justify-center mb-5">
                    <div className="w-12 h-12 rounded-full bg-[#3491b2] text-white flex items-center justify-center animate-pulse">
                      AI
                    </div>
                  </div>

                  <div className="space-y-3 mb-8">
                    <div className="max-w-[85%] rounded-2xl bg-[#e7eff2] px-4 py-3 text-left text-sm text-gray-800">
                      AI: Tell me what you did this weekend in Chinese.
                    </div>
                    <div className="max-w-[85%] ml-auto rounded-2xl bg-[#3491b2] px-4 py-3 text-left text-sm text-white">
                      You: 我周末去了公园，还和朋友一起吃饭。
                    </div>
                  </div>

                  <button
                    type="button"
                    className="mx-auto w-16 h-16 rounded-full bg-[#3491b2] text-white flex items-center justify-center shadow-[0_0_25px_rgba(52,145,178,0.55)] hover:scale-105 transition-transform"
                    aria-label="Start speaking"
                  >
                    <Mic className="w-7 h-7" />
                  </button>
                </div>
              </div>
            </section>
          </div>
        </div>
      )}
    </>
  );
}
