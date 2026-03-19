# Smart Placement Tracker — Project Workflow

## Overview

A college placement platform where students upload resumes, AI extracts and analyzes skills, detects gaps vs company requirements, and generates personalized improvement roadmaps. Admins monitor students, companies, and placement analytics.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite |
| Backend | Node.js + Express |
| Database | MongoDB (Mongoose) |
| Auth | JWT |
| File Storage | Cloudinary |
| PDF Parsing | pdf-parse |
| AI | Anthropic Claude API |

---

## System Flow

```
Student Registers / Logs In
        ↓
Uploads Resume (PDF)
        ↓
Multer → Cloudinary (stores PDF)
        ↓
pdf-parse → Extracts raw text
        ↓
Claude API → Extracts:
        • Skills
        • Keywords
        ↓
System compares with all Company required skills
        ↓
Claude API → Generates:
        • Missing Skills
        • Improvement Suggestions (importance + resources)
        • Learning Roadmap
        • Resume Score (0–100)
        ↓
All data saved to MongoDB (User document)
        ↓
Student Dashboard updates with full analysis
        ↓
Student browses Companies + applies
        ↓
Admin monitors everything via Admin Panel
```

---

## Database Models

### User
```
name, email, password (hashed), role (student | admin)
resumeUrl, resumePublicId
skills[], keywords[], missingSkills[]
resumeScore (0–100)
improvementSuggestions[{ skill, importance, howToImprove, resources[] }]
roadmap[{ title, description, url }]
appliedCompanies[{ companyId, status, role, appliedAt }]
branch, year, rollNumber
```

### Company
```
name, role, package, description
requiredSkills[], location, deadline
isActive, logoUrl
```

---

## API Endpoints

### Auth
```
POST   /api/auth/register        → Register student / admin
POST   /api/auth/login           → Login, returns JWT
```

### Student
```
GET    /api/student/dashboard    → Get full profile + AI analysis
POST   /api/student/upload-resume → Upload PDF, trigger AI pipeline
POST   /api/student/apply/:companyId → Apply to a company
```

### Companies
```
GET    /api/companies            → List all active companies
POST   /api/companies            → Add company (admin only)
PUT    /api/companies/:id        → Update company (admin only)
DELETE /api/companies/:id        → Delete company (admin only)
```

### Admin
```
GET    /api/admin/dashboard      → Stats: total students, companies, placements
GET    /api/admin/students       → List all students with skills + resume
PUT    /api/admin/students/:id/status → Update application status
```

---

## AI Integration (Claude API)

### Step 1 — Skill Extraction
- **Input:** Raw resume text
- **Output:** `skills[]`, `keywords[]`
- **Prompt goal:** Extract technical skills, tools, frameworks, languages

### Step 2 — Skill Gap Detection
- **Logic:** Collect all `requiredSkills` from all companies → compare with user `skills[]`
- **Output:** `missingSkills[]`

### Step 3 — Improvement Suggestions
- **Input:** `missingSkills[]`
- **Output:** For each skill → `{ importance, howToImprove, resources[] }`

### Step 4 — Roadmap Generation
- **Input:** `missingSkills[]`
- **Output:** Ordered learning steps `{ title, description, url }`

### Step 5 — Resume Score
- **Input:** `skills[]`, `missingSkills[]`, resume completeness
- **Output:** Score `0–100`

---

## Frontend Pages

### Student
| Page | Purpose |
|---|---|
| `/login`, `/register` | Auth |
| `/dashboard` | Skills, score, missing skills, roadmap |
| `/upload` | Drag & drop resume upload + AI result |
| `/companies` | Browse companies, see match %, apply |
| `/applications` | Track application statuses |
| `/roadmap` | Full learning roadmap with resources |

### Admin
| Page | Purpose |
|---|---|
| `/admin/dashboard` | Stats overview |
| `/admin/students` | View all students, skills, resumes |
| `/admin/companies` | Add / edit / remove companies |
| `/admin/analytics` | Skill gap trends, placement % |

---

## Development Phases

### Phase 1 — Foundation
- [ ] Project setup (backend + frontend)
- [ ] MongoDB models (User, Company)
- [ ] Auth (register, login, JWT, protected routes)

### Phase 2 — Resume Pipeline
- [ ] Multer + Cloudinary integration
- [ ] PDF text extraction with pdf-parse
- [ ] Store resumeUrl in User document

### Phase 3 — AI Integration
- [ ] Claude API: skill extraction from resume text
- [ ] Skill gap detection logic
- [ ] Claude API: suggestions + roadmap generation
- [ ] Resume score calculation

### Phase 4 — Student Frontend
- [ ] Dashboard (skills, score, missing skills)
- [ ] Resume upload UI
- [ ] Companies page with match %
- [ ] Roadmap page

### Phase 5 — Admin Panel
- [ ] Admin dashboard (stats)
- [ ] Student management
- [ ] Company CRUD
- [ ] Analytics view

---

## Key Features

| Feature | Description |
|---|---|
| AI Resume Analysis | Extract skills and keywords using Claude |
| Skill Gap Detection | Compare student skills vs company requirements |
| Resume Score | 0–100 score based on skill completeness |
| Company Match % | How well a student matches each company |
| Personalized Roadmap | Ordered learning plan for missing skills |
| Improvement Suggestions | Resource-backed tips per skill |
| Placement Tracking | Track application status end-to-end |
| Admin Analytics | Skill gap trends across all students |

---

## Folder Structure

```
placement-tracker/
├── backend/
│   ├── server.js
│   ├── .env.example
│   ├── models/
│   │   ├── User.js
│   │   └── Company.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── student.js
│   │   ├── companies.js
│   │   └── admin.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── studentController.js
│   │   ├── companyController.js
│   │   └── adminController.js
│   ├── middleware/
│   │   └── auth.js
│   └── utils/
│       ├── db.js
│       ├── cloudinary.js
│       └── aiService.js
│
└── frontend/
    └── src/
        ├── pages/
        │   ├── auth/
        │   ├── student/
        │   └── admin/
        ├── components/
        │   ├── UI/
        │   ├── Cards/
        │   └── Layout/
        ├── services/
        │   └── api.js
        └── context/
            └── AuthContext.jsx
```

---

## Notes

- All AI calls go through Anthropic Claude API (`claude-sonnet-4-20250514`)
- JWT tokens stored in `localStorage` on the frontend
- Resume PDFs stored on Cloudinary as `raw` resource type
- Admin role is set manually in DB or via a seed script
- Company match % = `(studentSkills ∩ companyRequiredSkills) / companyRequiredSkills.length × 100`
