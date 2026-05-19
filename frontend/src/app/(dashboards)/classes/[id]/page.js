"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft, Users, GraduationCap, Calendar,
  BookOpen, Mail, Phone, Shield, BarChart2,
  TrendingUp, Award, Clock
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, AreaChart, Area
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import api from "@/lib/axios";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function ClassDetailsPage({ params }) {
  const resolvedParams = use(params);
  const { id } = resolvedParams;

  const [classData, setClassData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchClassDetails = async () => {
      try {
        const { data } = await api.get(`/classes/${id}`);
        setClassData(data);
      } catch (error) {
        toast.error("Failed to fetch class details");
        router.push("/classes");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchClassDetails();
  }, [id, router]);

  if (loading) {
    return (
      <div className="space-y-8 max-w-7xl mx-auto">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Skeleton className="h-[500px] lg:col-span-2 rounded-[2rem]" />
          <Skeleton className="h-[500px] rounded-[2rem]" />
        </div>
      </div>
    );
  }

  if (!classData) return null;

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  const performanceData = [
    { name: 'Jan', score: 75 },
    { name: 'Feb', score: 82 },
    { name: 'Mar', score: 78 },
    { name: 'Apr', score: 88 },
    { name: 'May', score: 92 },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/classes"
            className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold tracking-widest uppercase">
                Active Section
              </span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              {classData.name} - Section {classData.section}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-xl font-bold h-11 px-6">
            Generate Report
          </Button>
          <Button className="rounded-xl font-bold h-11 px-6 bg-primary shadow-lg shadow-primary/20">
            Edit Class
          </Button>
        </div>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
      >

        <motion.div variants={item} className="lg:col-span-2 space-y-8">

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Total Students", value: classData.students?.length || 0, icon: Users, color: "text-blue-500" },
              { label: "Capacity", value: classData.capacity, icon: Shield, color: "text-emerald-500" },
              { label: "Subjects", value: classData.subjects?.length || 0, icon: BookOpen, color: "text-amber-500" },
              { label: "Avg. Attendance", value: "94%", icon: TrendingUp, color: "text-rose-500" },
            ].map((stat, i) => (
              <Card key={i} className="border-none shadow-xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur rounded-2xl overflow-hidden group">
                <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                  <div className={cn("p-2 rounded-xl mb-2 bg-zinc-50 dark:bg-zinc-800 group-hover:scale-110 transition-transform", stat.color)}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{stat.label}</p>
                  <p className="text-xl font-bold mt-1">{stat.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>


          <Card className="border-zinc-200 dark:border-zinc-800 shadow-xl rounded-[2rem] overflow-hidden bg-white dark:bg-zinc-900">
            <CardHeader className="p-8 border-b border-zinc-100 dark:border-zinc-800/50">
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Student List
              </CardTitle>
              <CardDescription>Directory of all students enrolled in this section</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-zinc-50/50 dark:bg-zinc-900/50">
                      <TableHead className="px-8 h-12 font-bold">Roll No</TableHead>
                      <TableHead className="h-12 font-bold">Name</TableHead>
                      <TableHead className="h-12 font-bold">Email</TableHead>
                      <TableHead className="h-12 font-bold text-right pr-8">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {classData.students?.map((student) => (
                      <TableRow key={student._id} className="border-b border-zinc-50 dark:border-zinc-800/50">
                        <TableCell className="px-8 font-bold text-primary">{student.rollNumber}</TableCell>
                        <TableCell className="font-medium">{student.name}</TableCell>
                        <TableCell className="text-zinc-500 text-sm">{student.email}</TableCell>
                        <TableCell className="text-right pr-8">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400">
                            ENROLLED
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                    {(!classData.students || classData.students.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={4} className="h-32 text-center text-zinc-500">
                          No students enrolled in this class yet.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>


          <Card className="border-zinc-200 dark:border-zinc-800 shadow-xl rounded-[2rem] bg-white dark:bg-zinc-900">
            <CardHeader className="p-8">
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-indigo-500" />
                Academic Performance Trend
              </CardTitle>
              <CardDescription>Class average across major examinations</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              {mounted && (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={performanceData}>
                    <defs>
                      <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#18181b" stopOpacity={0.1} />
                        <stop offset="95%" stopColor="#18181b" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#88888820" />
                    <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                    <Area type="monotone" dataKey="score" stroke="#18181b" fillOpacity={1} fill="url(#colorScore)" strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </motion.div>


        <motion.div variants={item} className="space-y-8">

          <Card className="border-zinc-200 dark:border-zinc-800 shadow-xl rounded-[2rem] overflow-hidden bg-white dark:bg-zinc-900">
            <div className="h-24 bg-gradient-to-r from-primary to-indigo-600 relative">
              <Avatar className="w-20 h-20 border-4 border-white dark:border-zinc-950 absolute -bottom-10 left-8 shadow-lg">
                <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                  {classData.teacher?.name ? classData.teacher.name.charAt(0) : "T"}
                </AvatarFallback>
              </Avatar>
            </div>
            <CardContent className="pt-14 pb-8 px-8">
              <h3 className="text-xl font-bold">Class Teacher</h3>
              <p className="text-primary font-medium mb-4">{classData.teacher?.name || "Not Assigned"}</p>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-zinc-500">
                  <Mail className="w-4 h-4" />
                  <span>{classData.teacher?.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-zinc-500">
                  <Phone className="w-4 h-4" />
                  <span>{classData.teacher?.phone}</span>
                </div>
              </div>
              <Button variant="outline" className="w-full mt-6 rounded-xl font-bold border-zinc-200 dark:border-zinc-800">
                Message Teacher
              </Button>
            </CardContent>
          </Card>


          <Card className="border-zinc-200 dark:border-zinc-800 shadow-xl rounded-[2rem] bg-white dark:bg-zinc-900 p-8">
            <CardHeader className="p-0 mb-6">
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-500" />
                Course Curriculum
              </CardTitle>
            </CardHeader>
            <div className="space-y-4">
              {classData.subjects?.map((subject, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-100 dark:border-zinc-800 hover:border-primary/20 transition-all cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 flex items-center justify-center font-bold text-xs">
                      {i + 1}
                    </div>
                    <span className="font-bold text-sm group-hover:text-primary transition-colors">{subject}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-300 group-hover:text-primary transition-colors" />
                </div>
              ))}
            </div>
          </Card>

          <Card className="border-zinc-200 dark:border-zinc-800 shadow-xl rounded-[2rem] bg-zinc-900 text-white p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-lg">Next Period</h3>
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Starts in 15m</span>
            </div>
            <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
              <p className="text-2xl font-bold">Physics</p>
              <p className="text-zinc-400 text-sm mt-1">with Prof. Sarah Smith</p>
              <div className="mt-4 flex items-center gap-2">
                <Award className="w-4 h-4 text-primary" />
                <span className="text-xs font-medium">Room 304 • Block B</span>
              </div>
            </div>
            <Button className="w-full mt-6 rounded-xl bg-white text-black hover:bg-white/90 font-bold">
              Full Timetable
            </Button>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
