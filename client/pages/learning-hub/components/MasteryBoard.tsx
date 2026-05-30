import React, { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { ReviewCard } from "@/hooks/use-review-system";

interface MasteryBoardProps {
  cards: ReviewCard[];
}

const MasteryBoard = ({ cards }: MasteryBoardProps) => {
  const [filter, setFilter] = useState<"all" | "mastered" | "learning">("all");

  const filteredCards = useMemo(() => {
    let base = [...cards];
    if (filter === "mastered") {
      base = base.filter((c) => c.state === "REVIEW");
    } else if (filter === "learning") {
      base = base.filter((c) => c.state === "LEARNING" || c.state === "RELEARNING");
    }
    return base.sort((a, b) => (b.repetition || 0) - (a.repetition || 0));
  }, [cards, filter]);

  return (
    <div className="space-y-4 rounded-xl border bg-card p-5 sm:p-6 transition-all duration-300 hover:border-primary/30 dark:hover:border-primary/40 hover:shadow-2xl hover:shadow-black/5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-heading">Vocabulary mastery board</h2>
        <div className="flex p-1 bg-secondary/30 rounded-xl self-start sm:self-center border border-border/50">
          {(["all", "mastered", "learning"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={cn(
                "px-3 py-1 text-[10px] tracking-wider font-bold rounded-lg transition-all capitalize",
                filter === t ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 min-h-[100px] items-center">
        {filteredCards.map((card) => {
          const isMastered = card.state === "REVIEW";
          const isLearning = card.state === "LEARNING" || card.state === "RELEARNING";

          return (
            <div
              key={card.id}
              className={cn(
                "group relative flex flex-col items-center justify-center p-4 rounded-xl border transition-all duration-200 min-w-[80px] h-[80px] shrink-0",
                isMastered ? "bg-emerald-50/30 border-emerald-100/50 dark:bg-emerald-500/5 dark:border-emerald-500/20" : 
                isLearning ? "bg-amber-50/30 border-amber-100/50 dark:bg-amber-500/5 dark:border-amber-500/20" : 
                "bg-secondary/20 border-border/50"
              )}
            >
              <span className="text-2xl font-heading mb-0.5">{card.simplified}</span>
              <span className="text-[10px] text-muted-foreground font-medium truncate w-full text-center">
                {card.pinyin}
              </span>
              <div className={cn(
                "absolute top-2 right-2 w-1.5 h-1.5 rounded-full",
                isMastered ? "bg-emerald-500" : isLearning ? "bg-amber-500" : "bg-muted-foreground/30"
              )} />
            </div>
          );
        })}
        {filteredCards.length === 0 && (
          <div className="w-full py-8 text-center bg-secondary/5 rounded-xl border border-dashed">
            <p className="text-xs text-muted-foreground">No vocabulary in this category yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MasteryBoard;