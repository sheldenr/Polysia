import { useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { DeepSeekV3Response } from "@shared/api";

export interface Message {
  role: "user" | "ai";
  text: string;
}

export function useRoleplayFlow(hskLevel: number, onActivityLog?: () => void) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [roleplayTopic, setRoleplayTopic] = useState("");
  const [isTopicSelected, setIsTopicSelected] = useState(false);
  const [roleplayMessages, setRoleplayMessages] = useState<Message[]>([]);
  const [roleplayInput, setRoleplayInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const startRoleplay = (topic: string) => {
    setRoleplayTopic(topic);
    setIsTopicSelected(true);
    if (topic === "Custom") {
      setRoleplayMessages([
        { role: "ai", text: "你好！请问今天你想练习什么场景的对话？比如：'在大使馆' 或 '去医院看医生'。\n[Hello! What scenario would you like to practice today? For example: 'At the embassy' or 'Seeing a doctor'.]" },
      ]);
    } else {
      setRoleplayMessages([
        { role: "ai", text: `你好！我们开始练习吧。今天的场景是：${topic}。你先请！\n[Hello! Let's start practicing. Today's scenario is: ${topic}. You first!]` },
      ]);
    }
  };

  const submitMessage = async () => {
    if (!roleplayInput.trim() || isLoading || !user) return;

    const userMsg = roleplayInput.trim();
    setRoleplayInput("");

    if (roleplayTopic === "Custom") {
      setRoleplayTopic(userMsg);
      setRoleplayMessages([
        { role: "ai", text: `你好！我们开始练习吧。今天的场景是：${userMsg}。你先请！\n[Hello! Let's start practicing. Today's scenario is: ${userMsg}. You first!]` },
      ]);
      return;
    }

    setRoleplayMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke<DeepSeekV3Response>(
        "deepseek-roleplay",
        {
          body: {
            messages: roleplayMessages.concat({ role: "user", text: userMsg }),
            topic: roleplayTopic,
            hskLevel,
          },
        }
      );

      if (error) throw error;

      if (data?.content) {
        setRoleplayMessages((prev) => [...prev, { role: "ai", text: data.content }]);
        if (onActivityLog) onActivityLog();
      }
    } catch (err) {
      console.error("Roleplay Error:", err);
      toast({
        title: "Chat failed",
        description: "DeepSeek is currently busy. Try again in a moment.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetRoleplay = () => {
    setIsTopicSelected(false);
    setRoleplayTopic("");
    setRoleplayMessages([]);
    setRoleplayInput("");
  };

  return {
    roleplayTopic,
    isTopicSelected,
    roleplayMessages,
    roleplayInput,
    setRoleplayInput,
    isLoading,
    startRoleplay,
    submitMessage,
    resetRoleplay,
  };
}
