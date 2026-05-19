"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  Settings,
  LogOut,
  School
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useUIStore } from "@/store/uiStore";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user } = useAuthStore();
  const { isSidebarOpen, closeSidebar } = useUIStore();

  const handleLogout = () => {
    logout(() => router.push("/login"));
  };

  const getLinksForRole = (role) => {
    switch (role) {
      case "admin":
        return [
          { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
          { name: "Students", href: "/students", icon: GraduationCap },
          { name: "Teachers", href: "/teachers", icon: Users },
          { name: "Attendance", href: "/admin/attendance", icon: BookOpen },
          { name: "Exams", href: "/admin/exams", icon: BookOpen },
          { name: "Assignments", href: "/admin/assignments", icon: BookOpen },
          { name: "Classes", href: "/classes", icon: BookOpen },
          { name: "Settings", href: "/settings", icon: Settings },
        ];
      case "teacher":
        return [
          { name: "Dashboard", href: "/teacher/dashboard", icon: LayoutDashboard },
          { name: "Attendance", href: "/teacher/attendance", icon: BookOpen },
          { name: "Enter Marks", href: "/teacher/marks", icon: BookOpen },
          { name: "Assignments", href: "/teacher/assignments", icon: BookOpen },
          { name: "Settings", href: "/settings", icon: Settings },
        ];
      case "student":
        return [
          { name: "Dashboard", href: "/student/dashboard", icon: LayoutDashboard },
          { name: "My Results", href: "/student/results", icon: BookOpen },
          { name: "Assignments", href: "/student/assignments", icon: BookOpen },
          { name: "My Attendance", href: "/student/attendance", icon: BookOpen },
          { name: "My Classes", href: "/classes", icon: BookOpen },
          { name: "Settings", href: "/settings", icon: Settings },
        ];
      default:
        return [{ name: "Dashboard", href: "/", icon: LayoutDashboard }];
    }
  };

  const links = getLinksForRole(user?.role);

  return (
    <>

      {isSidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeSidebar}
          className="fixed inset-0 z-40 bg-zinc-950/80 backdrop-blur-sm md:hidden"
        />
      )}

      <div className={`w-64 bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 h-screen flex flex-col fixed left-0 top-0 z-50 transform transition-transform duration-300 ease-in-out md:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="h-16 flex items-center px-6 border-b border-zinc-200 dark:border-zinc-800">
          <School className="w-6 h-6 text-primary mr-3" />
          <span className="font-bold text-lg tracking-tight">SchoolDash</span>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-2">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link key={link.name} href={link.href} className="relative">
                <span className={`flex items-center px-4 py-3 rounded-xl transition-colors relative z-10 ${isActive ? "text-primary font-medium" : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900/50"}`}>
                  <link.icon className={`w-5 h-5 mr-3 ${isActive ? "text-primary" : "opacity-70"}`} />
                  {link.name}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 bg-primary/10 dark:bg-primary/20 rounded-xl z-0"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </div>

        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>
    </>
  );
}
