# PlacementIQ — Backend Fix Specification
### For: Antigravity Development Team
### Project: AI-Driven Smart Placement Tracker & Skill Gap Analyzer

---

## Overview of Issues to Fix

This document covers **7 critical issues** found in the current backend implementation that need to be resolved. Each section describes the problem, the expected correct behavior, the API contract the frontend expects, and exactly what the backend must return.

---

## Issue 1 — Resume Score is Hardcoded as 72

### Problem
Every resume uploaded by every student returns `score: 72` regardless of the actual resume content. This is a hardcoded value somewhere in the scoring logic.

### Expected Behavior
The resume score must be **dynamically computed** based on a real comparison between:
- Skills found in the student's uploaded resume (via AI/NLP extraction)
- Skills required by the specific company role being analyzed

The score should be a **percentage match** (0–100) calculated as:

```
score = (number of matched skills / total required skills) * 100
```

Additionally, the score must come with **a detailed reason breakdown** explaining why the student got that score.

### API Contract Fix

**Endpoint:** `POST /analysis/run`

**Request Body:**
```json
{
  "companyId": "string",
  "roleId": "string"
}
```

**Response must now include `scoreReason` field:**
```json
{
  "eligible": true,
  "score": 67,
  "scoreReason": {
    "summary": "You matched 4 out of 6 required skills for this role. Strong in React and Node.js but lacking in System Design and AWS knowledge.",
    "breakdown": [
      {
        "category": "Technical Skills",
        "matched": ["React", "Node.js", "MongoDB"],
        "missing": ["System Design", "AWS"],
        "weight": 70,
        "earnedWeight": 42
      },
      {
        "category": "Core CS",
        "matched": ["DSA"],
        "missing": [],
        "weight": 30,
        "earnedWeight": 30
      }
    ],
    "positives": [
      "Strong frontend stack detected (React, CSS, JS)",
      "Project experience with Node.js backend"
    ],
    "improvements": [
      "No cloud platform experience found in resume",
      "System Design concepts not mentioned"
    ]
  },
  "matchedSkills": ["React", "Node.js", "MongoDB", "DSA"],
  "missingSkills": ["System Design", "AWS"],
  "company": "Google",
  "role": "Software Engineer",
  "roleId": "role_abc123",
  "analyzedAt": "2025-01-15T10:30:00Z"
}
```

### Scoring Rules
- Score must be recalculated fresh every time `POST /analysis/run` is called
- Score must differ per student (based on their resume) and per role (based on required skills)
- If a student has 0 matching skills → score = 0
- If a student has all matching skills → score = 100
- Eligibility threshold: score >= 60 means `eligible: true`

---

## Issue 2 — Students Cannot Upload Multiple Resumes

### Problem
The current implementation only allows one resume per student. Once a resume is uploaded, the student cannot upload a new one (either the endpoint rejects it or overwrites silently without history).

### Expected Behavior
- Students must be able to upload **multiple resumes** over time (e.g., updated versions)
- Each upload creates a **new resume record** with its own `resumeId`
- All past resumes remain accessible in the student's history
- One resume is marked as **active** (the latest uploaded one is used for analysis by default)
- Student can optionally mark an older resume as active

### API Contract Fix

**Endpoint:** `POST /resume/upload`

No change to request (still multipart FormData with `file` field).

**Response:**
```json
{
  "message": "Resume uploaded successfully",
  "resumeId": "resume_xyz789",
  "status": "processing",
  "version": 3,
  "isActive": true
}
```

**New Endpoint Needed:** `GET /resume/all`

Returns list of all resumes uploaded by the current student:
```json
{
  "resumes": [
    {
      "resumeId": "resume_xyz789",
      "filename": "John_Resume_v3.pdf",
      "uploadedAt": "2025-01-15T10:00:00Z",
      "status": "done",
      "score": 74,
      "isActive": true,
      "version": 3
    },
    {
      "resumeId": "resume_abc123",
      "filename": "John_Resume_v2.pdf",
      "uploadedAt": "2024-12-01T08:00:00Z",
      "status": "done",
      "score": 61,
      "isActive": false,
      "version": 2
    }
  ]
}
```

**New Endpoint Needed:** `PUT /resume/:resumeId/activate`

