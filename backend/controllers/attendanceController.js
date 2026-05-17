const Attendance = require("../models/Attendance");
const Student = require("../models/Student");

// @desc    Mark attendance for a class
// @route   POST /api/attendance/mark
// @access  Private (Teacher)
const markAttendance = async (req, res) => {
  const { students, className, date } = req.body;

  if (!students || !Array.isArray(students) || !className || !date) {
    return res.status(400).json({ message: "Please provide students list, class name and date" });
  }

  try {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);

    const attendanceRecords = students.map((student) => ({
      studentId: student.studentId,
      status: student.status,
      class: className,
      date: dayStart,
      markedBy: req.user._id,
    }));

    // Use bulkWrite for performance and handling potential duplicates if not caught by unique index gracefully
    const operations = attendanceRecords.map(record => ({
      updateOne: {
        filter: { studentId: record.studentId, date: record.date },
        update: { $set: record },
        upsert: true
      }
    }));

    await Attendance.bulkWrite(operations);

    res.status(201).json({ message: "Attendance marked successfully" });
  } catch (error) {
    console.error("Mark Attendance Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get attendance for a specific class/date
// @route   GET /api/attendance/class/:className
// @access  Private (Teacher/Admin)
const getClassAttendance = async (req, res) => {
  const { className } = req.params;
  const { date } = req.query;

  try {
    const query = { class: className };
    if (date) {
      const searchDate = new Date(date);
      searchDate.setHours(0, 0, 0, 0);
      query.date = searchDate;
    }

    const attendance = await Attendance.find(query).populate("studentId", "name rollNumber");
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get attendance for a specific student
// @route   GET /api/attendance/student/:studentId
// @access  Private (Student/Admin/Teacher)
const getStudentAttendance = async (req, res) => {
  const { studentId } = req.params;

  try {
    // If student, check if it's their own record
    if (req.user.role === 'student') {
        // Need to find the student document first to get the user ID
        const studentDoc = await Student.findById(studentId);
        if (!studentDoc || studentDoc.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized to view this attendance" });
        }
    }

    const attendance = await Attendance.find({ studentId }).sort({ date: -1 });
    
    // Calculate percentage
    const totalDays = attendance.length;
    const presentDays = attendance.filter(a => a.status === 'Present').length;
    const percentage = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(2) : 0;

    res.json({
        records: attendance,
        stats: {
            totalDays,
            presentDays,
            percentage
        }
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get attendance summary for admin (charts)
// @route   GET /api/attendance/admin/stats
// @access  Private (Admin)
const getAttendanceStats = async (req, res) => {
    try {
        const stats = await Attendance.aggregate([
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 }
                }
            }
        ]);
        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

// @desc    Get all attendance records for export
// @route   GET /api/attendance/admin/export
// @access  Private (Admin)
const getAllAttendance = async (req, res) => {
    try {
        const attendance = await Attendance.find()
            .populate("studentId", "name rollNumber")
            .sort({ date: -1 });
        res.json(attendance);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

module.exports = {
  markAttendance,
  getClassAttendance,
  getStudentAttendance,
  getAttendanceStats,
  getAllAttendance,
};
