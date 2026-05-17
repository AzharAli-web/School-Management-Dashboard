const express = require("express");
const router = express.Router();
const {
  createStudent,
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
} = require("../controllers/studentController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.use(protect);

// Admins manage students; teachers may list/view students for their assigned classes (marks, attendance)
router.route("/")
  .post(authorize("admin"), createStudent)
  .get(authorize("admin", "teacher"), getStudents);

router.route("/:id")
  .get(authorize("admin", "teacher"), getStudentById)
  .put(authorize("admin"), updateStudent)
  .delete(authorize("admin"), deleteStudent);

module.exports = router;
