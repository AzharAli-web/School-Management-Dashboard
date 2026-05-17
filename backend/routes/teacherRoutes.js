const express = require("express");
const router = express.Router();
const {
  createTeacher,
  getTeachers,
  getTeacherById,
  updateTeacher,
  deleteTeacher,
} = require("../controllers/teacherController");
const { protect, authorize } = require("../middleware/authMiddleware");

// All routes: JWT protected + Admin only
router.use(protect);
router.use(authorize("admin"));

router.route("/")
  .post(createTeacher)
  .get(getTeachers);

router.route("/:id")
  .get(getTeacherById)
  .put(updateTeacher)
  .delete(deleteTeacher);

module.exports = router;
