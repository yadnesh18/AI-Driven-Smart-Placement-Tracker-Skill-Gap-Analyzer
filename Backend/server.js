import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from "./routes/authRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import companyRoutes from "./routes/companyRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Debug: verify critical env vars are loaded
console.log("Env check — MONGODB_URI:", !!process.env.MONGODB_URI);
console.log("Env check — OPENROUTER_API_KEY:", !!process.env.OPENROUTER_API_KEY);
console.log("Env check — CLOUDINARY_CLOUD_NAME:", !!process.env.CLOUDINARY_CLOUD_NAME);
console.log("Env check — JWT_SECRET:", !!process.env.JWT_SECRET);

const app = express();
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/auth", authRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/admin", adminRoutes);

connectDB();

app.get('/',(req,res)=>{
    res.send("Backend running successfully");   
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});