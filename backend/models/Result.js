const mongoose = require("mongoose");

const resultSchema = mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Student",
    },
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Exam",
    },
    subjectMarks: [
      {
        subject: { type: String, required: true },
        marks: { type: Number, required: true, min: 0, max: 100 },
      }
    ],
    totalMarks: {
      type: Number,
      required: true,
    },
    percentage: {
      type: Number,
      required: true,
    },
    grade: {
      type: String,
      required: true,
    },
    remarks: {
      type: String,
      default: "Good",
    }
  },
  { timestamps: true }
);

// Index to prevent multiple result entries for same student in same exam
resultSchema.index({ studentId: 1, examId: 1 }, { unique: true });

const Result = mongoose.model("Result", resultSchema);
module.exports = Result;
