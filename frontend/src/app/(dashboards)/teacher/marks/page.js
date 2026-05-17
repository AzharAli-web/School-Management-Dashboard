"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  FileEdit,
  Save,
  User,
  BookOpen,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import api from "@/lib/axios";
import { toast } from "sonner";

export default function TeacherMarksPage() {
  const [exams, setExams] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedClass, setSelectedClass] = useState("10-A");
  const [selectedExam, setSelectedExam] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [marks, setMarks] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const examsForClass = useMemo(
    () => exams.filter((e) => e.class === selectedClass),
    [exams, selectedClass]
  );

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const { data } = await api.get("/exams");
        setExams(Array.isArray(data) ? data : []);
      } catch (error) {
        toast.error("Failed to fetch exams");
      }
    };
    fetchExams();
  }, []);

  useEffect(() => {
    if (examsForClass.length === 0) {
      setSelectedExam("");
      return;
    }
    if (!examsForClass.some((e) => e._id === selectedExam)) {
      setSelectedExam(examsForClass[0]._id);
    }
  }, [examsForClass, selectedExam]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/students?class=${encodeURIComponent(selectedClass)}`);
      setStudents(data.students || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch students");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedClass) fetchStudents();
  }, [selectedClass]);

  const handleStudentSelect = (student) => {
    setSelectedStudent(student);
    const exam = exams.find((e) => e._id === selectedExam);
    const initialMarks = {};
    exam?.subjects.forEach((sub) => {
      initialMarks[sub] = "";
    });
    setMarks(initialMarks);
  };

  const handleMarkChange = (subject, value) => {
    setMarks((prev) => ({
      ...prev,
      [subject]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!selectedStudent || !selectedExam) return;
    const exam = exams.find((e) => e._id === selectedExam);
    if (!exam) {
      toast.error("Select a valid exam");
      return;
    }
    const subjectMarks = exam.subjects.map((sub) => ({
      subject: sub,
      marks: marks[sub],
    }));
    const incomplete = subjectMarks.some(
      (r) => r.marks === "" || r.marks === undefined || Number.isNaN(Number(r.marks))
    );
    if (incomplete) {
      toast.error("Enter valid marks (0–100) for every subject");
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/exams/results/enter", {
        studentId: selectedStudent._id,
        examId: selectedExam,
        subjectMarks: subjectMarks.map((r) => ({ ...r, marks: Number(r.marks) })),
      });
      toast.success(`Marks saved for ${selectedStudent.name}`);
      setSelectedStudent(null);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save marks");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Enter Exam Marks</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-1">
          Choose class, then an exam for that class, then each student.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-zinc-900 p-6 border border-zinc-200 dark:border-zinc-800 rounded-3xl space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Class</label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl focus:ring-2 focus:ring-primary outline-none appearance-none transition-all"
              >
                <option value="10-A">Class 10-A</option>
                <option value="10-B">Class 10-B</option>
                <option value="9-A">Class 9-A</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Exam for this class</label>
              <select
                value={selectedExam}
                onChange={(e) => setSelectedExam(e.target.value)}
                className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl focus:ring-2 focus:ring-primary outline-none appearance-none transition-all"
              >
                {examsForClass.map((exam) => (
                  <option key={exam._id} value={exam._id}>
                    {exam.examName} — {new Date(exam.date).toLocaleDateString()}
                  </option>
                ))}
              </select>
              {examsForClass.length === 0 && (
                <p className="text-xs text-amber-600 dark:text-amber-500 flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  No exams scheduled for this class. Ask admin to create one.
                </p>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden">
            <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/50">
              <h3 className="font-bold">Students in {selectedClass}</h3>
            </div>
            <div className="max-h-[400px] overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800">
              {loading ? (
                <div className="p-8 text-center animate-pulse">Loading...</div>
              ) : (
                students.map((student) => (
                  <button
                    key={student._id}
                    type="button"
                    onClick={() => handleStudentSelect(student)}
                    className={`w-full p-4 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors ${
                      selectedStudent?._id === student._id ? "bg-primary/5 border-l-4 border-primary" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                        {student.name.charAt(0)}
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-semibold">{student.name}</p>
                        <p className="text-xs text-zinc-500">Roll: {student.rollNumber}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-zinc-300" />
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          {selectedStudent && selectedExam && examsForClass.length > 0 ? (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 shadow-sm"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-primary text-white flex items-center justify-center">
                    <FileEdit className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{selectedStudent.name}</h2>
                    <p className="text-zinc-500">
                      Class: {selectedClass} • Roll: {selectedStudent.rollNumber}
                    </p>
                    <p className="text-sm text-primary font-medium mt-1">
                      {exams.find((e) => e._id === selectedExam)?.examName}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.keys(marks).map((subject) => (
                  <div key={subject} className="space-y-2">
                    <label className="text-sm font-bold flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-primary" />
                      {subject}
                    </label>
                    <input
                      type="number"
                      max={100}
                      min={0}
                      placeholder="0–100"
                      value={marks[subject]}
                      onChange={(e) => handleMarkChange(subject, e.target.value)}
                      className="w-full p-4 bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all text-lg font-mono"
                    />
                  </div>
                ))}
              </div>

              <div className="mt-12 flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setSelectedStudent(null)}
                  className="px-8 py-3 rounded-2xl font-semibold text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex items-center gap-2 px-10 py-3 bg-primary text-white rounded-2xl font-bold hover:opacity-90 disabled:opacity-50 transition-all shadow-xl shadow-primary/20"
                >
                  {submitting ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Save className="w-5 h-5" />
                  )}
                  Save result
                </button>
              </div>
            </motion.div>
          ) : (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-zinc-400 bg-zinc-50/50 dark:bg-zinc-900/50 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl p-12 text-center">
              <User className="w-16 h-16 mb-4 opacity-10" />
              <h3 className="text-xl font-bold text-zinc-500">
                {examsForClass.length === 0 ? "No exam for this class" : "Select a student"}
              </h3>
              <p className="max-w-xs mt-2">
                {examsForClass.length === 0
                  ? "Switch class or contact admin to schedule an exam."
                  : "Pick a student from the list to enter marks for the selected exam."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
