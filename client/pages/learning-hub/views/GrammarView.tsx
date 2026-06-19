import React, { useState } from "react";
import { ChevronLeft, Book, Info, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { grammarData, GrammarPoint } from "../utils/grammarData";

interface GrammarViewProps {
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
  1: "text-emerald-600/80 dark:text-emerald-400/70",
  2: "text-teal-600/80 dark:text-teal-400/70",
  3: "text-amber-600/85 dark:text-amber-400/75",
  4: "text-orange-600/80 dark:text-orange-400/70",
  5: "text-red-600/80 dark:text-red-400/70",
  6: "text-purple-600/80 dark:text-purple-400/70",
};

const GrammarView = ({ onExit }: GrammarViewProps) => {
  const [selectedLevel, setSelectedLevel] = useState<number>(1);
  const [selectedPoint, setSelectedPoint] = useState<GrammarPoint | null>(null);

  const currentLevelPoints = grammarData[selectedLevel] || [];

  return (
    <div className="h-full flex flex-col space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
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

      <div className="flex flex-col lg:flex-row gap-8 flex-1 min-h-0">
        {/* Levels Sidebar */}
        <div className="w-full lg:w-64 space-y-4 shrink-0">
          <div className="px-2">
            <h2 className="text-sm font-bold text-muted-foreground/60 uppercase tracking-widest mb-4">HSK Levels</h2>
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
              {[1, 2, 3, 4, 5, 6].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => {
                    setSelectedLevel(lvl);
                    setSelectedPoint(null);
                  }}
                  className={cn(
                    "flex items-center justify-between px-4 py-3 rounded-xl border transition-all text-left",
                    selectedLevel === lvl
                      ? "bg-white dark:bg-white/[0.05] border-primary/50 shadow-sm"
                      : "bg-transparent border-transparent hover:bg-black/[0.03] dark:hover:bg-white/[0.03] text-muted-foreground"
                  )}
                >
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">HSK {lvl}</span>
                    <span className={cn("text-sm font-semibold", selectedLevel === lvl && levelColors[lvl])}>
                      {levelNames[lvl]}
                    </span>
                  </div>
                  <span className="text-xs opacity-40 font-mono">{grammarData[lvl]?.length || 0}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 min-w-0 bg-white dark:bg-background rounded-2xl border border-border/50 shadow-sm flex flex-col overflow-hidden">
          {selectedPoint ? (
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 custom-scrollbar space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSelectedPoint(null)}
                className="rounded-lg gap-2 -ml-2 text-muted-foreground mb-4"
              >
                <ChevronLeft className="h-4 w-4" /> Back to List
              </Button>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className={cn("px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest bg-black/[0.03] dark:bg-white/[0.05]", levelColors[selectedLevel])}>
                    HSK {selectedLevel}
                  </div>
                </div>
                <h1 className="text-3xl font-heading tracking-tight">{selectedPoint.title}</h1>
                <div className="text-2xl font-medium text-primary flex items-center gap-2">
                  <Book className="h-6 w-6" />
                  {selectedPoint.chinese}
                </div>
              </div>

              <div className="bg-muted/30 rounded-2xl p-6 border border-border/50">
                <h3 className="text-xs font-bold text-muted-foreground/60 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Info className="h-3 w-3" /> Explanation
                </h3>
                <p className="text-lg leading-relaxed">{selectedPoint.description}</p>
              </div>

              <div className="space-y-4">
                <h3 className="text-xs font-bold text-muted-foreground/60 uppercase tracking-widest px-1">Examples</h3>
                <div className="grid gap-4">
                  {selectedPoint.examples.map((example, idx) => (
                    <div key={idx} className="group relative bg-muted/20 hover:bg-muted/40 transition-colors rounded-2xl p-6 border border-border/50">
                      <div className="space-y-2">
                        <div className="text-2xl font-medium tracking-wide">{example.zh}</div>
                        <div className="text-sm font-mono text-muted-foreground/80">{example.py}</div>
                        <div className="text-base italic text-muted-foreground pt-2 border-t border-border/30">{example.en}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col min-h-0">
              <div className="p-6 border-b border-border/50 bg-muted/5">
                <h2 className="text-xl font-heading font-medium">HSK {selectedLevel} Grammar Points</h2>
                <p className="text-xs text-muted-foreground mt-1">Select a rule to view explanation and examples</p>
              </div>
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {currentLevelPoints.map((point) => (
                    <button
                      key={point.id}
                      onClick={() => setSelectedPoint(point)}
                      className="group flex items-start gap-4 p-5 rounded-2xl border border-border/50 hover:border-primary/30 hover:bg-primary/[0.02] transition-all text-left shadow-[0_2px_8px_rgb(0,0,0,0.02)] dark:shadow-none"
                    >
                      <div className="h-8 w-8 rounded-full bg-primary/5 flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                        <CheckCircle2 className="h-4 w-4 text-primary/40 group-hover:text-primary transition-colors" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-heading text-base group-hover:text-primary transition-colors">{point.title}</h4>
                        <p className="text-xs font-medium text-muted-foreground opacity-70 italic">{point.chinese}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GrammarView;
