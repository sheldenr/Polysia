import React, { useRef, useEffect, useState } from "react";
import { MessageCircle, Send, Loader2, ChevronLeft, User, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Message } from "../hooks/use-roleplay-flow";
import { cn } from "@/lib/utils";

interface RoleplayViewProps {
  topic: string;
  isTopicSelected: boolean;
  messages: Message[];
  input: string;
  onInputChange: (val: string) => void;
  isLoading: boolean;
  onStartRoleplay: (topic: string) => void;
  onSubmitMessage: () => void;
  onReset: () => void;
  onExit: () => void;
}

const RoleplayView = ({
  topic,
  isTopicSelected,
  messages,
  input,
  onInputChange,
  isLoading,
  onStartRoleplay,
  onSubmitMessage,
  onReset,
  onExit,
}: RoleplayViewProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showTranslation, setShowTranslation] = useState(false);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (!isTopicSelected) {
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
        <div>
          <h2 className="text-3xl font-heading tracking-tight">Practice Conversations</h2>
          <p className="text-muted-foreground mt-1">Select a scenario to practice your speaking and listening.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { id: "Order Coffee", title: "Ordering Coffee", desc: "Practice basic interactions at a cafe." },
            { id: "Market", title: "At the Market", desc: "Practice bargaining and asking for prices." },
            { id: "Taxi", title: "Taking a Taxi", desc: "Practice giving directions and small talk." },
            { id: "Greetings", title: "Introductions", desc: "Practice meeting someone for the first time." },
            { id: "Restaurant", title: "At the Restaurant", desc: "Practice ordering food and asking about the menu." },
            { id: "Custom", title: "Custom Scenario", desc: "Create your own roleplay topic or situation." },
          ].map((item) => (
            <div 
              key={item.id}
              onClick={() => onStartRoleplay(item.id)}
              className="group relative rounded-2xl bg-card dark:bg-card border border-border p-6 transition-all hover:border-primary/30 cursor-pointer flex items-center gap-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none overflow-hidden"
            >
              {/* Top Accent */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-primary/40 opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="size-10 flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors shrink-0">
                <MessageCircle className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-heading mb-0.5 transition-colors group-hover:text-primary">{item.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-10rem)] flex flex-col animate-in fade-in duration-500 pb-4">
      <div className="flex items-center justify-between mb-4 shrink-0 px-2">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onReset} className="rounded-xl gap-2 text-muted-foreground hover:text-foreground">
            <ChevronLeft className="h-4 w-4" /> Change Topic
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowTranslation(!showTranslation)}
            className="rounded-xl h-8 px-3 text-[10px] font-bold uppercase tracking-wider border-border bg-card hover:bg-muted"
          >
            {showTranslation ? "Hide Translation" : "Show Translation"}
          </Button>
        </div>
        <div className="text-[10px] font-bold text-primary/60 uppercase tracking-widest">
          {topic === "Custom" ? "Custom Scenario" : `Scenario: ${topic}`}
        </div>
      </div>

      <div className="flex-1 bg-black/[0.04] dark:bg-white/[0.06] rounded-xl overflow-hidden flex flex-col mb-4">
        {/* Messages */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar"
        >
          {messages.map((msg, i) => (
            <div 
              key={i} 
              className={cn(
                "flex items-end gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300",
                msg.role === "user" ? "flex-row-reverse" : "flex-row"
              )}
            >
              <div className={cn(
                "size-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm",
                msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-white dark:bg-slate-800"
              )}>
                {msg.role === "user" ? <User className="h-4 w-4" /> : <span className="text-[10px] font-bold text-muted-foreground/60">AI</span>}
              </div>
              <div className={cn(
                "max-w-[80%] rounded-xl px-4 py-2.5 text-sm flex flex-col gap-1.5",
                msg.role === "user" 
                  ? "bg-primary text-primary-foreground shadow-sm" 
                  : "bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm"
              )}>
                {msg.role === "ai" ? (() => {
                  const lines = msg.text.split("\n[");
                  const chinese = lines[0].trim();
                  const translation = lines[1] ? lines[1].replace("]", "").trim() : null;

                  return (
                    <>
                      <span>{chinese}</span>
                      {showTranslation && translation && (
                        <span className="text-[11px] text-muted-foreground/80 dark:text-muted-foreground/90 border-t border-border/30 dark:border-white/5 pt-1.5 mt-0.5 animate-in fade-in duration-300">
                          {translation}
                        </span>
                      )}
                    </>
                  );
                })() : (
                  <span>{msg.text}</span>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex items-end gap-3 animate-pulse">
               <div className="size-8 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
               </div>
               <div className="bg-white/60 dark:bg-slate-800/60 rounded-xl px-4 py-2.5">
                  <div className="flex gap-1">
                     <span className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                     <span className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                     <span className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce"></span>
                  </div>
               </div>
            </div>
          )}
        </div>

        {/* Input area */}
        <div className="p-4 bg-border/50 shrink-0">
          <form 
            onSubmit={(e) => { e.preventDefault(); onSubmitMessage(); }}
            className="relative flex items-center"
          >
            <Input 
              value={input}
              onChange={(e) => onInputChange(e.target.value)}
              placeholder={topic === "Custom" ? "Type your scenario (e.g. Booking a hotel)..." : "Type your message in Chinese..."}
              className="pr-14 h-14 rounded-xl bg-white dark:bg-slate-900 border-none shadow-sm focus:ring-primary/20 dark:focus:ring-white/20"
              disabled={isLoading}
            />
            <Button 
              type="submit" 
              size="icon" 
              disabled={isLoading || !input.trim()}
              className="absolute right-1.5 size-11 rounded-xl"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </form>
          <p className="text-[10px] text-center text-muted-foreground mt-2 uppercase tracking-widest font-bold">
            Press Enter to Send
          </p>
        </div>
      </div>
    </div>
  );
};

export default RoleplayView;
