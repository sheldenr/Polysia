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
  MessageCircle,
  Volume2
} from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: Layers,
    title: "Integrated SRS",
    description: "Connect your reading library directly to your spaced-repetition deck.",
    action: "Explore SRS",
  },
  {
    icon: Search,
    title: "Instant Dictionary",
    description: "Look up any word or grammar point without leaving the story.",
    action: "View Demo",
  },
  {
    icon: Sparkles,
    title: "AI Analysis",
    description: "Extract grammar patterns and vocabulary automatically from any text.",
    action: "Docs",
  },
];

const capabilities = [
  {
    icon: BookOpen,
    title: "HSK Graded Stories",
    description: "Never forget about your progress with level-appropriate content.",
  },
  {
    icon: Volume2,
    title: "Audio Transcripts",
    description: "Natural AI voices with full synchronized text for listening.",
  },
  {
    icon: FileText,
    title: "Upload PDFs",
    description: "Extract content from PDFs and search them just like any other link.",
  },
  {
    icon: MessageCircle,
    title: "Contextual Chat",
    description: "Discuss stories with AI to improve your conversation skills.",
  },
];

export default function LandingFeaturesSection() {
  return (
    <section className="bg-white dark:bg-background text-foreground py-24 sm:py-32 px-6 lg:px-8 overflow-hidden">
      <div className="mx-auto max-w-3xl">
        {/* First Section: Features Grid */}
        <div className="mb-12">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl sm:text-3xl font-heading mb-4 tracking-tight"
          >
            Connect your reading to SRS, <br />
            AI tools, and more.
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-base sm:text-lg text-muted-foreground max-w-xl leading-relaxed"
          >
            Polysia integrates perfectly into your character study, <br />
            conversation practice, and research workflows.
          </motion.p>
        </div>

        <div className="w-[min(90vw,900px)] -ml-[calc((min(90vw,900px)-100%)/2)] grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border/50 border-border/50 border rounded-2xl overflow-hidden mb-32 sm:mb-40 shadow-xl shadow-black/5 dark:shadow-none">
          {features.map((feature, i) => (
            <motion.div 
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 + i * 0.1 }}
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
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl sm:text-3xl font-heading mb-4 tracking-tight"
          >
            Import stories or upload files with a click.
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-base sm:text-lg text-muted-foreground max-w-xl leading-relaxed"
          >
            Automatically sync news, site feeds, and <br />
            YouTube transcripts to your library.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-12">
          {capabilities.map((cap, i) => (
            <motion.div 
              key={cap.title}
              initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 + (i * 0.05) }}
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
