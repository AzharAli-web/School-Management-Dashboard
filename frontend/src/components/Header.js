"use client";

import { useAuthStore } from "@/store/authStore";
import { useUIStore } from "@/store/uiStore";
import { useRouter } from "next/navigation";
import { Bell, Search, Menu } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const { toggleSidebar } = useUIStore();

  const handleLogout = () => logout(() => router.push("/login"));

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-zinc-200/80 bg-white/75 px-6 backdrop-blur-xl dark:border-zinc-800/80 dark:bg-zinc-950/75 sm:px-8">
      <div className="flex items-center gap-4 flex-1">
        <button onClick={toggleSidebar} className="md:hidden p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-colors">
          <Menu className="w-5 h-5 text-zinc-500" />
        </button>
        <div className="relative w-96 hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <Input 
            placeholder="Search dashboard..." 
            className="pl-10 bg-zinc-100 dark:bg-zinc-900 border-transparent focus-visible:ring-1 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <ThemeToggle />
        
        <button className="relative p-2 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-xl transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-zinc-950"></span>
        </button>

        <div className="h-8 w-px bg-zinc-200 dark:bg-zinc-800 mx-1 hidden sm:block"></div>

        <DropdownMenu>
          <DropdownMenuTrigger className="outline-none">
            <div className="flex items-center gap-3 cursor-pointer group">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold leading-none group-hover:text-primary transition-colors">{user?.name || "User"}</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mt-1">{user?.role || "Guest"}</p>
              </div>
              <Avatar className="h-9 w-9 border border-zinc-200 dark:border-zinc-800 transition-transform hover:scale-105">
                <AvatarImage src={user?.avatar || ""} />
                <AvatarFallback className="bg-primary/10 text-primary font-bold">
                  {user?.name?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 p-2 rounded-2xl border-zinc-200 dark:border-zinc-800">
            <DropdownMenuLabel className="px-3 py-4">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-bold leading-none">{user?.name || "User"}</p>
                <p className="text-xs leading-none text-zinc-500 mt-1">{user?.email || "user@example.com"}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-zinc-100 dark:bg-zinc-800" />
            <DropdownMenuItem className="rounded-xl px-0 py-0 cursor-pointer overflow-hidden focus:bg-zinc-100 dark:focus:bg-zinc-800">
              <Link href="/profile" className="w-full px-3 py-2 flex items-center">Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="rounded-xl px-0 py-0 cursor-pointer overflow-hidden focus:bg-zinc-100 dark:focus:bg-zinc-800">
              <Link href="/settings" className="w-full px-3 py-2 flex items-center">Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-zinc-100 dark:bg-zinc-800" />
            <DropdownMenuItem onClick={handleLogout} className="rounded-xl px-3 py-2 text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/30 cursor-pointer font-bold">
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
