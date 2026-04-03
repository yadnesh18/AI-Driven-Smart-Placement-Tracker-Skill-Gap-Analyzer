import mongoose from "mongoose";

const resumeSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    filename: {
      type: String,
      required: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    cloudinaryPublicId: {
      type: String,
      default: "",
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["uploading", "processing", "done", "error"],
      default: "processing",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    version: {
      type: Number,
      default: 1,
    },
    extractedSkills: {
      type: [String],
      default: [],
    },
    extractedFrom: {
      skillsSection: { type: [String], default: [] },
      projectsSection: { type: [String], default: [] },
      educationSection: { type: [String], default: [] },
    },
    rawScore: {
      type: Number,
      default: 0,
    },
    scoreBreakdown: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

// Compound index for fast lookups
resumeSchema.index({ studentId: 1, isActive: 1 });
resumeSchema.index({ studentId: 1, version: -1 });

const Resume = mongoose.model("Resume", resumeSchema);
export default Resume;
