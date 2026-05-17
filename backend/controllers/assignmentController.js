const Assignment = require("../models/Assignment");
const Submission = require("../models/Submission");
const Student = require("../models/Student");
const Teacher = require("../models/Teacher");

const canTeacherAccessAssignment = async (userId, assignment) => {
  if (assignment.createdBy && assignment.createdBy.toString() === userId.toString()) {
    return true;
  }
  const teacherDoc = await Teacher.findOne({ user: userId });
  return !!(teacherDoc?.assignedClasses?.includes(assignment.class));
};

// @desc    Create assignment (teacher for their classes, admin any)
// @route   POST /api/assignments
// @access  Private (Teacher/Admin)
const createAssignment = async (req, res) => {
  try {
    const { title, description, class: className, subject, deadline, fileUrl } = req.body;
    if (!title || !description || !className || !subject || !deadline) {
      return res.status(400).json({
        message: "title, description, class, subject, and deadline are required",
      });
    }

    if (req.user.role === "teacher") {
      const teacherDoc = await Teacher.findOne({ user: req.user._id });
      if (!teacherDoc?.assignedClasses?.includes(String(className).trim())) {
        return res.status(403).json({
          message: "You can only create assignments for classes on your profile",
        });
      }
    }

    const assignment = await Assignment.create({
      title: String(title).trim(),
      description: String(description).trim(),
      class: String(className).trim(),
      subject: String(subject).trim(),
      deadline: new Date(deadline),
      fileUrl: fileUrl ? String(fileUrl).trim() : "",
      createdBy: req.user._id,
    });
    res.status(201).json(assignment);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    List assignments for a class
// @route   GET /api/assignments/class/:className
// @access  Private
const getAssignmentsByClass = async (req, res) => {
  try {
    const className = req.params.className;

    if (req.user.role === "student") {
      const studentDoc = await Student.findOne({ user: req.user._id });
      if (!studentDoc || studentDoc.class !== className) {
        return res.status(403).json({ message: "Not authorized to view assignments for this class" });
      }
    } else if (req.user.role === "teacher") {
      const teacherDoc = await Teacher.findOne({ user: req.user._id });
      if (!teacherDoc?.assignedClasses?.includes(className)) {
        return res.status(403).json({ message: "Not authorized for this class" });
      }
    }

    const assignments = await Assignment.find({ class: className }).sort({ createdAt: -1 });
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Current student's submissions (with assignment details)
// @route   GET /api/assignments/me/submissions
// @access  Private (Student)
const getMySubmissions = async (req, res) => {
  try {
    const studentDoc = await Student.findOne({ user: req.user._id });
    if (!studentDoc) {
      return res.status(400).json({ message: "Student profile not found" });
    }
    const submissions = await Submission.find({ studentId: studentDoc._id })
      .populate("assignmentId")
      .sort({ updatedAt: -1 });
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Admin monitoring: counts + recent assignments
// @route   GET /api/assignments/admin/overview
// @access  Private (Admin)
const getAdminAssignmentOverview = async (req, res) => {
  try {
    const totalAssignments = await Assignment.countDocuments();
    const totalSubmissions = await Submission.countDocuments();
    const evaluatedCount = await Submission.countDocuments({ status: "Evaluated" });
    const awaitingGrade = await Submission.countDocuments({
      status: { $in: ["Submitted", "Late"] },
    });

    const byStatus = await Submission.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const recentAssignments = await Assignment.find({})
      .sort({ createdAt: -1 })
      .limit(20)
      .populate("createdBy", "name email")
      .lean();

    const ids = recentAssignments.map((a) => a._id);
    const submissionAgg =
      ids.length === 0
        ? []
        : await Submission.aggregate([
            { $match: { assignmentId: { $in: ids } } },
            { $group: { _id: "$assignmentId", count: { $sum: 1 } } },
          ]);

    const countMap = Object.fromEntries(
      submissionAgg.map((r) => [String(r._id), r.count])
    );

    const recentWithCounts = recentAssignments.map((a) => ({
      ...a,
      submissionCount: countMap[String(a._id)] || 0,
    }));

    res.json({
      totalAssignments,
      totalSubmissions,
      evaluatedCount,
      awaitingGrade,
      byStatus,
      recentAssignments: recentWithCounts,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Submit assignment (student)
// @route   POST /api/assignments/:id/submit
// @access  Private (Student)
const submitAssignment = async (req, res) => {
  const { fileUrl, studentId: bodyStudentId } = req.body;
  const assignmentId = req.params.id;

  try {
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    if (!fileUrl || !String(fileUrl).trim()) {
      return res.status(400).json({
        message: "fileUrl is required (upload to Cloudinary and paste the secure URL)",
      });
    }

    let studentId = bodyStudentId;
    if (req.user.role === "student") {
      const studentDoc = await Student.findOne({ user: req.user._id });
      if (!studentDoc) {
        return res.status(400).json({ message: "Student profile not found" });
      }
      studentId = studentDoc._id;
    }

    if (!studentId) {
      return res.status(400).json({ message: "studentId is required" });
    }

    const studentDoc = await Student.findById(studentId);
    if (!studentDoc) {
      return res.status(404).json({ message: "Student not found" });
    }
    if (studentDoc.class !== assignment.class) {
      return res.status(400).json({ message: "This assignment is not for your class" });
    }

    const status = new Date() > new Date(assignment.deadline) ? "Late" : "Submitted";

    const submission = await Submission.findOneAndUpdate(
      { studentId, assignmentId },
      { fileUrl: String(fileUrl).trim(), status },
      { upsert: true, new: true }
    );

    res.status(201).json(submission);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Submissions for one assignment
// @route   GET /api/assignments/:id/submissions
// @access  Private (Teacher/Admin)
const getSubmissions = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    if (req.user.role === "teacher") {
      const allowed = await canTeacherAccessAssignment(req.user._id, assignment);
      if (!allowed) {
        return res.status(403).json({ message: "Not authorized to view these submissions" });
      }
    }

    const submissions = await Submission.find({ assignmentId: req.params.id })
      .populate("studentId", "name rollNumber class")
      .sort({ createdAt: -1 });
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Grade submission
// @route   PUT /api/assignments/submissions/:submissionId/grade
// @access  Private (Teacher/Admin)
const gradeSubmission = async (req, res) => {
  const { marks, feedback } = req.body;
  try {
    const submission = await Submission.findById(req.params.submissionId).populate({
      path: "assignmentId",
      select: "class createdBy",
    });

    if (!submission || !submission.assignmentId) {
      return res.status(404).json({ message: "Submission not found" });
    }

    const assignment = submission.assignmentId;

    if (req.user.role === "teacher") {
      const allowed = await canTeacherAccessAssignment(req.user._id, assignment);
      if (!allowed) {
        return res.status(403).json({ message: "Not authorized to grade this submission" });
      }
    }

    const m =
      marks === undefined || marks === "" || marks === null
        ? submission.marks
        : Number(marks);
    if (Number.isNaN(m) || m < 0 || m > 100) {
      return res.status(400).json({ message: "marks must be a number between 0 and 100" });
    }

    const updated = await Submission.findByIdAndUpdate(
      req.params.submissionId,
      {
        marks: m,
        feedback: feedback != null ? String(feedback) : submission.feedback,
        status: "Evaluated",
      },
      { new: true }
    ).populate("studentId", "name rollNumber class");

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createAssignment,
  getAssignmentsByClass,
  getMySubmissions,
  getAdminAssignmentOverview,
  submitAssignment,
  getSubmissions,
  gradeSubmission,
};
