# AI-Driven Smart Placement Tracker & Skill Gap Analyzer

## Overview
The **AI-Driven Smart Placement Tracker & Skill Gap Analyzer** is a comprehensive full-stack platform designed to bridge the gap between students' skill sets and industry requirements. This system employs modern web technologies and Generative AI to provide personalized career roadmaps, intelligent placement tracking, and data-driven insights for both students and placement administrators.

## Features

### 🎓 For Students
- **Smart Dashboard**: View current placement statuses, upcoming drives, and overall progress.
- **Resume Upload & AI Analysis**: Upload your resume (PDF) to get actionable insights. The system uses AI (Google Gemini) coupled with document parsing to analyze your skills against modern industry standards.
- **Personalized AI Roadmaps**: Receive tailored, AI-generated learning paths to conquer identified skill gaps.
- **Company Browsing**: Explore active placement drives, check eligibility criteria, and review job descriptions.
- **Placement Results & Notifications**: Stay updated instantly regarding placement outcomes and scheduled events.

### 👨‍💼 For Administrators
- **Administrative Dashboard**: An overview of the placement ecosystem at a glance.
- **Live Analytics**: Interactive charts and data visualizations (powered by Recharts) displaying placement statistics, student performance, and organizational reach.
- **Company & Drive Management**: Effortlessly interface to add new companies, update drives, and configure recruitment conditions.
- **Student Tracking**: Monitor individual student development tracks, uploaded resumes, and placement results.

## Tech Stack

### Frontend
- **Framework**: React 19 + Vite
- **Styling**: Tailwind CSS + Radix UI Primitives (for highly accessible components)
- **Icons**: Lucide React
- **Routing**: React Router DOM v7
- **Charts**: Recharts
- **HTTP Client**: Axios

### Backend
- **Runtime**: Node.js + Express.js
- **Database**: MongoDB + Mongoose
- **Security & Authentication**: JSON Web Tokens (JWT), bcryptjs
- **File Handling & Storage**: AWS S3 Client & Cloudinary (integrated with `multer`)
- **AI & Data Processing**: Google Generative AI (`@google/generative-ai`), built-in PDF parsing (`pdf-parse`)

## Installation & Setup

### Prerequisites
- Node.js (v18 or higher recommended)
- MongoDB instance (Atlas cluster or local)
- Cloudinary and/or AWS S3 Credentials configured
- Google Gemini API Key

### Backend Setup
1. Navigate to the Backend directory:
   ```bash
   cd Backend
   ```
2. Install backend dependencies:
   ```bash
   npm install
   ```
3. Set up your environment variables. Ensure you have a `.env` file in the `Backend` directory containing necessary keys like `MONGO_URI`, `JWT_SECRET`, `GEMINI_API_KEY`, and storage credentials. 
4. Start the development server:
   ```bash
   npm run dev
   ```
   *The backend will typically run on `http://localhost:5000` or `5001`.*

### Frontend Setup
1. Navigate to the Frontend directory:
   ```bash
   cd Frontend
   ```
2. Install frontend dependencies:
   ```bash
   npm install
   ```
3. Set up the frontend `.env` configuration (e.g., configuring `VITE_API_URL` to point to the backend instance).
4. Start the Vite server:
   ```bash
   npm run dev
   ```

## Application Architecture Highlights
- **Role-Based Workflows**: Secure JWT authentication segments distinct interactive boundaries for `Admin` and `Student` roles.
- **Skill Gap LLM Pipeline**: Documents processed securely via `multer` into AWS S3/Cloudinary are fed through `pdf-parse`. The extracted raw payload interfaces with the Gemini model to intelligently construct localized skill matrices and responsive interactive Roadmaps on the frontend.
- **Design System Excellence**: Employs a robust, "Stitch"-inspired tonal interface using Tailwind CSS and Radix UI to maintain high visual fidelity and interactive polish across all screen types.

## License
ISC
