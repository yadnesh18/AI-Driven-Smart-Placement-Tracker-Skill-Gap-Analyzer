// utils/aiService.js
// AI Service using Groq API (Free Tier)
// Model: llama-3.1-8b-instant — fast, free, great for JSON

import { createRequire } from "module";
const require = createRequire(import.meta.url);
const skillResourcesMap = require("./skill_resources.json");

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.1-8b-instant";

// ─────────────────────────────────────────────
// Core Groq caller
// ─────────────────────────────────────────────
async function callGroq(prompt, maxTokens = 1000) {
  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      max_tokens: maxTokens,
      temperature: 0.3,
      messages: [
        {
          role: "system",
          content:
            "You are an expert AI resume analyzer and placement coach. Always respond with valid JSON only. No explanation, no markdown, no code fences. Just raw JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(`Groq API error: ${JSON.stringify(data)}`);
  }

  return data.choices[0].message.content.trim();
}

// ─────────────────────────────────────────────
// Helper: safely parse JSON from LLM response
// ─────────────────────────────────────────────
function safeParseJSON(text) {
  try {
    const cleaned = text.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned);
  } catch {
    // Try to extract JSON object or array from the text
    const objStart = text.indexOf("{");
    const objEnd = text.lastIndexOf("}");
    const arrStart = text.indexOf("[");
    const arrEnd = text.lastIndexOf("]");

    if (objStart !== -1 && objEnd > objStart) {
      try {
        return JSON.parse(text.slice(objStart, objEnd + 1));
      } catch { /* fall through */ }
    }
    if (arrStart !== -1 && arrEnd > arrStart) {
      try {
        return JSON.parse(text.slice(arrStart, arrEnd + 1));
      } catch { /* fall through */ }
    }
    throw new Error(`Failed to parse JSON from LLM response: ${text.slice(0, 200)}`);
  }
}

// ─────────────────────────────────────────────
// 1. Extract Skills & Keywords from Resume Text
//    (with section detection for Issue 3)
// ─────────────────────────────────────────────
async function extractResumeData(resumeText) {
  const prompt = `
Analyze this resume text and extract the candidate's technical skills, categorized by where they appear.

Resume Text:
"""
${resumeText.slice(0, 3000)}
"""

Return a JSON object in this exact format:
{
  "skills": ["skill1", "skill2", "skill3"],
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "extractedFrom": {
    "skillsSection": ["React", "Node.js"],
    "projectsSection": ["JavaScript", "Git"],
    "educationSection": ["DSA"]
  }
}

Rules:
- skills: programming languages, frameworks, tools, technologies (e.g. React, Node.js, Python, MongoDB)
- keywords: domain terms, concepts, methodologies (e.g. REST API, Agile, Machine Learning)
- extractedFrom: categorize skills based on which section of the resume they come from
- Return 5–20 skills and 5–15 keywords
- Only include what is clearly mentioned in the resume
`;

  try {
    const raw = await callGroq(prompt, 800);
    const parsed = safeParseJSON(raw);
    return {
      skills: parsed.skills || [],
      keywords: parsed.keywords || [],
      extractedFrom: parsed.extractedFrom || {
        skillsSection: [],
        projectsSection: [],
        educationSection: [],
      },
    };
  } catch (err) {
    console.error("Failed to extract resume data:", err.message);
    return {
      skills: [],
      keywords: [],
      extractedFrom: { skillsSection: [], projectsSection: [], educationSection: [] },
    };
  }
}

