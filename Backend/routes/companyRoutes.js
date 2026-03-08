import express from "express";
import { addCompany, getCompaniesAdmin } from "../controllers/companyController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getCompaniesAdmin);
router.post("/", protect, addCompany);

export default router;
