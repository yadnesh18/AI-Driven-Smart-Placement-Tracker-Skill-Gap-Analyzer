import User from "../models/user.js";
import Company from "../models/Company.js";

const ensureAdmin = (user) => {
  return user && user.role === "admin";
};

const buildStudentSkillStats = (students) => {
  const totalStudents = students.length;

  const eligibleCount = students.filter((s) => (s.skills || []).length >= 3).length;
  const eligiblePercent =
    totalStudents > 0 ? Math.round((eligibleCount / totalStudents) * 100) : 0;

  const missingSkillCounts = {};
  for (const s of students) {
    const skills = s.missingSkills || [];
    for (const skill of skills) {
      const trimmed = String(skill).trim();
      if (trimmed) {
        missingSkillCounts[trimmed] = (missingSkillCounts[trimmed] || 0) + 1;
      }
    }
  }
  let commonMissingSkill = "—";
  let maxCount = 0;
  for (const [skill, count] of Object.entries(missingSkillCounts)) {
    if (count > maxCount) {
      maxCount = count;
      commonMissingSkill = skill;
    }
  }

  const skillCounts = {};
  for (const s of students) {
    const skills = s.skills || [];
    for (const skill of skills) {
      const trimmed = String(skill).trim();
      if (trimmed) {
        skillCounts[trimmed] = (skillCounts[trimmed] || 0) + 1;
      }
    }
  }
  const skillDistribution = Object.entries(skillCounts)
    .map(([skill, count]) => ({ skill, count }))
    .sort((a, b) => b.count - a.count);

  return { totalStudents, eligiblePercent, commonMissingSkill, skillDistribution };
};

export const getAdminDashboard = async (req, res) => {
  try {
    if (!ensureAdmin(req.user)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const students = await User.find({ role: "student" }).select("skills missingSkills").lean();
    const { totalStudents, eligiblePercent, commonMissingSkill, skillDistribution } =
      buildStudentSkillStats(students);

    const totalCompanies = await Company.countDocuments();

    res.json({
      totalStudents,
      totalCompanies,
      eligiblePercent,
      commonMissingSkill,
      skillDistribution,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAdminAnalytics = async (req, res) => {
  try {
    if (!ensureAdmin(req.user)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const [students, totalCompanies, companies] = await Promise.all([
      User.find({ role: "student" }).select("skills missingSkills appliedCompanies").lean(),
      Company.countDocuments(),
      Company.find({}).select("requiredSkills").lean(),
    ]);

    const { totalStudents, skillDistribution } = buildStudentSkillStats(students);

    let totalApplications = 0;
    for (const s of students) {
      totalApplications += (s.appliedCompanies || []).length;
    }

    const requiredSkillCounts = {};
    for (const c of companies) {
      const skills = c.requiredSkills || [];
      for (const skill of skills) {
        const trimmed = String(skill).trim();
        if (trimmed) {
          requiredSkillCounts[trimmed] = (requiredSkillCounts[trimmed] || 0) + 1;
        }
      }
    }
    const topRequiredSkills = Object.entries(requiredSkillCounts)
      .map(([skill, count]) => ({ skill, count }))
      .sort((a, b) => b.count - a.count);

    res.json({
      totalStudents,
      totalCompanies,
      totalApplications,
      skillDistribution,
      topRequiredSkills,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getStudents = async (req, res) => {
  try {
    if (!ensureAdmin(req.user)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const students = await User.find({ role: "student" })
      .select("name email skills missingSkills keywords resumeUrl appliedCompanies progress")
      .lean();

    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