Marks a specific resume as active (used for future analyses):
```json
{ "message": "Resume set as active", "resumeId": "resume_abc123" }
```

**Update Endpoint:** `GET /resume/status`

Must now return info about the **active** resume:
```json
{
  "status": "done",
  "uploadedAt": "2025-01-15T10:00:00Z",
  "filename": "John_Resume_v3.pdf",
  "resumeId": "resume_xyz789",
  "version": 3,
  "totalUploaded": 3
}
```

---

## Issue 3 — Uploaded Resume Not Visible to Student

### Problem
After uploading, the student sees no confirmation of what was uploaded. The resume details, extracted skills, and score are not displayed back to the student.

### Expected Behavior
After upload and processing, the student must be able to see:
- File name and upload timestamp
- Extracted skills (list of skills the AI found in their resume)
- Resume score with reasoning (per Issue 1)
- Processing status in real time

### API Contract Fix

**Endpoint:** `GET /resume/:resumeId`

Returns full details of a specific resume:
```json
{
  "resumeId": "resume_xyz789",
  "filename": "John_Resume_v3.pdf",
  "uploadedAt": "2025-01-15T10:00:00Z",
  "status": "done",
  "isActive": true,
  "version": 3,
  "extractedSkills": ["React", "Node.js", "MongoDB", "JavaScript", "CSS", "Git", "DSA"],
  "extractedFrom": {
    "skillsSection": ["React", "Node.js", "MongoDB"],
    "projectsSection": ["JavaScript", "CSS", "Git"],
    "educationSection": ["DSA"]
  },
  "score": 74,
  "scoreBreakdown": "74% overall skill readiness based on extracted resume content across 3 sections.",
  "fileUrl": "/uploads/resume_xyz789.pdf"
}
```

**Note:** `fileUrl` must be a valid accessible URL so the frontend can display or open the uploaded PDF.

---

## Issue 4 — Roadmap is Not Personalised + Links Don't Work

### Problem
The roadmap returned from `POST /analysis/roadmap` is generic — it doesn't reflect which skills the specific student is missing. Also, `resources` are plain text strings with no clickable URLs, so links cannot be opened.

### Expected Behavior
- The roadmap must be **fully personalised** to the student's **specific missing skills**
- If a student is missing `["System Design", "AWS"]`, the roadmap must have modules specifically for System Design and AWS — not generic modules
- Each resource must be a **structured object** with a `title` and a valid `url` so the frontend can render a clickable link
- The AI prompt used to generate the roadmap must include: student name, target company, target role, and the exact list of missing skills

### API Contract Fix

**Endpoint:** `POST /analysis/roadmap`

**Request Body:**
```json
{
  "studentName": "John Doe",
  "missingSkills": ["System Design", "AWS"],
  "targetCompany": "Google",
  "targetRole": "Software Engineer",
  "roleId": "role_abc123",
  "currentScore": 67,
  "timelineWeeks": 8
}
```

