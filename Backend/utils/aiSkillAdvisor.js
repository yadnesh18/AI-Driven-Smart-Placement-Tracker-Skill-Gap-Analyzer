const MODEL_NAME = process.env.OPENROUTER_MODEL || "google/gemini-1.5-pro";

const fetchFromOpenRouter = async (prompt) => {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not configured");
  }

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: MODEL_NAME,
      messages: [{ role: "user", content: prompt }]
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenRouter API error: ${response.status} ${response.statusText} - ${errorText}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || "";
};

const cleanJson = (raw) => {
  if (!raw || typeof raw !== "string") return "[]";
  let text = raw.trim();
  if (text.startsWith("```")) {
    const parts = text.split("```");
    if (parts.length >= 3) {
      text = parts[1].startsWith("json") ? parts.slice(2).join("```") : parts[1];
    }
  }
  const start = text.indexOf("[");
  const end = text.lastIndexOf("]");
  if (start !== -1 && end !== -1 && end > start) {
    text = text.slice(start, end + 1);
  }
  return text;
};

export const generateSkillImprovement = async (missingSkills) => {
  const skills = Array.isArray(missingSkills)
    ? missingSkills.map((s) => String(s).trim()).filter(Boolean)
    : [];

  if (skills.length === 0) {
    return [];
  }

  const prompt = `
You are a career mentor for software engineering students.

The student is missing the following skills:
${JSON.stringify(skills)}

For each skill provide:

• explanation why it is important
• how to improve it
• recommended learning resources

Return JSON format:

[
  {
    "skill": "DSA",
    "importance": "Data Structures and Algorithms are critical for coding interviews",
    "howToImprove": "Practice problems on arrays, trees and graphs daily",
    "resources": "https://takeuforward.org"
  }
]
`;

  try {
    const rawText = await fetchFromOpenRouter(prompt);
    const parsed = JSON.parse(cleanJson(rawText));
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((item) => ({
        skill: String(item.skill || "").trim(),
        importance: String(item.importance || "").trim(),
        howToImprove: String(item.howToImprove || "").trim(),
        resources: String(item.resources || "").trim(),
      }))
      .filter((item) => item.skill);
  } catch (err) {
    console.error("Failed to fetch or parse improvement JSON from LLM:", err);
    return [];
  }
};

export const generateLearningRoadmap = async (missingSkills) => {
  const skills = Array.isArray(missingSkills)
    ? missingSkills.map((s) => String(s).trim()).filter(Boolean)
    : [];

  if (skills.length === 0) {
    return [];
  }

  const prompt = `
You are a learning path designer for software engineering students.

The student is missing the following skills:
${JSON.stringify(skills)}

Create a concise learning roadmap with 4–7 steps that helps the student systematically build these skills.

Each step should include:
- title
- description
- a recommended resource URL (can be a course, playlist, or documentation)

Return strictly valid JSON in the following format:

[
  {
    "title": "Master DSA fundamentals",
    "description": "Spend 2-3 weeks covering arrays, linked lists, stacks, queues, trees, and graphs with hands-on problems.",
    "url": "https://takeuforward.org/interviews/strivers-sde-sheet-top-coding-interview-problems"
  }
]
`;

  try {
    const rawText = await fetchFromOpenRouter(prompt);
    const parsed = JSON.parse(cleanJson(rawText));
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((item) => ({
        title: String(item.title || "").trim(),
        description: String(item.description || "").trim(),
        url: String(item.url || "").trim(),
      }))
      .filter((item) => item.title);
  } catch (err) {
    console.error("Failed to fetch or parse roadmap JSON from LLM:", err);
    return [];
  }
};
