"use client";

import { useAuthStore } from "@/store/authStore";
import { motion } from "framer-motion";
import { User, Mail, Shield, Calendar, Edit2, Camera } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export default function ProfilePage() {
  const { user } = useAuthStore();

  const container = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
  };

  return (
    <motion.div 
      variants={container} 
      initial="hidden" 
      animate="visible" 
      className="mx-auto max-w-4xl space-y-8 pb-12"
    >
      {/* Header section */}
      <motion.div variants={item} className="flex flex-col md:flex-row items-center gap-8 bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm shadow-zinc-200/50 dark:shadow-none">
        <div className="relative group">
          <Avatar className="h-32 w-32 border-4 border-white dark:border-zinc-800 shadow-xl">
            <AvatarImage src={user?.avatar || ""} />
            <AvatarFallback className="bg-primary/10 text-primary text-3xl font-bold">
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <button className="absolute bottom-1 right-1 p-2 bg-primary text-white rounded-full shadow-lg hover:scale-110 transition-transform">
            <Camera className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex-1 text-center md:text-left space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-white">
            {user?.name || "User Profile"}
          </h1>
          <div className="flex flex-wrap justify-center md:justify-start gap-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold">
              <Shield className="w-3.5 h-3.5" />
              {user?.role?.toUpperCase() || "GUEST"}
            </span>
            <span className="text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5 text-sm">
              <Mail className="w-4 h-4" />
              {user?.email || "user@example.com"}
            </span>
          </div>
        </div>

        <Button variant="outline" className="rounded-xl px-6 h-11 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
          <Edit2 className="w-4 h-4 mr-2" />
          Edit Profile
        </Button>
      </motion.div>

      {/* Details section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div variants={item} className="md:col-span-2 space-y-6">
          <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Personal Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="space-y-1">
                <p className="text-xs font-black uppercase tracking-widest text-zinc-400">Full Name</p>
                <p className="text-zinc-900 dark:text-white font-medium">{user?.name || "N/A"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-black uppercase tracking-widest text-zinc-400">Email Address</p>
                <p className="text-zinc-900 dark:text-white font-medium">{user?.email || "N/A"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-black uppercase tracking-widest text-zinc-400">Account Role</p>
                <p className="text-zinc-900 dark:text-white font-medium capitalize">{user?.role || "N/A"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-black uppercase tracking-widest text-zinc-400">Joined Date</p>
                <p className="text-zinc-900 dark:text-white font-medium flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-zinc-400" />
                  Jan 15, 2024
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <h3 className="text-lg font-bold mb-4">Bio</h3>
            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Managing administrative tasks and overseeing student performance across multiple classes. Dedicated to fostering a positive learning environment through efficient digital management.
            </p>
          </div>
        </motion.div>

        <motion.div variants={item} className="space-y-6">
          <div className="bg-primary/5 dark:bg-primary/10 p-8 rounded-3xl border border-primary/20 dark:border-primary/30">
            <h3 className="text-lg font-bold mb-2 text-primary">Account Security</h3>
            <p className="text-zinc-600 dark:text-zinc-400 text-sm mb-6">
              Manage your password and security settings to keep your account safe.
            </p>
            <Button className="w-full rounded-xl bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25">
              Change Password
            </Button>
          </div>

          <div className="bg-zinc-50 dark:bg-zinc-900/50 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800">
            <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center italic">
              "Providing excellence in education management."
            </p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
