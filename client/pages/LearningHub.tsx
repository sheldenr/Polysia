import { useEffect, useRef, useState } from "react";
import {
  BookOpen,
  Layers,
  MessageCircle,
  Settings,
  Sun,
  Moon,
  User,
  Eye,
  Flame,
  CheckCircle2,
  MessagesSquare,
  X,
  ChevronRight,
  Sparkles,
  Zap,
  BookMarked,
  BarChart3,
  Play,
  TrendingUp,
  Calendar,
  Clock,
  Target,
  Award,
  Activity,
  Home,
  LayoutDashboard,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

type View = "dashboard" | "flashcards" | "reading" | "roleplay";

export default function LearningHub() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isFlowActive, setIsFlowActive] = useState(false);
  const flowContainerRef = useRef<HTMLDivElement | null>(null);
  const slideRefs = useRef<Array<HTMLElement | null>>([]);

  // Stats & Progress
  const streakDays = 14;
  const statItems = [
    { label: "Flashcards", value: "1,248", icon: Layers, color: "text-blue-500" },
    { label: "Perfected", value: "376", icon: CheckCircle2, color: "text-emerald-500" },
    { label: "Dialogues", value: "42", icon: MessagesSquare, color: "text-amber-500" },
    { label: "Words Read", value: "7,930", icon: Eye, color: "text-purple-500" },
  ];

  // Learning State (Mocked)
  const [roleplayMessages, setRoleplayMessages] = useState<
    Array<{ role: "ai" | "user"; text: string }>
  >([
    {
      role: "ai",
      text: "你好！今天我们练习一个关于日常生活的对话。你能告诉我你今天做了什么吗？",
    },
  ]);
  const [roleplayInput, setRoleplayInput] = useState("");

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("theme");
    const shouldUseDark = savedTheme ? savedTheme === "dark" : false;
    setIsDarkMode(shouldUseDark);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
    window.localStorage.setItem("theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFlowActive) {
        exitFlow();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isFlowActive]);

  const enterFlow = (index: number = 0) => {
    setIsFlowActive(true);
    setTimeout(() => {
      slideRefs.current[index]?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const exitFlow = () => setIsFlowActive(false);

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <style>{`
        .flow-shell {
          height: 100vh;
          overflow-y: auto;
          scroll-snap-type: y mandatory;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .flow-shell::-webkit-scrollbar { display: none; }
        .flow-slide {
          height: 100vh;
          scroll-snap-align: start;
          scroll-snap-stop: always;
        }
      `}</style>

      {!isFlowActive ? (
        <div className="flex flex-col min-h-screen animate-in fade-in duration-700">
          {/* Top Bar */}
          <header className="border-b bg-background/50 backdrop-blur-sm px-6 py-4 sticky top-0 z-40">
            <div className="flex items-center justify-between max-w-7xl mx-auto">
              <div className="flex items-center gap-4">
                <Link to="/" className="flex items-center gap-2">
                  <img src="/logo only.svg" alt="Polysia" className="h-8 w-8" />
                  <span className="font-heading font-bold text-xl tracking-tight hidden sm:inline">
                    Polysia
                  </span>
                </Link>
              </div>
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full border border-primary/20">
                  <Flame className="w-4 h-4 text-primary fill-primary" />
                  <span className="text-xs font-bold text-primary">{streakDays} days</span>
                </div>
                <button
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className="p-2 hover:bg-secondary rounded-full transition-colors"
                >
                  {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
                <div className="h-10 w-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <User className="w-4 h-4 text-primary" />
                </div>
              </div>
            </div>
          </header>

          {/* Dashboard Content */}
          <main className="flex-1 overflow-y-auto p-6">
            <div className="max-w-7xl mx-auto space-y-8">
              {/* Learning Modes - PRIORITIZED */}
              <div className="space-y-6">
                <div className="text-center space-y-2 py-8">
                  <h1 className="text-3xl sm:text-5xl font-heading font-bold tracking-tight">Choose Your Learning Mode</h1>
                  <p className="text-muted-foreground text-lg">Pick where you want to continue today</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { name: "Flashcards", desc: "Review 20 cards due today", icon: Zap, index: 0, detail: "Master vocabulary through spaced repetition" },
                    { name: "AI Reading", desc: "Continue where you left off", icon: BookMarked, index: 1, detail: "Build comprehension with contextual passages" },
                    { name: "AI Roleplay", desc: "Food ordering scenario", icon: MessageCircle, index: 2, detail: "Practice real-world conversations" },
                  ].map((action, idx) => (
                    <button
                      key={idx}
                      onClick={() => enterFlow(action.index)}
                      className="group flex flex-col rounded-3xl border border-border hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 text-left overflow-hidden"
                    >
                      {/* Top section with centered icon */}
                      <div className="p-8 pb-12 flex items-center justify-center min-h-[200px]">
                        {/* Centered icon */}
                        <action.icon className="w-14 h-14 text-card-foreground" strokeWidth={1.5} />
                      </div>
                      
                      {/* Divider */}
                      <div className="border-t border-border"></div>
                      
                      {/* Bottom section - adapts to theme */}
                      <div className="p-8 pt-6 space-y-4 bg-card">
                        <h3 className="text-2xl font-bold font-heading text-card-foreground group-hover:text-primary transition-colors">{action.name}</h3>
                        <p className="text-sm font-medium text-card-foreground/90">{action.desc}</p>
                        <p className="text-xs text-muted-foreground leading-relaxed">{action.detail}</p>
                        <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-medium mt-2 rounded-full">
                          Start now
                        </Button>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {statItems.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div key={idx} className="group p-5 rounded-2xl border bg-card hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                          <Icon className="w-5 h-5 text-primary" />
                        </div>
                        <TrendingUp className="w-4 h-4 text-primary" />
                      </div>
                      <p className="text-2xl font-heading font-bold mb-1">{item.value}</p>
                      <p className="text-xs text-muted-foreground">{item.label}</p>
                    </div>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Today's Goals */}
                <div className="lg:col-span-2 space-y-4">
                  <h3 className="text-xl font-bold font-heading">Today's Goals</h3>
                  <div className="space-y-3">
                    {[
                      { name: "Complete 20 flashcards", progress: 65, icon: Layers },
                      { name: "Read 2 passages", progress: 50, icon: BookMarked },
                      { name: "Practice conversation", progress: 0, icon: MessageCircle },
                    ].map((goal, idx) => (
                      <div key={idx} className="p-5 rounded-2xl border bg-card hover:border-primary/30 transition-all space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/10">
                              <goal.icon className="w-5 h-5 text-primary" />
                            </div>
                            <span className="font-medium">{goal.name}</span>
                          </div>
                          <span className="text-sm text-primary font-bold">{goal.progress}%</span>
                        </div>
                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary rounded-full transition-all duration-300"
                            style={{ width: `${goal.progress}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Activity Widget */}
                <div className="space-y-4">
                  <h3 className="text-xl font-bold font-heading">Recent Activity</h3>
                  <div className="p-6 rounded-2xl border bg-card space-y-4">
                    {[
                      { time: "2h ago", action: "Completed 15 flashcards", icon: CheckCircle2 },
                      { time: "5h ago", action: "Finished reading passage", icon: BookOpen },
                      { time: "Yesterday", action: "Practiced conversation", icon: MessageCircle },
                    ].map((activity, idx) => (
                      <div key={idx} className="flex items-start gap-3 pb-4 last:pb-0 border-b last:border-0">
                        <div className="p-2 rounded-lg bg-primary/10 mt-0.5">
                          <activity.icon className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{activity.action}</p>
                          <p className="text-xs text-muted-foreground">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      ) : (
        <div className="relative h-screen w-screen overflow-hidden bg-background">
          {/* Flow Controls */}
          <div className="fixed top-6 left-6 z-50 flex items-center gap-4">
            <button
              onClick={exitFlow}
              className="flex h-12 w-12 items-center justify-center rounded-full border bg-background/80 backdrop-blur-md shadow-xl hover:bg-secondary transition-all group"
              aria-label="Exit flow"
            >
              <X className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </button>
            <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full border bg-background/80 backdrop-blur-md shadow-lg">
              <img src="/logo only.svg" alt="Polysia" className="h-5 w-5" />
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Learning Session</span>
            </div>
          </div>

          <div className="flow-shell" ref={flowContainerRef}>
            {/* Slide 1: Flashcards */}
            <section 
              ref={el => slideRefs.current[0] = el}
              className="flow-slide flex flex-col items-center justify-center p-6 bg-gradient-to-b from-background to-secondary/10"
            >
              <div className="w-full max-w-3xl space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="text-center space-y-2">
                  <h2 className="text-4xl font-heading font-bold tracking-tight">Flashcards</h2>
                  <p className="text-muted-foreground">Session progress: 8 of 24 cards</p>
                </div>
                
                <div className="relative aspect-[4/3] sm:aspect-[16/10] group perspective-1000">
                  <div className="absolute inset-0 bg-primary/20 blur-3xl opacity-20 -z-10" />
                  <div className="w-full h-full bg-card border-2 border-border rounded-[3rem] shadow-2xl flex flex-col items-center justify-center p-12 text-center transition-all duration-500 hover:border-primary/20">
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground mb-12">Character</p>
                    <span className="text-9xl font-bold tracking-tighter mb-4">你好</span>
                    <div className="mt-12 p-4 rounded-2xl bg-secondary/50 border border-border cursor-pointer hover:bg-secondary transition-colors">
                      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Click to flip</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {["Again", "Hard", "Good", "Easy"].map((label, idx) => (
                    <button
                      key={label}
                      className="flex flex-col items-center gap-2 p-4 rounded-2xl border bg-card hover:border-primary/30 hover:bg-secondary transition-all"
                    >
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{idx + 1}</span>
                      <span className="font-bold">{label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* Slide 2: AI Reading */}
            <section 
              ref={el => slideRefs.current[1] = el}
              className="flow-slide flex flex-col items-center justify-center p-6 bg-gradient-to-b from-secondary/10 to-primary/5"
            >
              <div className="w-full max-w-6xl space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="text-center space-y-2">
                  <h2 className="text-4xl font-heading font-bold tracking-tight">AI Reading</h2>
                  <p className="text-muted-foreground">Practice comprehension with context</p>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
                  <div className="lg:col-span-2 space-y-6">
                    <article className="p-10 rounded-[2.5rem] border bg-card shadow-xl leading-relaxed text-2xl space-y-8">
                      <h3 className="text-4xl font-bold mb-8 font-heading">早市日常</h3>
                      <p>
                        每天早上，我都会去附近的<span className="text-primary font-bold border-b-2 border-primary/20 cursor-pointer hover:bg-primary/10 px-1 rounded-sm transition-colors">市场</span>买新鲜的水果。
                      </p>
                      <p>
                        在回家的路上，我通常会练习一个简短的对话，复习新的词汇。有时候，我还会和市场上的商人用中文聊天。
                      </p>
                      <p>
                        午餐后，我喜欢在公园里散步。在那里，我看到很多人在做各种运动，比如太极拳、跑步和打羽毛球。
                      </p>
                    </article>
                  </div>

                  <aside className="space-y-6">
                    <div className="p-8 rounded-[2.5rem] border bg-card shadow-lg space-y-6">
                      <h3 className="font-bold flex items-center gap-2 text-xl">
                        <Sparkles className="w-5 h-5 text-primary" /> Context Quiz
                      </h3>
                      <div className="space-y-4">
                        <div className="p-5 rounded-2xl bg-secondary/50 border space-y-4">
                          <p className="text-sm font-medium leading-relaxed">The speaker never talks with people at the market.</p>
                          <div className="flex gap-2">
                            <Button variant="outline" className="flex-1 rounded-xl">True</Button>
                            <Button variant="outline" className="flex-1 rounded-xl">False</Button>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-8 rounded-[2.5rem] border bg-card shadow-lg">
                      <h3 className="font-bold mb-4 flex items-center gap-2 text-lg">
                        <BarChart3 className="w-5 h-5 text-primary" /> Key Vocabulary
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {["市场", "对话", "复习", "能力", "提高"].map(word => (
                          <span key={word} className="px-4 py-2 rounded-xl bg-secondary border text-sm font-medium cursor-pointer hover:border-primary/30 transition-colors">
                            {word}
                          </span>
                        ))}
                      </div>
                    </div>
                  </aside>
                </div>
              </div>
            </section>

            {/* Slide 3: AI Roleplay */}
            <section 
              ref={el => slideRefs.current[2] = el}
              className="flow-slide flex flex-col items-center justify-center p-6 bg-gradient-to-b from-primary/5 to-background"
            >
              <div className="w-full max-w-4xl space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="text-center">
                  <h2 className="text-4xl font-heading font-bold tracking-tight mb-2">AI Roleplay</h2>
                  <p className="text-muted-foreground">Scenario: Ordering food at a Shanghai cafe.</p>
                </div>

                <div className="h-[550px] flex flex-col rounded-[3rem] border bg-card overflow-hidden shadow-2xl relative">
                  <div className="flex-1 overflow-y-auto p-10 space-y-8">
                    {roleplayMessages.map((msg, idx) => (
                      <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[80%] px-8 py-5 rounded-[2rem] text-lg ${
                          msg.role === "user" 
                          ? "bg-primary text-primary-foreground rounded-tr-none shadow-xl shadow-primary/20" 
                          : "bg-secondary text-foreground rounded-tl-none"
                        }`}>
                          <p className="leading-relaxed">{msg.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-8 bg-secondary/30 border-t">
                    <div className="flex gap-4">
                      <input 
                        value={roleplayInput}
                        onChange={(e) => setRoleplayInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            if (!roleplayInput.trim()) return;
                            const userMessage = roleplayInput.trim();
                            setRoleplayMessages((prev: any) => [...prev, { role: "user", text: userMessage }]);
                            setRoleplayInput("");
                            setTimeout(() => {
                              setRoleplayMessages((prev: any) => [...prev, { role: "ai", text: "那很好！你能再告诉我更多的细节吗?" }]);
                            }, 800);
                          }
                        }}
                        placeholder="Type your response in Chinese..."
                        className="flex-1 bg-card border rounded-2xl px-8 py-4 text-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
                      />
                      <Button size="icon" className="h-16 w-16 rounded-2xl shrink-0 shadow-lg">
                        <ChevronRight className="w-8 h-8" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      )}
    </div>
  );
}
