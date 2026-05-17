"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  FileText,
  Users,
  Calendar,
  ChevronRight,
  ExternalLink,
  Loader2,
} from "lucide-react";
import api from "@/lib/axios";
import { toast } from "sonner";

export default function TeacherAssignmentsPage() {
  const [assignments, setAssignments] = useState([]);
  const [selectedClass, setSelectedClass] = useState("10-A");
  const [classOptions, setClassOptions] = useState(["10-A", "10-B", "9-A"]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loadingList, setLoadingList] = useState(false);
  const [loadingSubs, setLoadingSubs] = useState(false);
  const [grading, setGrading] = useState(null);
  const [gradeForm, setGradeForm] = useState({ marks: "", feedback: "" });
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    class: "10-A",
    subject: "",
    deadline: "",
    fileUrl: "",
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data } = await api.get("/auth/profile");
        if (data.role === "teacher" && data.teacher?.assignedClasses?.length) {
          const classes = data.teacher.assignedClasses;
          setClassOptions(classes);
          setSelectedClass((c) => (classes.includes(c) ? c : classes[0]));
          setFormData((f) => ({ ...f, class: classes.includes(f.class) ? f.class : classes[0] }));
        }
      } catch {
        /* ignore */
      }
    };
    loadProfile();
  }, []);

  const fetchAssignments = useCallback(async () => {
    setLoadingList(true);
    try {
      const { data } = await api.get(
        `/assignments/class/${encodeURIComponent(selectedClass)}`
      );
      setAssignments(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load assignments");
      setAssignments([]);
    } finally {
      setLoadingList(false);
    }
  }, [selectedClass]);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post("/assignments", {
        title: formData.title.trim(),
        description: formData.description.trim(),
        class: formData.class,
        subject: formData.subject.trim(),
        deadline: formData.deadline,
        fileUrl: formData.fileUrl.trim(),
      });
      toast.success("Assignment created");
      setShowCreateModal(false);
      setSelectedClass(formData.class);
      fetchAssignments();
      setFormData({
        title: "",
        description: "",
        class: formData.class,
        subject: "",
        deadline: "",
        fileUrl: "",
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create assignment");
    }
  };

  const viewSubmissions = async (assignment) => {
    setSelectedAssignment(assignment);
    setLoadingSubs(true);
    setGrading(null);
    try {
      const { data } = await api.get(`/assignments/${assignment._id}/submissions`);
      setSubmissions(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load submissions");
      setSubmissions([]);
    } finally {
      setLoadingSubs(false);
    }
  };

  const openGrade = (sub) => {
    setGrading(sub._id);
    setGradeForm({
      marks: sub.marks != null ? String(sub.marks) : "",
      feedback: sub.feedback || "",
    });
  };

  const saveGrade = async (submissionId) => {
    const marks = Number(gradeForm.marks);
    if (Number.isNaN(marks) || marks < 0 || marks > 100) {
      toast.error("Enter marks between 0 and 100");
      return;
    }
    try {
      await api.put(`/assignments/submissions/${submissionId}/grade`, {
        marks,
        feedback: gradeForm.feedback,
      });
      toast.success("Saved");
      setGrading(null);
      if (selectedAssignment) viewSubmissions(selectedAssignment);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save grade");
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Assignments</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">
            Create tasks, share reference links (Cloudinary), and grade submissions.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-bold hover:opacity-90 transition-all shadow-xl shadow-primary/20"
        >
          <Plus className="w-5 h-5" />
          New assignment
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm font-medium text-zinc-500">Class</span>
        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl font-medium min-w-[140px]"
        >
          {classOptions.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-lg font-bold flex items-center gap-2 px-2">
            <FileText className="w-5 h-5 text-primary" />
            Assignments for {selectedClass}
          </h2>
          {loadingList ? (
            <div className="p-8 flex justify-center text-zinc-400">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : (
            <div className="space-y-3">
              {assignments.map((assignment) => (
                <motion.button
                  key={assignment._id}
                  type="button"
                  whileHover={{ x: 4 }}
                  onClick={() => viewSubmissions(assignment)}
                  className={`w-full p-5 bg-white dark:bg-zinc-900 border text-left rounded-3xl transition-all ${
                    selectedAssignment?._id === assignment._id
                      ? "border-primary ring-1 ring-primary/20 shadow-md"
                      : "border-zinc-100 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 shadow-sm"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-black rounded-md uppercase tracking-wider">
                      {assignment.subject}
                    </span>
                    <span className="text-[10px] text-zinc-400 font-mono">
                      #{String(assignment._id).slice(-4)}
                    </span>
                  </div>
                  <h3 className="font-bold text-zinc-900 dark:text-white leading-tight mb-1">
                    {assignment.title}
                  </h3>
                  <div className="flex items-center gap-4 mt-4 text-xs text-zinc-500">
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {assignment.class}
                    </div>
                    <div className="flex items-center gap-1 text-red-500/80">
                      <Calendar className="w-3 h-3" />
                      {new Date(assignment.deadline).toLocaleDateString()}
                    </div>
                  </div>
                </motion.button>
              ))}
              {assignments.length === 0 && (
                <p className="text-sm text-zinc-500 px-2">No assignments for this class yet.</p>
              )}
            </div>
          )}
        </div>

        <div className="lg:col-span-2">
          {selectedAssignment ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-[2rem] overflow-hidden shadow-sm"
            >
              <div className="p-8 border-b border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/50">
                <div className="flex justify-between items-start gap-4 flex-wrap">
                  <div>
                    <h2 className="text-2xl font-black">{selectedAssignment.title}</h2>
                    <p className="text-zinc-500 mt-1 max-w-lg">{selectedAssignment.description}</p>
                    {selectedAssignment.fileUrl && (
                      <a
                        href={selectedAssignment.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-sm font-bold text-primary mt-2 hover:underline"
                      >
                        Reference / handout <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">
                      Submissions
                    </div>
                    <div className="text-3xl font-black text-primary">{submissions.length}</div>
                  </div>
                </div>
              </div>

              <div className="p-4">
                {loadingSubs ? (
                  <div className="p-12 text-center text-zinc-400">
                    <Loader2 className="w-8 h-8 animate-spin inline" />
                  </div>
                ) : submissions.length > 0 ? (
                  <div className="space-y-3">
                    {submissions.map((sub) => (
                      <div
                        key={sub._id}
                        className="p-4 bg-zinc-50/50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 rounded-2xl"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">
                              {sub.studentId?.name?.charAt(0) || "?"}
                            </div>
                            <div>
                              <p className="font-bold">{sub.studentId?.name || "Student"}</p>
                              <p className="text-xs text-zinc-500">
                                Roll {sub.studentId?.rollNumber ?? "—"} ·{" "}
                                {new Date(sub.createdAt).toLocaleString()}
                              </p>
                              <div className="flex flex-wrap gap-2 mt-1">
                                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800">
                                  {sub.status}
                                </span>
                                {sub.status === "Evaluated" && (
                                  <span className="text-[10px] font-bold text-primary">
                                    {sub.marks}/100
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 justify-end">
                            <a
                              href={sub.fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="p-2 hover:bg-primary/10 hover:text-primary rounded-xl transition-all inline-flex"
                            >
                              <ExternalLink className="w-5 h-5" />
                            </a>
                            {grading === sub._id ? (
                              <div className="flex flex-col gap-2 w-full sm:w-auto sm:flex-row sm:items-end">
                                <input
                                  type="number"
                                  min={0}
                                  max={100}
                                  placeholder="Marks"
                                  value={gradeForm.marks}
                                  onChange={(e) =>
                                    setGradeForm((g) => ({ ...g, marks: e.target.value }))
                                  }
                                  className="w-24 p-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                                />
                                <input
                                  type="text"
                                  placeholder="Feedback"
                                  value={gradeForm.feedback}
                                  onChange={(e) =>
                                    setGradeForm((g) => ({ ...g, feedback: e.target.value }))
                                  }
                                  className="flex-1 min-w-[160px] p-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                                />
                                <button
                                  type="button"
                                  onClick={() => saveGrade(sub._id)}
                                  className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-bold"
                                >
                                  Save
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setGrading(null)}
                                  className="px-3 py-2 text-sm text-zinc-500"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => openGrade(sub)}
                                className="px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl text-xs font-bold hover:opacity-90"
                              >
                                {sub.status === "Evaluated" ? "Update grade" : "Grade"}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-16 text-center">
                    <Users className="w-14 h-14 text-zinc-200 mx-auto mb-3" />
                    <h3 className="font-bold text-zinc-500">No submissions yet</h3>
                    <p className="text-zinc-400 text-sm mt-1">Students will appear here after they submit.</p>
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <div className="h-full min-h-[420px] flex flex-col items-center justify-center bg-zinc-50/50 dark:bg-zinc-900/50 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] p-12 text-center">
              <FileText className="w-16 h-16 mb-4 opacity-10" />
              <h3 className="text-xl font-bold text-zinc-400">Select an assignment</h3>
              <p className="text-zinc-500 mt-2 max-w-xs">
                Choose an assignment on the left to view and grade submissions.
              </p>
            </div>
          )}
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-zinc-900 w-full max-w-xl rounded-[2rem] overflow-hidden shadow-2xl border border-zinc-200 dark:border-zinc-800 max-h-[90vh] overflow-y-auto"
          >
            <div className="p-8 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
              <h2 className="text-2xl font-black">Create assignment</h2>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white text-2xl leading-none"
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-8 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-zinc-400">Title</label>
                  <input
                    required
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-zinc-400">Subject</label>
                  <input
                    required
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-zinc-400">Description</label>
                <textarea
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-zinc-400">Class</label>
                  <select
                    value={formData.class}
                    onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                    className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 outline-none focus:ring-2 focus:ring-primary"
                  >
                    {classOptions.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-zinc-400">Deadline</label>
                  <input
                    required
                    type="datetime-local"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-zinc-400">
                  Reference file URL (Cloudinary) — optional
                </label>
                <input
                  type="url"
                  value={formData.fileUrl}
                  onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
                  placeholder="https://res.cloudinary.com/..."
                  className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <button
                type="submit"
                className="w-full py-4 bg-primary text-white rounded-2xl font-black shadow-lg shadow-primary/25 hover:opacity-95"
              >
                Publish assignment
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
