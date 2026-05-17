const express = require("express");
const router = express.Router();
const {
  markAttendance,
  getClassAttendance,
  getStudentAttendance,
  getAttendanceStats,
  getAllAttendance,
} = require("../controllers/attendanceController");
const { protect, authorize } = require("../middleware/authMiddleware");

// All attendance routes are protected
router.use(protect);

// Teachers and Admins can mark attendance
router.post("/mark", authorize("teacher", "admin"), markAttendance);

// View attendance by class (Teachers/Admin)
router.get("/class/:className", authorize("teacher", "admin"), getClassAttendance);

// View individual student attendance (Student sees own, others see all)
router.get("/student/:studentId", getStudentAttendance);

// Admin reports
router.get("/admin/stats", authorize("admin"), getAttendanceStats);
router.get("/admin/export", authorize("admin"), getAllAttendance);

module.exports = router;
