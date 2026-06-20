// src/lib/ai-adapter.js
import {
  ChatGoogleGenerativeAI,
  GoogleGenerativeAIEmbeddings,
} from "@langchain/google-genai";

export function getLLM() {
  const modelName = process.env.LLM_MODEL_NAME || "gemini-1.5-flash";
  const apiKey = process.env.LLM_API_KEY;

  if (!apiKey) throw new Error("LLM_API_KEY is missing in .env.local");

  return new ChatGoogleGenerativeAI({
    model: modelName,
    apiKey: apiKey,
    temperature: 0.1,
    maxOutputTokens: 2048,
  });
}

export function getEmbeddings() {
  const modelName = process.env.EMBEDDING_MODEL_NAME || "gemini-embedding-2"; // Fixed missing model
  const apiKey = process.env.EMBEDDING_API_KEY || process.env.LLM_API_KEY;

  if (!apiKey) throw new Error("Embedding API Key is missing.");

  return new GoogleGenerativeAIEmbeddings({
    model: modelName,
    apiKey: apiKey,
    // THE FIX: Force the 3072-dimension model to shrink its output to 768 dimensions
    // This perfectly matches Postgres limits while utilizing the newest Google intelligence.
    taskType: "RETRIEVAL_DOCUMENT", // Improves RAG accuracy
    dimensions: 768,
  });
}
