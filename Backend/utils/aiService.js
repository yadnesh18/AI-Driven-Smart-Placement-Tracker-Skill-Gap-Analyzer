// utils/aiService.js
// AI Service using Groq API (Free Tier)
// Model: llama-3.1-8b-instant — fast, free, great for JSON

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
      temperature: 0.3, // lower = more consistent JSON output
      messages: [
        {
          role: "system",
          content:
            "You are an expert AI resume analyzer. Always respond with valid JSON only. No explanation, no markdown, no code fences. Just raw JSON.",
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
    // Strip markdown code fences if model adds them anyway
    const cleaned = text.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned);
  } catch (err) {
    throw new Error(`Failed to parse JSON from LLM response: ${text}`);
  }
}

// ─────────────────────────────────────────────
// 1. Extract Skills & Keywords from Resume Text
// ─────────────────────────────────────────────
async function extractResumeData(resumeText) {
  const prompt = `
Analyze this resume text and extract the candidate's technical skills and keywords.

Resume Text:
"""
${resumeText.slice(0, 3000)}
"""

Return a JSON object in this exact format:
{
  "skills": ["skill1", "skill2", "skill3"],
  "keywords": ["keyword1", "keyword2", "keyword3"]
}

Rules:
- skills: programming languages, frameworks, tools, technologies (e.g. React, Node.js, Python, MongoDB)
- keywords: domain terms, concepts, methodologies (e.g. REST API, Agile, Machine Learning)
- Return 5–20 skills and 5–15 keywords
- Only include what is clearly mentioned in the resume
`;

  try {
    const raw = await callGroq(prompt, 600);
    const parsed = safeParseJSON(raw);
    return {
      skills: parsed.skills || [],
      keywords: parsed.keywords || [],
    };
  } catch (err) {
    console.error("Failed to extract resume data:", err.message);
    return { skills: [], keywords: [] };
  }
}

// ─────────────────────────────────────────────
// 2. Generate Skill Improvement Suggestions
// ─────────────────────────────────────────────
async function generateSkillImprovement(missingSkills) {
  if (!missingSkills || missingSkills.length === 0) return [];

  // Limit to top 6 missing skills to save tokens
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
// 3. Generate Learning Roadmap
// ─────────────────────────────────────────────
async function generateLearningRoadmap(missingSkills) {
  if (!missingSkills || missingSkills.length === 0) return [];

  const skillsToMap = missingSkills.slice(0, 6);

  const prompt = `
Create a step-by-step learning roadmap for a student who needs to learn these skills: ${skillsToMap.join(", ")}

Return a JSON array of ordered learning steps in this exact format:
[
  {
    "title": "Step title",
    "description": "What to learn and why (1-2 sentences)",
    "url": "https://free-resource-url.com"
  }
]

Rules:
- Order steps from fundamentals to advanced
- Use only free resources (freeCodeCamp, MDN, official docs, YouTube)
- Return 5–8 steps total
- Each step should build on the previous
`;

  try {
    const raw = await callGroq(prompt, 800);
    const parsed = safeParseJSON(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error("Failed to generate roadmap:", err.message);
    return [];
  }
}

// ─────────────────────────────────────────────
// 4. Generate Resume Score (0–100)
// ─────────────────────────────────────────────
async function generateResumeScore(skills, missingSkills, resumeText) {
  const totalSkills = skills.length + missingSkills.length;
  if (totalSkills === 0) return 0;

  const prompt = `
Score this resume on a scale of 0 to 100 based on the following data.

Student has these skills: ${skills.join(", ") || "none"}
Student is missing these skills: ${missingSkills.join(", ") || "none"}
Resume length (chars): ${resumeText.length}

Scoring criteria:
- Skills coverage (40%): how many relevant skills the student has
- Missing skills penalty (30%): fewer missing skills = higher score
- Resume completeness (30%): estimated from text length and content

Return a JSON object in this exact format:
{
  "score": 72,
  "breakdown": {
    "skillsCoverage": 30,
    "missingSkillsPenalty": 22,
    "resumeCompleteness": 20
  },
  "summary": "One sentence summary of resume strength"
}
`;

  try {
    const raw = await callGroq(prompt, 400);
    const parsed = safeParseJSON(raw);
    return {
      score: Math.min(100, Math.max(0, parsed.score || 0)),
      breakdown: parsed.breakdown || {},
      summary: parsed.summary || "",
    };
  } catch (err) {
    console.error("Failed to generate resume score:", err.message);
    // Fallback: calculate score locally
    const coverage = Math.round((skills.length / (totalSkills)) * 100);
    return { score: coverage, breakdown: {}, summary: "" };
  }
}

// ─────────────────────────────────────────────
// 5. Calculate Company Match %
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
// 6. Detect Missing Skills vs All Companies
// ─────────────────────────────────────────────
function detectMissingSkills(studentSkills, allCompanies) {
  const studentSkillsLower = studentSkills.map((s) => s.toLowerCase());

  // Collect all unique required skills across all companies
  const allRequiredSkills = new Set();
  allCompanies.forEach((company) => {
    company.requiredSkills.forEach((skill) => {
      allRequiredSkills.add(skill.toLowerCase());
    });
  });

  // Find skills student doesn't have
  const missing = [...allRequiredSkills].filter(
    (skill) => !studentSkillsLower.includes(skill)
  );

  return missing;
}

export {
  extractResumeData,
  generateSkillImprovement,
  generateLearningRoadmap,
  generateResumeScore,
  calculateCompanyMatch,
  detectMissingSkills,
};