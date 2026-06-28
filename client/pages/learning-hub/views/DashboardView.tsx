import React, { useState } from "react";
import { 
  Book
} from "lucide-react";
import { ReviewMeta } from "@/hooks/use-review-system";
import { Story } from "../hooks/use-story-hub";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

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

const levelDotColors: Record<number, string> = {
  1: "bg-emerald-500",
  2: "bg-teal-500",
  3: "bg-amber-500",
  4: "bg-orange-500",
  5: "bg-red-500",
  6: "bg-purple-500",
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
    const id = story.storyline_id || "general";
    if (!acc[id]) {
      acc[id] = {
        id,
        name: story.storyline_id || "General Series",
        hsk_level: story.hsk_level,
        category: story.category,
        chapters: [],
      };
    }
    acc[id].chapters.push(story);
    return acc;
  }, {} as Record<string, { id: string; name: string; hsk_level: number; category: string; chapters: Story[] }>);

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
          className="group relative rounded-2xl bg-primary p-5 cursor-pointer shadow-sm hover:shadow-md transition-all overflow-hidden border border-primary/10"
        >
          <div className="relative z-10 flex flex-col h-full justify-between gap-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-white">Reference</span>
            <div className="space-y-1">
              <h3 className="text-lg font-heading font-bold text-white leading-tight">Grammar Hub</h3>
              <p className="text-[10px] text-white font-medium">HSK 1-6 Master Guide</p>
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
          </div>
        </div>
      </section>

      {/* Categories / Pills Filter Area */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          {/* View Tabs */}
          {(["all", "in-progress", "completed"] as const).map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all shadow-xs",
                  isActive 
                    ? "bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-900 shadow-sm font-semibold" 
                    : "bg-zinc-200/50 dark:bg-zinc-900/40 text-muted-foreground hover:bg-zinc-200 dark:hover:bg-zinc-800/50 hover:text-foreground"
                )}
              >
                {tab.replace("-", " ")}
              </button>
            );
          })}

          {/* Level Pills */}
          <div className="h-4 w-[1px] bg-border/60 mx-2" />
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={onClearLevels}
              className={cn(
                "px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all shadow-xs",
                selectedLevels.length === 0
                  ? "bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-900 shadow-sm font-semibold"
                  : "bg-zinc-200/50 dark:bg-zinc-900/40 text-muted-foreground hover:bg-zinc-200 dark:hover:bg-zinc-800/50 hover:text-foreground"
              )}
            >
              All Levels
            </button>
            {[1, 2, 3, 4, 5, 6].map((lvl) => {
              const isActive = selectedLevels.includes(lvl);
              return (
                <button 
                  key={lvl} 
                  onClick={() => onSelectLevel(lvl)}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all shadow-xs",
                    isActive
                      ? "bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-900 shadow-sm font-semibold"
                      : "bg-zinc-200/50 dark:bg-zinc-900/40 text-muted-foreground hover:bg-zinc-200 dark:hover:bg-zinc-800/50 hover:text-foreground"
                  )}
                >
                  <span className={cn("size-1.5 rounded-full shrink-0", levelDotColors[lvl])} />
                  {levelNames[lvl]}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Row-Based Story List */}
      <section className="space-y-4">
        <div className="grid grid-cols-12 px-6 py-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">
          <div className="col-span-8 px-2">Story Title</div>
          <div className="col-span-2">Added</div>
          <div className="col-span-2 text-right">Progress</div>
        </div>

        <div className="flex flex-col gap-3">
          {filteredStorylines.length > 0 ? (
            filteredStorylines.map((storyline) => {
              const progress = getProgress(storyline.chapters);
              const isFinished = progress === 100;

              return (
                <div 
                  key={storyline.name}
                  onClick={() => {
                    onSelectCategory(storyline.id);
                    onEnterFlow(1);
                  }}
                  className={cn(
                    "grid grid-cols-12 items-center p-5 px-6 cursor-pointer transition-all duration-300 group relative rounded-2xl bg-card border border-border/50 shadow-xs",
                    "hover:bg-white dark:hover:bg-zinc-800/80 hover:shadow-md hover:-translate-y-0.5",
                    "hover:z-10"
                  )}
                >
                  <div className="col-span-8 space-y-1 pr-4 px-2">
                    <h4 className="font-heading text-sm font-medium transition-colors line-clamp-1 group-hover:text-primary">
                      {storyline.name}
                    </h4>
                    <div className="flex items-center gap-2">
                      <span className={cn("size-1.5 rounded-full shrink-0", levelDotColors[storyline.hsk_level])} />
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
                        {levelNames[storyline.hsk_level]}
                      </p>
                      <span className="text-muted-foreground/30">•</span>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50">
                        {storyline.category}
                      </p>
                    </div>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">
                      {storyline.chapters[0]?.created_at && format(new Date(storyline.chapters[0].created_at), "MMM d, yyyy")}
                    </span>
                  </div>
                  <div className="col-span-2 flex flex-col items-end gap-1.5">
                    <div className="flex items-center gap-2 w-20">
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
              <Book className="size-10 text-muted-foreground/20 mb-3" />
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
