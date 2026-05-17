"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Upload,
  BookOpen,
  Calendar,
  ExternalLink,
  X,
  Award,
  AlertCircle,
} from "lucide-react";
import api from "@/lib/axios";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";

export default function StudentAssignmentsPage() {
  const { user } = useAuthStore();
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState(null);
  const [uploadFor, setUploadFor] = useState(null);
  const [fileUrl, setFileUrl] = useState("");

  const submissionByAssignmentId = useMemo(() => {
    const map = {};
    submissions.forEach((s) => {
      const aid = s.assignmentId?._id || s.assignmentId;
      if (aid) map[String(aid)] = s;
    });
    return map;
  }, [submissions]);

  const fetchData = async () => {
    try {
      const profileRes = await api.get("/auth/profile");
      const student = profileRes.data.student;
      const className = student?.class || "10-A";

      const [assignRes, subRes] = await Promise.all([
        api.get(`/assignments/class/${encodeURIComponent(className)}`),
        api.get("/assignments/me/submissions"),
      ]);
      setAssignments(Array.isArray(assignRes.data) ? assignRes.data : []);
      setSubmissions(Array.isArray(subRes.data) ? subRes.data : []);
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error(error.response?.data?.message || "Failed to load assignments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const openUpload = (assignmentId) => {
    setUploadFor(assignmentId);
    const existing = submissionByAssignmentId[String(assignmentId)];
    setFileUrl(existing?.fileUrl || "");
  };

  const handleSubmit = async () => {
    if (!uploadFor) return;
    const url = fileUrl.trim();
    if (!url) {
      toast.error("Paste your file URL (e.g. from Cloudinary)");
      return;
    }
    setSubmittingId(uploadFor);
    try {
      await api.post(`/assignments/${uploadFor}/submit`, { fileUrl: url });
      toast.success("Submitted successfully");
      setUploadFor(null);
      setFileUrl("");
      await fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Submission failed");
    } finally {
      setSubmittingId(null);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center animate-pulse text-zinc-500">Loading assignments...</div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-black tracking-tight">My assignments</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-1">
          Upload a Cloudinary (or other HTTPS) link to your completed work. Your teacher will grade it here.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {assignments.map((assignment, index) => {
          const isOverdue = new Date() > new Date(assignment.deadline);
          const sub = submissionByAssignmentId[String(assignment._id)];

          return (
            <motion.div
              key={assignment._id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.06 }}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2rem] overflow-hidden group hover:shadow-lg transition-shadow"
            >
              <div className="p-8 flex flex-col md:flex-row gap-8">
                <div className="flex-1 space-y-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-black rounded-lg uppercase tracking-wider">
                      {assignment.subject}
                    </span>
                    <span
                      className={`flex items-center gap-1 text-xs font-bold ${
                        isOverdue && !sub ? "text-red-500" : "text-zinc-400"
                      }`}
                    >
                      <Calendar className="w-3 h-3" />
                      Due: {new Date(assignment.deadline).toLocaleString()}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-2xl font-black text-zinc-900 dark:text-white">{assignment.title}</h3>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-2 leading-relaxed">
                      {assignment.description}
                    </p>
                  </div>

                  {assignment.fileUrl && (
                    <a
                      href={assignment.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline"
                    >
                      <FileText className="w-4 h-4" />
                      Teacher reference / handout
                    </a>
                  )}
                </div>

                <div className="md:w-72 flex flex-col justify-between gap-4 border-t md:border-t-0 md:border-l border-zinc-100 dark:border-zinc-800 pt-6 md:pt-0 md:pl-8">
                  <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Your status</p>
                    {sub ? (
                      <>
                        <div
                          className={`inline-flex px-3 py-1 rounded-full text-xs font-black uppercase ${
                            sub.status === "Evaluated"
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200"
                              : sub.status === "Late"
                                ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-200"
                                : "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200"
                          }`}
                        >
                          {sub.status}
                        </div>
                        {sub.status === "Evaluated" && (
                          <div className="flex items-center gap-2 text-sm">
                            <Award className="w-4 h-4 text-primary" />
                            <span className="font-bold">{sub.marks} / 100</span>
                            {sub.feedback && (
                              <p className="text-xs text-zinc-500 mt-1 w-full">{sub.feedback}</p>
                            )}
                          </div>
                        )}
                        {sub.fileUrl && (
                          <a
                            href={sub.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs font-bold text-primary inline-flex items-center gap-1"
                          >
                            Your file <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </>
                    ) : (
                      <div className="flex items-center gap-2 text-sm text-amber-700 dark:text-amber-300">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        Not submitted
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => openUpload(assignment._id)}
                    disabled={submittingId === assignment._id}
                    className={`w-full py-3.5 rounded-2xl flex items-center justify-center gap-2 font-black transition-all ${
                      submittingId === assignment._id
                        ? "bg-zinc-100 text-zinc-400"
                        : "bg-primary text-white shadow-lg shadow-primary/20 hover:opacity-95"
                    }`}
                  >
                    <Upload className="w-5 h-5" />
                    {sub ? "Update submission" : "Submit work"}
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}

        {assignments.length === 0 && (
          <div className="p-20 bg-zinc-50 dark:bg-zinc-900/50 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-[3rem] text-center flex flex-col items-center">
            <BookOpen className="w-16 h-16 text-zinc-200 mb-4" />
            <h3 className="text-xl font-bold text-zinc-400">No assignments yet</h3>
            <p className="text-zinc-500 mt-2">Your teachers have not posted tasks for your class.</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {uploadFor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 p-6 space-y-4"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold">Submit work</h3>
                <button
                  type="button"
                  onClick={() => {
                    setUploadFor(null);
                    setFileUrl("");
                  }}
                  className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-zinc-500">
                Upload your file to Cloudinary (or similar), then paste the <strong>https</strong> link below.
              </p>
              <input
                type="url"
                value={fileUrl}
                onChange={(e) => setFileUrl(e.target.value)}
                placeholder="https://res.cloudinary.com/..."
                className="w-full p-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 outline-none focus:ring-2 focus:ring-primary"
              />
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setUploadFor(null);
                    setFileUrl("");
                  }}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-zinc-500"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!!submittingId}
                  className="px-5 py-2 rounded-xl text-sm font-bold bg-primary text-white disabled:opacity-50"
                >
                  {submittingId ? "Sending…" : "Submit"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
