"use client";

import { motion } from "framer-motion";
import { Settings } from "lucide-react";

export default function SettingsPage() {
  const container = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
  };

  const item = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
  };

  return (
    <motion.div variants={container} initial="hidden" animate="visible" className="mx-auto max-w-7xl space-y-10 pb-8">
      <motion.div variants={item} className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200/80 bg-white/70 px-3 py-1 text-xs font-semibold text-zinc-600 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/70 dark:text-zinc-300">
            <Settings className="h-3.5 w-3.5 text-primary" />
            Configuration
          </div>
          <h1 className="text-4xl font-semibold tracking-tight text-zinc-900 dark:text-white md:text-5xl">
            Settings
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-zinc-600 dark:text-zinc-400">
            Manage your account preferences, system settings, and notifications.
          </p>
        </div>
      </motion.div>

      <motion.div variants={item} className="rounded-[1.75rem] border border-zinc-200/80 bg-white/90 p-8 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900/90">
        <Settings className="mx-auto h-12 w-12 text-zinc-400 dark:text-zinc-600 mb-4" />
        <h3 className="text-xl font-semibold text-zinc-900 dark:text-white mb-2">Coming Soon</h3>
        <p className="text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">
          The settings module is currently under development. Check back later for account configuration options.
        </p>
      </motion.div>
    </motion.div>
  );
}
