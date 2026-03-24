"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  MessageSquare,
  Settings,
  FolderOpen,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ProfileData {
  name: string;
  email: string;
  bio: string;
  avatar: string;
  avatarUrl?: string;
}

const defaultUserProfile = {
  name: "Alex Morgan",
  email: "alex.morgan@example.com",
  bio: "Brand strategist & creative director.",
  avatar: "AM",
};

const navItems = [
  { href: "/projects", label: "Projects", icon: FolderOpen },
  { href: "/canvas", label: "Canvas", icon: LayoutDashboard },
  { href: "/agents", label: "Agents", icon: MessageSquare },
  { href: "/settings", label: "Settings", icon: Settings },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const [profile] = useLocalStorage<ProfileData>("ship_user_profile", {
    name: defaultUserProfile.name,
    email: defaultUserProfile.email,
    bio: defaultUserProfile.bio,
    avatar: defaultUserProfile.avatar,
    avatarUrl: undefined,
  });

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col h-screen border-r border-border/50 bg-sidebar transition-all duration-300 ease-in-out relative z-30",
        collapsed ? "w-[68px]" : "w-[240px]"
      )}
    >
      <div
        className={cn(
          "flex items-center h-14 px-4 border-b border-border/50",
          collapsed ? "justify-center" : "gap-2"
        )}
      >
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-foreground">
          <Sparkles className="w-4 h-4 text-background" />
        </div>
        {!collapsed && (
          <span className="font-semibold text-sm tracking-tight">SHIP AI</span>
        )}
      </div>

      <nav className="flex-1 py-3 px-2 space-y-1">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");

          if (collapsed) {
            return (
              <Tooltip key={item.href}>
                <TooltipTrigger
                  className={cn(
                    "flex items-center justify-center w-full py-2.5 rounded-lg text-sm font-medium transition-colors duration-150",
                    isActive
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  )}
                  onClick={() => {
                    window.location.href = item.href;
                  }}
                >
                  <item.icon className="w-[18px] h-[18px] shrink-0" />
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={8}>
                  {item.label}
                </TooltipContent>
              </Tooltip>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150",
                isActive
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              )}
            >
              <item.icon className="w-[18px] h-[18px] shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-2 border-t border-border/50">
        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn(
              "flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm hover:bg-accent/50 transition-colors duration-150",
              collapsed && "justify-center px-0"
            )}
          >
            <Avatar className="w-7 h-7">
              {profile.avatarUrl && (
                <AvatarImage src={profile.avatarUrl} alt={profile.name} />
              )}
              <AvatarFallback className="text-xs bg-foreground/10">
                {profile.avatar}
              </AvatarFallback>
            </Avatar>
            {!collapsed && (
              <div className="flex-1 text-left truncate">
                <p className="text-sm font-medium leading-none truncate">
                  {profile.name}
                </p>
              </div>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start" className="w-56">
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium">{profile.name}</p>
              <p className="text-xs text-muted-foreground">
                {profile.email}
              </p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                window.location.href = "/settings";
              }}
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive focus:text-destructive">
              <LogOut className="w-4 h-4 mr-2" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <button
        onClick={onToggle}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full border border-border bg-background flex items-center justify-center hover:bg-accent transition-colors"
      >
        {collapsed ? (
          <ChevronRight className="w-3 h-3" />
        ) : (
          <ChevronLeft className="w-3 h-3" />
        )}
      </button>
    </aside>
  );
}
