import User from "../models/user.js";
import Company from "../models/Company.js";
import AnalysisResult from "../models/AnalysisResult.js";
import Notification from "../models/Notification.js";

const ensureAdmin = (user) => user && user.role === "admin";

// ─────────────────────────────────────────────
// Dashboard — top-level summary stats only (Issue 7)
// ─────────────────────────────────────────────
export const getAdminDashboard = async (req, res) => {
  try {
    if (!ensureAdmin(req.user)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const [totalStudents, totalCompanies, totalAnalyses] = await Promise.all([
      User.countDocuments({ role: "student" }),
      Company.countDocuments(),
      AnalysisResult.countDocuments(),
    ]);

    const eligibleCount = await AnalysisResult.countDocuments({
      eligible: true,
    });
    const eligiblePercent =
      totalAnalyses > 0
        ? Math.round((eligibleCount / totalAnalyses) * 100)
        : 0;

    // Most common missing skill
    const missingAgg = await AnalysisResult.aggregate([
      { $unwind: "$missingSkills" },
      { $group: { _id: "$missingSkills", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 },
    ]);
    const commonMissingSkill =
      missingAgg.length > 0 ? missingAgg[0]._id : "—";

    res.json({
      totalStudents,
      totalCompanies,
      totalAnalyses,
      eligiblePercent,
      commonMissingSkill,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────
// Analytics — trimmed to summary only (Issue 7)
// ─────────────────────────────────────────────
export const getAdminAnalytics = async (req, res) => {
  try {
    if (!ensureAdmin(req.user)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const [totalStudents, totalCompanies] = await Promise.all([
      User.countDocuments({ role: "student" }),
      Company.countDocuments(),
    ]);

    const totalAnalyses = await AnalysisResult.countDocuments();
    const eligibleCount = await AnalysisResult.countDocuments({
      eligible: true,
    });
    const eligiblePercent =
      totalAnalyses > 0
        ? Math.round((eligibleCount / totalAnalyses) * 100)
        : 0;

    // Skill distribution from analysis results
    const skillAgg = await AnalysisResult.aggregate([
      { $unwind: "$matchedSkills" },
      { $group: { _id: "$matchedSkills", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);
    const skillDistribution = skillAgg.map((s) => ({
      skill: s._id,
      count: s.count,
    }));

    res.json({
      totalStudents,
      totalCompanies,
      totalAnalyses,
      eligiblePercent,
      skillDistribution,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────
// Get all students (general list)
// ─────────────────────────────────────────────
export const getStudents = async (req, res) => {
  try {
    if (!ensureAdmin(req.user)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const students = await User.find({ role: "student" })
      .select(
        "name email skills missingSkills resumeUrl appliedCompanies progress"
      )
      .lean();

    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────
// Issue 6 — Get Students by Company/Role
// ─────────────────────────────────────────────
export const getStudentsByCompany = async (req, res) => {
  try {
    if (!ensureAdmin(req.user)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const { companyId } = req.query;
    if (!companyId) {
      return res.status(400).json({ message: "companyId is required" });
    }

    const company = await Company.findById(companyId).lean();
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    // Get all analysis results for this company
    const analyses = await AnalysisResult.find({ companyId })
      .populate("studentId", "name email")
      .populate("resumeId", "_id")
      .sort({ score: -1 })
      .lean();

    const students = analyses.map((a) => ({
      studentId: a.studentId?._id || a.studentId,
      name: a.studentId?.name || "Unknown",
      email: a.studentId?.email || "",
      score: a.score,
      eligible: a.eligible,
      matchedSkills: a.matchedSkills || [],
      missingSkills: a.missingSkills || [],
      resumeId: a.resumeId?._id || a.resumeId,
      analyzedAt: a.analyzedAt,
      status: a.status || "pending",
    }));

    const eligibleCount = students.filter((s) => s.eligible).length;

    res.json({
      company: company.name,
      role: company.role,
      students,
      summary: {
        total: students.length,
        eligible: eligibleCount,
        notEligible: students.length - eligibleCount,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────
// Issue 6 — Invite Student for Interview
// ─────────────────────────────────────────────
export const inviteStudent = async (req, res) => {
  try {
    if (!ensureAdmin(req.user)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const { studentId } = req.params;
    const { companyId, message, interviewDate } = req.body;

    if (!companyId) {
      return res.status(400).json({ message: "companyId is required" });
    }

    const student = await User.findById(studentId);
    if (!student || student.role !== "student") {
      return res.status(404).json({ message: "Student not found" });
    }

    const company = await Company.findById(companyId).lean();
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    // Update analysis result status
    await AnalysisResult.findOneAndUpdate(
      { studentId, companyId },
      { status: "invited" }
    );

    // Update student's applied company status
    const appIndex = student.appliedCompanies.findIndex(
      (a) => a.companyId && a.companyId.toString() === companyId
    );
    if (appIndex !== -1) {
      student.appliedCompanies[appIndex].status = "interview";
      if (student.progress) {
        const oldStatus = "applied";
        if (student.progress[oldStatus] > 0) student.progress[oldStatus] -= 1;
        student.progress.interview = (student.progress.interview || 0) + 1;
      }
      await student.save();
    }

    // Create notification
    await Notification.create({
      studentId,
      type: "interview_invite",
      company: company.name,
      role: company.role,
      companyId: company._id,
      message:
        message ||
        `Congratulations! You are invited for an interview at ${company.name} for the ${company.role} role.`,
      interviewDate: interviewDate || null,
    });

    res.json({
      message: "Student invited successfully",
      studentId,
      notificationSent: true,
      status: "invited",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────
// Issue 6 — Select Student
// ─────────────────────────────────────────────
export const selectStudent = async (req, res) => {
  try {
    if (!ensureAdmin(req.user)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const { studentId } = req.params;
    const { companyId, message } = req.body;

    if (!companyId) {
      return res.status(400).json({ message: "companyId is required" });
    }

    const student = await User.findById(studentId);
    if (!student || student.role !== "student") {
      return res.status(404).json({ message: "Student not found" });
    }

    const company = await Company.findById(companyId).lean();
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    // Update analysis result status
    await AnalysisResult.findOneAndUpdate(
      { studentId, companyId },
      { status: "selected" }
    );

    // Update student's applied company status
    const appIndex = student.appliedCompanies.findIndex(
      (a) => a.companyId && a.companyId.toString() === companyId
    );
    if (appIndex !== -1) {
      student.appliedCompanies[appIndex].status = "selected";
      if (student.progress) {
        student.progress.selected = (student.progress.selected || 0) + 1;
      }
      await student.save();
    }

    // Create notification
    await Notification.create({
      studentId,
      type: "selected",
      company: company.name,
      role: company.role,
      companyId: company._id,
      message:
        message ||
        `Congratulations! You have been selected for the ${company.role} role at ${company.name}.`,
    });

    res.json({
      message: "Student marked as selected",
      studentId,
      notificationSent: true,
      status: "selected",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────
// Issue 6 — Reject Student
// ─────────────────────────────────────────────
export const rejectStudent = async (req, res) => {
  try {
    if (!ensureAdmin(req.user)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const { studentId } = req.params;
    const { companyId, message } = req.body;

    if (!companyId) {
      return res.status(400).json({ message: "companyId is required" });
    }

    const student = await User.findById(studentId);
    if (!student || student.role !== "student") {
      return res.status(404).json({ message: "Student not found" });
    }

    const company = await Company.findById(companyId).lean();
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    // Update analysis result status
    await AnalysisResult.findOneAndUpdate(
      { studentId, companyId },
      { status: "rejected" }
    );

    // Update student's applied company status
    const appIndex = student.appliedCompanies.findIndex(
      (a) => a.companyId && a.companyId.toString() === companyId
    );
    if (appIndex !== -1) {
      student.appliedCompanies[appIndex].status = "rejected";
      await student.save();
    }

    // Create notification
    await Notification.create({
      studentId,
      type: "rejected",
      company: company.name,
      role: company.role,
      companyId: company._id,
      message:
        message ||
        `Thank you for your application. Unfortunately, you have not been selected for the ${company.role} role at ${company.name} at this time.`,
    });

    res.json({
      message: "Student notified",
      studentId,
      notificationSent: true,
      status: "rejected",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────
// Issue 6 — Get Admin Companies (with applicant counts)
// ─────────────────────────────────────────────
export const getAdminCompanies = async (req, res) => {
  try {
    if (!ensureAdmin(req.user)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const companies = await Company.find({}).sort({ createdAt: -1 }).lean();

    // Get applicant stats per company
    const companiesWithStats = await Promise.all(
      companies.map(async (c) => {
        const totalApplicants = await AnalysisResult.countDocuments({
          companyId: c._id,
        });
        const eligibleCount = await AnalysisResult.countDocuments({
          companyId: c._id,
          eligible: true,
        });

        return {
          ...c,
          id: c._id,
          totalApplicants,
          eligibleCount,
        };
      })
    );

    res.json({ companies: companiesWithStats });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
