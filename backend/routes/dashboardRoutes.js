const express = require("express");
const router = express.Router();
const { 
  getAdminDashboardStats, 
  getTeacherDashboardStats, 
  getStudentDashboardStats 
} = require("../controllers/dashboardController");
const { protect, authorize } = require("../middleware/authMiddleware");

// Role-based routes
router.get("/admin", protect, authorize("admin"), getAdminDashboardStats);
router.get("/teacher", protect, authorize("teacher"), getTeacherDashboardStats);
router.get("/student", protect, authorize("student"), getStudentDashboardStats);

module.exports = router;
