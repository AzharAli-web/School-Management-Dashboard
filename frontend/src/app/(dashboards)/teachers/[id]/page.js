"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { motion } from "framer-motion";
import {
  ArrowLeft, Mail, Phone, MapPin, GraduationCap,
  BookOpen, Briefcase, CalendarDays, LayoutList,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import api from "@/lib/axios";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function TeacherProfilePage({ params }) {
  const resolvedParams = use(params);
  const { id } = resolvedParams;

  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (user && user.role !== "admin") router.replace(`/${user.role}/dashboard`);
  }, [user, router]);

  useEffect(() => {
    const fetchTeacher = async () => {
      try {
        const { data } = await api.get(`/teachers/${id}`);
        setTeacher(data);
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to fetch teacher details");
        router.push("/teachers");
      } finally {
        setLoading(false);
      }
    };
    if (user?.role === "admin" && id) fetchTeacher();
  }, [id, user, router]);

  if (user?.role !== "admin") return null;

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-32" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-[420px] rounded-xl" />
          <Skeleton className="h-[420px] rounded-xl lg:col-span-2" />
        </div>
      </div>
    );
  }

  if (!teacher) return null;

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">

      <div className="flex items-center gap-4">
        <Link href="/teachers" className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "rounded-full")}>
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Teacher Profile</h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm">
            Detailed information for {teacher.name}
          </p>
        </div>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >

        <motion.div variants={item} className="space-y-6">
          <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
            <div className="h-32 bg-gradient-to-r from-emerald-500/40 to-blue-500/40 relative">
              <Avatar className="w-24 h-24 border-4 border-white dark:border-zinc-950 absolute -bottom-12 left-6 shadow-md">
                <AvatarFallback className="bg-emerald-500/10 text-emerald-600 text-2xl font-bold">
                  {teacher.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
            <CardContent className="pt-16 pb-6 px-6 space-y-4">
              <div>
                <h2 className="text-2xl font-bold">{teacher.name}</h2>
                <span className="inline-flex items-center mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400">
                  {teacher.subject}
                </span>
              </div>

              <div className="space-y-3">
                {[
                  { icon: Mail, text: teacher.email },
                  { icon: Phone, text: teacher.phone },
                  { icon: MapPin, text: teacher.address },
                  { icon: GraduationCap, text: teacher.qualification },
                  { icon: Briefcase, text: `${teacher.experience} year${teacher.experience !== 1 ? "s" : ""} of experience` },
                  { icon: CalendarDays, text: `Joined: ${new Date(teacher.createdAt).toLocaleDateString()}` },
                ].map(({ icon: Icon, text }, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm text-zinc-600 dark:text-zinc-300">
                    <Icon className="w-4 h-4 text-zinc-400 shrink-0" />
                    <span>{text}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>


        <motion.div variants={item} className="lg:col-span-2 space-y-6">
          <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LayoutList className="w-5 h-5 text-primary" /> Assigned Classes
              </CardTitle>
              <CardDescription>All classes currently assigned to this teacher.</CardDescription>
            </CardHeader>
            <CardContent>
              {teacher.assignedClasses && teacher.assignedClasses.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {teacher.assignedClasses.map((cls, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700"
                    >
                      <BookOpen className="w-3.5 h-3.5 mr-2 text-zinc-400" />
                      {cls}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-8 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 text-zinc-500">
                  <BookOpen className="w-8 h-8 mb-2 opacity-40" />
                  <p className="text-sm">No classes assigned yet.</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-500" /> Subject Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: "Subject", value: teacher.subject },
                  { label: "Qualification", value: teacher.qualification },
                  { label: "Experience", value: `${teacher.experience} years` },
                  { label: "Classes Count", value: teacher.assignedClasses?.length || 0 },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className="p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-100 dark:border-zinc-800"
                  >
                    <p className="text-xs text-zinc-500">{label}</p>
                    <p className="font-semibold text-lg mt-0.5">{value}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
