import Company from "../models/Company.js";

export const addCompany = async (req, res) => {
  try {
    const user = req.user;
    if (user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const { name, role, package: pkg, requiredSkills, description } = req.body;
    if (!name || !role) {
      return res.status(400).json({ message: "Name and role are required" });
    }

    const company = await Company.create({
      name,
      role,
      package: pkg || "Not disclosed",
      requiredSkills: Array.isArray(requiredSkills) ? requiredSkills : [],
      description: description || "",
    });

    res.status(201).json(company);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCompaniesAdmin = async (req, res) => {
  try {
    const user = req.user;
    if (user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const companies = await Company.find({}).sort({ createdAt: -1 });
    res.json(companies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
