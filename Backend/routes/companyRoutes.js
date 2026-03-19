import express from "express";
import { addCompany, getCompaniesAdmin, updateCompany, deleteCompany } from "../controllers/companyController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getCompaniesAdmin);
router.post("/", protect, addCompany);
router.put("/:id", protect, updateCompany);
router.delete("/:id", protect, deleteCompany);

export default router;
