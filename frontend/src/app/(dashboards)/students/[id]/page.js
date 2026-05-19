"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { motion } from "framer-motion";
import { ArrowLeft, User, Phone, MapPin, Mail, GraduationCap, Calendar, Users, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import api from "@/lib/axios";
import Link from "next/link";

export default function StudentProfilePage({ params }) {

  const resolvedParams = use(params);
  const { id } = resolvedParams;

  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();
  const router = useRouter();


  useEffect(() => {
    if (user && user.role !== "admin") {
      router.replace(`/${user.role}/dashboard`);
    }
  }, [user, router]);

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const { data } = await api.get(`/students/${id}`);
        setStudent(data);
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to fetch student details");
        router.push("/students");
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === "admin" && id) {
      fetchStudent();
    }
  }, [id, user, router]);

  if (user?.role !== "admin") return null;

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-32" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-[400px] rounded-xl" />
          <Skeleton className="h-[400px] rounded-xl lg:col-span-2" />
        </div>
      </div>
    );
  }

  if (!student) return null;

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/students" className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "rounded-full")}>
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Student Profile</h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm">
            Detailed information for {student.name}
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
            <div className="h-32 bg-gradient-to-r from-primary/40 to-emerald-500/40 relative">
              <Avatar className="w-24 h-24 border-4 border-white dark:border-zinc-950 absolute -bottom-12 left-6 shadow-md">
                <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                  {student.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
            <CardContent className="pt-16 pb-6 px-6">
              <h2 className="text-2xl font-bold">{student.name}</h2>
              <p className="text-primary font-medium">{student.rollNumber}</p>

              <div className="mt-6 space-y-4">
                <div className="flex items-center gap-3 text-sm text-zinc-600 dark:text-zinc-300">
                  <Mail className="w-4 h-4 text-zinc-400" />
                  <span>{student.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-zinc-600 dark:text-zinc-300">
                  <Phone className="w-4 h-4 text-zinc-400" />
                  <span>{student.phone}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-zinc-600 dark:text-zinc-300">
                  <MapPin className="w-4 h-4 text-zinc-400" />
                  <span>{student.address}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-zinc-600 dark:text-zinc-300">
                  <Calendar className="w-4 h-4 text-zinc-400" />
                  <span>Age: {student.age} • Gender: {student.gender}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>


        <motion.div variants={item} className="lg:col-span-2 space-y-6">
          <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-primary" /> Academic Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-100 dark:border-zinc-800">
                <div>
                  <p className="text-sm text-zinc-500">Class</p>
                  <p className="font-semibold text-lg">{student.class}</p>
                </div>
                <div>
                  <p className="text-sm text-zinc-500">Section</p>
                  <p className="font-semibold text-lg">{student.section}</p>
                </div>
                <div>
                  <p className="text-sm text-zinc-500">Roll No.</p>
                  <p className="font-semibold text-lg">{student.rollNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-zinc-500">Joined</p>
                  <p className="font-semibold text-base">{new Date(student.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-500" /> Parent / Guardian Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-3 rounded-lg border border-zinc-100 dark:border-zinc-800">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <User className="w-4 h-4 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm text-zinc-500">Name</p>
                    <p className="font-medium">{student.parentName}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg border border-zinc-100 dark:border-zinc-800">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <Phone className="w-4 h-4 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm text-zinc-500">Contact Number</p>
                    <p className="font-medium">{student.parentPhone}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-500" /> Performance & Attendance
              </CardTitle>
              <CardDescription>Metrics are currently running in placeholder mode.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center p-8 text-zinc-500 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800">
                <Activity className="w-8 h-8 mb-3 opacity-50" />
                <p className="font-medium text-zinc-600 dark:text-zinc-400">Attendance Module Not Connected</p>
                <p className="text-sm mt-1">This section will show real-time attendance graphs and exam results soon.</p>
              </div>
            </CardContent>
          </Card>

        </motion.div>
      </motion.div>
    </div>
  );
}
