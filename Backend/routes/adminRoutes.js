import express from "express";
import {
  getAdminDashboard,
  getAdminAnalytics,
  getStudents,
  getStudentsByCompany,
  inviteStudent,
  selectStudent,
  rejectStudent,
  getAdminCompanies,
} from "../controllers/adminController.js";
import { protect } from "../middleware/authMiddleware.js";
import Company from "../models/Company.js";
import User from "../models/user.js";

const router = express.Router();

// Dashboard & Analytics
router.get("/dashboard", protect, getAdminDashboard);
router.get("/analytics", protect, getAdminAnalytics);

// Student management
router.get("/students", protect, getStudents);
router.get("/students/by-company", protect, getStudentsByCompany);

// Student actions (Issue 6)
router.post("/students/:studentId/invite", protect, inviteStudent);
router.post("/students/:studentId/select", protect, selectStudent);
router.post("/students/:studentId/reject", protect, rejectStudent);

// Companies with applicant counts (Issue 6)
router.get("/companies", protect, getAdminCompanies);

// Update student application status (legacy)
router.put("/students/:id/status", protect, async (req, res) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const { id } = req.params;
    const { companyId, status } = req.body;

    if (!companyId || !status) {
      return res
        .status(400)
        .json({ message: "companyId and status are required" });
    }

    const validStatuses = [
      "applied",
      "shortlisted",
      "interview",
      "selected",
      "rejected",
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      });
    }

    const student = await User.findById(id);
    if (!student || student.role !== "student") {
      return res.status(404).json({ message: "Student not found" });
    }

    const appIndex = student.appliedCompanies.findIndex(
      (a) => a.companyId && a.companyId.toString() === companyId
    );

    if (appIndex === -1) {
      return res.status(404).json({ message: "Application not found" });
    }

    const oldStatus = student.appliedCompanies[appIndex].status;
    student.appliedCompanies[appIndex].status = status;

    if (student.progress) {
      if (oldStatus && student.progress[oldStatus] > 0) {
        student.progress[oldStatus] -= 1;
      }
      student.progress[status] = (student.progress[status] || 0) + 1;
    }

    await student.save();

    res.json({
      message: "Status updated successfully",
      student: {
        _id: student._id,
        appliedCompanies: student.appliedCompanies,
        progress: student.progress,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add company
router.post("/company", protect, async (req, res) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const {
      name,
      role,
      package: pkg,
      requiredSkills,
      description,
      location,
      deadline,
      isActive,
      logoUrl,
    } = req.body;
    if (!name || !role || typeof pkg === "undefined") {
      return res
        .status(400)
        .json({ message: "Name, role and package are required" });
    }

    const company = await Company.create({
      name,
      role,
      package: Number(pkg),
      requiredSkills: Array.isArray(requiredSkills)
        ? requiredSkills
        : typeof requiredSkills === "string" && requiredSkills.length
        ? requiredSkills
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : [],
      description: description || "",
      location: location || "",
      deadline: deadline || undefined,
      isActive: isActive !== undefined ? isActive : true,
      logoUrl: logoUrl || "",
    });

    res.status(201).json(company);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete company
router.delete("/company/:id", protect, async (req, res) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const { id } = req.params;
    const deleted = await Company.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Company not found" });
    }
    res.json({ message: "Company deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
