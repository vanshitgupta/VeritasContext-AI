// src/lib/constants.js
export const APP_CONFIG = {
  NAME: "VeritasContext AI",
  TAGLINE: "Enterprise Knowledge Governance Engine",
  MAX_FILE_SIZE_MB: 5,
  ALLOWED_TYPES: ["application/pdf"],
};

export const SYSTEM_ROLES = {
  ADMIN: "Administrator",
  FINANCE: "Finance",
  HR: "Human Resources",
  ENGINEERING: "Engineering",
  GENERAL: "General",
};

export const STORAGE_BUCKET = "veritascontext-ai-company-vault";

// Converted to a function to dynamically inject retrieved vectors at query time
export const getSystemPrompt = (
  contextText,
  question,
) => `You are VeritasContext AI, an enterprise knowledge engine.
Your goal is to answer the user's question using ONLY the verified context provided below.

CRITICAL RULES:
1. If the answer cannot be confidently derived from the provided context, state clearly that you do not possess that information within the uploaded company documents. Do NOT make up information.
2. Maintain a neutral, professional, corporate tone.
3. Never reference any data that was redacted (e.g., if you see [REDACTED_EMAIL], refer to it generally as a redacted company contact).

Context Database Records:
-------------------------
${contextText}
-------------------------

User Question: ${question}
Answer:`;
