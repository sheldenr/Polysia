import React, { useState } from "react";
import { ChevronLeft, Volume2, Plus, Loader2, ChevronRight, BookOpen, CheckCircle2, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Story } from "../hooks/use-story-hub";
import ChineseTooltipText from "@/components/ChineseTooltipText";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

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
  isStoryComplete: (storyId: string) => boolean;
  onToggleComplete: (storyId: string) => void;
  currentLevel?: number;
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
  isStoryComplete,
  onToggleComplete,
  currentLevel = 1,
}: StoryHubViewProps) => {
  const { toast } = useToast();
  const [isAdding, setIsAdding] = useState<string | null>(null);
  const [pinnedWord, setPinnedWord] = useState<string | null>(null);
  const [hoveredData, setHoveredData] = useState<{
    word: string;
    definition: string;
    sentence: string;
    translation: string;
  }>({ word: "", definition: "", sentence: "", translation: "" });

  const handleAddToReview = async (text: string) => {
    if (!text) return;

    setIsAdding(text);
    try {
      await onAddToReview(text);
      toast({
        title: "Added to Review",
        description: `"${text}" has been added to your daily review queue.`,
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
    const zhSentences = selectedStory.content_zh.split(/(?<=[。！？\n])/g).filter(Boolean);
    const enSentences = selectedStory.content_en?.split(/(?<=[.!?\n])/g).filter(Boolean) || [];

    return (
      <div className="relative min-h-full">
        <div className="relative z-10 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => {
                onSelectStory(null);
                setPinnedWord(null);
                setHoveredData({ word: "", definition: "", sentence: "", translation: "" });
              }}
              className="rounded-xl gap-2 text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="h-4 w-4" /> Back to Stories
            </Button>

            <div className="flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary/50 rounded-full border border-border/50 opacity-50 cursor-not-allowed">
                      <span className="text-[10px] font-mono w-8 text-center">{readingSpeed}x</span>
                      <input 
                        type="range" 
                        min="0.5" max="2.0" step="0.1" 
                        value={readingSpeed}
                        disabled
                        className="w-16 h-1 accent-primary pointer-events-none"
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>Audio settings (WIP)</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      disabled
                      className="h-9 w-9 rounded-xl border-border/50 opacity-50 cursor-not-allowed"
                    >
                      <Volume2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Listen to story (Coming Soon)</TooltipContent>
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
            <div className="bg-black/[0.03] dark:bg-white/[0.04] rounded-xl p-4 border border-border/50 transition-all min-h-16 flex flex-col justify-center">
              <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest mb-1">Current Sentence</span>
              <p className="text-sm font-medium italic">
                {hoveredData.translation || <span className="opacity-30">Click a word to see sentence translation</span>}
              </p>
            </div>
            <div className="bg-black/[0.03] dark:bg-white/[0.04] rounded-xl p-4 border border-border/50 transition-all min-h-16 flex flex-row items-center justify-between">
              <div className="flex flex-col justify-center">
                <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest mb-1">Word Definition</span>
                <p className="text-sm font-medium italic">
                  {hoveredData.word ? (
                    <><strong>{hoveredData.word}</strong>: {hoveredData.definition}</>
                  ) : (
                    <span className="opacity-30">Hover over a word for details</span>
                  )}
                </p>
              </div>
              {hoveredData.word && (
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="rounded-lg h-8 text-[10px] font-bold capitalize gap-2 border-primary/20 hover:border-primary/50 text-primary hover:bg-primary/5 transition-all"
                  onClick={() => handleAddToReview(hoveredData.word)}
                  disabled={!!isAdding}
                >
                  {isAdding === hoveredData.word ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
                  Add to Review
                </Button>
              )}
            </div>
          </div>

          <article className="w-full bg-black/[0.04] dark:bg-white/[0.06] rounded-xl p-8 sm:p-12 relative group/article">
            <div className="border-b border-border/50 pb-4">
              <div className="flex items-center justify-between mb-1">
                <div className="text-[10px] font-bold text-primary/60 uppercase tracking-widest">
                  {levelNames[selectedStory.hsk_level]}
                </div>
              </div>
              <h1 className="text-3xl font-heading leading-tight">{selectedStory.title_zh}</h1>
              <p className="text-muted-foreground italic">{selectedStory.title_en}</p>
            </div>

            <div className="relative">
              <div className="text-2xl sm:text-3xl leading-[2.5] sm:leading-[3] text-foreground transition-all select-text flex flex-wrap gap-y-4 sm:gap-y-6">
                {zhSentences.map((sentence, sIdx) => (
                  <div 
                    key={sIdx}
                    className="hover:bg-primary/5 rounded px-1 transition-colors"
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
                        } else if (!pinnedWord) {
                          setHoveredData(prev => ({ ...prev, word: "", definition: "" }));
                        }
                      }}
                      onTokenClick={(token, definition) => {
                        setPinnedWord(token);
                        setHoveredData(prev => ({ 
                          ...prev, 
                          word: token,
                          definition: definition?.english || "No definition found",
                          sentence: sentence,
                          translation: enSentences[sIdx] || "Translation unavailable"
                        }));
                      }}
                    />
                  </div>
                ))}
              </div>
              
              <div className="mt-12 pt-12 border-t border-border/50 flex flex-col items-start space-y-6">
                <div className="text-left space-y-2">
                  <h3 className="font-heading text-xl font-medium">Finished reading?</h3>
                  <p className="text-sm text-muted-foreground">Mark this story as complete to track your progress.</p>
                </div>
                
                <Button 
                  onClick={() => onToggleComplete(selectedStory.id)}
                  variant="outline"
                  className={cn(
                    "h-10 px-6 rounded-xl text-sm font-bold transition-all duration-300 gap-2 border-2",
                    isStoryComplete(selectedStory.id) 
                      ? "bg-emerald-500/5 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/10 hover:border-emerald-500/30" 
                      : "bg-background text-foreground border-border/50 hover:bg-muted/50 hover:border-border"
                  )}
                >
                  {isStoryComplete(selectedStory.id) ? (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      Story Completed
                    </>
                  ) : (
                    <>
                      Mark as Complete
                      <ChevronRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </article>
        </div>
      </div>
    );
  }

  // Storyline Detail Mode
  if (selectedCategory) {
    const categoryStories = stories.filter(s => s.category === selectedCategory);
    const storyline = categoryStories.length > 0 ? {
      name: selectedCategory,
      hsk_level: categoryStories[0].hsk_level,
      chapters: [...categoryStories].sort((a, b) => (a.chapter_number || 0) - (b.chapter_number || 0))
    } : null;

    if (storyline) {
      const progress = Math.round((categoryStories.filter(c => isStoryComplete(c.id)).length / Math.max(1, categoryStories.length)) * 100);

      return (
        <div className="relative min-h-full">
          <div className="relative z-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
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

            <div className="space-y-4 px-2">
              <div className="flex items-center gap-2 mb-2">
                <span className={cn("px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest bg-black/[0.03] dark:bg-white/[0.05]", levelColors[storyline.hsk_level])}>
                  {levelNames[storyline.hsk_level]}
                </span>
                <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">
                  {storyline.chapters.length} Chapters
                </span>
              </div>
              <h1 className="text-3xl font-heading tracking-tight">{storyline.name}</h1>
              <p className="text-muted-foreground leading-relaxed max-w-2xl">
                A {storyline.chapters.length}-part journey through {storyline.name.toLowerCase()}. Progress through each chapter to master the content.
              </p>
              
              <div className="flex flex-col gap-2 w-full max-w-[200px] pt-2">
                <div className="flex items-center justify-between text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                  <span>Overall Progress</span>
                  <span className="text-foreground">{progress}%</span>
                </div>
                <div className="h-1.5 w-full bg-black/[0.05] dark:bg-white/[0.05] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-700 ease-out" 
                    style={{ width: `${progress}%` }} 
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {storyline.chapters.map((chapter, idx) => {
                const isRead = isStoryComplete(chapter.id);
                const isNext = !isRead && (idx === 0 || isStoryComplete(storyline.chapters[idx-1].id));
                
                return (
                  <div 
                    key={chapter.id}
                    className={cn(
                      "group relative flex items-center justify-between p-4 rounded-2xl border transition-all duration-200 cursor-pointer hover:bg-muted/50",
                      isRead 
                        ? "bg-white dark:bg-card border-border/40 opacity-70" 
                        : isNext
                          ? "bg-white dark:bg-card border-primary/30 shadow-sm"
                          : "bg-black/[0.01] dark:bg-white/[0.01] border-border/30"
                    )}
                    onClick={() => onSelectStory(chapter)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="size-8 flex items-center justify-center text-[10px] font-bold transition-all">
                        {isRead ? <CheckCircle2 className="size-5 text-white" /> : (idx + 1).toString().padStart(2, '0')}
                      </div>
                      <div className="flex flex-col">
                        <h3 className={cn(
                          "font-heading text-base transition-colors",
                          isRead ? "text-foreground/60" : "text-foreground"
                        )}>
                          {chapter.title_zh}
                        </h3>
                        <div className="flex items-center gap-2">
                          <p className="text-xs text-muted-foreground italic opacity-70 line-clamp-1">{chapter.title_en}</p>
                          {chapter.created_at && (
                            <>
                              <span className="text-[10px] text-muted-foreground/30">•</span>
                              <span className="text-[10px] text-muted-foreground/40 font-medium">
                                {format(new Date(chapter.created_at), "MMM d")}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {isRead ? (
                        <span className="text-[8px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 px-2 py-0.5 rounded-lg">Done</span>
                      ) : isNext ? (
                        <span className="text-[8px] font-bold uppercase tracking-widest text-primary bg-primary/5 px-2 py-0.5 rounded-lg">Next</span>
                      ) : null}
                      <ChevronRight className={cn(
                        "size-4 transition-all duration-300",
                        isNext ? "text-primary translate-x-0" : "text-muted-foreground/30 -translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0"
                      )} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      );
    }
  }

  return null;
};

export default StoryHubView;
