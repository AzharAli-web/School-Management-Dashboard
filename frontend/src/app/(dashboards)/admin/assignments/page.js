"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Users,
  CheckCircle2,
  Clock,
  BarChart3,
  TrendingUp,
  Loader2,
  Calendar,
} from "lucide-react";
import api from "@/lib/axios";
import { toast } from "sonner";

export default function AdminAssignmentsPage() {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get("/assignments/admin/overview");
        setOverview(data);
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to load overview");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const byStatusMap = {};
  (overview?.byStatus || []).forEach((row) => {
    byStatusMap[row._id] = row.count;
  });

  const gradedPct =
    overview?.totalSubmissions > 0
      ? Math.round((overview.evaluatedCount / overview.totalSubmissions) * 100)
      : 0;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto flex justify-center py-24 text-zinc-500">
        <Loader2 className="w-10 h-10 animate-spin" />
      </div>
    );
  }

  if (!overview) {
    return (
      <div className="max-w-7xl mx-auto p-8 text-center text-zinc-500">No data available.</div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-black tracking-tight">Assignment overview</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-1">
          Monitor assignments and submissions across the school.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            label: "Total assignments",
            value: overview.totalAssignments,
            icon: FileText,
            color: "text-blue-600 dark:text-blue-400",
            bg: "bg-blue-50 dark:bg-blue-950/40",
          },
          {
            label: "Submissions",
            value: overview.totalSubmissions,
            icon: Users,
            color: "text-purple-600 dark:text-purple-400",
            bg: "bg-purple-50 dark:bg-purple-950/40",
          },
          {
            label: "Graded",
            value: `${gradedPct}%`,
            icon: CheckCircle2,
            color: "text-green-600 dark:text-green-400",
            bg: "bg-green-50 dark:bg-green-950/40",
          },
          {
            label: "Awaiting grade",
            value: overview.awaitingGrade,
            icon: Clock,
            color: "text-amber-600 dark:text-amber-400",
            bg: "bg-amber-50 dark:bg-amber-950/40",
          },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="p-8 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2rem] shadow-sm"
          >
            <div className={`w-14 h-14 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center mb-4`}>
              <stat.icon className="w-7 h-7" />
            </div>
            <p className="text-sm text-zinc-500 font-bold uppercase tracking-widest">{stat.label}</p>
            <h3 className="text-3xl font-black mt-1">{stat.value}</h3>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] overflow-hidden shadow-sm">
          <div className="p-8 border-b border-zinc-100 dark:border-zinc-800">
            <h3 className="text-xl font-black">Recent assignments</h3>
            <p className="text-sm text-zinc-500 mt-1">Newest first · submission count per task</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-zinc-50/50 dark:bg-zinc-800/50 border-b border-zinc-100 dark:border-zinc-800">
                  <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                    Assignment
                  </th>
                  <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                    Class
                  </th>
                  <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                    Due
                  </th>
                  <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-right">
                    Submissions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {(overview.recentAssignments || []).map((item) => (
                  <tr key={item._id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20">
                    <td className="px-6 py-4">
                      <p className="font-bold text-zinc-900 dark:text-white">{item.title}</p>
                      <p className="text-xs text-zinc-500">{item.subject}</p>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-zinc-600 dark:text-zinc-300">
                      {item.class}
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-500">
                      {item.deadline ? new Date(item.deadline).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-6 py-4 text-right font-mono font-bold text-sm">
                      {item.submissionCount ?? 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {(!overview.recentAssignments || overview.recentAssignments.length === 0) && (
              <p className="p-8 text-center text-zinc-500">No assignments created yet.</p>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="p-8 bg-zinc-900 text-white rounded-[2.5rem] relative overflow-hidden shadow-2xl">
            <BarChart3 className="w-24 h-24 absolute -right-4 -bottom-4 opacity-10" />
            <h4 className="text-lg font-black mb-4">Submission status mix</h4>
            <ul className="space-y-3 text-sm">
              {Object.keys(byStatusMap).length === 0 ? (
                <li className="text-zinc-400">No submissions recorded.</li>
              ) : (
                Object.entries(byStatusMap).map(([status, count]) => (
                  <li key={status} className="flex justify-between border-b border-zinc-800 pb-2">
                    <span className="text-zinc-400">{status}</span>
                    <span className="font-mono font-bold">{count}</span>
                  </li>
                ))
              )}
            </ul>
          </div>

          <div className="p-8 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] bg-white dark:bg-zinc-950">
            <TrendingUp className="w-8 h-8 text-primary mb-4" />
            <h4 className="font-bold">Grading progress</h4>
            <p className="text-xs text-zinc-500 mt-1">
              {overview.evaluatedCount} of {overview.totalSubmissions} submissions marked as evaluated.
            </p>
            <div className="mt-4 space-y-2">
              <div className="h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${gradedPct}%` }}
                />
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/50 text-sm text-zinc-600 dark:text-zinc-400 flex gap-3">
            <Calendar className="w-5 h-5 shrink-0 text-primary" />
            Teachers create tasks; students submit HTTPS file links (e.g. Cloudinary). Use the teacher panel to
            grade work.
          </div>
        </div>
      </div>
    </div>
  );
}
