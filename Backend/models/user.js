import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ["student", "admin"],
    default: "student"
  },
  resumeUrl: {
    type: String,
  },
  skills: {
    type: [String],
    default: []
  },
  missingSkills: {
    type: [String],
    default: []
  },
  appliedCompanies: {
    type: [
      {
        companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company" },
        name: String,
        role: String,
        status: {
          type: String,
          enum: ["applied", "shortlisted", "interview", "selected", "rejected"],
          default: "applied"
        },
        appliedAt: {
          type: Date,
          default: Date.now
        }
      }
    ],
    default: []
  },
  progress: {
    applied: {
      type: Number,
      default: 0
    },
    shortlisted: {
      type: Number,
      default: 0
    },
    interview: {
      type: Number,
      default: 0
    },
    selected: {
      type: Number,
      default: 0
    }
  },
  roadmap: {
    type: [
      {
        title: String,
        description: String,
        url: String
      }
    ],
    default: []
  }
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

export default User;