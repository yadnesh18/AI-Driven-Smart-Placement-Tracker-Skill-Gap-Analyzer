// controllers/studentController.js
import User from "../models/user.js";
import Company from "../models/Company.js";
import Resume from "../models/Resume.js";
import AnalysisResult from "../models/AnalysisResult.js";
import Notification from "../models/Notification.js";
import cloudinary from "../config/cloudinary.js";
import pdfParse from "pdf-parse";
import fs from "fs";
import {
  extractResumeData,
  generateSkillImprovement,
  generateScoreReason,
  computeScore,
  generatePersonalisedRoadmap,
  getMissingSkillResources,
  generateResumeScore,
} from "../utils/aiService.js";

const ensureStudent = (user) => user && user.role === "student";

// ─────────────────────────────────────────────
// Dashboard
// ─────────────────────────────────────────────
export const getDashboard = async (req, res) => {
  try {
    const user = req.user;
    if (!ensureStudent(user)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    // Get active resume info
    const activeResume = await Resume.findOne({
      studentId: user._id,
      isActive: true,
    }).lean();

    // Get latest analysis result
    const latestAnalysis = await AnalysisResult.findOne({
      studentId: user._id,
    })
      .sort({ analyzedAt: -1 })
      .lean();

    const dashboard = {
      name: user.name,
      resumeUploaded: Boolean(activeResume),
      resumeScore: activeResume?.rawScore || user.resumeScore || 0,
      skills: activeResume?.extractedSkills || user.skills || [],
      missingSkills: latestAnalysis?.missingSkills || user.missingSkills || [],
      improvementSuggestions: user.improvementSuggestions || [],
      roadmap: user.roadmap || [],
      appliedCompanies: user.appliedCompanies || [],
      progress: user.progress || {
        applied: 0,
        shortlisted: 0,
        interview: 0,
        selected: 0,
      },
      latestAnalysis: latestAnalysis
        ? {
            company: latestAnalysis.companyName,
            role: latestAnalysis.roleName,
            score: latestAnalysis.score,
            eligible: latestAnalysis.eligible,
          }
        : null,
    };

    res.json(dashboard);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────
// Issue 2 — Upload Resume (multi-resume support)
// ─────────────────────────────────────────────
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
    const originalFilename = req.file.originalname || "resume.pdf";

    // Upload to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(localPath, {
      resource_type: "raw",
      folder: "resumes",
    });

    const fileUrl = uploadResult.secure_url;
    const cloudinaryPublicId = uploadResult.public_id;

    // Determine version number
    const existingCount = await Resume.countDocuments({ studentId: user._id });
    const newVersion = existingCount + 1;

    // Deactivate all existing active resumes for this student
    await Resume.updateMany(
      { studentId: user._id, isActive: true },
      { isActive: false }
    );

    // Create new resume record
    const resume = await Resume.create({
      studentId: user._id,
      filename: originalFilename,
      fileUrl,
      cloudinaryPublicId,
      status: "processing",
      isActive: true,
      version: newVersion,
    });

    // Send immediate response
    res.json({
      message: "Resume uploaded successfully",
      resumeId: resume._id,
      status: "processing",
      version: newVersion,
      isActive: true,
    });

    // Background processing: extract skills and compute score
    try {
      const fileBuffer = await fs.promises.readFile(localPath);
      const parsed = await pdfParse(fileBuffer);
      const resumeText = parsed.text || "";

      // AI-powered skill extraction with section awareness
      const { skills: extractedSkills, keywords, extractedFrom } =
        await extractResumeData(resumeText);

      // Fetch company required skills for base score
      const companies = await Company.find({}).lean();
      const requiredSkillSet = new Set();
      for (const company of companies) {
        (company.requiredSkills || []).forEach((s) => {
          if (s && typeof s === "string") {
            requiredSkillSet.add(s.trim());
          }
        });
      }

      const studentSkills = Array.from(
        new Set(
          (Array.isArray(extractedSkills) ? extractedSkills : [])
            .map((s) => String(s).trim())
            .filter(Boolean)
        )
      );

      const studentSkillsLower = new Set(
        studentSkills.map((s) => s.toLowerCase())
      );
      const missingSkills = Array.from(requiredSkillSet).filter(
        (skill) => !studentSkillsLower.has(String(skill).toLowerCase())
      );

      // Compute base resume score
      const scoreResult = await generateResumeScore(
        studentSkills,
        missingSkills,
        resumeText
      );

      // Update resume record
      await Resume.findByIdAndUpdate(resume._id, {
        status: "done",
        extractedSkills: studentSkills,
        extractedFrom: extractedFrom || {},
        rawScore: scoreResult.score,
        scoreBreakdown: scoreResult.summary,
      });

      // Also update user skills for backward compat
      await User.findByIdAndUpdate(user._id, {
        resumeUrl: fileUrl,
        resumePublicId: cloudinaryPublicId,
        skills: studentSkills,
        missingSkills,
        resumeScore: scoreResult.score,
        resumeScoreSummary: scoreResult.summary,
      });
    } catch (bgErr) {
      console.error("Background resume processing failed:", bgErr.message);
      await Resume.findByIdAndUpdate(resume._id, { status: "error" });
    }

    // Cleanup local temp file
    fs.promises.unlink(localPath).catch(() => {});
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────
// Issue 2 — Get All Resumes
// ─────────────────────────────────────────────
export const getAllResumes = async (req, res) => {
  try {
    const user = req.user;
    if (!ensureStudent(user)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const resumes = await Resume.find({ studentId: user._id })
      .sort({ version: -1 })
      .lean();

    res.json({
      resumes: resumes.map((r) => ({
        resumeId: r._id,
        filename: r.filename,
        uploadedAt: r.uploadedAt || r.createdAt,
        status: r.status,
        score: r.rawScore,
        isActive: r.isActive,
        version: r.version,
      })),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────
// Issue 2 — Activate Resume
// ─────────────────────────────────────────────
export const activateResume = async (req, res) => {
  try {
    const user = req.user;
    if (!ensureStudent(user)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const { resumeId } = req.params;
    const resume = await Resume.findOne({
      _id: resumeId,
      studentId: user._id,
    });

    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }

    // Deactivate all, then activate this one
    await Resume.updateMany(
      { studentId: user._id, isActive: true },
      { isActive: false }
    );
    resume.isActive = true;
    await resume.save();

    // Update user's resumeUrl to point to the newly active resume
    await User.findByIdAndUpdate(user._id, {
      resumeUrl: resume.fileUrl,
      skills: resume.extractedSkills || [],
      resumeScore: resume.rawScore || 0,
    });

    res.json({ message: "Resume set as active", resumeId: resume._id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────
// Issue 2 — Get Resume Status (active resume)
// ─────────────────────────────────────────────
export const getResumeStatus = async (req, res) => {
  try {
    const user = req.user;
    if (!ensureStudent(user)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const activeResume = await Resume.findOne({
      studentId: user._id,
      isActive: true,
    }).lean();

    const totalUploaded = await Resume.countDocuments({
      studentId: user._id,
    });

    if (!activeResume) {
      return res.json({
        status: "none",
        totalUploaded,
      });
    }

    res.json({
      status: activeResume.status,
      uploadedAt: activeResume.uploadedAt || activeResume.createdAt,
      filename: activeResume.filename,
      resumeId: activeResume._id,
      version: activeResume.version,
      totalUploaded,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────
// Issue 3 — Get Resume Detail
// ─────────────────────────────────────────────
export const getResumeDetail = async (req, res) => {
  try {
    const user = req.user;
    if (!ensureStudent(user)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const { resumeId } = req.params;
    const resume = await Resume.findOne({
      _id: resumeId,
      studentId: user._id,
    }).lean();

    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }

    res.json({
      resumeId: resume._id,
      filename: resume.filename,
      uploadedAt: resume.uploadedAt || resume.createdAt,
      status: resume.status,
      isActive: resume.isActive,
      version: resume.version,
      extractedSkills: resume.extractedSkills || [],
      extractedFrom: resume.extractedFrom || {
        skillsSection: [],
        projectsSection: [],
        educationSection: [],
      },
      score: resume.rawScore || 0,
      scoreBreakdown: resume.scoreBreakdown || "",
      fileUrl: resume.fileUrl,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────
// Issue 1 — Run Analysis (dynamic scoring)
// ─────────────────────────────────────────────
export const runAnalysis = async (req, res) => {
  try {
    const user = req.user;
    if (!ensureStudent(user)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const { companyId } = req.body;
    if (!companyId) {
      return res.status(400).json({ message: "companyId is required" });
    }

    // Fetch the company (which acts as company+role)
    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    // Get student's active resume
    const activeResume = await Resume.findOne({
      studentId: user._id,
      isActive: true,
      status: "done",
    }).lean();

    if (!activeResume) {
      return res.status(400).json({
        message: "No processed resume found. Please upload a resume first.",
      });
    }

    const studentSkills = activeResume.extractedSkills || [];
    const requiredSkills = company.requiredSkills || [];

    // Deterministic skill matching
    const studentSkillsLower = new Set(
      studentSkills.map((s) => s.toLowerCase())
    );
    const matchedSkills = requiredSkills.filter((s) =>
      studentSkillsLower.has(s.toLowerCase())
    );
    const missingSkills = requiredSkills.filter(
      (s) => !studentSkillsLower.has(s.toLowerCase())
    );

    // Generate score with AI-powered reason (score itself is deterministic)
    const result = await generateScoreReason(
      matchedSkills,
      missingSkills,
      requiredSkills,
      user.name
    );

    // Save analysis result
    const analysisResult = await AnalysisResult.findOneAndUpdate(
      { studentId: user._id, companyId: company._id },
      {
        studentId: user._id,
        companyId: company._id,
        companyName: company.name,
        roleName: company.role,
        score: result.score,
        eligible: result.eligible,
        scoreReason: result.scoreReason,
        matchedSkills: result.matchedSkills,
        missingSkills: result.missingSkills,
        resumeId: activeResume._id,
        analyzedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    res.json({
      eligible: result.eligible,
      score: result.score,
      scoreReason: result.scoreReason,
      matchedSkills: result.matchedSkills,
      missingSkills: result.missingSkills,
      company: company.name,
      role: company.role,
      roleId: company._id,
      analyzedAt: analysisResult.analyzedAt,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────
// Issue 4 — Generate Personalised Roadmap
// ─────────────────────────────────────────────
export const generateRoadmapHandler = async (req, res) => {
  try {
    const user = req.user;
    if (!ensureStudent(user)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const {
      studentName,
      missingSkills,
      targetCompany,
      targetRole,
      roleId,
      currentScore,
      timelineWeeks,
    } = req.body;

    if (!missingSkills || missingSkills.length === 0) {
      return res
        .status(400)
        .json({ message: "missingSkills array is required" });
    }

    const result = await generatePersonalisedRoadmap({
      studentName: studentName || user.name,
      missingSkills,
      targetCompany: targetCompany || "",
      targetRole: targetRole || "",
      currentScore: currentScore || 0,
      timelineWeeks: timelineWeeks || 8,
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────
// Issue 5 — Skill Radar
// ─────────────────────────────────────────────
export const getSkillRadar = async (req, res) => {
  try {
    const user = req.user;
    if (!ensureStudent(user)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    // Get latest analysis result
    const latestAnalysis = await AnalysisResult.findOne({
      studentId: user._id,
    })
      .sort({ analyzedAt: -1 })
      .lean();

    if (!latestAnalysis) {
      return res.json({
        skills: [],
        overallScore: 0,
        matchedCount: 0,
        eligible: false,
        latestCompany: null,
        latestRole: null,
        missingSkills: [],
        missingSkillsWithResources: [],
      });
    }

    // Build skill radar data: each required skill with a score
    const company = await Company.findById(latestAnalysis.companyId).lean();
    const requiredSkills = company?.requiredSkills || [];

    const matchedLower = new Set(
      (latestAnalysis.matchedSkills || []).map((s) => s.toLowerCase())
    );

    const skills = requiredSkills.map((skill) => ({
      skill,
      score: matchedLower.has(skill.toLowerCase()) ? 90 : 10,
      fullMark: 100,
    }));

    // Get prep resources for missing skills
    const missingSkillsWithResources = getMissingSkillResources(
      latestAnalysis.missingSkills || []
    );

    res.json({
      skills,
      overallScore: latestAnalysis.score,
      matchedCount: (latestAnalysis.matchedSkills || []).length,
      eligible: latestAnalysis.eligible,
      latestCompany: latestAnalysis.companyName,
      latestRole: latestAnalysis.roleName,
      missingSkills: latestAnalysis.missingSkills || [],
      missingSkillsWithResources,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────
// Get all companies (for students to browse and apply)
// ─────────────────────────────────────────────
export const getCompanies = async (req, res) => {
  try {
    const user = req.user;
    if (!ensureStudent(user)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const companies = await Company.find({ isActive: true })
      .sort({ createdAt: -1 })
      .lean();

    const appliedIds = new Set(
      (user.appliedCompanies || [])
        .map((a) => (a.companyId ? a.companyId.toString() : null))
        .filter(Boolean)
    );
    const appliedByNameRole = new Set(
      (user.appliedCompanies || []).map((a) => `${a.name}|${a.role}`)
    );

    // Get student's skills from active resume
    const activeResume = await Resume.findOne({
      studentId: user._id,
      isActive: true,
    }).lean();
    const studentSkills = activeResume?.extractedSkills || user.skills || [];
    const studentSkillsLower = new Set(
      studentSkills.map((s) => String(s).toLowerCase().trim())
    );

    const withApplied = companies.map((c) => {
      const reqSkills = c.requiredSkills || [];
      const matchCount = reqSkills.filter((s) =>
        studentSkillsLower.has(String(s).toLowerCase().trim())
      ).length;
      const matchPercent =
        reqSkills.length > 0
          ? Math.round((matchCount / reqSkills.length) * 100)
          : 100;

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

// ─────────────────────────────────────────────
// Apply to a company
// ─────────────────────────────────────────────
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

    const alreadyApplied = (user.appliedCompanies || []).some(
      (a) =>
        (a.companyId && a.companyId.toString() === companyId) ||
        (a.name === company.name && a.role === company.role)
    );
    if (alreadyApplied) {
      return res
        .status(400)
        .json({ message: "You have already applied to this company" });
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

// ─────────────────────────────────────────────
// Get student's application results
// ─────────────────────────────────────────────
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

// ─────────────────────────────────────────────
// Get student's roadmap (backward compat)
// ─────────────────────────────────────────────
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

// ─────────────────────────────────────────────
// Issue 6 — Get Notifications
// ─────────────────────────────────────────────
export const getNotifications = async (req, res) => {
  try {
    const user = req.user;
    if (!ensureStudent(user)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const notifications = await Notification.find({ studentId: user._id })
      .sort({ createdAt: -1 })
      .lean();

    const unreadCount = notifications.filter((n) => !n.read).length;

    res.json({
      notifications: notifications.map((n) => ({
        id: n._id,
        type: n.type,
        company: n.company,
        role: n.role,
        message: n.message,
        interviewDate: n.interviewDate,
        read: n.read,
        createdAt: n.createdAt,
      })),
      unreadCount,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────
// Issue 6 — Mark Notification as Read
// ─────────────────────────────────────────────
export const markNotificationRead = async (req, res) => {
  try {
    const user = req.user;
    if (!ensureStudent(user)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const { id } = req.params;
    const notification = await Notification.findOne({
      _id: id,
      studentId: user._id,
    });

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    notification.read = true;
    await notification.save();

    res.json({ message: "Notification marked as read" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
