const Class = require("../models/Class");
const Student = require("../models/Student");

// @desc    Get all classes
// @route   GET /api/classes
// @access  Private (Admin/Teacher)
const getClasses = async (req, res) => {
  try {
    const classes = await Class.find().populate("teacher", "name");
    
    // Add student count for each class
    const classesWithCount = await Promise.all(
      classes.map(async (cls) => {
        const studentCount = await Student.countDocuments({
          class: cls.name,
          section: cls.section,
        });
        return {
          ...cls._doc,
          studentCount,
        };
      })
    );

    res.json(classesWithCount);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get single class details
// @route   GET /api/classes/:id
// @access  Private (Admin/Teacher)
const getClassById = async (req, res) => {
  try {
    const cls = await Class.findById(req.params.id).populate("teacher", "name email phone");
    if (!cls) return res.status(404).json({ message: "Class not found" });

    const students = await Student.find({
      class: cls.name,
      section: cls.section,
    }).select("name rollNumber email");

    res.json({
      ...cls._doc,
      students,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Create a new class
// @route   POST /api/classes
// @access  Private (Admin)
const createClass = async (req, res) => {
  const { name, section, capacity, teacher, subjects } = req.body;

  try {
    const classExists = await Class.findOne({ name, section });
    if (classExists) {
      return res.status(400).json({ message: "Class with this section already exists" });
    }

    const cls = await Class.create({
      name,
      section,
      capacity,
      teacher,
      subjects,
      timetable: [
        { time: "09:00 AM", subject: subjects[0] || "General", teacher: "Assigned" },
        { time: "10:00 AM", subject: subjects[1] || "General", teacher: "Assigned" },
      ]
    });

    res.status(201).json(cls);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Update a class
// @route   PUT /api/classes/:id
// @access  Private (Admin)
const updateClass = async (req, res) => {
  try {
    const cls = await Class.findById(req.params.id);
    if (!cls) return res.status(404).json({ message: "Class not found" });

    const updatedClass = await Class.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    ).populate("teacher", "name");

    res.json(updatedClass);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Delete a class
// @route   DELETE /api/classes/:id
// @access  Private (Admin)
const deleteClass = async (req, res) => {
  try {
    const cls = await Class.findById(req.params.id);
    if (!cls) return res.status(404).json({ message: "Class not found" });

    await cls.deleteOne();
    res.json({ message: "Class removed" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getClasses,
  getClassById,
  createClass,
  updateClass,
  deleteClass,
};
