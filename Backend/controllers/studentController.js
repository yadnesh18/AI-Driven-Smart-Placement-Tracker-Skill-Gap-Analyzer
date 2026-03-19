// controllers/studentController.js
import User from "../models/user.js";
import Company from "../models/Company.js";
import cloudinary from "../config/cloudinary.js";
import pdfParse from "pdf-parse";
import fs from "fs";
import {
  extractResumeData,
  generateSkillImprovement,
  generateLearningRoadmap,
  generateResumeScore,
} from "../utils/aiService.js";

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
      resumeScore: user.resumeScore || 0,
      skills: user.skills || [],
      keywords: user.keywords || [],
      missingSkills: user.missingSkills || [],
      improvementSuggestions: user.improvementSuggestions || [],
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

// Upload resume - file comes from multer disk storage
export const uploadResume = async (req, res) => {
  try {
    const user = req.user;
    if (!ensureStudent(user)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const localPath = req.file.path;

    // Upload to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(localPath, {
      resource_type: "raw",
      folder: "resumes",
    });

    const resumeUrl = uploadResult.secure_url;
    const resumePublicId = uploadResult.public_id;

    // Extract text from PDF
    const fileBuffer = await fs.promises.readFile(localPath);
    const parsed = await pdfParse(fileBuffer);
    const resumeText = parsed.text || "";

    // AI-powered skill extraction
    const { skills: extractedSkills, keywords } = await extractResumeData(
      resumeText
    );

    // Fetch company required skills
    const companies = await Company.find({});
    const requiredSkillSet = new Set();
    for (const company of companies) {
      (company.requiredSkills || []).forEach((s) => {
        if (s && typeof s === "string") {
          requiredSkillSet.add(s.trim());
        }
      });
    }

    // Merge extracted skills with any existing user skills
    const studentSkills = Array.from(
      new Set(
        [
          ...(Array.isArray(extractedSkills) ? extractedSkills : []),
          ...(Array.isArray(user.skills) ? user.skills : []),
        ]
          .map((s) => String(s).trim())
          .filter(Boolean)
      )
    );

    const studentSkillsLower = new Set(
      studentSkills.map((s) => s.toLowerCase())
    );

    // Detect missing skills
    const missingSkills = Array.from(requiredSkillSet).filter(
      (skill) => !studentSkillsLower.has(String(skill).toLowerCase())
    );

    // AI-powered improvement suggestions + roadmap + score
    const [improvementSuggestions, roadmap, scoreResult] = await Promise.all([
      generateSkillImprovement(missingSkills),
      generateLearningRoadmap(missingSkills),
      generateResumeScore(studentSkills, missingSkills, resumeText),
    ]);

    const update = {
      resumeUrl,
      resumePublicId,
      resumeScore: scoreResult.score,
      resumeScoreBreakdown: scoreResult.breakdown,
      resumeScoreSummary: scoreResult.summary,
      skills: studentSkills,
      keywords: Array.isArray(keywords) ? keywords : [],
      missingSkills,
      improvementSuggestions,
      roadmap,
    };

    await User.findByIdAndUpdate(user._id, update);

    // Cleanup local temp file
    fs.promises.unlink(localPath).catch(() => {});

    res.json({
      success: true,
      message: "Resume uploaded and analyzed successfully",
      data: {
        resumeUrl,
        skills: studentSkills,
        keywords: update.keywords,
        missingSkills,
        resumeScore: scoreResult.score,
        resumeScoreBreakdown: scoreResult.breakdown,
        resumeScoreSummary: scoreResult.summary,
        improvementSuggestions,
        roadmap,
      },
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

    const companies = await Company.find({ isActive: true }).sort({ createdAt: -1 }).lean();
    const appliedIds = new Set(
      (user.appliedCompanies || [])
        .map((a) => (a.companyId ? a.companyId.toString() : null))
        .filter(Boolean)
    );
    const appliedByNameRole = new Set(
      (user.appliedCompanies || []).map((a) => `${a.name}|${a.role}`)
    );

    const studentSkillsLower = new Set(
      (user.skills || []).map((s) => String(s).toLowerCase().trim())
    );

    const withApplied = companies.map((c) => {
      const reqSkills = c.requiredSkills || [];
      const matchCount = reqSkills.filter((s) =>
        studentSkillsLower.has(String(s).toLowerCase().trim())
      ).length;
      const matchPercent =
        reqSkills.length > 0 ? Math.round((matchCount / reqSkills.length) * 100) : 100;

      return {
        ...c,
        applied:
          appliedIds.has(c._id.toString()) ||
          appliedByNameRole.has(`${c.name}|${c.role}`),
        matchPercent,
      };
    });

    res.json(withApplied);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Apply to a company (companyId from URL params)
export const applyCompany = async (req, res) => {
  try {
    const user = req.user;
    if (!ensureStudent(user)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const { companyId } = req.params;
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
