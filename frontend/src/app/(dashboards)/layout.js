"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useAuthStore } from "@/store/authStore";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { Loader2 } from "lucide-react";

export default function DashboardLayout({ children }) {
  const { token, fetchProfile, isLoading, user, initialize } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (mounted) {
      if (!localStorage.getItem("token")) {
        router.push("/login");
      } else if (!user) {
        fetchProfile();
      }
    }
  }, [mounted, user, router, fetchProfile]);

  if (!mounted || isLoading || !token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-zinc-50 via-zinc-50 to-zinc-100/90 dark:from-zinc-950 dark:via-zinc-950 dark:to-zinc-900/90">
      <Sidebar />
      <div className="md:ml-64 flex min-h-screen flex-1 flex-col w-full transition-all duration-300">
        <Header />
        <main className="flex-1 overflow-y-auto px-6 py-8 sm:px-8 sm:py-10 lg:px-10">
          <div className="mx-auto max-w-[1600px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}
