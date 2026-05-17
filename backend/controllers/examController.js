const Exam = require("../models/Exam");
const Result = require("../models/Result");
const Student = require("../models/Student");
const Teacher = require("../models/Teacher");

const examAllowedFields = ["examName", "class", "subjects", "date", "status"];

// --- EXAM CONTROLLERS ---

// @desc    Create new exam
// @route   POST /api/exams
// @access  Private (Admin)
const createExam = async (req, res) => {
  try {
    const { examName, class: className, subjects, date } = req.body;
    if (!examName || !className || !date) {
      return res.status(400).json({ message: "examName, class, and date are required" });
    }
    if (!Array.isArray(subjects) || subjects.length === 0) {
      return res.status(400).json({ message: "subjects must be a non-empty array of strings" });
    }
    const exam = await Exam.create({
      examName: String(examName).trim(),
      class: String(className).trim(),
      subjects: subjects.map((s) => String(s).trim()).filter(Boolean),
      date: new Date(date),
    });
    res.status(201).json(exam);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get all exams (teachers: only for assigned classes)
// @route   GET /api/exams
// @access  Private
const getExams = async (req, res) => {
  try {
    const { class: classQuery } = req.query;
    let filter = {};

    if (req.user.role === "teacher") {
      const teacherDoc = await Teacher.findOne({ user: req.user._id });
      const allowed = teacherDoc?.assignedClasses?.length
        ? teacherDoc.assignedClasses
        : [];
      if (allowed.length === 0) {
        return res.json([]);
      }
      filter.class = classQuery && allowed.includes(classQuery) ? classQuery : { $in: allowed };
    } else if (classQuery) {
      filter.class = classQuery;
    }

    const exams = await Exam.find(filter).sort({ date: -1 });
    res.json(exams);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update exam (admin)
// @route   PATCH /api/exams/:id
// @access  Private (Admin)
const updateExam = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }
    const payload = {};
    for (const key of examAllowedFields) {
      if (req.body[key] !== undefined) payload[key] = req.body[key];
    }
    if (payload.subjects) {
      if (!Array.isArray(payload.subjects) || payload.subjects.length === 0) {
        return res.status(400).json({ message: "subjects must be a non-empty array" });
      }
      payload.subjects = payload.subjects.map((s) => String(s).trim()).filter(Boolean);
    }
    if (payload.date) payload.date = new Date(payload.date);
    Object.assign(exam, payload);
    await exam.save();
    res.json(exam);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Delete exam and its results (admin)
// @route   DELETE /api/exams/:id
// @access  Private (Admin)
const deleteExam = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }
    await Result.deleteMany({ examId: exam._id });
    await Exam.findByIdAndDelete(req.params.id);
    res.json({ message: "Exam and related results removed" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Performance analytics for one exam (admin)
// @route   GET /api/exams/:examId/analytics
// @access  Private (Admin)
const getExamAnalytics = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.examId);
    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }
    const results = await Result.find({ examId: exam._id }).populate("studentId", "name rollNumber class");
    const inClass = results.filter(
      (r) => r.studentId && typeof r.studentId === "object" && r.studentId.class === exam.class
    );
    const count = inClass.length;
    if (count === 0) {
      return res.json({
        exam,
        submittedCount: 0,
        averagePercentage: 0,
        gradeDistribution: {},
        topPerformers: [],
      });
    }
    const averagePercentage =
      Math.round((inClass.reduce((acc, r) => acc + r.percentage, 0) / count) * 100) / 100;
    const gradeDistribution = inClass.reduce((acc, r) => {
      acc[r.grade] = (acc[r.grade] || 0) + 1;
      return acc;
    }, {});
    const topPerformers = [...inClass]
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 8)
      .map((r) => ({
        studentId: r.studentId._id,
        name: r.studentId.name,
        rollNumber: r.studentId.rollNumber,
        percentage: r.percentage,
        grade: r.grade,
        totalMarks: r.totalMarks,
      }));
    res.json({
      exam,
      submittedCount: count,
      averagePercentage,
      gradeDistribution,
      topPerformers,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// --- RESULT CONTROLLERS ---

// @desc    Enter marks for a student
// @route   POST /api/results/enter
// @access  Private (Teacher/Admin)
const enterMarks = async (req, res) => {
  const { studentId, examId, subjectMarks } = req.body;

  if (!studentId || !examId || !Array.isArray(subjectMarks) || subjectMarks.length === 0) {
    return res.status(400).json({ message: "studentId, examId, and a non-empty subjectMarks array are required" });
  }

  try {
    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    const studentDoc = await Student.findById(studentId);
    if (!studentDoc) {
      return res.status(404).json({ message: "Student not found" });
    }
    if (studentDoc.class !== exam.class) {
      return res.status(400).json({ message: "Student class does not match the exam class" });
    }

    const examSubjects = [...exam.subjects].map((s) => String(s).trim());
    if (subjectMarks.length !== examSubjects.length) {
      return res.status(400).json({
        message: `subjectMarks must include exactly ${examSubjects.length} subject(s) for this exam`,
      });
    }

    const normalizedMarks = [];
    for (const sub of examSubjects) {
      const row = subjectMarks.find((m) => String(m.subject).trim() === sub);
      if (!row) {
        return res.status(400).json({ message: `Missing marks for subject: ${sub}` });
      }
      const m = Number(row.marks);
      if (Number.isNaN(m) || m < 0 || m > 100) {
        return res.status(400).json({ message: `Invalid marks for ${sub} (use 0–100)` });
      }
      normalizedMarks.push({ subject: sub, marks: m });
    }

    if (req.user.role === "teacher") {
      const teacherDoc = await Teacher.findOne({ user: req.user._id });
      if (!teacherDoc?.assignedClasses?.includes(studentDoc.class)) {
        return res.status(403).json({ message: "Not authorized to enter marks for this student" });
      }
    }

    const totalMarks = normalizedMarks.reduce((acc, curr) => acc + curr.marks, 0);
    const percentage = (totalMarks / (normalizedMarks.length * 100)) * 100;

    // Calculate Grade
    let grade = 'F';
    if (percentage >= 90) grade = 'A+';
    else if (percentage >= 80) grade = 'A';
    else if (percentage >= 70) grade = 'B';
    else if (percentage >= 60) grade = 'C';
    else if (percentage >= 50) grade = 'D';

    const result = await Result.findOneAndUpdate(
      { studentId, examId },
      {
        subjectMarks: normalizedMarks,
        totalMarks,
        percentage,
        grade,
      },
      { upsert: true, new: true }
    );

    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get student results
// @route   GET /api/results/student/:studentId
// @access  Private (Student/Teacher/Admin)
const getStudentResults = async (req, res) => {
  try {
    if (req.user.role === "student") {
      const studentDoc = await Student.findOne({ user: req.user._id });
      if (!studentDoc || studentDoc._id.toString() !== req.params.studentId) {
        return res.status(403).json({ message: "Not authorized to view these results" });
      }
    } else if (req.user.role === "teacher") {
      const studentDoc = await Student.findById(req.params.studentId);
      const teacherDoc = await Teacher.findOne({ user: req.user._id });
      if (!studentDoc || !teacherDoc?.assignedClasses?.includes(studentDoc.class)) {
        return res.status(403).json({ message: "Not authorized to view these results" });
      }
    }

    const results = await Result.find({ studentId: req.params.studentId })
      .populate("examId")
      .sort({ createdAt: -1 });
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get class performance for an exam
// @route   GET /api/results/exam/:examId/class/:className
// @access  Private (Teacher/Admin)
const getClassPerformance = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.examId);
    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }
    if (exam.class !== req.params.className) {
      return res.status(400).json({ message: "Class does not match this exam" });
    }

    if (req.user.role === "teacher") {
      const teacherDoc = await Teacher.findOne({ user: req.user._id });
      if (!teacherDoc?.assignedClasses?.includes(req.params.className)) {
        return res.status(403).json({ message: "Not authorized for this class" });
      }
    }

    const results = await Result.find({ examId: req.params.examId }).populate(
      "studentId",
      "name rollNumber class"
    );

    const classResults = results.filter(
      (r) => r.studentId && typeof r.studentId === "object" && r.studentId.class === req.params.className
    );

    res.json(classResults);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createExam,
  getExams,
  updateExam,
  deleteExam,
  getExamAnalytics,
  enterMarks,
  getStudentResults,
  getClassPerformance,
};
