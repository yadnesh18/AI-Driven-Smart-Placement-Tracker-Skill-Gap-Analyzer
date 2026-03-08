// controllers/studentController.js
import User from "../models/user.js";
import Company from "../models/Company.js";

const ensureStudent = (user) => {
  if (user.role !== "student") {
    return false;
  }
  return true;
};

// Returns a dashboard summary for the authenticated student.
export const getDashboard = async (req, res) => {
  try {
    const user = req.user;
    if (!ensureStudent(user)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const dashboard = {
      name: user.name,
      resumeUploaded: Boolean(user.resumeUrl),
      skills: user.skills || [],
      missingSkills: user.missingSkills || [],
      roadmap: user.roadmap || [],
      appliedCompanies: user.appliedCompanies || [],
      progress: user.progress || {
        applied: 0,
        shortlisted: 0,
        interview: 0,
        selected: 0,
      },
    };

    res.json(dashboard);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Upload resume - file comes from multer
export const uploadResume = async (req, res) => {
  try {
    const user = req.user;
    if (!ensureStudent(user)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const resumePath = `uploads/${req.file.filename}`;
    await User.findByIdAndUpdate(user._id, { resumeUrl: resumePath });

    res.json({
      message: "Resume uploaded successfully",
      resumeUrl: resumePath,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all companies (for students to browse and apply)
export const getCompanies = async (req, res) => {
  try {
    const user = req.user;
    if (!ensureStudent(user)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const companies = await Company.find({}).sort({ createdAt: -1 }).lean();
    const appliedIds = new Set(
      (user.appliedCompanies || [])
        .map((a) => (a.companyId ? a.companyId.toString() : null))
        .filter(Boolean)
    );
    const appliedByNameRole = new Set(
      (user.appliedCompanies || []).map((a) => `${a.name}|${a.role}`)
    );

    const withApplied = companies.map((c) => ({
      ...c,
      applied:
        appliedIds.has(c._id.toString()) ||
        appliedByNameRole.has(`${c.name}|${c.role}`),
    }));

    res.json(withApplied);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Apply to a company
export const applyCompany = async (req, res) => {
  try {
    const user = req.user;
    if (!ensureStudent(user)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const { companyId } = req.body;
    if (!companyId) {
      return res.status(400).json({ message: "Company ID is required" });
    }

    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    const alreadyApplied =
      (user.appliedCompanies || []).some(
        (a) =>
          (a.companyId && a.companyId.toString() === companyId) ||
          (a.name === company.name && a.role === company.role)
      );
    if (alreadyApplied) {
      return res.status(400).json({ message: "You have already applied to this company" });
    }

    const appliedEntry = {
      companyId: company._id,
      name: company.name,
      role: company.role,
      status: "applied",
      appliedAt: new Date(),
    };

    const updatedProgress = {
      ...user.progress,
      applied: (user.progress?.applied || 0) + 1,
    };

    await User.findByIdAndUpdate(user._id, {
      $push: { appliedCompanies: appliedEntry },
      progress: updatedProgress,
    });

    res.json({
      message: "Application submitted successfully",
      company: { name: company.name, role: company.role },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get student's application results
export const getResults = async (req, res) => {
  try {
    const user = req.user;
    if (!ensureStudent(user)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const results = user.appliedCompanies || [];
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get student's roadmap
export const getRoadmap = async (req, res) => {
  try {
    const user = req.user;
    if (!ensureStudent(user)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const roadmap = user.roadmap || [];
    res.json(roadmap);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


