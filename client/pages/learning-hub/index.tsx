import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { 
  SidebarInset, 
  SidebarProvider, 
  SidebarTrigger 
} from "@/components/ui/sidebar";
import { 
  Dialog, 
  DialogContent, 
  DialogTitle 
} from "@/components/ui/dialog";
import { 
  CommandDialog, 
  CommandInput, 
  CommandList, 
  CommandEmpty, 
  CommandGroup, 
  CommandItem 
} from "@/components/ui/command";
import { Layers, BookOpen, MessageCircle, Settings, AlertCircle, Menu, Book } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

import LearningHubSidebar from "./components/LearningHubSidebar";
import DashboardView from "./views/DashboardView";
import ReviewView from "./views/ReviewView";
import StoryHubView from "./views/StoryHubView";
import RoleplayView from "./views/RoleplayView";
import GrammarView from "./views/GrammarView";
import Hsk1IntroDialog from "./components/Hsk1IntroDialog";
import SettingsPanel from "@/components/SettingsPanel";

import { useLearningMetrics } from "./hooks/use-learning-metrics";
import { useReviewSystem } from "@/hooks/use-review-system";
import { useStoryHub } from "./hooks/use-story-hub";
import { useRoleplayFlow } from "./hooks/use-roleplay-flow";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

