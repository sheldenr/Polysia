import React from "react";
import { BookOpen, ChevronRight, BarChart3, Target, Flame, GraduationCap, Zap, Book } from "lucide-react";
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
  filterLevel: number;
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
  1: "text-foreground",
  2: "text-foreground",
  3: "text-foreground",
  4: "text-foreground",
  5: "text-foreground",
  6: "text-foreground",
};

const levelBgColors: Record<number, string> = {
  1: "bg-muted-foreground/40",
  2: "bg-muted-foreground/40",
  3: "bg-muted-foreground/40",
  4: "bg-muted-foreground/40",
  5: "bg-muted-foreground/40",
  6: "bg-muted-foreground/40",
};

const DashboardView = ({
  stats,
  stories,
  reviewMeta,
  onEnterFlow,
  onSelectCategory,
  onSelectLevel,
  filterLevel,
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
        className="group relative rounded-2xl bg-primary/5 dark:bg-primary/10 border border-primary/20 p-6 cursor-pointer hover:bg-primary/10 transition-all overflow-hidden"
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
                  {storylines.filter(s => s.hsk_level === filterLevel).length} Storylines available for this level
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
                      filterLevel === lvl 
                        ? cn("bg-white dark:bg-card shadow-sm border-current ring-1 ring-current", levelColors[lvl])
                        : "bg-muted/50 border-transparent text-muted-foreground hover:bg-muted"
                    )}
                  >
                    <div className={cn("size-1.5 rounded-full", levelBgColors[lvl])} />
                    <span className="text-[9px] font-bold uppercase tracking-wider">
                      {levelNames[lvl]}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {storylines
                .filter((s) => s.hsk_level === filterLevel)
                .map((storyline) => {
                const progress = getProgress(storyline.chapters);
                const levelColor = levelColors[storyline.hsk_level];
                return (
                  <div 
                    key={storyline.name}
                    className="group relative rounded-2xl bg-card dark:bg-card border border-border p-6 transition-all hover:border-primary/30 cursor-pointer flex flex-col justify-between shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none overflow-hidden"
                    onClick={() => {
                      onSelectCategory(storyline.name);
                      onEnterFlow(1);
                    }}
                  >
                    {/* Top Accent */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-primary/40" />

                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className={cn("text-[10px] font-bold uppercase tracking-widest", levelColor)}>
                          {levelNames[storyline.hsk_level]}
                        </div>
                        <span className="text-[10px] text-muted-foreground font-medium">{storyline.chapters.length} Chapters</span>
                      </div>
                      <h3 className="font-heading text-lg mb-1 transition-colors group-hover:text-primary">
                        {storyline.name}
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-1 italic opacity-70">
                        {storyline.chapters.map(c => c.title_en).join(" · ")}
                      </p>
                    </div>
                    
                    <div className="mt-6 space-y-2">
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                        <span>Progress</span>
                        <span className="text-foreground">{progress}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-foreground transition-all duration-500" 
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
