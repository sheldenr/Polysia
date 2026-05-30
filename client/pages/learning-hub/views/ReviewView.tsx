import React, { useState, useRef } from "react";
import { Layers, ChevronLeft, Volume2, HelpCircle, CheckCircle2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReviewCard, ReviewMeta } from "@/hooks/use-review-system";
import { cn } from "@/lib/utils";
import ChineseTooltipText from "@/components/ChineseTooltipText";

interface ReviewViewProps {
  deck: ReviewCard[];
  meta: ReviewMeta | null;
  onSubmitAnswer: (cardId: string, rating: "AGAIN" | "HARD" | "GOOD" | "EASY") => Promise<void>;
  onExit: () => void;
}

const ReviewView = ({
  deck,
  meta,
  onSubmitAnswer,
  onExit,
}: ReviewViewProps) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [skipTransition, setSkipTransition] = useState(false);
  
  const currentCard = deck[0];
  const dueCount = deck.length;

  const handleRate = async (rating: "AGAIN" | "HARD" | "GOOD" | "EASY") => {
    if (!currentCard) return;
    setSkipTransition(true);
    setIsFlipped(false);
    
    // Small delay to allow flip animation to reset before content changes
    setTimeout(() => {
      setSkipTransition(false);
    }, 50);

    await onSubmitAnswer(currentCard.id, rating);
  };

  if (!currentCard) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 text-center animate-in fade-in duration-700">
        <div className="size-24 rounded-full bg-emerald-500/10 flex items-center justify-center">
           <CheckCircle2 className="h-12 w-12 text-emerald-500" />
        </div>
        <div>
          <h2 className="text-3xl font-heading mb-2">You're all caught up!</h2>
          <p className="text-muted-foreground max-w-sm mx-auto">
            Great job. You've reviewed all your characters for today. 
            Come back tomorrow or read some stories to add more!
          </p>
        </div>
        <Button onClick={onExit} variant="outline" className="rounded-xl px-8">
           Return to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onExit} className="rounded-xl gap-2 text-muted-foreground hover:text-foreground">
          <ChevronLeft className="h-4 w-4" /> End Session
        </Button>

        <div className="flex items-center gap-4">
           <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              {dueCount} Cards Remaining
           </div>
           <div className="w-32 h-1.5 bg-border/50 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-500" 
                style={{ width: `${Math.max(5, ( (meta?.reviewLimit || 50) - dueCount) / (meta?.reviewLimit || 50) * 100)}%` }} 
              />
           </div>
        </div>
      </div>

      <div className="flex flex-col items-center space-y-12 py-10">
        {/* Flashcard Component */}
        <div className="w-full max-w-md perspective-1000 h-[380px]">
          <div 
            onClick={() => setIsFlipped(!isFlipped)}
            className={cn(
              "relative w-full h-full transition-all duration-500 preserve-3d cursor-pointer group",
              isFlipped && "rotate-y-180",
              skipTransition && "duration-0"
            )}
          >
            {/* Front */}
            <div className="absolute inset-0 backface-hidden rounded-xl bg-black/[0.04] dark:bg-white/[0.06] flex flex-col items-center justify-center p-8 text-center hover:bg-black/[0.06] dark:hover:bg-white/[0.04] transition-all">
              <span className="text-[10px] font-bold uppercase tracking-widest text-primary/60 mb-8">Character</span>
              <div className="text-8xl font-heading mb-4">{currentCard.simplified}</div>
              <div className="mt-auto flex items-center gap-2 text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                 <HelpCircle className="h-3 w-3" /> Click to reveal
              </div>
            </div>

            {/* Back */}
            <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-xl bg-black/[0.04] dark:bg-white/[0.06] flex flex-col p-8 overflow-y-auto no-scrollbar">
               <div className="text-center border-b border-border/50 pb-6 mb-6">
                  <div className="text-4xl font-heading mb-1">{currentCard.simplified}</div>
                  <div className="text-xl font-medium text-primary">{currentCard.pinyin}</div>
               </div>

               <div className="space-y-6">
                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-primary/60 mb-2">Meaning</h4>
                    <p className="text-lg leading-snug">{currentCard.english}</p>
                  </div>

                  {currentCard.example_sentence && (
                    <div>
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-primary/60 mb-2">Example</h4>
                      <p className="text-base leading-relaxed mb-1">{currentCard.example_sentence}</p>
                      <p className="text-xs text-muted-foreground">{currentCard.notes.split('|')[1] || ""}</p>
                    </div>
                  )}
               </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="w-full max-w-lg space-y-6">
          {!isFlipped ? (
            <Button 
              onClick={() => setIsFlipped(true)}
              className="w-full h-14 text-lg font-heading rounded-xl shadow-sm hover:shadow-md transition-all"
            >
              Show Answer
            </Button>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-in fade-in zoom-in-95 duration-300">
               <RatingButton label="Again" sub="<1m" color="bg-rose-500" onClick={() => handleRate("AGAIN")} />
               <RatingButton label="Hard" sub="2d" color="bg-orange-500" onClick={() => handleRate("HARD")} />
               <RatingButton label="Good" sub="4d" color="bg-emerald-500" onClick={() => handleRate("GOOD")} />
               <RatingButton label="Easy" sub="7d" color="bg-blue-500" onClick={() => handleRate("EASY")} />
            </div>
          )}
          
          <div className="flex justify-center gap-6 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
             <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-500" /> Learning
             </div>
             <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Reviewing
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const RatingButton = ({ label, sub, color, onClick }: { label: string, sub: string, color: string, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className="flex flex-col items-center justify-center p-3 rounded-xl bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.06] dark:hover:bg-white/[0.04] transition-all group"
  >
    <span className={cn("text-xs font-bold uppercase tracking-widest mb-1 group-hover:scale-110 transition-transform", color.replace('bg-', 'text-'))}>{label}</span>
    <span className="text-[10px] text-muted-foreground font-mono">{sub}</span>
  </button>
);

export default ReviewView;
