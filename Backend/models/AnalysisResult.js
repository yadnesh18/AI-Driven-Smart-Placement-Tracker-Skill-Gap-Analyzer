import mongoose from "mongoose";

const analysisResultSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    companyName: {
      type: String,
      required: true,
    },
    roleName: {
      type: String,
      required: true,
    },
    score: {
      type: Number,
      required: true,
    },
    eligible: {
      type: Boolean,
      required: true,
    },
    scoreReason: {
      summary: { type: String, default: "" },
      breakdown: {
        type: [
          {
            category: String,
            matched: [String],
            missing: [String],
            weight: Number,
            earnedWeight: Number,
          },
        ],
        default: [],
      },
      positives: { type: [String], default: [] },
      improvements: { type: [String], default: [] },
    },
    matchedSkills: {
      type: [String],
      default: [],
    },
    missingSkills: {
      type: [String],
      default: [],
    },
    resumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resume",
    },
    analyzedAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["pending", "invited", "selected", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

// Compound indexes for common queries
analysisResultSchema.index({ studentId: 1, companyId: 1 });
analysisResultSchema.index({ companyId: 1, eligible: 1 });
analysisResultSchema.index({ studentId: 1, analyzedAt: -1 });

const AnalysisResult = mongoose.model("AnalysisResult", analysisResultSchema);
export default AnalysisResult;
