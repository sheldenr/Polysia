import { Link } from "react-router-dom";

export default function HeroSection() {
  return (
    <section className="dark-gradient-dither relative isolate w-full overflow-hidden px-6 py-16 sm:px-6 sm:py-24 lg:px-8 lg:py-32">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 h-[52rem] w-[100rem] -translate-x-1/2 -translate-y-[58%] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(52,145,178,0.145) 0%, rgba(52,145,178,0.11) 22%, rgba(52,145,178,0.075) 40%, rgba(52,145,178,0.045) 58%, rgba(52,145,178,0.02) 72%, rgba(52,145,178,0) 86%)",
          filter: "blur(90px)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[36rem]"
        style={{
          opacity: 0.16,
          mixBlendMode: "multiply",
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180' viewBox='0 0 180 180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.95' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23n)' opacity='0.42'/%3E%3C/svg%3E\")",
          backgroundSize: "220px 220px",
          maskImage:
            "linear-gradient(to bottom, rgba(0,0,0,0.9), rgba(0,0,0,0.5) 55%, rgba(0,0,0,0))",
          WebkitMaskImage:
            "linear-gradient(to bottom, rgba(0,0,0,0.9), rgba(0,0,0,0.5) 55%, rgba(0,0,0,0))",
        }}
      />
      <style>{`
        @keyframes pill-border-glow {
          0% {
            box-shadow: 0 0 0 0 rgba(52,145,178,0.0);
            border-color: rgba(209,213,219,1);
          }
          50% {
            box-shadow: 0 0 0 3px rgba(52,145,178,0.08);
            border-color: rgba(52,145,178,0.45);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(52,145,178,0.0);
            border-color: rgba(209,213,219,1);
          }
        }
        .pill-border-animate {
          animation: pill-border-glow 3.5s ease-in-out infinite;
        }
      `}</style>
      <div className="relative z-10 mx-auto max-w-4xl text-center">
        {/* Animated Top Label */}
        <div className="mb-4 flex justify-center">
          <div className="inline-flex items-center rounded-full px-4 py-1 text-xs font-medium uppercase tracking-wide border border-gray-300 bg-white text-black dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 pill-border-animate">
            Start learning today
          </div>
        </div>

        {/* Main Heading */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight text-black dark:text-zinc-100">
          Learn Chinese <span className="font-serif italic text-[#3491b2]">faster.</span>
        </h1>

        {/* Subheading */}
        <p className="text-lg sm:text-xl text-gray-700 dark:text-zinc-300 mb-8 max-w-2xl mx-auto leading-relaxed">
          An adaptive language-learning platform powered by spaced repetition and DeepSeek V3.2. Read and review only the words you actually care about learning.
        </p>

        {/* CTA Button */}
        <Link
          to="/signup"
          className="inline-block bg-black text-white dark:bg-[#3491b2] dark:hover:bg-[#2b7f9d] font-semibold py-3 px-8 rounded-full hover:bg-gray-800 transition-colors shadow-lg hover:shadow-xl"
        >
          Try for free
        </Link>
      </div>
    </section>
  );
}