**Response — `resources` must now be objects, not strings:**
```json
{
  "roadmap": [
    {
      "week": 1,
      "title": "System Design Fundamentals",
      "skill": "System Design",
      "description": "Learn the core concepts of distributed systems required for Google SWE interviews",
      "topics": ["CAP Theorem", "Load Balancing", "Horizontal vs Vertical Scaling", "Caching strategies"],
      "estimatedHours": 10,
      "resources": [
        {
          "title": "System Design Primer (GitHub)",
          "url": "https://github.com/donnemartin/system-design-primer",
          "type": "free"
        },
        {
          "title": "Grokking System Design (Educative)",
          "url": "https://www.educative.io/courses/grokking-modern-system-design-interview",
          "type": "paid"
        },
        {
          "title": "System Design YouTube Playlist",
          "url": "https://www.youtube.com/watch?v=UzLMhqg3_Wc",
          "type": "free"
        }
      ],
      "practiceLinks": [
        {
          "title": "Design a URL Shortener",
          "url": "https://leetcode.com/discuss/interview-question/system-design/124658/Design-URL-Shortening-Service"
        }
      ]
    },
    {
      "week": 2,
      "title": "Advanced System Design Patterns",
      "skill": "System Design",
      "description": "Deep dive into database design, sharding, and microservices",
      "topics": ["Database Sharding", "Microservices", "Message Queues", "API Design"],
      "estimatedHours": 12,
      "resources": [
        {
          "title": "Designing Data-Intensive Applications (Book)",
          "url": "https://www.oreilly.com/library/view/designing-data-intensive-applications/9781491903063/",
          "type": "paid"
        },
        {
          "title": "ByteByteGo Newsletter",
          "url": "https://bytebytego.com",
          "type": "free"
        }
      ],
      "practiceLinks": []
    },
    {
      "week": 3,
      "title": "AWS Core Services",
      "skill": "AWS",
      "description": "Get hands-on with the AWS services most asked in placements",
      "topics": ["EC2", "S3", "Lambda", "RDS", "IAM", "VPC basics"],
      "estimatedHours": 14,
      "resources": [
        {
          "title": "AWS Free Tier Account Setup",
          "url": "https://aws.amazon.com/free/",
          "type": "free"
        },
        {
          "title": "AWS Cloud Practitioner Essentials",
          "url": "https://aws.amazon.com/training/learn-about/cloud-practitioner/",
          "type": "free"
        },
        {
          "title": "FreeCodeCamp AWS Tutorial",
          "url": "https://www.youtube.com/watch?v=ulprqHHWlng",
          "type": "free"
        }
      ],
      "practiceLinks": [
        {
          "title": "Deploy a Node.js app on EC2",
          "url": "https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/create_deploy_nodejs.html"
        }
      ]
    }
  ],
  "summary": "8-week personalised roadmap for John Doe targeting Software Engineer at Google. Focuses on closing 2 skill gaps: System Design and AWS.",
  "totalWeeks": 8,
  "totalHours": 72,
  "generatedFor": {
    "studentName": "John Doe",
    "targetCompany": "Google",
    "targetRole": "Software Engineer",
    "missingSkills": ["System Design", "AWS"]
  }
}
```

### AI Prompt Requirements
The backend AI call (to OpenAI/Gemini/Claude) must use a prompt like:

```
You are a placement coach. Generate a personalised week-by-week learning roadmap for:
- Student: {studentName}
- Target Company: {targetCompany}  
- Target Role: {targetRole}
- Missing Skills: {missingSkills.join(", ")}
- Current Score: {currentScore}%
- Timeline: {timelineWeeks} weeks

Rules:
1. Each week must focus on ONE specific missing skill
2. Topics must be specific to what {targetCompany} tests for {targetRole}
3. ALL resources must be real, working URLs (GitHub, YouTube, official docs, Coursera, etc.)
4. Do NOT invent URLs. Use only well-known, verified resource URLs.
5. Return JSON only.
```

---

## Issue 5 — Student Dashboard Shows Wrong Data

### Problem
The student dashboard currently shows "extracted skills" and "resume keywords" which are not useful. The requirement is to show **only the skills the student is missing** for the company/role they applied to — along with **where to prepare** for each missing skill.

### Expected Behavior
Dashboard must show:
- Missing skills (only for the last analyzed company/role)
- For each missing skill: a preparation link or resource
- No raw extracted keywords or resume dump

### API Contract Fix

**Endpoint:** `GET /analysis/skill-radar`

**Response must now include `missingSkillsWithResources`:**
```json
{
  "skills": [
    { "skill": "DSA", "score": 85, "fullMark": 100 },
    { "skill": "React", "score": 90, "fullMark": 100 },
    { "skill": "System Design", "score": 20, "fullMark": 100 },
    { "skill": "AWS", "score": 0, "fullMark": 100 },
    { "skill": "SQL", "score": 70, "fullMark": 100 },
    { "skill": "Communication", "score": 60, "fullMark": 100 }
  ],
  "overallScore": 54,
  "matchedCount": 3,
  "eligible": false,
  "latestCompany": "Google",
  "latestRole": "Software Engineer",
  "missingSkills": ["System Design", "AWS"],
  "missingSkillsWithResources": [
    {
      "skill": "System Design",
      "prepLink": "https://github.com/donnemartin/system-design-primer",
      "prepLabel": "System Design Primer"
    },
    {
      "skill": "AWS",
      "prepLink": "https://aws.amazon.com/free/",
      "prepLabel": "AWS Free Tier"
    }
  ]
}
```

