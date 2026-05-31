import React from "react";
import { 
  BookOpen, 
  ChevronRight, 
  Target, 
  Flame, 
  GraduationCap, 
  Zap, 
  Book, 
  Home, 
  Search, 
  Heart, 
  Plane, 
  Briefcase, 
  Globe, 
  FlaskConical, 
  Cpu, 
  PenTool, 
  Landmark, 
  History, 
  Sparkles, 
  Utensils, 
  Trophy 
} from "lucide-react";
import { motion } from "framer-motion";
import { ReviewCard, ReviewMeta } from "@/hooks/use-review-system";
import { LearningActivity } from "../hooks/use-learning-metrics";
import { Story } from "../hooks/use-story-hub";
import { cn } from "@/lib/utils";

interface DashboardViewProps {
  stats: {
    weeklyMinutes: number;
    dailyMinutes: number;
    modeMinutes: { review: number; reading: number; roleplay: number };
  };
  reviewMeta: ReviewMeta | null;
  reviewDeck: ReviewCard[];
  allActivities: LearningActivity[];
  stories: Story[];
  onEnterFlow: (index: number) => void;
  onSelectStory: (story: Story) => void;
  onSelectCategory: (category: string | null) => void;
  onSelectLevel: (level: number) => void;
  selectedLevels: number[];
}

const levelNames: Record<number, string> = {
  1: "Newbie",
  2: "Elementary",
  3: "Intermediate",
  4: "Upper Intermediate",
  5: "Advanced",
  6: "Master",
};

const levelColors: Record<number, string> = {
  1: "text-emerald-600 dark:text-emerald-400",
  2: "text-sky-600 dark:text-sky-400",
  3: "text-blue-600 dark:text-blue-400",
  4: "text-indigo-600 dark:text-indigo-400",
  5: "text-purple-600 dark:text-purple-400",
  6: "text-rose-600 dark:text-rose-400",
};

const levelBgColors: Record<number, string> = {
  1: "bg-emerald-500/40",
  2: "bg-sky-500/40",
  3: "bg-blue-500/40",
  4: "bg-indigo-500/40",
  5: "bg-purple-500/40",
  6: "bg-rose-500/40",
};

