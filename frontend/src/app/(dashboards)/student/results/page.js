"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Trophy,
  Download,
  ChevronDown,
  ChevronUp,
  Award,
  BookOpen,
  TrendingUp,
  GraduationCap,
} from "lucide-react";
import api from "@/lib/axios";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";
import { printResultReport } from "@/lib/resultPrint";

export default function StudentResultsPage() {
  const { user } = useAuthStore();
  const [results, setResults] = useState([]);
  const [studentName, setStudentName] = useState("");
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const profileRes = await api.get("/auth/profile");
        const studentId = profileRes.data.studentId;
        setStudentName(profileRes.data.name || "Student");
        if (studentId) {
          const { data } = await api.get(`/exams/results/student/${studentId}`);
          const list = Array.isArray(data) ? data : [];
          setResults(list);
          if (list.length > 0) setExpandedId(list[0]._id);
        }
      } catch (error) {
        console.error("Fetch results error:", error);
        toast.error("Could not load results");
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [user]);

  const summary = useMemo(() => {
    if (!results.length) return null;
    const avg =
      results.reduce((a, r) => a + (Number(r.percentage) || 0), 0) / results.length;
    const top = results.reduce((a, b) =>
      (Number(a.percentage) || 0) >= (Number(b.percentage) || 0) ? a : b
    );
    return {
      count: results.length,
      averagePct: Math.round(avg * 100) / 100,
      bestGrade: top?.grade || "—",
    };
  }, [results]);

  const handleDownloadPdf = (result) => {
    const opened = printResultReport({ result, studentName });
    if (!opened) {
      toast.error("Allow pop-ups to print or save as PDF");
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center animate-pulse text-zinc-500">Fetching your results...</div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Academic results</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">
            Official marks and grades for each examination you have completed.
          </p>
        </div>
      </div>

      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              label: "Exams graded",
              value: summary.count,
              icon: BookOpen,
              accent: "from-blue-500/15 to-transparent",
            },
            {
              label: "Overall average",
              value: `${summary.averagePct}%`,
              icon: TrendingUp,
              accent: "from-emerald-500/15 to-transparent",
            },
            {
              label: "Highest grade band",
              value: summary.bestGrade,
              icon: GraduationCap,
              accent: "from-amber-500/15 to-transparent",
            },
          ].map((card) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-gradient-to-br ${card.accent} bg-white dark:bg-zinc-900 p-6 shadow-sm`}
            >
              <div className="flex items-center gap-3 mb-2 text-zinc-500 dark:text-zinc-400">
                <card.icon className="w-5 h-5" />
                <span className="text-xs font-bold uppercase tracking-wider">{card.label}</span>
              </div>
              <p className="text-3xl font-black text-zinc-900 dark:text-white">{card.value}</p>
            </motion.div>
          ))}
        </div>
      )}

      <div className="space-y-6">
        {results.length > 0 ? (
          results.map((result, index) => {
            const exam = result.examId;
            const examTitle = exam?.examName ?? "Exam";
            const examMeta = exam
              ? `${new Date(exam.date).toLocaleDateString()} • ${exam.class}`
              : "";

            return (
              <motion.div
                key={result._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.06 }}
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm"
              >
                <div
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setExpandedId(expandedId === result._id ? null : result._id);
                    }
                  }}
                  className={`p-8 cursor-pointer transition-colors ${
                    expandedId === result._id
                      ? "bg-primary/5"
                      : "hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                  }`}
                  onClick={() => setExpandedId(expandedId === result._id ? null : result._id)}
                >
                  <div className="flex flex-wrap items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                      <div
                        className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                          result.grade === "A+"
                            ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                            : "bg-primary/10 text-primary"
                        }`}
                      >
                        <Trophy className="w-8 h-8" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">{examTitle}</h3>
                        <p className="text-zinc-500 dark:text-zinc-400 text-sm">{examMeta}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-8 flex-wrap">
                      <div className="text-center min-w-[72px]">
                        <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Grade</p>
                        <p
                          className={`text-2xl font-black ${
                            result.grade === "A+"
                              ? "text-amber-500"
                              : "text-primary"
                          }`}
                        >
                          {result.grade}
                        </p>
                      </div>
                      <div className="text-center min-w-[72px]">
                        <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider">%</p>
                        <p className="text-2xl font-black text-zinc-900 dark:text-white">
                          {Math.round(Number(result.percentage) * 100) / 100}%
                        </p>
                      </div>
                      <div className="text-center min-w-[72px]">
                        <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Total</p>
                        <p className="text-2xl font-black text-zinc-900 dark:text-white">
                          {result.totalMarks}
                        </p>
                      </div>
                      {expandedId === result._id ? (
                        <ChevronUp className="w-6 h-6 text-zinc-300" />
                      ) : (
                        <ChevronDown className="w-6 h-6 text-zinc-300" />
                      )}
                    </div>
                  </div>
                </div>

                {expandedId === result._id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    className="px-8 pb-8 border-t border-zinc-100 dark:border-zinc-800"
                  >
                    <div className="pt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {(result.subjectMarks || []).map((sub, i) => (
                        <div
                          key={i}
                          className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <BookOpen className="w-4 h-4 text-primary" />
                            <span className="font-medium">{sub.subject}</span>
                          </div>
                          <span className="font-mono font-bold text-lg">{sub.marks}</span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-8 flex flex-wrap justify-end gap-3">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownloadPdf(result);
                        }}
                        className="flex items-center gap-2 px-6 py-2.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl font-semibold hover:opacity-90 transition-all"
                      >
                        <Download className="w-4 h-4" />
                        Download PDF (print)
                      </button>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            );
          })
        ) : (
          <div className="p-20 bg-zinc-50 dark:bg-zinc-900/50 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl text-center flex flex-col items-center">
            <Award className="w-16 h-16 text-zinc-300 mb-4" />
            <h3 className="text-xl font-bold text-zinc-500">No results yet</h3>
            <p className="text-zinc-400 mt-2 max-w-md">
              When your teachers publish marks for an exam, they will show up here with grades and a printable
              report.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
