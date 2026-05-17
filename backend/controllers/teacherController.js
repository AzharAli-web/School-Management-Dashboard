const Teacher = require("../models/Teacher");
const User = require("../models/User");

// @desc    Create a new teacher
// @route   POST /api/teachers
// @access  Private/Admin
const createTeacher = async (req, res) => {
  try {
    const {
      name, email, password, subject,
      assignedClasses, phone, address,
      qualification, experience,
    } = req.body;

    const userExists = await User.findOne({ email });
    const teacherExists = await Teacher.findOne({ email });

    if (userExists || teacherExists) {
      return res.status(400).json({ message: "A user with this email already exists" });
    }

    // Create login account with teacher role
    const user = await User.create({ name, email, password, role: "teacher" });

    if (!user) {
      return res.status(400).json({ message: "Failed to create user account" });
    }

    const teacher = await Teacher.create({
      user: user._id,
      name,
      email,
      subject,
      assignedClasses: assignedClasses || [],
      phone,
      address,
      qualification,
      experience,
    });

    res.status(201).json(teacher);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get all teachers
// @route   GET /api/teachers
// @access  Private/Admin
const getTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.find({}).sort({ createdAt: -1 });
    res.json(teachers);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get teacher by ID
// @route   GET /api/teachers/:id
// @access  Private/Admin
const getTeacherById = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id).populate("user", "name email avatar");

    if (teacher) {
      res.json(teacher);
    } else {
      res.status(404).json({ message: "Teacher not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Update teacher
// @route   PUT /api/teachers/:id
// @access  Private/Admin
const updateTeacher = async (req, res) => {
  try {
    const { name, subject, assignedClasses, phone, address, qualification, experience } = req.body;

    const teacher = await Teacher.findById(req.params.id);

    if (teacher) {
      teacher.name = name || teacher.name;
      teacher.subject = subject || teacher.subject;
      teacher.assignedClasses = assignedClasses || teacher.assignedClasses;
      teacher.phone = phone || teacher.phone;
      teacher.address = address || teacher.address;
      teacher.qualification = qualification || teacher.qualification;
      teacher.experience = experience !== undefined ? experience : teacher.experience;

      // Also update name in user account
      if (name) {
        await User.findByIdAndUpdate(teacher.user, { name });
      }

      const updatedTeacher = await teacher.save();
      res.json(updatedTeacher);
    } else {
      res.status(404).json({ message: "Teacher not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Delete teacher
// @route   DELETE /api/teachers/:id
// @access  Private/Admin
const deleteTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id);

    if (teacher) {
      // Delete linked user account
      await User.findByIdAndDelete(teacher.user);
      // Delete teacher profile
      await Teacher.findByIdAndDelete(req.params.id);
      res.json({ message: "Teacher removed" });
    } else {
      res.status(404).json({ message: "Teacher not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  createTeacher,
  getTeachers,
  getTeacherById,
  updateTeacher,
  deleteTeacher,
};
