import Company from "../models/Company.js";

export const addCompany = async (req, res) => {
  try {
    const user = req.user;
    if (user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const { name, role, package: pkg, requiredSkills, description, location, deadline, isActive, logoUrl } = req.body;
    if (!name || !role) {
      return res.status(400).json({ message: "Name and role are required" });
    }

    const company = await Company.create({
      name,
      role,
      package: pkg || 0,
      requiredSkills: Array.isArray(requiredSkills)
        ? requiredSkills
        : typeof requiredSkills === "string" && requiredSkills.length
        ? requiredSkills.split(",").map((s) => s.trim()).filter(Boolean)
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

export const updateCompany = async (req, res) => {
  try {
    const user = req.user;
    if (user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const { id } = req.params;
    const { name, role, package: pkg, requiredSkills, description, location, deadline, isActive, logoUrl } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (role !== undefined) updateData.role = role;
    if (pkg !== undefined) updateData.package = Number(pkg);
    if (requiredSkills !== undefined) {
      updateData.requiredSkills = Array.isArray(requiredSkills)
        ? requiredSkills
        : typeof requiredSkills === "string" && requiredSkills.length
        ? requiredSkills.split(",").map((s) => s.trim()).filter(Boolean)
        : [];
    }
    if (description !== undefined) updateData.description = description;
    if (location !== undefined) updateData.location = location;
    if (deadline !== undefined) updateData.deadline = deadline;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (logoUrl !== undefined) updateData.logoUrl = logoUrl;

    const company = await Company.findByIdAndUpdate(id, updateData, { new: true });
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    res.json(company);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteCompany = async (req, res) => {
  try {
    const user = req.user;
    if (user.role !== "admin") {
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
};