// ─────────────────────────────────────────────
// 2. Generate Skill Improvement Suggestions
// ─────────────────────────────────────────────
async function generateSkillImprovement(missingSkills) {
  if (!missingSkills || missingSkills.length === 0) return [];

  const skillsToAnalyze = missingSkills.slice(0, 6);

  const prompt = `
For each of the following missing technical skills, provide improvement suggestions.

Missing Skills: ${skillsToAnalyze.join(", ")}

Return a JSON array in this exact format:
[
  {
    "skill": "skill name",
    "importance": "High" or "Medium" or "Low",
    "howToImprove": "1-2 sentence practical tip",
    "resources": ["resource1", "resource2"]
  }
]

Rules:
- importance: High = frequently required by companies, Low = niche
- resources: free learning resources like YouTube channels, docs, or website names (no URLs needed)
- Keep howToImprove concise and actionable
`;

  try {
    const raw = await callGroq(prompt, 800);
    const parsed = safeParseJSON(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error("Failed to generate improvement suggestions:", err.message);
    return [];
  }
}

// ─────────────────────────────────────────────
// 3. Generate Score Reason (Issue 1)
//    Score is computed DETERMINISTICALLY — AI only provides text
// ─────────────────────────────────────────────
function computeScore(matchedSkills, requiredSkills) {
  if (!requiredSkills || requiredSkills.length === 0) return 100;
  return Math.round((matchedSkills.length / requiredSkills.length) * 100);
}

async function generateScoreReason(matchedSkills, missingSkills, requiredSkills, studentName) {
  const score = computeScore(matchedSkills, requiredSkills);
  const eligible = score >= 60;

  // Build deterministic breakdown
  // Categorize skills: Technical (70% weight) and Core CS (30% weight)
  const csConcepts = new Set([
    "dsa", "data structures", "algorithms", "operating systems", "os",
    "dbms", "database management", "computer networks", "cn",
    "oops", "oop", "object oriented programming", "compiler design",
    "theory of computation", "discrete mathematics", "linear algebra",
  ]);

  const technicalRequired = [];
  const coreCSRequired = [];
  for (const skill of requiredSkills) {
    if (csConcepts.has(skill.toLowerCase())) {
      coreCSRequired.push(skill);
    } else {
      technicalRequired.push(skill);
    }
  }

  const matchedLower = new Set(matchedSkills.map((s) => s.toLowerCase()));

  const techMatched = technicalRequired.filter((s) => matchedLower.has(s.toLowerCase()));
  const techMissing = technicalRequired.filter((s) => !matchedLower.has(s.toLowerCase()));
  const csMatched = coreCSRequired.filter((s) => matchedLower.has(s.toLowerCase()));
  const csMissing = coreCSRequired.filter((s) => !matchedLower.has(s.toLowerCase()));

  // Calculate weighted scores
  const techWeight = coreCSRequired.length > 0 ? 70 : 100;
  const csWeight = coreCSRequired.length > 0 ? 30 : 0;

  const techEarned =
    technicalRequired.length > 0
      ? Math.round((techMatched.length / technicalRequired.length) * techWeight)
      : techWeight;
  const csEarned =
    coreCSRequired.length > 0
      ? Math.round((csMatched.length / coreCSRequired.length) * csWeight)
      : csWeight;

  const breakdown = [];
  if (technicalRequired.length > 0) {
    breakdown.push({
      category: "Technical Skills",
      matched: techMatched,
      missing: techMissing,
      weight: techWeight,
      earnedWeight: techEarned,
    });
  }
  if (coreCSRequired.length > 0) {
    breakdown.push({
      category: "Core CS",
      matched: csMatched,
      missing: csMissing,
      weight: csWeight,
      earnedWeight: csEarned,
    });
  }

  // Ask AI for summary and improvements text only
  let summary = `You matched ${matchedSkills.length} out of ${requiredSkills.length} required skills.`;
  let positives = [];
  let improvements = [];

  try {
    const prompt = `
A student named "${studentName || "Student"}" has the following skill match for a job role:
- Matched skills: ${matchedSkills.join(", ") || "none"}
- Missing skills: ${missingSkills.join(", ") || "none"}
- Score: ${score}%

Generate:
1. A 1-2 sentence summary of their readiness
2. 2-3 positive observations about their profile
3. 2-3 specific improvement suggestions

Return JSON:
{
  "summary": "string",
  "positives": ["string", "string"],
  "improvements": ["string", "string"]
}
`;
    const raw = await callGroq(prompt, 400);
    const parsed = safeParseJSON(raw);
    summary = parsed.summary || summary;
    positives = parsed.positives || [];
    improvements = parsed.improvements || [];
  } catch (err) {
    console.error("Failed to generate score reason text:", err.message);
    // Use defaults computed above
    if (matchedSkills.length > 0) {
      positives = [`Has ${matchedSkills.length} relevant skills: ${matchedSkills.slice(0, 3).join(", ")}`];
    }
    if (missingSkills.length > 0) {
      improvements = missingSkills.slice(0, 3).map((s) => `${s} not found in resume`);
    }
  }

  return {
    score,
    eligible,
    scoreReason: {
      summary,
      breakdown,
      positives,
      improvements,
    },
    matchedSkills,
    missingSkills,
  };
}

// ─────────────────────────────────────────────
// 4. Generate Personalised Roadmap (Issue 4)
// ─────────────────────────────────────────────
async function generatePersonalisedRoadmap({
  studentName,
  missingSkills,
  targetCompany,
  targetRole,
  currentScore,
  timelineWeeks,
}) {
  if (!missingSkills || missingSkills.length === 0) {
    return { roadmap: [], summary: "No missing skills detected.", totalWeeks: 0, totalHours: 0 };
  }

  const weeks = timelineWeeks || Math.max(4, missingSkills.length * 2);

  const prompt = `
You are a placement coach. Generate a personalised week-by-week learning roadmap for:
- Student: ${studentName || "Student"}
- Target Company: ${targetCompany || "Top Tech Company"}
- Target Role: ${targetRole || "Software Engineer"}
- Missing Skills: ${missingSkills.join(", ")}
- Current Score: ${currentScore || 0}%
- Timeline: ${weeks} weeks

Rules:
1. Each week must focus on ONE specific missing skill
2. Topics must be specific to what ${targetCompany || "the company"} tests for ${targetRole || "this role"}
3. ALL resources must be real, working URLs (GitHub, YouTube, official docs, Coursera, etc.)
4. Do NOT invent URLs. Use only well-known, verified resource URLs.
5. Return JSON only with this structure:

{
  "roadmap": [
    {
      "week": 1,
      "title": "string",
      "skill": "string",
      "description": "string",
      "topics": ["topic1", "topic2"],
      "estimatedHours": 10,
      "resources": [
        { "title": "string", "url": "https://...", "type": "free" }
      ],
      "practiceLinks": [
        { "title": "string", "url": "https://..." }
      ]
    }
  ],
  "totalHours": 72
}
`;

  try {
    const raw = await callGroq(prompt, 2000);
    const parsed = safeParseJSON(raw);

    let roadmap = parsed.roadmap || (Array.isArray(parsed) ? parsed : []);

    // Validate and filter URLs
    roadmap = roadmap.map((week) => {
      const resources = (week.resources || [])
        .filter((r) => r.url && r.url.startsWith("https://"))
        .map((r) => ({
          title: r.title || "Resource",
          url: r.url,
          type: r.type || "free",
        }));

      // If AI returned no valid resources, use curated fallback
      if (resources.length === 0 && week.skill) {
        const fallback = findSkillResources(week.skill);
        if (fallback) {
          resources.push(...fallback);
        }
      }

      const practiceLinks = (week.practiceLinks || []).filter(
        (p) => p.url && p.url.startsWith("https://")
      );

      return {
        week: week.week || 1,
        title: week.title || `Learn ${week.skill}`,
        skill: week.skill || "",
        description: week.description || "",
        topics: week.topics || [],
        estimatedHours: week.estimatedHours || 10,
        resources,
        practiceLinks,
      };
    });

    const totalHours = roadmap.reduce((sum, w) => sum + (w.estimatedHours || 0), 0);

    return {
      roadmap,
      summary: `${weeks}-week personalised roadmap for ${studentName || "Student"} targeting ${targetRole || "Software Engineer"} at ${targetCompany || "Top Company"}. Focuses on closing ${missingSkills.length} skill gap${missingSkills.length > 1 ? "s" : ""}: ${missingSkills.join(" and ")}.`,
      totalWeeks: weeks,
      totalHours: parsed.totalHours || totalHours,
      generatedFor: {
        studentName: studentName || "Student",
        targetCompany: targetCompany || "",
        targetRole: targetRole || "",
        missingSkills,
      },
    };
  } catch (err) {
    console.error("Failed to generate personalised roadmap:", err.message);
    // Fallback: generate a basic roadmap from curated resources
    const roadmap = missingSkills.map((skill, idx) => {
      const fallbackResources = findSkillResources(skill) || [];
      return {
        week: idx + 1,
        title: `Learn ${skill}`,
        skill,
        description: `Study ${skill} fundamentals and build hands-on projects.`,
        topics: [`${skill} basics`, `${skill} advanced concepts`],
        estimatedHours: 10,
        resources: fallbackResources,
        practiceLinks: [],
      };
    });

    return {
      roadmap,
      summary: `Fallback roadmap for ${missingSkills.length} missing skills.`,
      totalWeeks: missingSkills.length,
      totalHours: missingSkills.length * 10,
      generatedFor: {
        studentName: studentName || "Student",
        targetCompany: targetCompany || "",
        targetRole: targetRole || "",
        missingSkills,
      },
    };
  }
}

// ─────────────────────────────────────────────
// Helper: find resources for a skill from curated map
// ─────────────────────────────────────────────
function findSkillResources(skill) {
  if (!skill) return [];
  // Try exact match first, then case-insensitive
  if (skillResourcesMap[skill]) return skillResourcesMap[skill].resources || [];
  const key = Object.keys(skillResourcesMap).find(
    (k) => k.toLowerCase() === skill.toLowerCase()
  );
  return key ? skillResourcesMap[key].resources || [] : [];
}

// ─────────────────────────────────────────────
// 5. Get Missing Skill Resources (Issue 5)
// ─────────────────────────────────────────────
function getMissingSkillResources(missingSkills) {
  if (!missingSkills || missingSkills.length === 0) return [];

  return missingSkills.map((skill) => {
    const key = Object.keys(skillResourcesMap).find(
      (k) => k.toLowerCase() === skill.toLowerCase()
    );
    const data = key ? skillResourcesMap[key] : null;

    return {
      skill,
      prepLink: data?.prepLink || `https://www.google.com/search?q=learn+${encodeURIComponent(skill)}`,
      prepLabel: data?.prepLabel || `Learn ${skill}`,
    };
  });
}

// ─────────────────────────────────────────────
// 6. Calculate Company Match %
// ─────────────────────────────────────────────
function calculateCompanyMatch(studentSkills, companyRequiredSkills) {
  if (!companyRequiredSkills || companyRequiredSkills.length === 0) return 0;

  const studentSkillsLower = studentSkills.map((s) => s.toLowerCase());
  const matched = companyRequiredSkills.filter((skill) =>
    studentSkillsLower.includes(skill.toLowerCase())
  );

  return Math.round((matched.length / companyRequiredSkills.length) * 100);
}

// ─────────────────────────────────────────────
// 7. Detect Missing Skills vs All Companies
// ─────────────────────────────────────────────
function detectMissingSkills(studentSkills, allCompanies) {
  const studentSkillsLower = studentSkills.map((s) => s.toLowerCase());

  const allRequiredSkills = new Set();
  allCompanies.forEach((company) => {
    (company.requiredSkills || []).forEach((skill) => {
      allRequiredSkills.add(skill.toLowerCase());
    });
  });

  return [...allRequiredSkills].filter(
    (skill) => !studentSkillsLower.includes(skill)
  );
}

// ─────────────────────────────────────────────
// 8. Generate Resume Base Score (for upload-time scoring)
// ─────────────────────────────────────────────
async function generateResumeScore(skills, missingSkills, resumeText) {
  const totalSkills = skills.length + missingSkills.length;
  if (totalSkills === 0) return { score: 0, breakdown: {}, summary: "" };

  const score = Math.round((skills.length / totalSkills) * 100);
  const summary = `${score}% overall skill readiness based on ${skills.length} detected skills and ${missingSkills.length} missing skills.`;

  return {
    score,
    breakdown: {
      skillsCoverage: Math.round((skills.length / totalSkills) * 40),
      missingSkillsPenalty: Math.round(((totalSkills - missingSkills.length) / totalSkills) * 30),
      resumeCompleteness: Math.min(30, Math.round((resumeText.length / 2000) * 30)),
    },
    summary,
  };
}

export {
  extractResumeData,
  generateSkillImprovement,
  generateScoreReason,
  computeScore,
  generatePersonalisedRoadmap,
  getMissingSkillResources,
  generateResumeScore,
  calculateCompanyMatch,
  detectMissingSkills,
  findSkillResources,
};