**Remove from all responses:**
- `extractedKeywords`
- `resumeKeywords`
- Raw text dump from resume parsing

---

## Issue 6 — Admin Dashboard Missing Student Eligibility List

### Problem
The admin dashboard only shows aggregate stats. There is no list showing which individual students are eligible or not for a given company, and no way to act on that (invite/reject).

### Expected Behavior
Admin must be able to:
1. See a **per-company list** of students with their eligibility status
2. See student name, score, missing skills, resume link
3. **Invite a student for interview** (sends notification to student)
4. **Mark a student as selected** (sends notification to student)
5. These actions must trigger a notification/email to the student

### New API Endpoints Needed

**`GET /admin/students?companyId=xxx&roleId=yyy`**

Returns list of all students who ran analysis for this company+role:
```json
{
  "company": "Google",
  "role": "Software Engineer",
  "students": [
    {
      "studentId": "stu_001",
      "name": "John Doe",
      "email": "john@university.edu",
      "score": 87,
      "eligible": true,
      "matchedSkills": ["React", "Node.js", "DSA", "MongoDB"],
      "missingSkills": ["AWS"],
      "resumeId": "resume_xyz789",
      "analyzedAt": "2025-01-15T10:00:00Z",
      "status": "pending"
    },
    {
      "studentId": "stu_002",
      "name": "Jane Smith",
      "email": "jane@university.edu",
      "score": 45,
      "eligible": false,
      "matchedSkills": ["React"],
      "missingSkills": ["DSA", "System Design", "AWS", "Node.js"],
      "resumeId": "resume_abc456",
      "analyzedAt": "2025-01-14T14:30:00Z",
      "status": "pending"
    }
  ],
  "summary": {
    "total": 2,
    "eligible": 1,
    "notEligible": 1
  }
}
```

**`POST /admin/students/:studentId/invite`**

Invites a student for interview:
```json
// Request
{
  "companyId": "company_001",
  "roleId": "role_abc123",
  "message": "Congratulations! You are invited for an interview at Google for the Software Engineer role.",
  "interviewDate": "2025-01-25T10:00:00Z"
}

// Response
{
  "message": "Student invited successfully",
  "studentId": "stu_001",
  "notificationSent": true,
  "status": "invited"
}
```

**`POST /admin/students/:studentId/select`**

Marks student as selected (placement confirmed):
```json
// Request
{
  "companyId": "company_001",
  "roleId": "role_abc123",
  "message": "Congratulations! You have been selected for the Software Engineer role at Google."
}

// Response
{
  "message": "Student marked as selected",
  "studentId": "stu_001",
  "notificationSent": true,
  "status": "selected"
}
```

**`POST /admin/students/:studentId/reject`**

Informs student they were not selected:
```json
// Request
{
  "companyId": "company_001",
  "roleId": "role_abc123",
  "message": "Thank you for your application. Unfortunately, you have not been selected at this time."
}

// Response
{
  "message": "Student notified",
  "studentId": "stu_001",
  "notificationSent": true,
  "status": "rejected"
}
```

**`GET /admin/companies`** (update existing)

Must now return list of companies with analysis counts:
```json
{
  "companies": [
    {
      "id": "company_001",
      "name": "Google",
      "roles": [
        {
          "id": "role_abc123",
          "title": "Software Engineer",
          "level": "Intermediate",
          "requiredSkills": ["React", "Node.js", "DSA", "System Design", "AWS", "MongoDB"],
          "totalApplicants": 24,
          "eligibleCount": 9
        }
      ]
    }
  ]
}
```

### Student Notification Endpoint (student-facing)

**`GET /student/notifications`**

Returns notifications for the logged-in student:
```json
{
  "notifications": [
    {
      "id": "notif_001",
      "type": "interview_invite",
      "company": "Google",
      "role": "Software Engineer",
      "message": "Congratulations! You are invited for an interview at Google.",
      "interviewDate": "2025-01-25T10:00:00Z",
      "read": false,
      "createdAt": "2025-01-15T12:00:00Z"
    },
    {
      "id": "notif_002",
      "type": "selected",
      "company": "Infosys",
      "role": "Backend Developer",
      "message": "You have been selected!",
      "read": true,
      "createdAt": "2025-01-10T09:00:00Z"
    }
  ],
  "unreadCount": 1
}
```

