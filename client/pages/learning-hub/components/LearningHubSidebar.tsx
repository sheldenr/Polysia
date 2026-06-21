import React from "react";
import { 
  Sidebar, 
  SidebarContent, 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarGroupLabel, 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem,
  useSidebar
} from "@/components/ui/sidebar";
import { Layers, BookOpen, MessageCircle, LayoutDashboard, Settings, Search, Book } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";

interface LearningHubSidebarProps {
  activeFlowIndex: number | null;
  onEnterFlow: (index: number) => void;
  onExitFlow: () => void;
  onOpenSearch: () => void;
  onOpenSettings: () => void;
}

const LearningHubSidebar = ({
  activeFlowIndex,
  onEnterFlow,
  onExitFlow,
  onOpenSearch,
  onOpenSettings,
}: LearningHubSidebarProps) => {
  const { user } = useAuth();
  const { setOpenMobile } = useSidebar();

  const menuItems = [
    { index: null, label: "Dashboard", icon: LayoutDashboard },
    { index: 2, label: "Roleplay", icon: MessageCircle },
    { index: 3, label: "Grammar", icon: Book },
  ];

  return (
    <Sidebar variant="sidebar" collapsible="none" className="bg-[#F3F7FF] dark:bg-sidebar border-none shadow-none [&_[data-slot=sidebar]]:bg-transparent">
      <SidebarContent className="px-3 bg-transparent">
        <div 
          className="flex items-center gap-3 px-6 py-8 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => {
            onExitFlow();
            setOpenMobile(false);
          }}
        >
           <img src="/logo only.svg" alt="Polysia logo" className="size-8" />
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className="px-6 text-xs font-bold text-muted-foreground/60 mb-2">Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {menuItems.map((item) => {
                const isActive = activeFlowIndex === item.index;
                return (
                  <SidebarMenuItem key={item.label}>
                    <SidebarMenuButton
                      onClick={() => {
                        if (item.index === null) onExitFlow();
                        else onEnterFlow(item.index);
                        setOpenMobile(false);
                      }}
                      className={cn(
                        "h-9 rounded-xl px-6 transition-all duration-200",
                        isActive 
                          ? "bg-black/[0.05] dark:bg-white/[0.08] text-foreground shadow-sm font-semibold" 
                          : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                      )}
                    >
                      <item.icon className={cn("h-4 w-4", isActive ? "text-primary" : "")} />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-4">
           <SidebarGroupLabel className="px-6 text-xs font-bold text-muted-foreground/60 mb-2">Tools</SidebarGroupLabel>
           <SidebarGroupContent>
              <SidebarMenu className="gap-1">
                 <SidebarMenuItem>
                    <SidebarMenuButton 
                      onClick={() => { onOpenSearch(); setOpenMobile(false); }}
                      className="h-9 rounded-xl px-6 text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                    >
                       <Search className="h-4 w-4" />
                       <span>Search</span>
                       <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                         /
                       </kbd>
                    </SidebarMenuButton>
                 </SidebarMenuItem>
                 <SidebarMenuItem>
                    <SidebarMenuButton 
                      onClick={() => { onOpenSettings(); setOpenMobile(false); }}
                      className="h-9 rounded-xl px-6 text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                    >
                       <Settings className="h-4 w-4" />
                       <span>Settings</span>
                    </SidebarMenuButton>
                 </SidebarMenuItem>
              </SidebarMenu>
           </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default LearningHubSidebar;
