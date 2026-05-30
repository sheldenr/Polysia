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
    setRoleplayMessages([
      { role: "ai", text: `你好！我们开始练习吧。今天的场景是：${topic}。你先请！` },
    ]);
  };

  const submitMessage = async () => {
    if (!roleplayInput.trim() || isLoading || !user) return;

    const userMsg = roleplayInput.trim();
    setRoleplayInput("");
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
