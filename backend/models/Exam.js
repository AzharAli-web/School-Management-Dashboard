const mongoose = require("mongoose");

const examSchema = mongoose.Schema(
  {
    examName: {
      type: String,
      required: true,
      trim: true,
    },
    class: {
      type: String,
      required: true,
    },
    subjects: [
      {
        type: String,
        required: true,
      }
    ],
    date: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["Scheduled", "Ongoing", "Completed"],
      default: "Scheduled",
    }
  },
  { timestamps: true }
);

const Exam = mongoose.model("Exam", examSchema);
module.exports = Exam;
