
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

  try {
    const rawText = await fetchFromOpenRouter(prompt);
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
    console.error("Failed to fetch or parse resume JSON from LLM:", err);
    return { skills: [], keywords: [] };
  }
};
