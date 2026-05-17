"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Calendar,
  Trash2,
  FilePlus2,
  Users,
  BarChart3,
  X,
  Loader2,
} from "lucide-react";
import api from "@/lib/axios";
import { toast } from "sonner";

export default function AdminExamsPage() {
  const [exams, setExams] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [analyticsExamId, setAnalyticsExamId] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [newExam, setNewExam] = useState({
    examName: "",
    class: "10-A",
    subjects: "",
    date: "",
  });

  const fetchExams = async () => {
    try {
      const { data } = await api.get("/exams");
      setExams(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error("Failed to load exams");
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const openAnalytics = async (examId) => {
    setAnalyticsExamId(examId);
    setAnalytics(null);
    setAnalyticsLoading(true);
    try {
      const { data } = await api.get(`/exams/${examId}/analytics`);
      setAnalytics(data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load analytics");
      setAnalyticsExamId(null);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete exam "${name}" and all entered results for it?`)) return;
    try {
      await api.delete(`/exams/${id}`);
      toast.success("Exam removed");
      fetchExams();
    } catch (error) {
      toast.error(error.response?.data?.message || "Delete failed");
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const subjectsArray = newExam.subjects.split(",").map((s) => s.trim()).filter(Boolean);
      await api.post("/exams", {
        examName: newExam.examName.trim(),
        class: newExam.class,
        subjects: subjectsArray,
        date: newExam.date,
      });
      toast.success("Exam scheduled successfully");
      setShowModal(false);
      fetchExams();
      setNewExam({ examName: "", class: "10-A", subjects: "", date: "" });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create exam");
    }
  };

  const gradeEntries = analytics?.gradeDistribution
    ? Object.entries(analytics.gradeDistribution).sort((a, b) => b[1] - a[1])
    : [];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Exam management</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">Schedule exams and review class performance</p>
        </div>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-bold hover:opacity-90 transition-all shadow-xl shadow-primary/20"
        >
          <Plus className="w-5 h-5" />
          Schedule exam
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            label: "Total exams",
            value: exams.length,
            icon: FilePlus2,
            color: "text-blue-600 dark:text-blue-400",
            bg: "bg-blue-50 dark:bg-blue-950/40",
          },
          {
            label: "Classes involved",
            value: [...new Set(exams.map((e) => e.class))].length,
            icon: Users,
            color: "text-purple-600 dark:text-purple-400",
            bg: "bg-purple-50 dark:bg-purple-950/40",
          },
          {
            label: "Upcoming",
            value: exams.filter((e) => new Date(e.date) > new Date()).length,
            icon: Calendar,
            color: "text-amber-600 dark:text-amber-400",
            bg: "bg-amber-50 dark:bg-amber-950/40",
          },
        ].map((stat, i) => (
          <div
            key={i}
            className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl flex items-center gap-6"
          >
            <div className={`w-14 h-14 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center`}>
              <stat.icon className="w-7 h-7" />
            </div>
            <div>
              <p className="text-sm text-zinc-500 font-medium">{stat.label}</p>
              <h3 className="text-2xl font-bold">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-zinc-50/50 dark:bg-zinc-800/50 border-b border-zinc-100 dark:border-zinc-800">
                <th className="px-6 py-4 font-bold text-sm">Exam</th>
                <th className="px-6 py-4 font-bold text-sm">Class</th>
                <th className="px-6 py-4 font-bold text-sm">Subjects</th>
                <th className="px-6 py-4 font-bold text-sm">Date</th>
                <th className="px-6 py-4 font-bold text-sm">Status</th>
                <th className="px-6 py-4 font-bold text-sm text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {exams.map((exam) => (
                <tr
                  key={exam._id}
                  className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20 transition-colors"
                >
                  <td className="px-6 py-4">
                    <p className="font-bold">{exam.examName}</p>
                    <p className="text-xs text-zinc-500">ID: …{String(exam._id).slice(-6)}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-full text-xs font-bold">
                      {exam.class}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {exam.subjects.map((s, i) => (
                        <span
                          key={i}
                          className="text-[10px] bg-primary/5 text-primary border border-primary/10 px-2 py-0.5 rounded-md font-medium"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">
                    {new Date(exam.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        exam.status === "Scheduled"
                          ? "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                          : exam.status === "Ongoing"
                            ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200"
                            : "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300"
                      }`}
                    >
                      {exam.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => openAnalytics(exam._id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 mr-2 text-sm font-semibold rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                    >
                      <BarChart3 className="w-4 h-4" />
                      Analytics
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(exam._id, exam.examName)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-lg text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-950/30"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-zinc-200 dark:border-zinc-800"
            >
              <div className="p-8 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                <h2 className="text-2xl font-bold">Schedule exam</h2>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                >
                  &times;
                </button>
              </div>
              <form onSubmit={handleCreate} className="p-8 space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-zinc-500">Exam name</label>
                  <input
                    required
                    type="text"
                    value={newExam.examName}
                    onChange={(e) => setNewExam({ ...newExam, examName: e.target.value })}
                    className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl focus:ring-2 focus:ring-primary outline-none"
                    placeholder="e.g. Midterm 2026"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-zinc-500">Class</label>
                  <select
                    value={newExam.class}
                    onChange={(e) => setNewExam({ ...newExam, class: e.target.value })}
                    className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl focus:ring-2 focus:ring-primary outline-none"
                  >
                    <option value="10-A">10-A</option>
                    <option value="10-B">10-B</option>
                    <option value="9-A">9-A</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-zinc-500">Subjects (comma separated)</label>
                  <input
                    required
                    type="text"
                    value={newExam.subjects}
                    onChange={(e) => setNewExam({ ...newExam, subjects: e.target.value })}
                    className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl focus:ring-2 focus:ring-primary outline-none"
                    placeholder="Math, English, Science"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-zinc-500">Date</label>
                  <input
                    required
                    type="date"
                    value={newExam.date}
                    onChange={(e) => setNewExam({ ...newExam, date: e.target.value })}
                    className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl focus:ring-2 focus:ring-primary outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-4 mt-4 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/30 hover:opacity-90 transition-all"
                >
                  Create exam
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {analyticsExamId && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between sticky top-0 bg-white dark:bg-zinc-900">
                <h2 className="text-xl font-bold">Performance analytics</h2>
                <button
                  type="button"
                  onClick={() => {
                    setAnalyticsExamId(null);
                    setAnalytics(null);
                  }}
                  className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-6">
                {analyticsLoading && (
                  <div className="flex justify-center py-12 text-zinc-500">
                    <Loader2 className="w-8 h-8 animate-spin" />
                  </div>
                )}
                {!analyticsLoading && analytics && (
                  <>
                    <div>
                      <p className="text-sm text-zinc-500">Exam</p>
                      <p className="text-lg font-bold">{analytics.exam?.examName}</p>
                      <p className="text-sm text-zinc-500">
                        Class {analytics.exam?.class} · {new Date(analytics.exam?.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60">
                        <p className="text-xs font-bold text-zinc-500 uppercase">Submissions</p>
                        <p className="text-2xl font-black">{analytics.submittedCount}</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60">
                        <p className="text-xs font-bold text-zinc-500 uppercase">Avg %</p>
                        <p className="text-2xl font-black">{analytics.averagePercentage}%</p>
                      </div>
                    </div>
                    {gradeEntries.length > 0 && (
                      <div>
                        <p className="text-sm font-bold mb-3">Grade distribution</p>
                        <div className="space-y-2">
                          {gradeEntries.map(([grade, count]) => (
                            <div key={grade} className="flex items-center gap-3">
                              <span className="w-10 font-mono font-bold">{grade}</span>
                              <div className="flex-1 h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-primary rounded-full"
                                  style={{
                                    width: `${Math.min(100, (count / analytics.submittedCount) * 100)}%`,
                                  }}
                                />
                              </div>
                              <span className="text-sm text-zinc-500 w-8 text-right">{count}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {analytics.topPerformers?.length > 0 && (
                      <div>
                        <p className="text-sm font-bold mb-3">Top students</p>
                        <ul className="space-y-2">
                          {analytics.topPerformers.map((p, i) => (
                            <li
                              key={p.studentId || i}
                              className="flex justify-between text-sm border border-zinc-100 dark:border-zinc-800 rounded-xl px-3 py-2"
                            >
                              <span>
                                {p.name}{" "}
                                <span className="text-zinc-500">({p.rollNumber})</span>
                              </span>
                              <span className="font-mono font-bold">
                                {p.percentage}% · {p.grade}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
