import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Download, ArrowRight, Play, Sparkles, Menu } from "lucide-react";
import { useAuth } from "@/lib/auth";
import ChineseTooltipText from "@/components/ChineseTooltipText";
import { GlowButton } from "@/components/ui/glow-button";

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
    <section className="relative w-full overflow-hidden bg-white dark:bg-background px-6 pt-20 pb-0 sm:pt-28 lg:pt-32 lg:px-8 isolate">
      {/* Modern Dot Field Background - Simple & Clean */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden transform-gpu" style={{ transform: 'translateZ(0)' }} aria-hidden="true">
        {/* Base Dot Grid - Very faint */}
        <div 
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
          style={{ 
            backgroundImage: `radial-gradient(circle at 1px 1px, var(--primary) 1px, transparent 0)`,
            backgroundSize: '32px 32px'
          }} 
        />
        
        {/* Single Subtle Twinkle */}
        <div 
          className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04] will-change-[opacity]"
          style={{ 
            backgroundImage: `radial-gradient(circle at 1px 1px, var(--primary) 1.5px, transparent 0)`,
            backgroundSize: '96px 96px',
            animation: 'simplePulse 12s ease-in-out infinite'
          }} 
        />

        {/* Gradient Overlay to fade dots - More performant than mask-image */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_80%,transparent_0%,white_95%)] dark:bg-[radial-gradient(circle_at_50%_80%,transparent_0%,hsl(var(--background))_95%)]" />

        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes simplePulse {
            0%, 100% { opacity: 0.01; }
            50% { opacity: 0.08; }
          }
        `}} />
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
          <GlowButton
            asChild
            className="w-full sm:w-auto"
          >
            <Link to={isAuthenticated ? "/learning-hub" : "/signup"}>
              Start for free
            </Link>
          </GlowButton>
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

        {/* Browser Window (The "Story Thing") */}
        <div className="w-full flex justify-center relative mt-16 sm:mt-24 transform-gpu" style={{ transform: 'translateZ(0)' }}>
          <motion.div 
            className="w-[min(90vw,900px)] shrink-0 bg-white/80 dark:bg-white/[0.03] backdrop-blur-md rounded-t-xl overflow-hidden text-left h-[440px] relative group border-x border-t border-border/50 shadow-2xl"
          >
            {/* Mock Showcase Header */}
            <div className="px-6 py-5 flex items-center justify-between">
              {/* Left: Icon + Nav Placeholder */}
              <div className="flex items-center gap-4 w-1/3">
                <Menu className="size-4 text-muted-foreground/60" />
                <div className="flex gap-2">
                  <div className="h-2 w-8 rounded-full bg-foreground/[0.08]" />
                  <div className="h-2 w-6 rounded-full bg-foreground/[0.04]" />
                </div>
              </div>

              {/* Center: Settings Pill */}
              <div className="flex justify-center w-1/3">
                <div className="h-8 px-4 rounded-full bg-white/70 dark:bg-zinc-800/70 backdrop-blur-md shadow-[0_2px_10px_rgb(0,0,0,0.06)] flex items-center">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Settings</span>
                </div>
              </div>

              {/* Right: Profile Placeholder */}
              <div className="flex justify-end w-1/3">
                <div className="size-9 rounded-full bg-white/70 dark:bg-zinc-800/70 backdrop-blur-md shadow-[0_2px_10px_rgb(0,0,0,0.06)] flex items-center justify-center">
                  <div className="size-3.5 rounded-full bg-foreground/[0.08]" />
                </div>
              </div>
            </div>

            {/* Browser Content */}
            <div className="p-8 sm:p-12 pt-4 sm:pt-6 relative z-0">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeSentence}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="space-y-6 sm:space-y-8 will-change-[transform,opacity]"
                >
                  {/* Two Row Meaning Display (Unified Style) */}
                  <div className="grid gap-2">
                    <div className="bg-white/60 dark:bg-white/[0.05] rounded-xl p-3 h-14 flex flex-col justify-center shadow-sm">
                       <span className="text-[8px] font-bold text-muted-foreground/60 uppercase tracking-widest">Current Sentence</span>
                       <p className="text-xs italic truncate font-medium">{sentences[activeSentence].en}</p>
                    </div>
                    <div className="bg-white/30 dark:bg-white/[0.02] rounded-xl p-3 h-14 flex flex-col justify-center">
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
                         characterClassName="relative font-light"
                         highlightText={sentences[activeSentence].word}
                       />
                    </div>

                    <div className="flex flex-wrap items-end gap-x-3 gap-y-8">
                       <ChineseTooltipText 
                         text={sentences[activeSentence].zh2} 
                         variant="landing-hero"
                         characterClassName="relative font-light"
                         highlightText={sentences[activeSentence].word}
                       />
                    </div>
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
          {/* Horizontal Line at the bottom of the showcase container */}
          <div className="absolute bottom-0 left-[-100vw] right-[-100vw] h-[2px] bg-border dark:bg-border z-20 shadow-[0_1px_4px_rgba(0,0,0,0.1)] dark:shadow-[0_1px_4px_rgba(255,255,255,0.05)]" />
        </div>
      </div>
    </section>
  );
}
