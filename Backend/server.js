import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from "./routes/authRoutes.js";  

dotenv.config();

const app = express();

// enable CORS for the frontend origin (adjust if the client runs on a different host/port)
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET','POST','PUT','DELETE','OPTIONS'],
    allowedHeaders: ['Content-Type','Authorization'],
  })
);

// explicit preflight route (safe to leave even though cors() handles it)
app.options('*', cors());

app.use(express.json());
app.use("/api/auth", authRoutes);

connectDB();

app.get('/',(req,res)=>{
    res.send("Backend running successfully");   
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});