import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Download, ArrowRight, Play } from "lucide-react";
import { useAuth } from "@/lib/auth";
import ChineseTooltipText from "@/components/ChineseTooltipText";

export default function NewHeroSection() {
  const { isAuthenticated } = useAuth();
  const [activeSentence, setActiveSentence] = useState(0);

  const sentences = [
    {
      zh: "我的爸爸妈妈。",
      zh2: "他们很爱我。",
      pinyin: "Wǒ de bàba māma.",
      pinyin2: "Tāmen hěn ài wǒ.",
      en: "My mom and dad. They love me very much.",
      word: "我的",
      def: "My, mine"
    },
    {
      zh: "我叫西西。",
      zh2: "我是猫，我一岁。",
      pinyin: "Wǒ jiào Xīxi.",
      pinyin2: "Wǒ shì māo, wǒ yī suì.",
      en: "My name is Xixi. I am a cat, I am one year old.",
      word: "我叫",
      def: "I am called"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSentence((prev) => (prev + 1) % sentences.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative w-full overflow-hidden bg-white dark:bg-background px-6 pt-20 pb-0 sm:pt-24 lg:px-8 isolate">
      {/* Dot Grid Pattern with Center/Bottom Focus & Shimmer */}
      <div className="absolute inset-x-0 bottom-0 h-[600px] z-0 pointer-events-none" aria-hidden="true">
        {/* Base Grid */}
        <div 
          className="absolute inset-0 opacity-[0.6] dark:opacity-[0.4]" 
          style={{ 
            backgroundImage: `radial-gradient(circle at 1px 1px, #008EC2 1.2px, transparent 0)`,
            backgroundSize: '20px 20px',
            maskImage: 'radial-gradient(ellipse 60% 80% at 50% 100%, black, transparent)'
          }} 
        />
        {/* Shimmering Overlay Grid (Twinkle effect) */}
        <motion.div 
          animate={{ opacity: [0.2, 0.7, 0.2] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0" 
          style={{ 
            backgroundImage: `radial-gradient(circle at 1px 1px, #008EC2 1.6px, transparent 0)`,
            backgroundSize: '48px 48px',
            maskImage: 'radial-gradient(ellipse 50% 70% at 50% 100%, black, transparent)'
          }} 
        />
      </div>

      <div className="mx-auto max-w-3xl text-left flex flex-col items-start relative pb-0 z-10">
        {/* Logo Icon */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <img src="/logo only.svg" alt="Polysia" className="w-14 h-14" />
        </motion.div>

        {/* Headline */}
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-3xl sm:text-4xl lg:text-5xl font-heading font-semibold mb-5 tracking-tight leading-[1.05]"
        >
          Learn Chinese with stories <br />
          you can understand
        </motion.h1>

        {/* Subheadline */}
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-xl sm:text-2xl text-muted-foreground mb-6 max-w-2xl leading-relaxed"
        >
          Polysia has stories you can read at your level at a reasonable price.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center gap-4 mb-10 w-full sm:w-auto"
        >
          <Button
            size="default"
            asChild
            className="rounded-xl px-6 h-11 text-sm font-bold transition-all w-full sm:w-auto"
          >
            <Link to={isAuthenticated ? "/learning-hub" : "/signup"}>
              Start for free
            </Link>
          </Button>
          <Button
            variant="secondary"
            size="default"
            className="rounded-xl px-6 h-11 text-sm font-bold transition-all w-full sm:w-auto bg-black/[0.04] dark:bg-white/[0.08] hover:bg-black/[0.06] dark:hover:bg-white/[0.12] text-foreground border-none shadow-none"
            onClick={() => {
              document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Learn more
          </Button>
        </motion.div>

        {/* Story Pill (Appears occasionally) */}
        <motion.div 
          initial={{ opacity: 0, y: 10, scale: 0.9 }}
          animate={{ 
            opacity: [0, 1, 1, 0],
            y: [10, 0, 0, -10],
            scale: [0.95, 1, 1, 0.95]
          }}
          transition={{ 
            duration: 4,
            times: [0, 0.15, 0.85, 1],
            repeat: Infinity, 
            repeatDelay: 8,
            ease: "easeInOut"
          }}
          className="mb-6 self-center"
        >
          <div className="relative group overflow-hidden px-4 py-1.5 rounded-full bg-white dark:bg-[#1a1a1c] flex items-center justify-center shadow-sm">
            <span className="relative z-10 text-[9px] font-bold uppercase tracking-widest text-foreground flex items-center gap-2">
              <div className="size-1 rounded-full bg-foreground" />
              Story Chapter 1
            </span>
          </div>
        </motion.div>

        {/* Browser Window (The "Story Thing") */}
        <div className="w-full flex justify-center relative mt-4">
          <motion.div 
            className="w-[min(90vw,900px)] shrink-0 bg-white dark:bg-[#121214] rounded-t-xl overflow-hidden text-left h-[440px] relative group border-x border-t border-border shadow-2xl"
          >
            {/* Mock Showcase Header */}
            <div className="px-6 py-5 flex items-center justify-between">
              {/* Left: Nav Placeholder */}
              <div className="flex gap-4">
                <div className="h-2 w-12 rounded-full bg-foreground/[0.08]" />
                <div className="h-2 w-10 rounded-full bg-foreground/[0.04]" />
              </div>

              {/* Center: Settings Pill + Search */}
              <div className="flex items-center gap-2">
                <div className="h-8 px-4 rounded-full bg-white/70 dark:bg-zinc-800/70 backdrop-blur-md shadow-[0_2px_10px_rgb(0,0,0,0.06)] border border-white/20 dark:border-white/5 flex items-center gap-2">
                  <div className="size-1.5 rounded-full bg-primary" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Settings</span>
                </div>
                <div className="size-8 rounded-lg bg-white/70 dark:bg-zinc-800/70 backdrop-blur-md shadow-[0_2px_10px_rgb(0,0,0,0.06)] border border-white/20 dark:border-white/5 flex items-center justify-center text-muted-foreground">
                  <Search className="size-4" />
                </div>
              </div>

              {/* Right: Profile Placeholder */}
              <div className="size-9 rounded-full bg-white/70 dark:bg-zinc-800/70 backdrop-blur-md shadow-[0_2px_10px_rgb(0,0,0,0.06)] border border-white/20 dark:border-white/5 flex items-center justify-center">
                <div className="size-3.5 rounded-full bg-foreground/[0.08]" />
              </div>
            </div>

            {/* Browser Content */}
            <div className="p-8 sm:p-12 relative z-0">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeSentence}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-8"
                >
                  {/* Two Row Meaning Display (Unified Style) */}
                  <div className="grid gap-2">
                    <div className="bg-white/60 dark:bg-black/40 rounded-xl p-3 border border-border/50 h-14 flex flex-col justify-center shadow-sm">
                       <span className="text-[8px] font-bold text-muted-foreground/60 uppercase tracking-widest">Current Sentence</span>
                       <p className="text-xs italic truncate font-medium">{sentences[activeSentence].en}</p>
                    </div>
                    <div className="bg-white/30 dark:bg-black/20 rounded-xl p-3 border border-border/50 h-14 flex flex-col justify-center">
                       <span className="text-[8px] font-bold text-muted-foreground/60 uppercase tracking-widest">Word Definition</span>
                       <p className="text-xs font-medium truncate italic opacity-80">
                          <strong>{sentences[activeSentence].word}</strong>: {sentences[activeSentence].def}
                       </p>
                    </div>
                  </div>

                  {/* Large Content with Mock Cursor */}
                  <div className="relative pt-4 space-y-8">
                    <div className="flex flex-wrap items-end gap-x-3 gap-y-8">
                       <ChineseTooltipText 
                         text={sentences[activeSentence].zh} 
                         variant="landing-hero"
                         characterClassName="relative"
                         highlightText={sentences[activeSentence].word}
                       />
                    </div>

                    <div className="flex flex-wrap items-end gap-x-3 gap-y-8">
                       <ChineseTooltipText 
                         text={sentences[activeSentence].zh2} 
                         variant="landing-hero"
                         characterClassName="relative"
                       />
                    </div>
                    
                    {/* Mock Cursor */}
                    <motion.div 
                      animate={{ 
                        opacity: [1, 0, 1]
                      }}
                      transition={{ 
                        duration: 1, 
                        repeat: Infinity,
                        ease: "linear"
                      }}
                      className="absolute top-10 left-4 w-[2px] h-10 bg-[#008EC2] rounded-full"
                    />
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Animation indicator */}
              <div className="absolute bottom-10 right-10 flex items-center gap-2">
                 <div className="flex gap-1">
                   {sentences.map((_, i) => (
                     <div 
                       key={i} 
                       className={`size-1.5 rounded-full transition-all duration-300 ${activeSentence === i ? 'w-3 bg-primary' : 'bg-muted-foreground/30'}`} 
                     />
                   ))}
                 </div>
              </div>
            </div>
          </motion.div>
          {/* Horizontal Line moved to the bottom of the browser window */}
          <div className="absolute bottom-0 left-[-100vw] right-[-100vw] h-[1px] bg-border z-20 shadow-[0_1px_2px_rgba(0,0,0,0.05)]" />
        </div>
      </div>
    </section>
  );
}
