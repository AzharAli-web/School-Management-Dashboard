const express = require("express");
const router = express.Router();
const {
  createExam,
  getExams,
  updateExam,
  deleteExam,
  getExamAnalytics,
  enterMarks,
  getStudentResults,
  getClassPerformance,
} = require("../controllers/examController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.use(protect);

// Results (register before "/:examId/analytics" and "/:id")
router.post("/results/enter", authorize("teacher", "admin"), enterMarks);
router.get("/results/student/:studentId", getStudentResults);
router.get("/results/exam/:examId/class/:className", authorize("teacher", "admin"), getClassPerformance);

// Admin analytics for one exam
router.get("/:examId/analytics", authorize("admin"), getExamAnalytics);

router
  .route("/")
  .get(getExams)
  .post(authorize("admin"), createExam);

router.patch("/:id", authorize("admin"), updateExam);
router.delete("/:id", authorize("admin"), deleteExam);

module.exports = router;
