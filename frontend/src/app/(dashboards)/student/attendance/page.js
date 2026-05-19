"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  Award,
  AlertCircle
} from "lucide-react";
import api from "@/lib/axios";
import { useAuthStore } from "@/store/authStore";

export default function StudentAttendancePage() {
  const { user } = useAuthStore();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttendance = async () => {
      if (!user?.studentId && !user?._id) return;
      try {

        const profileRes = await api.get("/auth/profile");
        const studentId = profileRes.data.studentId;

        if (studentId) {
          const { data } = await api.get(`/attendance/student/${studentId}`);
          setData(data);
        }
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [user]);

  if (loading) return <div className="flex items-center justify-center h-96 animate-pulse text-zinc-400">Loading your attendance data...</div>;

  const stats = data?.stats || { totalDays: 0, presentDays: 0, percentage: 0 };
  const records = data?.records || [];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Attendance</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-1">Track your daily presence and performance</p>
      </div>


      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Attendance Rate', value: `${stats.percentage}%`, icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { label: 'Days Present', value: stats.presentDays, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
          { label: 'Days Absent', value: stats.totalDays - stats.presentDays, icon: XCircle, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20' },
          { label: 'Total Working Days', value: stats.totalDays, icon: CalendarIcon, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' }
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl"
          >
            <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center mb-4`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <p className="text-sm text-zinc-500 font-medium">{stat.label}</p>
            <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-primary" />
            Recent History
          </h2>
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden">
            <div className="divide-y divide-zinc-100 dark:divide-zinc-900">
              {records.length > 0 ? records.map((record, i) => (
                <div key={i} className="p-4 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-xl ${record.status === 'Present' ? 'bg-green-100 text-green-600' :
                        record.status === 'Absent' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'
                      }`}>
                      {record.status === 'Present' ? <CheckCircle2 className="w-5 h-5" /> :
                        record.status === 'Absent' ? <XCircle className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="font-semibold">{new Date(record.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                      <p className="text-xs text-zinc-500">Status: {record.status}</p>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold ${record.status === 'Present' ? 'bg-green-100 text-green-700' :
                      record.status === 'Absent' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                    {record.status}
                  </div>
                </div>
              )) : (
                <div className="p-12 text-center text-zinc-500 flex flex-col items-center">
                  <AlertCircle className="w-12 h-12 mb-4 opacity-20" />
                  No attendance records found yet.
                </div>
              )}
            </div>
          </div>
        </div>


        <div className="space-y-6">
          <div className="p-6 bg-primary/10 border border-primary/20 rounded-3xl">
            <Award className="w-10 h-10 text-primary mb-4" />
            <h3 className="font-bold text-lg">Attendance Goal</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2">
              Maintain at least 95% attendance to unlock the "Perfect Scholar" badge and boost your internal grades.
            </p>
            <div className="mt-6 h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-1000"
                style={{ width: `${stats.percentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
