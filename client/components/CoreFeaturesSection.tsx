import { motion } from "framer-motion";
import { 
  Zap, 
  Search, 
  Terminal, 
  Cpu, 
  Monitor, 
  Chrome, 
  FileText, 
  Mail, 
  Youtube, 
  Twitter,
  ArrowRight,
  Sparkles,
  Layers,
  BookOpen,
  Book,
  MessageCircle,
  Volume2
} from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: Layers,
    title: "Integrated SRS",
    description: "Instantly add words from stories to your daily spaced-repetition deck.",
    action: "Explore SRS",
  },
  {
    icon: Search,
    title: "Instant Dictionary",
    description: "One-tap lookups for any word or grammar point while you read.",
    action: "Try Reading",
  },
  {
    icon: MessageCircle,
    title: "AI Roleplay",
    description: "Practice real-life conversations with an AI that adapts to your HSK level.",
    action: "Go Practice",
  },
];

const capabilities = [
  {
    icon: BookOpen,
    title: "HSK Graded Stories",
    description: "Dozens of hand-crafted stories designed for every level from HSK 1 to 6.",
  },
  {
    icon: Volume2,
    title: "Audio Transcripts",
    description: "High-quality AI voices provide full synchronized audio for every single story.",
  },
  {
    icon: Book,
    title: "Grammar Guide",
    description: "A complete HSK grammar reference with hundreds of clear examples.",
  },
  {
    icon: Sparkles,
    title: "Ongoing Series",
    description: "Follow recurring characters through multi-chapter storylines and series.",
  },
];

export default function CoreFeaturesSection() {
  return (
    <section className="bg-white dark:bg-background text-foreground py-24 sm:py-32 px-6 lg:px-8 overflow-hidden">
      <div className="mx-auto max-w-3xl">
        {/* First Section: Features Grid */}
        <div className="mb-12">
          <motion.h2 
            initial={{ opacity: 0, y: 6 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="text-2xl sm:text-3xl font-heading mb-4 tracking-tight"
          >
            Turn your reading into <br />
            long-term memory.
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 6 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="text-base sm:text-lg text-muted-foreground max-w-xl leading-relaxed"
          >
            Polysia bridges the gap between passive reading <br />
            and active vocabulary mastery.
          </motion.p>
        </div>

        <div className="w-[min(90vw,900px)] -ml-[calc((min(90vw,900px)-100%)/2)] grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border/50 border-border/50 border rounded-2xl overflow-hidden mb-32 sm:mb-40 shadow-xl shadow-black/5 dark:shadow-none">
          {features.map((feature, i) => (
            <motion.div 
              key={feature.title}
              initial={{ opacity: 0, y: 6 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.15 + i * 0.05 }}
              className="p-6 sm:p-8 bg-card/50 dark:bg-zinc-900/50 backdrop-blur-sm flex flex-col gap-4 hover:bg-card dark:hover:bg-zinc-900 transition-colors"
            >
              <feature.icon className="h-5 w-5 text-primary" />
              <div className="space-y-1.5">
                <h3 className="text-base font-bold">{feature.title}</h3>
                <p className="text-muted-foreground text-xs leading-relaxed">{feature.description}</p>
              </div>
              <div className="mt-auto flex items-center gap-1.5 text-xs font-bold text-primary group/link cursor-pointer">
                <span>{feature.action}</span>
                <ArrowRight className="h-3 w-3 transition-transform group-hover/link:translate-x-0.5" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Second Section: Capability List */}
        <div className="max-w-3xl mb-12">
          <motion.h2 
            initial={{ opacity: 0, y: 6 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="text-2xl sm:text-3xl font-heading mb-4 tracking-tight"
          >
            Curated content for every step of your journey.
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 6 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="text-base sm:text-lg text-muted-foreground max-w-xl leading-relaxed"
          >
            From your first character to your first novel, <br />
            we provide the roadmap you need.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-12">
          {capabilities.map((cap, i) => (
            <motion.div 
              key={cap.title}
              initial={{ opacity: 0, y: 6 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.15 + (i * 0.05) }}
              className="space-y-3"
            >
              <div className="flex items-center gap-2 mb-1">
                <cap.icon className="h-5 w-5 text-primary/70" />
                {cap.title === "Web Importer" && (
                   <div className="flex gap-1">
                      <div className="size-3.5 rounded-full bg-[#4285F4]" />
                      <div className="size-3.5 rounded-full bg-[#EA4335]" />
                      <div className="size-3.5 rounded-full bg-[#FBBC05]" />
                      <div className="size-3.5 rounded-full bg-[#34A853]" />
                   </div>
                )}
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold">{cap.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">{cap.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
