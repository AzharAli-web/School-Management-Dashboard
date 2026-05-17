const mongoose = require("mongoose");

const teacherSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    subject: { type: String, required: true },
    assignedClasses: [{ type: String }],
    phone: { type: String, required: true },
    address: { type: String, required: true },
    qualification: { type: String, required: true },
    experience: { type: Number, required: true }, // in years
  },
  { timestamps: true }
);

const Teacher = mongoose.model("Teacher", teacherSchema);
module.exports = Teacher;
