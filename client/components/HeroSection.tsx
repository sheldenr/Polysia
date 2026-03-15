import { Link } from "react-router-dom";

export default function HeroSection() {
  return (
    <section className="w-full px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">
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
      <div className="max-w-4xl mx-auto text-center">
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
          A minimalist language engine powered by spaced repetition and dynamic AI. Read and review only the words you actually care about learning.
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
