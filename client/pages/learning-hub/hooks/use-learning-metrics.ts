import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { getSrsDayStart } from "../utils";

export interface LearningActivity {
  id: string;
  mode: "review" | "reading" | "roleplay";
  action: string;
  minutes_spent: number;
  created_at: string;
}

export function useLearningMetrics() {
  const { user } = useAuth();
  const [allActivities, setAllActivities] = useState<LearningActivity[]>([]);
  const [stats, setStats] = useState({
    weeklyMinutes: 0,
    dailyMinutes: 0,
    modeMinutes: { review: 0, reading: 0, roleplay: 0 },
  });
  const [loading, setLoading] = useState(false);

  const refreshMetrics = useCallback(async () => {
    if (!supabase || !user) return;

    setLoading(true);
    const trackerStart = new Date();
    trackerStart.setDate(trackerStart.getDate() - 365);

    const now = new Date();
    const dayStart = getSrsDayStart(now);
    const weekStart = new Date(dayStart);
    weekStart.setDate(weekStart.getDate() - 7);

    const { data, error } = await supabase
      .from("learning_activity")
      .select("id, mode, action, minutes_spent, created_at")
      .eq("user_id", user.id)
      .gte("created_at", trackerStart.toISOString())
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching learning activity:", error);
      setLoading(false);
      return;
    }

    const activities = (data || []) as LearningActivity[];
    setAllActivities(activities);

    const weekActivity = activities.filter((a) => new Date(a.created_at) >= weekStart);
    const dailyActivity = activities.filter((a) => new Date(a.created_at) >= dayStart);

    const weekMinutes = weekActivity.reduce((acc, a) => acc + (a.minutes_spent || 0), 0);
    const dailyMinutes = dailyActivity.reduce((acc, a) => acc + (a.minutes_spent || 0), 0);

    const modeMinutes = activities.reduce(
      (acc, a) => {
        if (a.mode === "review") acc.review += a.minutes_spent || 0;
        else if (a.mode === "reading") acc.reading += a.minutes_spent || 0;
        else if (a.mode === "roleplay") acc.roleplay += a.minutes_spent || 0;
        return acc;
      },
      { review: 0, reading: 0, roleplay: 0 }
    );

    setStats({
      weeklyMinutes: Math.round(weekMinutes),
      dailyMinutes: Math.round(dailyMinutes),
      modeMinutes,
    });
    setLoading(false);
  }, [user]);

  useEffect(() => {
    void refreshMetrics();
  }, [refreshMetrics]);

  return {
    allActivities,
    stats,
    loading,
    refreshMetrics,
  };
}
