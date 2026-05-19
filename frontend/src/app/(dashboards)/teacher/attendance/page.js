"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Save,
  ChevronRight,
  Filter
} from "lucide-react";
import api from "@/lib/axios";
import { toast } from "sonner";

export default function TeacherAttendancePage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [className, setClassName] = useState("10-A"); // Default or from list
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState({}); // { studentId: status }

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/students?class=${className}`);
      setStudents(data.students || []);


      const initialAttendance = {};
      if (data.students && Array.isArray(data.students)) {
        data.students.forEach(s => {
          initialAttendance[s._id] = "Present";
        });
      }
      setAttendance(initialAttendance);
    } catch (error) {
      toast.error("Failed to fetch students");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [className]);

  const handleStatusChange = (studentId, status) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const records = Object.keys(attendance).map(id => ({
        studentId: id,
        status: attendance[id]
      }));

      await api.post("/attendance/mark", {
        students: records,
        className,
        date
      });

      toast.success("Attendance marked successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to mark attendance");
    } finally {
      setSubmitting(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mark Attendance</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">Manage daily attendance for your classes</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <select
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              className="pl-10 pr-8 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-primary outline-none appearance-none transition-all"
            >
              <option value="10-A">Class 10-A</option>
              <option value="10-B">Class 10-B</option>
              <option value="9-A">Class 9-A</option>
            </select>
          </div>
        </div>
      </div>


      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/50">
                <th className="px-6 py-4 font-semibold text-sm">Student</th>
                <th className="px-6 py-4 font-semibold text-sm">Roll No</th>
                <th className="px-6 py-4 font-semibold text-sm text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900">
              {loading ? (
                [1, 2, 3].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan="3" className="px-6 py-8 bg-zinc-50/20 dark:bg-zinc-900/20"></td>
                  </tr>
                ))
              ) : (
                students.map((student) => (
                  <motion.tr
                    key={student._id}
                    variants={itemVariants}
                    className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                          {student.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium">{student.name}</p>
                          <p className="text-xs text-zinc-500">{student.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400 font-mono text-sm">
                      #{student.rollNumber}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        {[
                          { id: 'Present', icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20', border: 'border-green-200 dark:border-green-800' },
                          { id: 'Absent', icon: XCircle, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-200 dark:border-red-800' },
                          { id: 'Late', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-200 dark:border-amber-800' }
                        ].map(status => (
                          <button
                            key={status.id}
                            onClick={() => handleStatusChange(student._id, status.id)}
                            className={`p-2 rounded-xl border transition-all flex items-center gap-2 ${attendance[student._id] === status.id
                                ? `${status.bg} ${status.border} ${status.color} shadow-sm ring-1 ring-inset ring-current/20`
                                : 'border-zinc-100 dark:border-zinc-800 text-zinc-400 grayscale hover:grayscale-0'
                              }`}
                          >
                            <status.icon className="w-5 h-5" />
                            <span className="text-xs font-semibold hidden sm:inline">{status.id}</span>
                          </button>
                        ))}
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-zinc-100 dark:border-zinc-900 flex justify-between items-center bg-zinc-50/30 dark:bg-zinc-900/30">
          <div className="text-sm text-zinc-500">
            Total Students: <span className="font-bold text-zinc-900 dark:text-zinc-100">{students.length}</span>
          </div>
          <button
            onClick={handleSubmit}
            disabled={submitting || students.length === 0}
            className="flex items-center gap-2 px-8 py-3 bg-primary text-white rounded-2xl font-semibold hover:opacity-90 disabled:opacity-50 transition-all shadow-lg shadow-primary/20"
          >
            {submitting ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            Submit Attendance
          </button>
        </div>
      </motion.div>
    </div>
  );
}
