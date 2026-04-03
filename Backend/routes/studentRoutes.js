import express from "express";
import {
  getDashboard,
  uploadResume,
  getAllResumes,
  activateResume,
  getResumeStatus,
  getResumeDetail,
  runAnalysis,
  generateRoadmapHandler,
  getSkillRadar,
  getCompanies,
  applyCompany,
  getResults,
  getRoadmap,
  getNotifications,
  markNotificationRead,
} from "../controllers/studentController.js";
import { protect } from "../middleware/authMiddleware.js";
import { uploadResume as multerUpload } from "../config/multer.js";

const router = express.Router();

// Dashboard
router.get("/dashboard", protect, getDashboard);

// Resume endpoints (Issue 2 & 3)
router.post(
  "/upload-resume",
  protect,
  (req, res, next) => {
    multerUpload.single("resume")(req, res, (err) => {
      if (err) {
        return res.status(400).json({
          message: err.message || "Invalid file. PDF only, max 5MB.",
        });
      }
      next();
    });
  },
  uploadResume
);
router.get("/resume/all", protect, getAllResumes);
router.get("/resume/status", protect, getResumeStatus);
router.get("/resume/:resumeId", protect, getResumeDetail);
router.put("/resume/:resumeId/activate", protect, activateResume);

// Analysis endpoints (Issues 1, 4, 5)
router.post("/analysis/run", protect, runAnalysis);
router.post("/analysis/roadmap", protect, generateRoadmapHandler);
router.get("/analysis/skill-radar", protect, getSkillRadar);

// Company / Application
router.get("/companies", protect, getCompanies);
router.post("/apply/:companyId", protect, applyCompany);
router.get("/results", protect, getResults);
router.get("/roadmap", protect, getRoadmap);

// Notifications (Issue 6)
router.get("/notifications", protect, getNotifications);
router.put("/notifications/:id/read", protect, markNotificationRead);

export default router;