const DashboardView = ({
  stats,
  stories,
  reviewMeta,
  onEnterFlow,
  onSelectCategory,
  onSelectLevel,
  selectedLevels,
}: DashboardViewProps) => {
  const statItems = [
    { 
      label: "Current Streak", 
      value: `${reviewMeta?.streak || 0} Days`, 
      icon: Flame
    },
    { 
      label: "Learned Today", 
      value: reviewMeta?.newStartedToday || 0, 
      icon: GraduationCap
    },
    { 
      label: "Due for Review", 
      value: (reviewMeta?.reviewDueCount || 0) + (reviewMeta?.learningDueCount || 0), 
      icon: Zap
    },
    { 
      label: "Mastery Level", 
      value: levelNames[reviewMeta?.hskProgress.currentLevel || 1], 
      icon: Target
    },
  ];

  const groupedByStoryline = stories.reduce((acc, story) => {
    if (!acc[story.category]) {
      acc[story.category] = {
        name: story.category,
        hsk_level: story.hsk_level,
        chapters: [],
      };
    }
    acc[story.category].chapters.push(story);
    return acc;
  }, {} as Record<string, { name: string; hsk_level: number; chapters: Story[] }>);

  const storylines = Object.values(groupedByStoryline).sort((a, b) => {
    if (a.hsk_level !== b.hsk_level) return a.hsk_level - b.hsk_level;
    return a.name.localeCompare(b.name);
  });

  const filteredStorylines = storylines.filter(s => 
    selectedLevels.length === 0 || selectedLevels.includes(s.hsk_level)
  );

  const getProgress = (chapters: Story[]) => {
    if (typeof window === "undefined") return 0;
    const readStories = JSON.parse(localStorage.getItem("read_stories") || "[]");
    const readInThisStoryline = chapters.filter(c => readStories.includes(c.id)).length;
    return Math.round((readInThisStoryline / Math.max(1, chapters.length)) * 100);
  };

  return (
    <div className="space-y-8 pb-20 px-1">
      {/* Clean Stats Grid */}
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statItems.map((item) => (
          <div
            key={item.label}
            className="group relative rounded-2xl bg-card dark:bg-card border border-border p-6 flex flex-col gap-2 hover:border-primary/30 transition-all shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none overflow-hidden"
          >
            {/* Top Accent */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/20 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">{item.label}</span>
            </div>
            <p className="text-2xl font-heading tracking-tight">{item.value}</p>
          </div>
        ))}
      </section>

      {/* Grammar Quick Access */}
      <section 
        className="group relative rounded-2xl bg-primary/5 dark:bg-primary/10 border border-border p-6 cursor-pointer hover:bg-primary/10 transition-all overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:shadow-none"
        onClick={() => onEnterFlow(3)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Book className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-heading font-medium">Grammar Reference</h3>
              <p className="text-xs text-muted-foreground">Master {Object.values(levelNames).length} HSK levels of grammar rules with examples</p>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-primary group-hover:translate-x-1 transition-transform" />
        </div>
      </section>

      <section className="grid grid-cols-1 gap-8">
        <div className="space-y-10">
          {/* Stories Grid */}
          <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end justify-between px-1">
              <div className="space-y-1">
                <h2 className="text-2xl font-heading font-medium">Stories</h2>
                <p className="text-xs text-muted-foreground font-medium">
                  {selectedLevels.length === 0 
                    ? `${storylines.length} Storylines available across all levels`
                    : `${filteredStorylines.length} Storylines available for selected levels`
                  }
                </p>
              </div>

              {/* Difficulty Selector */}
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4, 5, 6].map((lvl) => (
                  <button 
                    key={lvl} 
                    onClick={() => onSelectLevel(lvl)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all duration-300",
                      selectedLevels.includes(lvl)
                        ? "bg-foreground/5 border-foreground text-foreground shadow-sm font-bold"
                        : "bg-transparent border-border text-muted-foreground hover:bg-muted/50"
                    )}
                  >
                    <span className="text-[9px] font-bold uppercase tracking-wider">
                      {levelNames[lvl]}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredStorylines.map((storyline) => {
                const progress = getProgress(storyline.chapters);
                const isFinished = progress === 100;
                const levelColor = levelColors[storyline.hsk_level];
                const levelBgColor = levelBgColors[storyline.hsk_level].replace("bg-", "text-");

                return (
                  <div 
                    key={storyline.name}
                    className="group relative rounded-2xl bg-white dark:bg-card border border-border/50 p-6 transition-all hover:border-primary/30 cursor-pointer flex flex-col shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] dark:shadow-none overflow-hidden"
                    onClick={() => {
                      onSelectCategory(storyline.name);
                      onEnterFlow(1);
                    }}
                  >
                    {/* Top Row: Icon & Status */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-zinc-900 dark:text-zinc-100">
                        <BookOpen className="size-5" strokeWidth={2} />
                      </div>
                      {isFinished ? (
                        <div className="flex items-center px-3 py-1 rounded-full bg-white dark:bg-black text-zinc-600 dark:text-zinc-400 text-[9px] font-bold uppercase tracking-wider shadow-[0_2px_8px_rgba(0,0,0,0.06)] dark:shadow-none">
                          Finished
                        </div>
                      ) : (
                        <div className="flex items-center px-3 py-1 rounded-full bg-white dark:bg-black text-zinc-500 dark:text-zinc-500 text-[9px] font-bold uppercase tracking-wider shadow-[0_2px_8px_rgba(0,0,0,0.06)] dark:shadow-none">
                          In Progress
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="space-y-1 mb-4 flex-1">
                      <h3 className="font-heading text-lg transition-colors group-hover:text-primary leading-tight">
                        {storyline.name}
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed opacity-70">
                        {storyline.chapters.map(c => c.title_en).join(" · ")}
                      </p>
                    </div>

                    {/* Details Row */}
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex flex-col">
                        <span className="text-[8px] font-bold text-muted-foreground/40 uppercase tracking-widest">Level</span>
                        <span className="text-[10px] font-bold">{levelNames[storyline.hsk_level]}</span>
                      </div>
                      <div className="w-[1px] h-4 bg-border dark:bg-white/10" />
                      <div className="flex flex-col">
                        <span className="text-[8px] font-bold text-muted-foreground/40 uppercase tracking-widest">Chapters</span>
                        <span className="text-[10px] font-bold">{storyline.chapters.length} Parts</span>
                      </div>
                    </div>

                    {/* Internal Divider - Just for progress */}
                    <div className="h-[1px] w-full bg-border dark:bg-white/10 mb-4" />

                    {/* Bottom Row: Simple Progress */}
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between text-[9px] font-bold text-muted-foreground/40 uppercase tracking-widest px-0.5">
                        <span>Progress</span>
                        <span className="text-foreground/60">{progress}%</span>
                      </div>
                      <div className="h-[2px] w-full bg-black/[0.03] dark:bg-white/[0.03] rounded-full overflow-hidden">
                        <div 
                          className={cn(
                            "h-full transition-all duration-1000 ease-out",
                            progress === 100 
                              ? "bg-zinc-900 dark:bg-zinc-100" 
                              : progress > 50 
                                ? "bg-zinc-600 dark:bg-zinc-400" 
                                : "bg-zinc-400 dark:bg-zinc-600"
                          )}
                          style={{ width: `${progress}%` }} 
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DashboardView;
