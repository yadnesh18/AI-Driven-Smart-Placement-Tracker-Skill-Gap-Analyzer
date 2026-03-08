import express from "express";
import {
  getAdminDashboard,
  getAdminAnalytics,
} from "../controllers/adminController.js";
import { protect } from "../middleware/authMiddleware.js";
import Company from "../models/Company.js";

const router = express.Router();

router.get("/dashboard", protect, getAdminDashboard);
router.get("/analytics", protect, getAdminAnalytics);

router.post("/company", protect, async (req, res) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const { name, role, package: pkg, requiredSkills, description } = req.body;
    if (!name || !role || typeof pkg === "undefined") {
      return res.status(400).json({ message: "Name, role and package are required" });
    }

    const company = await Company.create({
      name,
      role,
      package: Number(pkg),
      requiredSkills: Array.isArray(requiredSkills)
        ? requiredSkills
        : typeof requiredSkills === "string" && requiredSkills.length
        ? requiredSkills.split(",").map((s) => s.trim()).filter(Boolean)
        : [],
      description: description || "",
    });

    res.status(201).json(company);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/companies", protect, async (req, res) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const companies = await Company.find({}).sort({ createdAt: -1 });
    res.json(companies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

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
