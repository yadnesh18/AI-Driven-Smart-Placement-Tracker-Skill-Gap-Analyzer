import { GoogleGenerativeAI } from "@google/generative-ai";

const MODEL_NAME = process.env.GEMINI_MODEL || "gemini-1.5-pro";

const getClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({ model: MODEL_NAME });
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

  const model = getClient();

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

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const rawText = response.text();

  try {
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
    console.error("Failed to parse improvement JSON from LLM:", err);
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

  const model = getClient();

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

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const rawText = response.text();

  try {
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
    console.error("Failed to parse roadmap JSON from LLM:", err);
    return [];
  }
};

