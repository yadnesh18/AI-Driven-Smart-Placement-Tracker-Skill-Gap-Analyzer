import User from "../models/user.js";
import Company from "../models/Company.js";
import { uploadToS3 } from "../config/s3.js";
import pdfParse from "pdf-parse";
import fs from "fs";

const ensureStudent = (user) => {
  if (user.role !== "student") {
    return false;
  }
  return true;
};

const detectSkills = (text) => {
  const cleaned = text
    .replace(/[^a-zA-Z0-9+#. ]/g, " ")
    .replace(/\s+/g, " ");

  const words = cleaned.split(" ");

  const stopWords = new Set([
    "the","and","for","with","from","this","that",
    "have","has","had","are","was","were","will",
    "your","you","our","their","them","his","her",
    "work","experience","project","projects",
    "education","skills","developer","engineer"
  ]);

  const detected = [];

  for (let word of words) {
    if (
      word.length > 2 &&
      !stopWords.has(word.toLowerCase()) &&
      /^[A-Za-z+#.]+$/.test(word)
    ) {
      detected.push(word);
    }
  }

  return [...new Set(detected)];
};

const generateRoadmap = (missingSkills) => {
  const urlMap = {
    JavaScript: "https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/",
    React: "https://reactjs.org/docs/getting-started.html",
    Node: "https://nodejs.dev/learn",
    MongoDB: "https://www.mongodb.com/developer/quickstart/",
    Python: "https://www.python.org/about/gettingstarted/",
    Java: "https://www.oracle.com/java/technologies/javase-downloads.html",
    "C++": "https://www.learncpp.com/",
    DSA: "https://www.geeksforgeeks.org/data-structures/",
    SQL: "https://www.w3schools.com/sql/",
    HTML: "https://developer.mozilla.org/en-US/docs/Web/HTML",
    CSS: "https://developer.mozilla.org/en-US/docs/Web/CSS",
  };

  return missingSkills.map((skill) => ({
    title: `Learn ${skill}`,
    description: `Resources to learn ${skill} and strengthen your profile for technical roles.`, 
    url: urlMap[skill] || "https://www.freecodecamp.org/",
  }));
};

export const uploadResume = async (req, res) => {
  try {
    const user = req.user;
    if (!ensureStudent(user)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const localPath = req.file.path;

    // Upload to S3
    const fileName = req.file.filename;
    const mimeType = req.file.mimetype;
    const resumeUrl = await uploadToS3(localPath, fileName, mimeType);

    // Extract text from PDF
    const fileBuffer = await fs.promises.readFile(localPath);
    const parsed = await pdfParse(fileBuffer);
    const text = parsed.text || "";

    // Detect skills
    const skills = detectSkills(text);

    // Compare against company required skills
    const companies = await Company.find({}).lean();
    const requiredSkills = new Set(
      companies
        .flatMap((c) => c.requiredSkills || [])
        .map((s) => s.toLowerCase())
    );

    const missingSkills = [...requiredSkills].filter(
      (skill) => !skills.map((s) => s.toLowerCase()).includes(skill)
    );

    const roadmap = generateRoadmap(missingSkills);

    // Store results on user
    await User.findByIdAndUpdate(user._id, {
      resumeUrl,
      skills,
      missingSkills,
      roadmap,
    });

    // Cleanup local file
    fs.promises.unlink(localPath).catch(() => {});

    res.json({
      message: "Resume uploaded successfully",
      resumeUrl,
      skills,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
