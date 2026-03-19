import express from "express";
import {
  getDashboard,
  uploadResume,
  getCompanies,
  applyCompany,
  getResults,
  getRoadmap,
} from "../controllers/studentController.js";
import { protect } from "../middleware/authMiddleware.js";
import { uploadResume as multerUpload } from "../config/multer.js";

const router = express.Router();

router.get("/dashboard", protect, getDashboard);
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
router.get("/companies", protect, getCompanies);
router.post("/apply/:companyId", protect, applyCompany);
router.get("/results", protect, getResults);
router.get("/roadmap", protect, getRoadmap);

export default router;
