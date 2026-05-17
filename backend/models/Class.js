const mongoose = require("mongoose");

const classSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    section: { type: String, required: true },
    capacity: { type: Number, required: true },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      required: true,
    },
    subjects: [{ type: String }],
    timetable: [
      {
        time: { type: String, required: true },
        subject: { type: String, required: true },
        teacher: { type: String, required: true },
      }
    ],
  },
  { timestamps: true }
);

// Unique index on name and section
classSchema.index({ name: 1, section: 1 }, { unique: true });

const Class = mongoose.model("Class", classSchema);
module.exports = Class;
