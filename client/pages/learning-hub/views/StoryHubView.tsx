import React, { useState } from "react";
import { ChevronLeft, Volume2, Plus, Loader2, ChevronRight, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Story } from "../hooks/use-story-hub";
import ChineseTooltipText from "@/components/ChineseTooltipText";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface StoryHubViewProps {
  stories: Story[];
  selectedStory: Story | null;
  selectedCategory: string | null;
  onSelectStory: (story: Story | null) => void;
  onSelectCategory: (category: string | null) => void;
  showPinyin: boolean;
  onTogglePinyin: (show: boolean) => void;
  readingSpeed: number;
  onSetReadingSpeed: (speed: number) => void;
  isTTSLoading: boolean;
  onHandleTTS: () => void;
  onAddToReview: (text: string) => Promise<boolean>;
  onExit: () => void;
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
  1: "bg-emerald-500",
  2: "bg-sky-500",
  3: "bg-blue-500",
  4: "bg-indigo-500",
  5: "bg-purple-500",
  6: "bg-rose-500",
};

const StoryHubView = ({
  stories,
  selectedStory,
  selectedCategory,
  onSelectStory,
  onSelectCategory,
  showPinyin,
  onTogglePinyin,
  readingSpeed,
  onSetReadingSpeed,
  isTTSLoading,
  onHandleTTS,
  onAddToReview,
  onExit,
}: StoryHubViewProps) => {
  const { toast } = useToast();
  const [isAdding, setIsAdding] = useState<string | null>(null);
  const [hoveredData, setHoveredData] = useState<{
    word: string;
    definition: string;
    sentence: string;
  }>({ word: "", definition: "", sentence: "" });

  // Mark story as read when viewed
  React.useEffect(() => {
    if (selectedStory) {
      const readStories = JSON.parse(localStorage.getItem("read_stories") || "[]");
      if (!readStories.includes(selectedStory.id)) {
        readStories.push(selectedStory.id);
        localStorage.setItem("read_stories", JSON.stringify(readStories));
      }
    }
  }, [selectedStory]);

  const handleAddSelection = async () => {
    const selection = window.getSelection()?.toString().trim();
    if (!selection) return;

    if (selection.length > 10) {
      toast({
        title: "Selection too long",
        description: "Please select a single word or a short phrase.",
        variant: "destructive"
      });
      return;
    }

    setIsAdding(selection);
    try {
      await onAddToReview(selection);
      toast({
        title: "Added to Review",
        description: `"${selection}" has been added to your daily review queue.`,
      });
    } catch (err) {
      toast({
        title: "Failed to add",
        description: err instanceof Error ? err.message : "Something went wrong",
        variant: "destructive"
      });
    } finally {
      setIsAdding(null);
    }
  };

  // Reader Mode
  if (selectedStory) {
    // Split into sentences for hover tracking
    const sentences = selectedStory.content_zh.split(/(?<=[。！？\n])/g).filter(Boolean);

    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onSelectStory(null)}
            className="rounded-xl gap-2 text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" /> Back to Chapters
          </Button>

          <div className="flex items-center gap-2">
            <TooltipProvider>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary/50 rounded-full border border-border/50">
                <span className="text-[10px] font-mono w-8 text-center">{readingSpeed}x</span>
                <input 
                  type="range" 
                  min="0.5" max="2.0" step="0.1" 
                  value={readingSpeed}
                  onChange={(e) => onSetReadingSpeed(parseFloat(e.target.value))}
                  className="w-16 h-1 accent-primary"
                />
              </div>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={onHandleTTS}
                    disabled={isTTSLoading}
                    className="h-9 w-9 rounded-xl border-border/50"
                  >
                    <Volume2 className={cn("h-4 w-4", isTTSLoading && "animate-pulse text-primary")} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Listen to story</TooltipContent>
              </Tooltip>

              <Button
                variant={showPinyin ? "default" : "outline"}
                size="sm"
                onClick={() => onTogglePinyin(!showPinyin)}
                className="rounded-xl h-9 text-xs font-bold capitalize px-4"
              >
                Pinyin: {showPinyin ? "ON" : "OFF"}
              </Button>
            </TooltipProvider>
          </div>
        </div>

        {/* Hover Info Rows */}
        <div className="w-full grid gap-3">
          <div className="bg-black/[0.03] dark:bg-white/[0.04] rounded-xl p-4 border border-border/50 transition-all h-16 flex flex-col justify-center overflow-hidden">
             <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest mb-1">Current Sentence</span>
             <p className="text-sm font-medium line-clamp-1 italic">
                {hoveredData.sentence || <span className="opacity-30">Hover over any text to see meaning</span>}
             </p>
          </div>
          <div className="bg-black/[0.03] dark:bg-white/[0.04] rounded-xl p-4 border border-border/50 transition-all h-16 flex flex-col justify-center overflow-hidden">
             <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest mb-1">Word Definition</span>
             <p className="text-sm font-medium line-clamp-1 italic">
                {hoveredData.word ? (
                  <><strong>{hoveredData.word}</strong>: {hoveredData.definition}</>
                ) : (
                  <span className="opacity-30">Hover over a word for details</span>
                )}
             </p>
          </div>
        </div>

        <article className="w-full space-y-8 bg-black/[0.04] dark:bg-white/[0.06] rounded-xl p-8 sm:p-12 relative group/article">
          <div className="mb-8 border-b border-border/50 pb-6">
            <div className="text-[10px] font-bold text-primary/60 uppercase tracking-widest mb-1">
              {levelNames[selectedStory.hsk_level]}
            </div>
            <h1 className="text-3xl font-heading leading-tight">{selectedStory.title_zh}</h1>
            <p className="text-muted-foreground italic">{selectedStory.title_en}</p>
          </div>

          <div className="relative">
             <div className="text-2xl sm:text-3xl leading-[2.5] sm:leading-[3] text-foreground transition-all select-text flex flex-wrap">
               {sentences.map((sentence, sIdx) => (
                 <div 
                   key={sIdx}
                   className="hover:bg-primary/5 rounded px-1 transition-colors"
                   onMouseEnter={() => setHoveredData(prev => ({ ...prev, sentence }))}
                   onMouseLeave={() => setHoveredData(prev => ({ ...prev, sentence: "" }))}
                 >
                   <ChineseTooltipText 
                     text={sentence} 
                     variant="reading" 
                     showPinyin={showPinyin}
                     onTokenHover={(token, definition) => {
                       if (token) {
                         setHoveredData(prev => ({ 
                           ...prev, 
                           word: token, 
                           definition: definition?.english || "No definition found" 
                         }));
                       } else {
                         setHoveredData(prev => ({ ...prev, word: "", definition: "" }));
                       }
                     }}
                   />
                 </div>
               ))}
             </div>
             
             <div className="mt-12 pt-6 border-t border-dashed border-border/60 flex items-center justify-between text-muted-foreground">
                <p className="text-xs">Highlight any text to add it to your <strong>Review</strong> queue.</p>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="rounded-lg h-8 text-[10px] font-bold capitalize gap-2"
                  onClick={handleAddSelection}
                  disabled={!!isAdding}
                >
                  {isAdding ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
                  Add Selection to Review
                </Button>
             </div>
          </div>
        </article>
      </div>
    );
  }

  // Storyline Detail Mode
  const categoryStories = stories.filter(s => s.category === selectedCategory);
  const storyline = categoryStories.length > 0 ? {
    name: selectedCategory,
    hsk_level: categoryStories[0].hsk_level,
    chapters: [...categoryStories].sort((a, b) => (a.chapter_number || 0) - (b.chapter_number || 0))
  } : null;

  if (!storyline) return null;

  const readStories = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("read_stories") || "[]") : [];
  const progress = Math.round((categoryStories.filter(c => readStories.includes(c.id)).length / Math.max(1, categoryStories.length)) * 100);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex items-center justify-between">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onExit}
          className="rounded-xl gap-2 text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" /> Back to Dashboard
        </Button>
      </div>

      <div className="group relative bg-card dark:bg-[#121214] border border-border rounded-2xl p-8 sm:p-10 relative overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none">
        {/* Top Accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-primary/40" />

        <div className="absolute -right-8 -top-8 opacity-[0.03] dark:opacity-[0.05]">
           <BookOpen className="w-48 h-48" />
        </div>
        
        <div className="relative z-10 space-y-4">
          <div className="space-y-1">
            <div className={cn("text-[10px] font-bold uppercase tracking-widest", levelColors[storyline.hsk_level])}>
              {levelNames[storyline.hsk_level]} Path
            </div>
            <h1 className="text-4xl font-heading tracking-tight">{storyline.name}</h1>
            <p className="text-muted-foreground text-lg italic opacity-80">{storyline.chapters.length} chapters for this level.</p>
          </div>

          <div className="flex flex-col gap-2 w-full max-w-xs pt-2">
            <div className="flex items-center justify-between text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
              <span>Overall Progress</span>
              <span className="text-foreground">{progress}%</span>
            </div>
            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-foreground transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-heading px-2 font-medium">Chapters</h2>
        <div className="grid grid-cols-1 gap-3">
          {storyline.chapters.map((chapter, idx) => {
            const isRead = readStories.includes(chapter.id);
            return (
              <div 
                key={chapter.id}
                className="group relative flex items-center justify-between p-6 rounded-2xl bg-card dark:bg-[#121214] border border-border hover:border-primary/30 transition-all cursor-pointer shadow-[0_4px_20px_rgb(0,0,0,0.03)] dark:shadow-none overflow-hidden"
                onClick={() => onSelectStory(chapter)}
              >
                {/* Top Accent (Hover) */}
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary/40 opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="flex items-center gap-5">
                  <div className={cn(
                    "h-10 w-10 rounded-xl flex items-center justify-center text-sm font-bold transition-colors",
                    isRead ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-muted text-muted-foreground/60"
                  )}>
                    {idx + 1}
                  </div>
                  <div>
                    <h3 className="font-heading text-lg transition-colors group-hover:text-primary">{chapter.title_zh}</h3>
                    <p className="text-sm text-muted-foreground italic opacity-70">{chapter.title_en}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {isRead && (
                    <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg">Completed</span>
                  )}
                  <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform group-hover:text-primary" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StoryHubView;