---

## Issue 7 — Remove Analysis Section from Admin

### Problem
The admin has access to student analysis internals (the full analysis run page and analytics tab). This should be removed.

### Expected Behavior
- Remove the `/admin/analytics` route and page entirely from the admin navigation
- The `GET /analysis/admin-stats` endpoint can remain (used for dashboard summary stats only)
- Admin should NOT be able to manually trigger or view raw analysis results for students
- Admin only sees the **summary view** (eligible/not eligible per company) and can take actions (invite/select/reject)

### What to Keep
Keep these admin endpoints:
- `GET /admin/students?companyId=&roleId=` — student list per company
- `POST /admin/students/:studentId/invite` — invite action
- `POST /admin/students/:studentId/select` — select action
- `POST /admin/students/:studentId/reject` — reject action
- `GET /analysis/admin-stats` — dashboard summary only
- `GET /admin/companies` — company list with applicant counts

### What to Remove
- `GET /analysis/admin-stats` detailed breakdown (keep only top-level numbers)
- Any endpoint that exposes per-student raw analysis data to admin beyond the list view

---

## Summary of All API Changes

| # | Type | Endpoint | Change |
|---|------|----------|--------|
| 1 | MODIFY | `POST /analysis/run` | Add `scoreReason` object, fix hardcoded score |
| 2 | MODIFY | `POST /resume/upload` | Support multiple uploads, add version tracking |
| 2 | NEW | `GET /resume/all` | Return all resumes for current student |
| 2 | NEW | `PUT /resume/:resumeId/activate` | Set active resume |
| 2 | MODIFY | `GET /resume/status` | Return active resume + total upload count |
| 3 | NEW | `GET /resume/:resumeId` | Full resume detail with extractedSkills, fileUrl |
| 4 | MODIFY | `POST /analysis/roadmap` | Personalised roadmap, resources as `{title, url}` objects |
| 5 | MODIFY | `GET /analysis/skill-radar` | Add `missingSkillsWithResources` field, remove keyword dump |
| 6 | NEW | `GET /admin/students` | Student eligibility list per company/role |
| 6 | NEW | `POST /admin/students/:id/invite` | Invite for interview |
| 6 | NEW | `POST /admin/students/:id/select` | Mark as selected |
| 6 | NEW | `POST /admin/students/:id/reject` | Notify not selected |
| 6 | NEW | `GET /student/notifications` | Student notification inbox |
| 7 | REMOVE | Admin analytics deep-dive | Keep only top-level dashboard stats |

---

## Database Schema Additions Required

### `resumes` table/collection
```
resumeId        string (PK)
studentId       string (FK)
filename        string
fileUrl         string
uploadedAt      datetime
status          enum: 'uploading' | 'processing' | 'done' | 'error'
isActive        boolean
version         integer
extractedSkills string[] (JSON array)
rawScore        float
scoreBreakdown  string
```

### `student_notifications` table/collection
```
notificationId  string (PK)
studentId       string (FK)
type            enum: 'interview_invite' | 'selected' | 'rejected'
company         string
role            string
message         string
interviewDate   datetime (nullable)
read            boolean
createdAt       datetime
```

### `analysis_results` table/collection — add fields
```
scoreReason     JSON object (full breakdown as specified in Issue 1)
analyzedAt      datetime
```

---

## Notes for AI/LLM Integration

### Roadmap Generation Prompt (Issue 4)
The AI model (OpenAI GPT-4 / Google Gemini / Anthropic Claude) must be called with:
- Temperature: 0.3 (consistent, factual output)
- System prompt must instruct it to return only valid JSON
- Must validate that all URLs in `resources[].url` start with `https://`
- If AI returns a URL that doesn't start with `https://`, strip it out
- Fallback: if URL validation fails, use curated hardcoded URLs per skill (maintain a `skill_resources.json` map)

### Score Calculation (Issue 1)
- Do NOT rely on AI to compute the score — compute it deterministically in backend code
- Only use AI for `scoreReason.summary` and `scoreReason.improvements` text generation
- The numeric `score` must be computed by your own matching algorithm

---

*Document prepared by: PlacementIQ Frontend Team*
*Version: 1.0 | Date: 2025*
