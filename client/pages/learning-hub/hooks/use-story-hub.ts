import { useState, useCallback, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";

export interface Story {
  id: string;
  title_zh: string;
  title_en: string;
  content_zh: string;
  hsk_level: number;
  category: string;
  storyline_id?: string;
  chapter_number?: number;
}

export const SAMPLE_STORYLINES: Story[] = [
  {
    id: "sample-1-1",
    title_zh: "我的猫",
    title_en: "My Cat",
    content_zh: "我有一只猫。它很可爱。它喜欢喝牛奶。每天它都和我一起睡觉。",
    hsk_level: 1,
    category: "Life with Pets"
  },
  {
    id: "sample-1-2",
    title_zh: "可爱的狗",
    title_en: "Cute Dog",
    content_zh: "我朋友有一只大狗。它叫大黄。大黄很聪明，它会看家。",
    hsk_level: 1,
    category: "Life with Pets"
  },
  {
    id: "sample-2-1",
    title_zh: "早上的咖啡馆",
    title_en: "Morning Cafe",
    content_zh: "我每天早上都去那家咖啡馆。那里的咖啡很好喝，老板也特别客气。",
    hsk_level: 2,
    category: "City Life"
  },
  {
    id: "sample-2-2",
    title_zh: "去商店买东西",
    title_en: "Shopping at the Store",
    content_zh: "今天我想买一件衣服。这个商店很大，东西很多。我买了一件红色的衬衫。",
    hsk_level: 2,
    category: "City Life"
  },
  {
    id: "sample-3-1",
    title_zh: "我的中国旅行",
    title_en: "My China Trip",
    content_zh: "去年我去北京旅行了。北京有很多有名的地方，比如长城和故宫。我最喜欢那里的烤鸭，味道好极了。",
    hsk_level: 3,
    category: "Travel Stories"
  },
  {
    id: "sample-3-2",
    title_zh: "在上海工作",
    title_en: "Working in Shanghai",
    content_zh: "上海是一个非常现代的城市。这里有很多高楼大厦。虽然工作很忙，但我很喜欢这里的生活。",
    hsk_level: 3,
    category: "Travel Stories"
  }
];

export function useStoryHub() {
  const { user } = useAuth();
  const [stories, setStories] = useState<Story[]>(SAMPLE_STORYLINES);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPinyin, setShowPinyin] = useState(true);
  const [readingSpeed, setReadingSpeed] = useState(1.0);
  const [isTTSLoading, setIsTTSLoading] = useState(false);
  const [readStories, setReadStories] = useState<string[]>([]);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("read_stories");
    if (saved) {
      try {
        setReadStories(JSON.parse(saved));
      } catch (e) {
        setReadStories([]);
      }
    }
  }, []);

  const toggleStoryComplete = useCallback((storyId: string) => {
    setReadStories(prev => {
      const next = prev.includes(storyId) 
        ? prev.filter(id => id !== storyId)
        : [...prev, storyId];
      localStorage.setItem("read_stories", JSON.stringify(next));
      return next;
    });
  }, []);

  const isStoryComplete = useCallback((storyId: string) => {
    return readStories.includes(storyId);
  }, [readStories]);

  const fetchStories = useCallback(async () => {
    setLoading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) return;

      const res = await fetch("/api/stories", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch stories");
      const data = await res.json();
      
      setStories(prev => {
        const dbStories = data || [];
        const combined = [...SAMPLE_STORYLINES];
        dbStories.forEach((s: Story) => {
          if (!combined.find(c => c.id === s.id)) {
            combined.push(s);
          }
        });
        return combined;
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const selectStory = (story: Story | null) => {
    setSelectedStory(story);
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
      setIsTTSLoading(false);
    }
  };

  const selectCategory = (category: string | null) => {
    setSelectedCategory(category);
    setSelectedStory(null);
  };

  const handleTTS = async () => {
    if (!selectedStory?.content_zh || isTTSLoading) return;

    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }

    setIsTTSLoading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      
      const response = await fetch("/api/ai/tts", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ text: selectedStory.content_zh }),
      });

      if (!response.ok) throw new Error("TTS failed");

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.playbackRate = readingSpeed;
      currentAudioRef.current = audio;

      audio.onended = () => {
        setIsTTSLoading(false);
        URL.revokeObjectURL(url);
      };

      await audio.play();
    } catch (err) {
      console.error("TTS Error:", err);
      setIsTTSLoading(false);
    }
  };

  useEffect(() => {
    void fetchStories();
  }, [fetchStories]);

  return {
    stories,
    selectedStory,
    selectedCategory,
    loading,
    showPinyin,
    setShowPinyin,
    readingSpeed,
    setReadingSpeed,
    isTTSLoading,
    selectStory,
    selectCategory,
    handleTTS,
    toggleStoryComplete,
    isStoryComplete,
    refreshStories: fetchStories,
  };
}
