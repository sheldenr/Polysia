import React, { useMemo, useState, useEffect, useRef } from "react";
import { format, subDays, startOfToday, eachDayOfInterval } from "date-fns";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface Activity {
  created_at: string;
  minutes_spent: number;
}

interface ActivityTrackerProps {
  activities: Activity[];
}

const ActivityTracker: React.FC<ActivityTrackerProps> = ({ activities }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [days, setDays] = useState(140); // Start with a sensible default
  const [isMobile, setIsMobile] = useState(false);
  const today = startOfToday();

  useEffect(() => {
    if (!containerRef.current) return;

    const updateDays = () => {
      const width = containerRef.current?.offsetWidth || 0;
      const isMobileViewport = window.innerWidth < 640;
      setIsMobile(isMobileViewport);
      
      // Column width = box width + gap
      // Desktop: 12px (h-3) + 4px (gap) = 16px
      // Mobile: 10px (h-2.5) + 2px (gap) = 12px
      const colWidth = isMobileViewport ? 12 : 16;
      const numWeeks = Math.floor(width / colWidth);
      
      if (numWeeks > 0) {
        const computedDays = numWeeks * 7;
        const constrainedDays = isMobileViewport
          ? Math.min(56, Math.max(28, computedDays))
          : computedDays;
        setDays(constrainedDays);
      }
    };

    const observer = new ResizeObserver(updateDays);
    observer.observe(containerRef.current);
    updateDays(); // Initial calculation

    return () => observer.disconnect();
  }, []);

  const startDate = useMemo(() => subDays(today, days - 1), [today, days]);

  const dateRange = useMemo(() => {
    return eachDayOfInterval({ start: startDate, end: today });
  }, [startDate, today]);

  const activityMap = useMemo(() => {
    const map: Record<string, number> = {};
    activities.forEach((activity) => {
      const dateKey = format(new Date(activity.created_at), "yyyy-MM-dd");
      map[dateKey] = (map[dateKey] || 0) + 1;
    });
    return map;
  }, [activities]);

  const getColorClass = (count: number) => {
    if (count === 0) return "bg-zinc-100 dark:bg-zinc-800/50";
    if (count < 2) return "bg-primary/20";
    if (count < 4) return "bg-primary/40";
    if (count < 6) return "bg-primary/70";
    return "bg-primary";
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
    <div className="w-full flex flex-col justify-between space-y-4 rounded-3xl border bg-card p-5 sm:p-6 h-full overflow-hidden">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-heading text-muted-foreground uppercase tracking-wider">Activity History</h2>
        <div className="hidden items-center gap-1.5 text-[10px] text-muted-foreground sm:flex">
          <span>Less</span>
          <div className="h-2.5 w-2.5 rounded-sm bg-zinc-100 dark:bg-zinc-800/50" />
          <div className="h-2.5 w-2.5 rounded-sm bg-primary/20" />
          <div className="h-2.5 w-2.5 rounded-sm bg-primary/40" />
          <div className="h-2.5 w-2.5 rounded-sm bg-primary/70" />
          <div className="h-2.5 w-2.5 rounded-sm bg-primary" />
          <span>More</span>
        </div>
      </div>

      <div className="relative" ref={containerRef}>
        {/* Month Labels */}
        <div className="mb-1.5 hidden h-3 min-w-max text-[9px] text-muted-foreground sm:flex">
          {weeks.map((_, i) => {
            const monthLabel = monthLabels.find(l => l.index === i);
            return (
              <div key={i} className="flex-none w-[12px] sm:w-[16px] relative">
                {monthLabel && <span className="absolute left-0 whitespace-nowrap">{monthLabel.label}</span>}
              </div>
            );
          })}
        </div>

        <div className="flex justify-start">
          <div className="flex gap-[2px] sm:gap-[4px]">
            <TooltipProvider delayDuration={0}>
              {weeks.map((week, weekIdx) => (
                <div key={weekIdx} className="flex flex-col gap-[2px] sm:gap-[4px]">
                  {week.map((day) => {
                    const dateKey = format(day, "yyyy-MM-dd");
                    const count = activityMap[dateKey] || 0;
                    return (
                      <Tooltip key={dateKey}>
                        <TooltipTrigger asChild>
                          <div
                            className={`h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-[1px] sm:rounded-[2px] transition-colors ${getColorClass(count)}`}
                          />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="text-[10px] p-2">
                          <p className="font-medium">
                            {count} {count === 1 ? "activity" : "activities"}
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
        <span className="font-medium text-primary/80">{isMobile ? "Compact" : "Full View"}</span>
      </div>
    </div>
  );
};

export default ActivityTracker;
