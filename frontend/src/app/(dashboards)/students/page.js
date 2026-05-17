"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, MoreHorizontal, Loader2, Edit, Trash2, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import api from "@/lib/axios";
import Link from "next/link";
import StudentModal from "@/components/StudentModal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/dialog"; // Wait, shadcn alert-dialog is different. Let's just use window.confirm or regular Dialog if alert-dialog is not installed. 
// I'll use a basic custom confirmation modal if alert-dialog isn't installed, or install it.

export default function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [studentToEdit, setStudentToEdit] = useState(null);
  
  const { user } = useAuthStore();
  const router = useRouter();

  // Protect route - Admin Only
  useEffect(() => {
    if (user && user.role !== "admin") {
      router.replace(`/${user.role}/dashboard`);
    }
  }, [user, router]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/students");
      setStudents(data.students ?? data ?? []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch students");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === "admin") {
      fetchStudents();
    }
  }, [user]);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this student and their login account?")) {
      try {
        await api.delete(`/students/${id}`);
        toast.success("Student deleted successfully");
        setStudents(students.filter(s => s._id !== id));
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to delete student");
      }
    }
  };

  const filteredStudents = students.filter((student) =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.class.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (user?.role !== "admin") return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Students</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">
            Manage your student directory and their details.
          </p>
        </div>
        <Button onClick={() => { setStudentToEdit(null); setIsModalOpen(true); }} className="bg-primary text-primary-foreground shadow hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          Add Student
        </Button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 24 }}
        className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm overflow-hidden min-h-[400px]"
      >
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-900/50">
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <Input
              placeholder="Search by name, roll, or class..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center p-12 text-zinc-500">
            <Loader2 className="w-8 h-8 animate-spin mb-4 text-primary" />
            <p>Loading students...</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-zinc-200 dark:border-zinc-800">
                <TableHead>Student</TableHead>
                <TableHead>Roll Number</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Section</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence>
                {filteredStudents.map((student) => (
                  <motion.tr 
                    key={student._id} 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 border border-zinc-200 dark:border-zinc-800">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                            {student.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{student.name}</p>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">{student.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{student.rollNumber}</TableCell>
                    <TableCell>{student.class}</TableCell>
                    <TableCell>{student.section}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger className={buttonVariants({ variant: "ghost", className: "h-8 w-8 p-0" })}>
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem className="p-0">
                            <Link href={`/students/${student._id}`} className="flex w-full items-center px-2 py-1.5 cursor-pointer">
                              <Eye className="w-4 h-4 mr-2" /> View Profile
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => { setStudentToEdit(student); setIsModalOpen(true); }}>
                            <Edit className="w-4 h-4 mr-2" /> Edit Details
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/30" onClick={() => handleDelete(student._id)}>
                            <Trash2 className="w-4 h-4 mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </TableBody>
          </Table>
        )}
        {!loading && filteredStudents.length === 0 && (
          <div className="p-8 text-center text-zinc-500 dark:text-zinc-400">
            No students found.
          </div>
        )}
      </motion.div>

      {isModalOpen && (
        <StudentModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          studentToEdit={studentToEdit} 
          onSuccess={fetchStudents} 
        />
      )}
    </div>
  );
}
