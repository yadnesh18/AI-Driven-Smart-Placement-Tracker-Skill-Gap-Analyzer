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
  if (!raw || typeof raw !== "string") return "{}";
  let text = raw.trim();
  if (text.startsWith("```")) {
    const parts = text.split("```");
    if (parts.length >= 3) {
      text = parts[1].startsWith("json") ? parts.slice(2).join("```") : parts[1];
    }
  }
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) {
    text = text.slice(start, end + 1);
  }
  return text;
};

export const extractResumeData = async (resumeText) => {
  if (!resumeText || typeof resumeText !== "string") {
    return { skills: [], keywords: [] };
  }

  const model = getClient();

  const prompt = `
You are an AI resume analyzer.

From the resume text extract:

1. Technical Skills
2. Important Keywords
3. Technologies / Frameworks / Tools

Return result strictly in JSON:

{
  "skills": ["React","Node.js","MongoDB"],
  "keywords": ["REST API","Microservices","Docker"]
}

Resume text:
${resumeText}
`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const rawText = response.text();

  try {
    const parsed = JSON.parse(cleanJson(rawText));
    const skills = Array.isArray(parsed.skills)
      ? parsed.skills.map((s) => String(s).trim()).filter(Boolean)
      : [];
    const keywords = Array.isArray(parsed.keywords)
      ? parsed.keywords.map((s) => String(s).trim()).filter(Boolean)
      : [];

    return {
      skills,
      keywords,
    };
  } catch (err) {
    console.error("Failed to parse resume JSON from LLM:", err);
    return { skills: [], keywords: [] };
  }
};