const LearningHub = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();

  // Navigation State
  const [activeFlowIndex, setActiveFlowIndex] = useState<number | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showHsk1Intro, setShowHsk1Intro] = useState(false);
  const [supabaseConfigError, setSupabaseConfigError] = useState<string | null>(null);
  const [filterLevel, setFilterLevel] = useState<number>(1);

  // Hooks
  const metrics = useLearningMetrics();
  const review = useReviewSystem();
  const storyHub = useStoryHub();
  const roleplay = useRoleplayFlow(review.meta?.hskProgress.currentLevel || 1, metrics.refreshMetrics);

  // Sync with URL
  useEffect(() => {
    const mode = searchParams.get("mode");
    if (mode === "review") setActiveFlowIndex(0);
    else if (mode === "stories") setActiveFlowIndex(1);
    else if (mode === "roleplay") setActiveFlowIndex(2);
    else if (mode === "grammar") setActiveFlowIndex(3);
    else setActiveFlowIndex(null);
  }, [searchParams]);

  useEffect(() => {
    // Check for onboarding intro
    if (user) {
      supabase
        .from("profiles")
        .select("onboarding_hsk_level")
        .eq("id", user.id)
        .maybeSingle()
        .then(({ data }) => {
          if (data?.onboarding_hsk_level === "HSK 1" && !localStorage.getItem("hasSeenHsk1Intro")) {
            setShowHsk1Intro(true);
          }
        });
    }

    // Check supabase config
    if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
      setSupabaseConfigError("Supabase environment variables are missing.");
    }
  }, [user]);

  // Keyboard shortcuts
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "/") {
        // Don't trigger if user is typing in an input
        if (
          document.activeElement?.tagName === "INPUT" ||
          document.activeElement?.tagName === "TEXTAREA"
        ) {
          return;
        }
        e.preventDefault();
        setIsSearchOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const enterFlow = (index: number) => {
    const modes = ["review", "stories", "roleplay", "grammar"];
    setSearchParams({ mode: modes[index] });
    setActiveFlowIndex(index);
  };

  const exitFlow = () => {
    setSearchParams({});
    setActiveFlowIndex(null);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-[#F3F7FF] dark:bg-background text-foreground transition-colors duration-300 overflow-hidden">
        <div className="flex h-full w-full max-w-7xl mx-auto">
          <Hsk1IntroDialog 
            open={showHsk1Intro} 
            onOpenChange={setShowHsk1Intro} 
            onDismiss={() => {
              setShowHsk1Intro(false);
              localStorage.setItem("hasSeenHsk1Intro", "true");
            }} 
          />

          {supabaseConfigError && (
            <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] w-full max-w-sm px-4 animate-in slide-in-from-top-4 fade-in duration-300">
              <Alert variant="destructive" className="shadow-2xl rounded-xl p-4 flex gap-3">
                <AlertCircle className="h-5 w-5 shrink-0 text-white" />
                <div className="flex-1 min-w-0">
                  <AlertTitle className="text-sm font-semibold text-white">Configuration Required</AlertTitle>
                  <AlertDescription className="mt-1 text-xs text-zinc-400 line-clamp-2">
                    {supabaseConfigError}
                  </AlertDescription>
                  <div className="mt-3 flex items-center gap-2">
                    <button className="h-7 px-3 text-[10px] rounded-lg bg-white text-black font-bold" onClick={() => window.location.reload()}>Retry</button>
                  </div>
                </div>
              </Alert>
            </div>
          )}

          <LearningHubSidebar 
            activeFlowIndex={activeFlowIndex}
            onEnterFlow={enterFlow}
            onExitFlow={exitFlow}
            onOpenSearch={() => setIsSearchOpen(true)}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />

          <SidebarInset className="flex flex-col bg-transparent overflow-hidden p-2 sm:p-4 sm:pl-0">
            <div className="flex-1 bg-white dark:bg-white/[0.03] dark:backdrop-blur-xl border border-border/60 dark:border-white/10 rounded-2xl shadow-[0_8px_40px_rgb(0,0,0,0.08)] dark:shadow-[0_8px_40px_rgb(0,0,0,0.4)] overflow-hidden flex flex-col">
              <header className="flex h-14 shrink-0 items-center justify-between gap-2 px-6 border-b border-border/50 bg-muted/5">
                <div className="flex items-center gap-2">
                    <SidebarTrigger className="-ml-1 lg:hidden">
                      <Menu className="h-5 w-5" />
                    </SidebarTrigger>
                    <div className="flex flex-col">
                      <h1 className="text-xs font-bold text-muted-foreground/60 uppercase tracking-widest font-sans">
                          {activeFlowIndex === 0 ? "Daily Review" : 
                          activeFlowIndex === 1 ? "Story Hub" : 
                          activeFlowIndex === 2 ? "Practice Conversations" : 
                          activeFlowIndex === 3 ? "Grammar Reference" : "Dashboard"}
                      </h1>
                    </div>
                </div>
              </header>

              <main className="flex-1 overflow-y-auto p-4 sm:p-8 custom-scrollbar">
                <div className="h-full">
                    {activeFlowIndex === null && (
                      <DashboardView 
                        stats={metrics.stats}
                        reviewMeta={review.meta}
                        reviewDeck={review.deck}
                        allActivities={metrics.allActivities}
                        stories={storyHub.stories}
                        onEnterFlow={enterFlow}
                        onSelectStory={(story) => {
                          storyHub.selectStory(story);
                          enterFlow(1);
                        }}
                        onSelectCategory={storyHub.selectCategory}
                        onSelectLevel={setFilterLevel}
                        filterLevel={filterLevel}
                      />
                    )}

                    {activeFlowIndex === 0 && (
                      <ReviewView 
                        deck={review.deck}
                        meta={review.meta}
                        onSubmitAnswer={review.submitAnswer}
                        onExit={exitFlow}
                      />
                    )}

                    {activeFlowIndex === 1 && (
                      <StoryHubView 
                        stories={storyHub.stories}
                        selectedStory={storyHub.selectedStory}
                        selectedCategory={storyHub.selectedCategory}
                        onSelectStory={storyHub.selectStory}
                        onSelectCategory={storyHub.selectCategory}
                        showPinyin={storyHub.showPinyin}
                        onTogglePinyin={storyHub.setShowPinyin}
                        readingSpeed={storyHub.readingSpeed}
                        onSetReadingSpeed={storyHub.setReadingSpeed}
                        isTTSLoading={storyHub.isTTSLoading}
                        onHandleTTS={storyHub.handleTTS}
                        onAddToReview={review.addToReview}
                        onExit={exitFlow}
                      />
                    )}

                    {activeFlowIndex === 2 && (
                      <RoleplayView 
                        topic={roleplay.roleplayTopic}
                        isTopicSelected={roleplay.isTopicSelected}
                        messages={roleplay.roleplayMessages}
                        input={roleplay.roleplayInput}
                        onInputChange={roleplay.setRoleplayInput}
                        isLoading={roleplay.isLoading}
                        onStartRoleplay={roleplay.startRoleplay}
                        onSubmitMessage={roleplay.submitMessage}
                        onReset={roleplay.resetRoleplay}
                        onExit={exitFlow}
                      />
                    )}

                    {activeFlowIndex === 3 && (
                      <GrammarView 
                        onExit={exitFlow}
                      />
                    )}
                </div>
              </main>
            </div>
          </SidebarInset>
        </div>
      </div>

      <CommandDialog open={isSearchOpen} onOpenChange={setIsSearchOpen} className="max-w-[min(90vw,600px)] border border-border/50">
        <CommandInput placeholder="Search Polysia..." className="text-base" />
        <CommandList className="custom-scrollbar p-2 pb-4">
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Modes" className="px-2 pt-4">
            <div className="space-y-1">
              <CommandItem onSelect={() => { enterFlow(0); setIsSearchOpen(false); }} className="rounded-xl h-11 px-2 data-selected:bg-[rgba(0,0,0,0.05)] cursor-pointer flex items-center gap-2.5">
                <Layers className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="font-medium text-sm">Daily Review</span>
              </CommandItem>
              <CommandItem onSelect={() => { enterFlow(1); setIsSearchOpen(false); }} className="rounded-xl h-11 px-2 data-selected:bg-[rgba(0,0,0,0.05)] cursor-pointer flex items-center gap-2.5">
                <BookOpen className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="font-medium text-sm">Story Hub</span>
              </CommandItem>
              <CommandItem onSelect={() => { enterFlow(2); setIsSearchOpen(false); }} className="rounded-xl h-11 px-2 data-selected:bg-[rgba(0,0,0,0.05)] cursor-pointer flex items-center gap-2.5">
                <MessageCircle className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="font-medium text-sm">Roleplay</span>
              </CommandItem>
              <CommandItem onSelect={() => { enterFlow(3); setIsSearchOpen(false); }} className="rounded-xl h-11 px-2 data-selected:bg-[rgba(0,0,0,0.05)] cursor-pointer flex items-center gap-2.5">
                <Book className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="font-medium text-sm">Grammar</span>
              </CommandItem>
            </div>
          </CommandGroup>
          <CommandGroup heading="Settings" className="px-2 pt-4">
            <CommandItem onSelect={() => { setIsSettingsOpen(true); setIsSearchOpen(false); }} className="rounded-xl h-11 px-2 data-selected:bg-[rgba(0,0,0,0.05)] cursor-pointer flex items-center gap-2.5">
              <Settings className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="font-medium text-sm">Settings</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>

      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="w-[min(96vw,56rem)] h-[65vh] max-h-[600px] overflow-hidden p-0 border border-border/50 bg-card/95 backdrop-blur-xl shadow-2xl rounded-xl flex flex-col">
          <DialogTitle className="sr-only">Settings</DialogTitle>
          <SettingsPanel onLogout={handleLogout} />
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
};

export default LearningHub;
