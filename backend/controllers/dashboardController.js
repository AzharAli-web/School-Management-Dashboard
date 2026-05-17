const User = require("../models/User");

// @desc    Get admin dashboard statistics
// @route   GET /api/dashboard/admin
// @access  Private/Admin
const getAdminDashboardStats = async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: "student" });
    const totalTeachers = await User.countDocuments({ role: "teacher" });
    
    // Mock attendance data
    const attendanceOverview = {
      present: 85,
      absent: 10,
      late: 5
    };

    res.json({
      totalStudents,
      totalTeachers,
      attendanceOverview,
      recentActivity: [
        { id: 1, action: "New student enrolled", time: "2 hours ago" },
        { id: 2, action: "Teacher uploaded grades", time: "5 hours ago" }
      ]
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get teacher dashboard data
// @route   GET /api/dashboard/teacher
// @access  Private/Teacher
const getTeacherDashboardStats = async (req, res) => {
  try {
    res.json({
      assignedClasses: 4,
      todaysSchedule: [
        { id: 1, subject: "Mathematics", time: "09:00 AM", grade: "10th Grade" },
        { id: 2, subject: "Physics", time: "11:00 AM", grade: "11th Grade" }
      ],
      attendanceQuickView: {
        totalStudents: 120,
        presentToday: 115
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get student dashboard data
// @route   GET /api/dashboard/student
// @access  Private/Student
const getStudentDashboardStats = async (req, res) => {
  try {
    res.json({
      attendancePercentage: 92,
      latestResults: [
        { id: 1, subject: "Mathematics", score: "A-" },
        { id: 2, subject: "Physics", score: "B+" }
      ],
      upcomingAssignments: [
        { id: 1, title: "Algebra Homework", dueDate: "Tomorrow" },
        { id: 2, title: "Physics Lab Report", dueDate: "Friday" }
      ]
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { 
  getAdminDashboardStats, 
  getTeacherDashboardStats, 
  getStudentDashboardStats 
};
