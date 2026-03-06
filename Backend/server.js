import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from "./routes/authRoutes.js";  

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);

connectDB();

app.get('/',(req,res)=>{
    res.send("Backend running successfully");   
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});