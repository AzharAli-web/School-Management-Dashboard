const mongoose = require("mongoose");

const submissionSchema = mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    assignmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assignment",
      required: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["Submitted", "Pending", "Late", "Evaluated"],
      default: "Submitted",
    },
    marks: {
      type: Number,
      default: 0,
    },
    feedback: {
      type: String,
      default: "",
    }
  },
  { timestamps: true }
);

// Prevent duplicate submissions by same student for same assignment
submissionSchema.index({ studentId: 1, assignmentId: 1 }, { unique: true });

const Submission = mongoose.model("Submission", submissionSchema);
module.exports = Submission;
