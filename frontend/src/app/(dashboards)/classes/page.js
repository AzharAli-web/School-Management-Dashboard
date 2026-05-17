"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BookOpen, Plus, Search, Filter, MoreHorizontal, 
  Users, GraduationCap, Layout, ChevronRight, Download,
  Loader2, Trash2, Edit3, Eye
} from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from "recharts";
import { toast } from "sonner";
import api from "@/lib/axios";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export default function ClassesPage() {
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    section: "",
    capacity: "",
    teacher: "",
    subjects: ""
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [classesRes, teachersRes] = await Promise.all([
        api.get("/classes"),
        api.get("/teachers")
      ]);
      setClasses(classesRes.data);
      setTeachers(teachersRes.data);
    } catch (error) {
      toast.error("Failed to fetch dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleAddClass = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        subjects: formData.subjects.split(",").map(s => s.trim()),
        capacity: Number(formData.capacity)
      };
      await api.post("/classes", payload);
      toast.success("Class added successfully");
      setIsAddModalOpen(false);
      setFormData({ name: "", section: "", capacity: "", teacher: "", subjects: "" });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add class");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClass = async (id) => {
    if (!confirm("Are you sure you want to delete this class?")) return;
    try {
      await api.delete(`/classes/${id}`);
      toast.success("Class deleted");
      fetchData();
    } catch (error) {
      toast.error("Failed to delete class");
    }
  };

  const filteredClasses = classes.filter(cls => 
    cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cls.section.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cls.teacher?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Analytics Calculations
  const stats = [
    { title: "Total Classes", value: classes.length, icon: BookOpen, color: "from-blue-600 to-indigo-600" },
    { title: "Total Sections", value: classes.reduce((acc, curr) => acc + 1, 0), icon: Layout, color: "from-emerald-500 to-teal-500" },
    { title: "Total Students", value: classes.reduce((acc, curr) => acc + (curr.studentCount || 0), 0), icon: Users, color: "from-orange-500 to-amber-500" },
    { title: "Avg. Capacity", value: classes.length ? Math.round(classes.reduce((acc, curr) => acc + curr.capacity, 0) / classes.length) : 0, icon: GraduationCap, color: "from-pink-500 to-rose-500" },
  ];

  const chartData = classes.map(cls => ({
    name: `${cls.name}-${cls.section}`,
    students: cls.studentCount || 0,
    capacity: cls.capacity
  }));

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 to-zinc-500 dark:from-white dark:to-zinc-400">
            Class Management
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-2 text-lg">
            Organize academic classes, sections, and teacher assignments.
          </p>
        </div>
        <Button 
          onClick={() => setIsAddModalOpen(true)}
          className="rounded-2xl px-6 py-6 h-auto bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all hover:scale-105"
        >
          <Plus className="w-5 h-5 mr-2" />
          <span className="text-base font-bold">Add New Class</span>
        </Button>
      </div>

      {/* Stats Cards */}
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {stats.map((stat, i) => (
          <motion.div key={i} variants={item}>
            <Card className="relative overflow-hidden group border-none shadow-2xl">
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-90 transition-transform duration-500 group-hover:scale-110`} />
              <CardContent className="p-6 relative z-10">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-white/70 font-medium text-sm mb-1">{stat.title}</p>
                    <h3 className="text-3xl font-black text-white">{stat.value}</h3>
                  </div>
                  <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Table Section */}
        <Card className="xl:col-span-2 border-zinc-200 dark:border-zinc-800 shadow-xl rounded-[2rem] overflow-hidden bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl">
          <CardHeader className="p-8 border-b border-zinc-100 dark:border-zinc-800/50">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-2xl font-bold">Classes Directory</CardTitle>
                <CardDescription className="mt-1 text-base">Overview of all active academic sections</CardDescription>
              </div>
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <Input 
                  placeholder="Search class or teacher..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-11 h-12 bg-zinc-50 dark:bg-zinc-950/50 border-zinc-200 dark:border-zinc-800 rounded-2xl focus:ring-primary/20"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-zinc-50/50 dark:bg-zinc-900/50">
                  <TableRow className="border-zinc-100 dark:border-zinc-800/50">
                    <TableHead className="px-8 h-14 font-bold text-zinc-900 dark:text-zinc-100">Class & Section</TableHead>
                    <TableHead className="h-14 font-bold text-zinc-900 dark:text-zinc-100">Class Teacher</TableHead>
                    <TableHead className="h-14 font-bold text-zinc-900 dark:text-zinc-100">Students</TableHead>
                    <TableHead className="h-14 font-bold text-zinc-900 dark:text-zinc-100">Capacity</TableHead>
                    <TableHead className="h-14 font-bold text-zinc-900 dark:text-zinc-100 text-right pr-8">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence mode="popLayout">
                    {filteredClasses.map((cls) => (
                      <motion.tr 
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        key={cls._id}
                        className="group border-b border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50/30 dark:hover:bg-zinc-800/30 transition-colors"
                      >
                        <TableCell className="px-8 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center font-bold text-primary">
                              {cls.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-zinc-900 dark:text-zinc-100">{cls.name}</p>
                              <p className="text-xs text-zinc-400 font-medium">Section {cls.section}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center text-xs font-bold uppercase">
                              {cls.teacher?.name.charAt(0)}
                            </span>
                            <span className="font-medium">{cls.teacher?.name || "Unassigned"}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                             <div className="w-full max-w-[100px] h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                               <div 
                                 className="h-full bg-primary" 
                                 style={{ width: `${(cls.studentCount / cls.capacity) * 100}%` }}
                               />
                             </div>
                             <span className="text-xs font-bold text-zinc-500">{cls.studentCount}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium text-zinc-500">{cls.capacity}</TableCell>
                        <TableCell className="text-right pr-8">
                          <DropdownMenu>
                            <DropdownMenuTrigger className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl")}>
                              <MoreHorizontal className="w-4 h-4" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 p-2 rounded-2xl">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem className="rounded-xl px-0 py-0 cursor-pointer overflow-hidden">
                                <Link href={`/classes/${cls._id}`} className="flex items-center w-full px-3 py-2">
                                  <Eye className="w-4 h-4 mr-2" /> View Details
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem className="rounded-xl px-3 py-2 cursor-pointer">
                                <Edit3 className="w-4 h-4 mr-2" /> Edit Class
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleDeleteClass(cls._id)}
                                className="rounded-xl px-3 py-2 cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/30"
                              >
                                <Trash2 className="w-4 h-4 mr-2" /> Delete Class
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Charts & Timetable */}
        <div className="space-y-8">
          <Card className="border-zinc-200 dark:border-zinc-800 shadow-xl rounded-[2rem] bg-white dark:bg-zinc-900">
            <CardHeader>
              <CardTitle>Distribution</CardTitle>
              <CardDescription>Student count vs Capacity</CardDescription>
            </CardHeader>
            <CardContent className="h-64">
              {mounted && (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#88888820" />
                    <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                    />
                    <Bar dataKey="students" fill="#18181b" radius={[4, 4, 0, 0]} className="dark:fill-white" />
                    <Bar dataKey="capacity" fill="#e4e4e7" radius={[4, 4, 0, 0]} className="dark:fill-zinc-800" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card className="border-zinc-200 dark:border-zinc-800 shadow-xl rounded-[2rem] bg-white dark:bg-zinc-900">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-xl font-bold">Today's Schedule</CardTitle>
              <span className="text-xs bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded-full font-bold">MON, 15 MAY</span>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { time: "09:00 AM", subject: "Mathematics", teacher: "Dr. Arshad", color: "bg-blue-500" },
                { time: "10:30 AM", subject: "Physics", teacher: "Prof. Sarah", color: "bg-purple-500" },
                { time: "12:00 PM", subject: "Chemistry", teacher: "Mr. Usman", color: "bg-amber-500" },
              ].map((slot, i) => (
                <div key={i} className="flex items-center gap-4 group cursor-pointer">
                  <div className="text-xs font-bold text-zinc-400 w-16">{slot.time}</div>
                  <div className="flex-1 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-100 dark:border-zinc-800 group-hover:border-primary/30 transition-colors">
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-2 h-2 rounded-full ${slot.color}`} />
                      <p className="font-bold text-sm">{slot.subject}</p>
                    </div>
                    <p className="text-xs text-zinc-500 font-medium">with {slot.teacher}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Class Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-[2rem] p-8">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-2xl font-bold">Initialize New Class</DialogTitle>
            <DialogDescription>Create a new academic section and assign a lead teacher.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddClass} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="font-bold">Class Name</Label>
                <Input 
                  id="name" 
                  placeholder="e.g. Grade 10" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required 
                  className="rounded-xl h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="section" className="font-bold">Section</Label>
                <Input 
                  id="section" 
                  placeholder="e.g. A" 
                  value={formData.section}
                  onChange={(e) => setFormData({...formData, section: e.target.value})}
                  required 
                  className="rounded-xl h-11"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="capacity" className="font-bold">Maximum Capacity</Label>
              <Input 
                id="capacity" 
                type="number" 
                placeholder="40" 
                value={formData.capacity}
                onChange={(e) => setFormData({...formData, capacity: e.target.value})}
                required 
                className="rounded-xl h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="teacher" className="font-bold">Lead Teacher</Label>
              <Select 
                onValueChange={(val) => setFormData({...formData, teacher: val})}
                value={formData.teacher}
              >
                <SelectTrigger className="rounded-xl h-11">
                  <SelectValue placeholder="Select teacher" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {teachers.map(t => (
                    <SelectItem key={t._id} value={t._id}>{t.name} ({t.subject})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subjects" className="font-bold">Subjects (Comma separated)</Label>
              <Input 
                id="subjects" 
                placeholder="Math, Science, English..." 
                value={formData.subjects}
                onChange={(e) => setFormData({...formData, subjects: e.target.value})}
                required 
                className="rounded-xl h-11"
              />
            </div>

            <DialogFooter className="mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => setIsAddModalOpen(false)}
                className="rounded-xl h-11 px-6 font-bold"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="rounded-xl h-11 px-8 font-bold bg-primary shadow-lg shadow-primary/20"
              >
                {isSubmitting ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating...</>
                ) : (
                  "Create Class"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
