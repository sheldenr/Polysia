import React, { useState } from "react";
import { 
  BookOpen, 
  ChevronRight, 
  GraduationCap, 
  Zap, 
  Book, 
  CheckCircle2,
  Clock
} from "lucide-react";
import { ReviewMeta } from "@/hooks/use-review-system";
import { Story } from "../hooks/use-story-hub";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface DashboardViewProps {
  stats: {
    weeklyMinutes: number;
    dailyMinutes: number;
    modeMinutes: { review: number; reading: number; roleplay: number };
  };
  reviewMeta: ReviewMeta | null;
  stories: Story[];
  onEnterFlow: (index: number) => void;
  onSelectStory: (story: Story) => void;
  onSelectCategory: (category: string | null) => void;
  onSelectLevel: (level: number) => void;
  onClearLevels: () => void;
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

const DashboardView = ({
  stats,
  stories,
  reviewMeta,
  onEnterFlow,
  onSelectCategory,
  onSelectLevel,
  onClearLevels,
  selectedLevels,
}: DashboardViewProps) => {
  const [activeTab, setActiveTab] = useState<"all" | "in-progress" | "completed">("all");

  const dueCount = (reviewMeta?.reviewDueCount || 0) + (reviewMeta?.learningDueCount || 0);

  const getProgress = (chapters: Story[]) => {
    if (typeof window === "undefined") return 0;
    const readStories = JSON.parse(localStorage.getItem("read_stories") || "[]");
    const readInThisStoryline = chapters.filter(c => readStories.includes(c.id)).length;
    return Math.round((readInThisStoryline / Math.max(1, chapters.length)) * 100);
  };

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

  const filteredStorylines = storylines.filter(s => {
    const matchesLevel = selectedLevels.length === 0 || selectedLevels.includes(s.hsk_level);
    const progress = getProgress(s.chapters);
    
    if (activeTab === "in-progress") return matchesLevel && progress > 0 && progress < 100;
    if (activeTab === "completed") return matchesLevel && progress === 100;
    return matchesLevel;
  });

  return (
    <div className="flex flex-col gap-8 pb-20 px-1 max-w-5xl mx-auto">
      {/* 4-Box Header Grid */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Box 1: Grammar Reference */}
        <div 
          onClick={() => onEnterFlow(3)}
          className="group relative rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 p-5 cursor-pointer shadow-sm hover:shadow-md transition-all overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:scale-110 transition-transform">
            <Book className="size-12 text-white" />
          </div>
          <div className="relative z-10 flex flex-col h-full justify-between gap-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/80">Reference</span>
            <div className="space-y-1">
              <h3 className="text-lg font-heading font-bold text-white leading-tight">Grammar Hub</h3>
              <p className="text-[10px] text-white/70 font-medium">HSK 1-6 Master Guide</p>
            </div>
          </div>
        </div>

        {/* Box 2: Weekly Minutes */}
        <div className="relative rounded-2xl bg-card border border-border/60 p-5 flex flex-col justify-between shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Weekly Practice</span>
          <div className="flex items-end gap-2">
            <p className="text-3xl font-heading tracking-tight">{stats.weeklyMinutes}</p>
            <span className="text-[10px] font-bold text-muted-foreground/40 pb-1.5 uppercase">Mins</span>
          </div>
        </div>

        {/* Box 3: Daily Minutes */}
        <div className="relative rounded-2xl bg-card border border-border/60 p-5 flex flex-col justify-between shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Daily Focus</span>
          <div className="flex items-end gap-2">
            <p className="text-3xl font-heading tracking-tight">{stats.dailyMinutes}</p>
            <span className="text-[10px] font-bold text-muted-foreground/40 pb-1.5 uppercase">Mins</span>
          </div>
        </div>

        {/* Box 4: Due Reviews */}
        <div 
          onClick={() => onEnterFlow(0)}
          className="relative rounded-2xl bg-card border border-border/60 p-5 flex flex-col justify-between shadow-sm cursor-pointer hover:border-primary/30 transition-colors"
        >
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Due for Review</span>
          <div className="flex items-end gap-2 justify-between">
            <p className={cn("text-3xl font-heading tracking-tight", dueCount > 0 ? "text-primary" : "text-muted-foreground/40")}>
              {dueCount}
            </p>
            <div className="size-8 flex items-center justify-center transition-all">
              <Zap className={cn("size-5 text-white", dueCount > 0 && "fill-white/20")} />
            </div>
          </div>
        </div>
      </section>

      {/* Categories / Pills Filter Area */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          {/* View Tabs */}
          <div className="flex p-1 bg-muted/30 rounded-xl mr-4">
            {(["all", "in-progress", "completed"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all",
                  activeTab === tab 
                    ? "bg-white dark:bg-zinc-800 shadow-sm text-foreground" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {tab.replace("-", " ")}
              </button>
            ))}
          </div>

          {/* Level Pills */}
          <div className="h-4 w-[1px] bg-border/60 mx-2" />
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={onClearLevels}
              className={cn(
                "px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider border transition-all",
                selectedLevels.length === 0
                  ? "bg-foreground/5 border-foreground text-foreground"
                  : "bg-transparent border-border text-muted-foreground hover:bg-muted/50"
              )}
            >
              All Levels
            </button>
            {[1, 2, 3, 4, 5, 6].map((lvl) => (
              <button 
                key={lvl} 
                onClick={() => onSelectLevel(lvl)}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider border transition-all",
                  selectedLevels.includes(lvl)
                    ? "bg-foreground/5 border-foreground text-foreground"
                    : "bg-transparent border-border text-muted-foreground hover:bg-muted/50"
                )}
              >
                {levelNames[lvl]}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Row-Based Story List */}
      <section className="space-y-4">
        <div className="grid grid-cols-12 px-6 py-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">
          <div className="col-span-1">Status</div>
          <div className="col-span-6 px-2">Story Title</div>
          <div className="col-span-2">Difficulty</div>
          <div className="col-span-3 text-right">Progress</div>
        </div>

        <div className="space-y-1 rounded-2xl overflow-hidden border border-border/50 bg-muted/20">
          {filteredStorylines.length > 0 ? (
            filteredStorylines.map((storyline, index) => {
              const progress = getProgress(storyline.chapters);
              const isFinished = progress === 100;
              const isStarted = progress > 0;

              return (
                <div 
                  key={storyline.name}
                  onClick={() => {
                    onSelectCategory(storyline.name);
                    onEnterFlow(1);
                  }}
                  className={cn(
                    "grid grid-cols-12 items-center p-4 px-6 cursor-pointer transition-all group relative rounded-xl",
                    index % 2 === 0 ? "bg-card" : "bg-muted/30",
                    "hover:z-10 hover:ring-1 hover:ring-primary hover:ring-inset"
                  )}
                >
                  <div className="col-span-1">
                    <div className="size-8 flex items-center justify-center transition-all">
                      {isFinished ? (
                        <CheckCircle2 className="size-5 text-emerald-500" />
                      ) : isStarted ? (
                        <Clock className="size-5 text-primary" />
                      ) : (
                        <BookOpen className="size-5 text-muted-foreground/40 group-hover:text-primary/60" />
                      )}
                    </div>
                  </div>
                  <div className="col-span-6 space-y-0.5 pr-4 px-2">
                    <h4 className="font-heading text-sm font-medium transition-colors line-clamp-1">
                      {storyline.name}
                    </h4>
                    <p className="text-[10px] text-muted-foreground/60 line-clamp-1 italic">
                      {storyline.chapters.map(c => c.title_en).join(" · ")}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <span className={cn("text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg bg-background/50 border border-border/20", levelColors[storyline.hsk_level])}>
                      {levelNames[storyline.hsk_level]}
                    </span>
                  </div>
                  <div className="col-span-3 flex flex-col items-end gap-1.5">
                    <div className="flex items-center gap-2 w-24">
                      <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={cn(
                            "h-full transition-all duration-1000",
                            isFinished ? "bg-emerald-500" : "bg-primary"
                          )}
                          style={{ width: `${progress}%` }} 
                        />
                      </div>
                      <span className="text-[10px] font-mono font-bold text-muted-foreground/60 w-8 text-right">
                        {progress}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center py-20 bg-card">
              <BookOpen className="size-10 text-muted-foreground/20 mb-3" />
              <p className="text-xs text-muted-foreground font-medium">No stories found matching your filters</p>
              <Button 
                variant="ghost" 
                size="sm" 
                className="mt-4 text-[10px] font-bold uppercase tracking-widest"
                onClick={() => { onClearLevels(); setActiveTab("all"); }}
              >
                Reset All Filters
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default DashboardView;
