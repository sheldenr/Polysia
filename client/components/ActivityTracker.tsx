import { startOfToday, eachDayOfInterval, subDays, format } from "date-fns";
import React, { useMemo, useState, useEffect, useRef } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface Activity {
  created_at: string;
  minutes_spent: number;
  action: string;
}

interface ActivityTrackerProps {
  activities: Activity[];
  variant?: "default" | "compact";
}

const ActivityTracker: React.FC<ActivityTrackerProps> = ({ activities, variant = "default" }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [days, setDays] = useState(variant === "compact" ? 42 : 70); 
  const [isMobile, setIsMobile] = useState(false);
  const today = startOfToday();

  useEffect(() => {
    if (!containerRef.current) return;

    const updateDays = () => {
      const width = containerRef.current?.offsetWidth || 0;
      const isMobileViewport = window.innerWidth < 640;
      setIsMobile(isMobileViewport);
      
      const colWidth = isMobileViewport ? 12 : 16;
      const numWeeks = Math.floor(width / colWidth);
      
      if (numWeeks > 0) {
        const computedDays = numWeeks * 7;
        
        const constrainedDays = isMobileViewport
          ? Math.max(28, computedDays)
          : computedDays;
        setDays(constrainedDays);
      }
    };

    const observer = new ResizeObserver(updateDays);
    observer.observe(containerRef.current);
    updateDays(); // Initial calculation

    return () => observer.disconnect();
  }, [variant]);

  const startDate = useMemo(() => subDays(today, days - 1), [today, days]);

  const dateRange = useMemo(() => {
    return eachDayOfInterval({ start: startDate, end: today });
  }, [startDate, today]);

  const activityMap = useMemo(() => {
    const map: Record<string, number> = {};
    activities.forEach((activity) => {
      // Only count character mastery/success events for the "characters studied" heatmap
      if (activity.action.includes("flashcard-success") || activity.action.includes("Studied")) {
        const dateKey = format(new Date(activity.created_at), "yyyy-MM-dd");
        
        // If it's a "Studied X cards" action, extract X
        const studiedMatch = activity.action.match(/Studied (\d+) cards/);
        const count = studiedMatch ? parseInt(studiedMatch[1], 10) : 1;
        
        map[dateKey] = (map[dateKey] || 0) + count;
      }
    });
    return map;
  }, [activities]);

  const getColorClass = (count: number) => {
    if (count === 0) return "bg-zinc-200 dark:bg-zinc-800";
    if (count < 10) return "bg-sky-200 dark:bg-sky-900";
    if (count < 25) return "bg-sky-300 dark:bg-sky-700";
    if (count < 50) return "bg-sky-400 dark:bg-sky-500";
    if (count < 100) return "bg-sky-500 dark:bg-sky-400";
    return "bg-sky-400 dark:bg-sky-300 shadow-[0_0_8px_rgba(56,189,248,0.6)] brightness-110";
  };

  const weeks: Date[][] = useMemo(() => {
    const result: Date[][] = [];
    let currentWeek: Date[] = [];

    dateRange.forEach((day) => {
      currentWeek.push(day);
      if (currentWeek.length === 7) {
        result.push(currentWeek);
        currentWeek = [];
      }
    });
    if (currentWeek.length > 0) {
      result.push(currentWeek);
    }
    return result;
  }, [dateRange]);

  const monthLabels = useMemo(() => {
    const labels: { label: string; index: number }[] = [];
    weeks.forEach((week, index) => {
      const firstDay = week[0];
      if (index === 0 || firstDay.getDate() <= 7) {
        const label = format(firstDay, "MMM");
        if (labels.length === 0 || labels[labels.length - 1].label !== label) {
          labels.push({ label, index });
        }
      }
    });
    return labels;
  }, [weeks]);

  return (
    <div className={cn(
      "w-full flex flex-col justify-between rounded-3xl border bg-card transition-all duration-300 hover:border-zinc-400 dark:hover:border-zinc-600 hover:shadow-lg hover:shadow-black/5",
      "p-5 sm:p-6 space-y-4"
    )}>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-heading">Characters Mastered</h2>
        <div className={cn("hidden items-center text-muted-foreground sm:flex", variant === "compact" ? "gap-1 text-[8px]" : "gap-1.5 text-[10px]")}>
          <span>0</span>
          <div className={cn("rounded-sm bg-zinc-200 dark:bg-zinc-800", variant === "compact" ? "h-2 w-2" : "h-2.5 w-2.5")} />
          <div className={cn("rounded-sm bg-sky-200 dark:bg-sky-900", variant === "compact" ? "h-2 w-2" : "h-2.5 w-2.5")} />
          <div className={cn("rounded-sm bg-sky-300 dark:bg-sky-700", variant === "compact" ? "h-2 w-2" : "h-2.5 w-2.5")} />
          <div className={cn("rounded-sm bg-sky-400 dark:bg-sky-500", variant === "compact" ? "h-2 w-2" : "h-2.5 w-2.5")} />
          <div className={cn("rounded-sm bg-sky-500 dark:bg-sky-400", variant === "compact" ? "h-2 w-2" : "h-2.5 w-2.5")} />
          <div className={cn("rounded-sm bg-sky-400 dark:bg-sky-300 brightness-110", variant === "compact" ? "h-2 w-2" : "h-2.5 w-2.5")} />
          <span>100+</span>
        </div>
      </div>

      <div className="relative py-4 sm:py-6" ref={containerRef}>
        {/* Month Labels */}
        <div className={cn("mb-1.5 hidden min-w-max text-muted-foreground sm:flex", variant === "compact" ? "h-2.5 text-[8px]" : "h-3 text-[9px]")}>
          {weeks.map((_, i) => {
            const monthLabel = monthLabels.find(l => l.index === i);
            return (
              <div key={i} className={cn("flex-none relative", variant === "compact" ? "w-[12px] sm:w-[14px]" : "w-[12px] sm:w-[16px]")}>
                {monthLabel && <span className="absolute left-0 whitespace-nowrap">{monthLabel.label}</span>}
              </div>
            );
          })}
        </div>

        <div className="flex justify-start">
          <div className={cn("flex w-full justify-between", variant === "compact" ? "gap-[2px]" : "gap-[2px] sm:gap-[4px]")}>
            <TooltipProvider delayDuration={0}>
              {weeks.map((week, weekIdx) => (
                <div key={weekIdx} className={cn("flex flex-col justify-between", variant === "compact" ? "gap-[2px]" : "gap-[2px] sm:gap-[4px]")}>
                  {week.map((day) => {
                    const dateKey = format(day, "yyyy-MM-dd");
                    const count = activityMap[dateKey] || 0;
                    return (
                      <Tooltip key={dateKey}>
                        <TooltipTrigger asChild>
                          <div
                            className={cn(
                              "rounded-[1px] sm:rounded-[2px] transition-colors",
                              variant === "compact" ? "h-2 w-2 sm:h-2.5 sm:w-2.5" : "h-2.5 w-2.5 sm:h-3 sm:w-3",
                              getColorClass(count)
                            )}
                          />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="text-[10px] p-2">
                          <p className="font-medium">
                            {count} {count === 1 ? "character" : "characters"} mastered
                          </p>
                          <p className="opacity-70">{format(day, "MMM do, yyyy")}</p>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>
              ))}
            </TooltipProvider>
          </div>
        </div>
      </div>
      
      <div className="flex justify-between border-t border-border/50 pt-1 text-[10px] text-muted-foreground uppercase tracking-widest">
        <span>{format(startDate, "MMMM yyyy")}</span>
        {variant !== "compact" && <span className="font-medium text-primary/80">Character Mastery Heatmap</span>}
      </div>
    </div>
  );
};

export default ActivityTracker;
