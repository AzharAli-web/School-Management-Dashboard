const Student = require("../models/Student");
const User = require("../models/User");
const Teacher = require("../models/Teacher");

// @desc    Create a new student
// @route   POST /api/students
// @access  Private/Admin
const createStudent = async (req, res) => {
  try {
    const { name, email, password, rollNumber, class: className, section, age, gender, phone, address, parentName, parentPhone } = req.body;

    // 1. Check if student or user already exists
    const userExists = await User.findOne({ email });
    const studentExists = await Student.findOne({ rollNumber });

    if (userExists) {
      return res.status(400).json({ message: "User with this email already exists" });
    }
    if (studentExists) {
      return res.status(400).json({ message: "Student with this roll number already exists" });
    }

    // 2. Create the User account for the student
    const user = await User.create({
      name,
      email,
      password,
      role: "student",
    });

    if (!user) {
      return res.status(400).json({ message: "Failed to create user account" });
    }

    // 3. Create the Student profile linked to the User
    const student = await Student.create({
      user: user._id,
      name,
      email,
      rollNumber,
      class: className,
      section,
      age,
      gender,
      phone,
      address,
      parentName,
      parentPhone,
      attendance: [],
    });

    res.status(201).json(student);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get all students
// @route   GET /api/students
// @access  Private/Admin
const getStudents = async (req, res) => {
  try {
    const { class: className } = req.query;

    if (req.user.role === "teacher") {
      if (!className) {
        return res.status(400).json({ message: "Teachers must pass a class query (?class=10-A)" });
      }
      const teacherDoc = await Teacher.findOne({ user: req.user._id });
      const allowed = teacherDoc?.assignedClasses?.includes(className);
      if (!allowed) {
        return res.status(403).json({ message: "Not authorized to list students for this class" });
      }
    }

    const filter = className ? { class: className } : {};
    const students = await Student.find(filter).sort({ createdAt: -1 });
    res.json({ students }); // Wrap in object as expected by frontend
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get student by ID
// @route   GET /api/students/:id
// @access  Private/Admin
const getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).populate("user", "name email avatar");

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    if (req.user.role === "teacher") {
      const teacherDoc = await Teacher.findOne({ user: req.user._id });
      const allowed = teacherDoc?.assignedClasses?.includes(student.class);
      if (!allowed) {
        return res.status(403).json({ message: "Not authorized to view this student" });
      }
    }

    res.json(student);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Update student
// @route   PUT /api/students/:id
// @access  Private/Admin
const updateStudent = async (req, res) => {
  try {
    const { name, rollNumber, class: className, section, age, gender, phone, address, parentName, parentPhone } = req.body;

    const student = await Student.findById(req.params.id);

    if (student) {
      student.name = name || student.name;
      student.rollNumber = rollNumber || student.rollNumber;
      student.class = className || student.class;
      student.section = section || student.section;
      student.age = age || student.age;
      student.gender = gender || student.gender;
      student.phone = phone || student.phone;
      student.address = address || student.address;
      student.parentName = parentName || student.parentName;
      student.parentPhone = parentPhone || student.parentPhone;

      // Sync name with User record
      if (name) {
        await User.findByIdAndUpdate(student.user, { name });
      }

      const updatedStudent = await student.save();
      res.json(updatedStudent);
    } else {
      res.status(404).json({ message: "Student not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Delete student
// @route   DELETE /api/students/:id
// @access  Private/Admin
const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (student) {
      // Delete the linked user account first
      await User.findByIdAndDelete(student.user);
      
      // Delete the student profile
      await Student.findByIdAndDelete(req.params.id);
      
      res.json({ message: "Student removed" });
    } else {
      res.status(404).json({ message: "Student not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  createStudent,
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
};
