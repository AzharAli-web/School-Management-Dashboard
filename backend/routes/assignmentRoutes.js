const express = require("express");
const router = express.Router();
const {
  createAssignment,
  getAssignmentsByClass,
  getMySubmissions,
  getAdminAssignmentOverview,
  submitAssignment,
  getSubmissions,
  gradeSubmission,
} = require("../controllers/assignmentController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.use(protect);

// Static paths first (avoid ":id" capturing "admin", "me", "class")
router.get("/admin/overview", authorize("admin"), getAdminAssignmentOverview);
router.get("/me/submissions", authorize("student"), getMySubmissions);
router.get("/class/:className", getAssignmentsByClass);

router.post("/", authorize("teacher", "admin"), createAssignment);

router.post("/:id/submit", authorize("student"), submitAssignment);
router.get("/:id/submissions", authorize("teacher", "admin"), getSubmissions);
router.put("/submissions/:submissionId/grade", authorize("teacher", "admin"), gradeSubmission);

module.exports = router;
