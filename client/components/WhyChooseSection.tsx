import { useState, useEffect } from "react";
import ChineseTooltipText from "./ChineseTooltipText";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";

type DemoMode = "flashcards" | "reading" | "roleplay";

function FlashcardDemo() {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full animate-in fade-in duration-700">
      <div className="w-full h-full bg-primary/15 flex flex-col items-center justify-center p-5 sm:p-16 relative overflow-hidden">
        <div className="text-center space-y-5 sm:space-y-10">
          <span className="text-[92px] sm:text-[180px] leading-none tracking-tighter text-foreground block font-heading whitespace-nowrap break-normal">早上</span>
          <div className="text-base sm:text-3xl font-medium text-muted-foreground font-heading max-w-4xl mx-auto leading-relaxed">
            <ChineseTooltipText text="早上好，你吃早饭了吗？" />
          </div>
        </div>
      </div>
    </div>
  );
}

function ReadingDemoContent() {
  const fullText = "今天下雨，我坐公共汽车去学校。雨很大，路上有很多水。公共汽车开得很慢，我等了很久。到了学校，我的衣服都湿了。书包也湿了，书在里面。我很不高兴。老师看见我，说：“你的衣服湿了，快换衣服。”我没有干衣服，所以我很冷。下午雨停了，太阳出来了。我回家换衣服，然后吃饭。今天真麻烦。";
  // Split text: first half is static, second half types in
  const splitIndex = Math.floor(fullText.length / 2);
  const staticPart = fullText.slice(0, splitIndex);
  const typingPart = fullText.slice(splitIndex);
  
  const [displayText, setDisplayText] = useState(staticPart);

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setDisplayText(staticPart + typingPart.slice(0, i));
      i++;
      if (i > typingPart.length) {
        clearInterval(interval);
      }
    }, 40);
    return () => clearInterval(interval);
  }, [staticPart, typingPart]);

  return (
    <div className="flex h-full flex-col justify-center p-4 sm:p-6 lg:p-8 animate-in fade-in duration-700">
      <h3 className="text-2xl sm:text-4xl mb-4 sm:mb-8 font-heading font-bold flex items-center gap-2 sm:gap-3 flex-wrap">
        <span className="text-foreground">下雨天的麻烦</span>
        <span className="text-sm sm:text-xl font-normal text-muted-foreground">
          (Trouble on a Rainy Day)
        </span>
      </h3>

      <div className="text-xl sm:text-4xl leading-[1.6] text-foreground font-normal font-heading overflow-hidden pr-2 min-h-[150px] sm:min-h-[200px]">
        <ChineseTooltipText text={displayText} />
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
          className={`inline-block w-[3px] h-[0.9em] bg-primary ml-1 align-middle ${
            displayText.length === fullText.length ? "hidden" : ""
          }`}
        />
      </div>
    </div>
  );
}

function RoleplayDemo() {
  const messages = [
    { role: "ai", text: "你好！欢迎光临。请问您想喝点什么？" },
    { role: "user", text: "我要一个大杯拿铁。" },
    { role: "ai", text: "好的，大杯拿铁。还需要别的吗？", correction: "Excellent. You can also say '请给我...' for a more formal order." },
  ];

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-700">
      <div className="flex-1 space-y-4 sm:space-y-6 overflow-hidden">
        {messages.map((msg, i) => (
          <div key={i} className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
            {msg.correction && (
              <div className="mb-2 sm:mb-3 max-w-[90%] px-3 py-2 sm:px-4 bg-amber-50 dark:bg-amber-900/30 border border-amber-200/50 dark:border-amber-800/50 rounded-2xl text-xs sm:text-sm text-amber-800 dark:text-amber-200 shadow-sm">
                <span className="font-bold mr-1 italic-serif">Tip:</span>{msg.correction}
              </div>
            )}
            <div className={`px-4 sm:px-6 py-3 sm:py-4 rounded-[1.25rem] sm:rounded-[2rem] text-base sm:text-2xl font-normal ${
              msg.role === "user" ? "bg-primary text-primary-foreground shadow-xl shadow-primary/10" : "bg-secondary text-foreground"
            }`}>
              <ChineseTooltipText text={msg.text} />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 sm:mt-6 flex gap-2 sm:gap-3">
        <div className="flex-1 h-10 sm:h-12 bg-background border border-border rounded-xl px-3 sm:px-4 flex items-center text-muted-foreground text-xs sm:text-sm italic">
        </div>
        <div className="h-10 w-10 sm:h-12 sm:w-12 bg-primary rounded-xl flex items-center justify-center text-primary-foreground">
          <HugeiconsIcon icon={ArrowRight01Icon} className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
      </div>
    </div>
  );
}

function MultiModeDemo() {
  const [mode, setMode] = useState<DemoMode>("flashcards");
  const modes: DemoMode[] = ["flashcards", "reading", "roleplay"];

  useEffect(() => {
    const interval = setInterval(() => {
      setMode((current) => {
        const nextIndex = (modes.indexOf(current) + 1) % modes.length;
        return modes[nextIndex];
      });
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const modeContent = {
    flashcards: {
      title: "Character Flashcards",
      subtitle: "Learning HSK 1 set · Learned 221/790",
    },
    reading: {
      title: "Tailored Reading",
      subtitle: "Practice authentic reading at your Beginner level.",
    },
    roleplay: {
      title: "Practice Conversations",
      subtitle: "Natural speaking in guided scenarios.",
    },
  };

  return (
    <div className="relative w-screen left-[50%] right-[50%] ml-[-50vw] mr-[-50vw] border-y border-border/50 bg-zinc-50 dark:bg-zinc-900/30 py-10 sm:py-24 mb-0 overflow-hidden">
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6">
        <div className="space-y-6 sm:space-y-8">
          <div className="text-center animate-in fade-in duration-500" key={`header-${mode}`}>
            <h2 className="text-2xl sm:text-3xl font-heading tracking-tight mb-1 text-foreground">
              {modeContent[mode].title}
            </h2>
            <p className="text-sm text-muted-foreground">
              {modeContent[mode].subtitle}
            </p>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl shadow-primary/5 border border-zinc-200 dark:border-white/10 p-4 sm:p-12 h-[420px] sm:h-[550px] flex flex-col justify-center relative overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={mode}
                initial={{ opacity: 0, filter: "blur(10px)" }}
                animate={{ opacity: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, filter: "blur(10px)" }}
                transition={{ 
                  duration: 0.4, 
                  ease: [0.19, 1, 0.22, 1] 
                }}
                className="h-full w-full relative z-10"
              >
                {mode === "flashcards" && <FlashcardDemo />}
                {mode === "reading" && <ReadingDemoContent />}
                {mode === "roleplay" && <RoleplayDemo />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function WhyChooseSection() {
  return (
    <section className="w-full overflow-hidden pb-0 pt-20 transition-colors duration-300 sm:pb-0 sm:pt-24">
      <div className="max-w-6xl mx-auto px-6">
        {/* Section Title */}
        <div className="mb-16 sm:mb-20">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-1 w-8 bg-primary rounded-full" />
            <span className="text-xs tracking-widest uppercase text-muted-foreground">
              Approach
            </span>
          </div>
          <h2 className="text-4xl sm:text-6xl font-heading mb-6 tracking-tight text-foreground lg:max-w-3x1">
            Language learning reimagined with{" "}
            <span className="italic-serif text-primary">AI.</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl leading-relaxed">
            Polysia generates authentic conversations, provides real-time feedback, and tracks your improvement over time, making language learning more effective and engaging than ever before.
          </p>
        </div>
      </div>

      <MultiModeDemo />
    </section>
  );
}
