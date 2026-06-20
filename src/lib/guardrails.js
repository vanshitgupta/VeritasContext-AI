// src/lib/guardrails.js

// FIXED: Using the exact named export required by the ES Module version of bad-words
import { Filter } from "bad-words";

// Initialize the profanity filter
const profanityFilter = new Filter();

const PII_PATTERNS = {
  EMAIL: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g,
  GLOBAL_PHONE:
    /(?:\+?\d{1,3}[-.\s]?)?(?:\(?\d{2,4}\)?[-.\s]?)?\d{3,4}[-.\s]?\d{3,4}[-.\s]?\d{0,4}/g,
  CREDIT_CARD: /\b(?:\d[ -]*?){13,16}\b/g,
  OPENAI_KEY: /\b(sk-[a-zA-Z0-9]{20,48})\b/g,
  GEMINI_KEY: /\b(AIza[0-9A-Za-z-_]{35})\b/g,
  PINCODE_ZIP: /(?<!\d)\b\d{5,6}\b(?!\d)/g,
  AADHAAR: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g,
};

/**
 * Scans text and redacts sensitive information before it reaches the LLM or Database.
 */
export function enforceGuardrails(text) {
  if (!text) return "";

  // 1. Scrub Profanity / Abusive Language
  let cleanText = profanityFilter.clean(text);

  // 2. Redact PII and Security Risks
  cleanText = cleanText.replace(PII_PATTERNS.EMAIL, "[REDACTED_EMAIL]");
  cleanText = cleanText.replace(PII_PATTERNS.CREDIT_CARD, "[REDACTED_CARD]");
  cleanText = cleanText.replace(
    PII_PATTERNS.OPENAI_KEY,
    "[REDACTED_OPENAI_KEY]",
  );
  cleanText = cleanText.replace(
    PII_PATTERNS.GEMINI_KEY,
    "[REDACTED_GEMINI_KEY]",
  );
  cleanText = cleanText.replace(PII_PATTERNS.AADHAAR, "[REDACTED_NATIONAL_ID]");
  cleanText = cleanText.replace(PII_PATTERNS.PINCODE_ZIP, "[REDACTED_ZIP]");

  // Phone numbers are tricky; we run this last to ensure it doesn't overwrite other masks.
  cleanText = cleanText.replace(PII_PATTERNS.GLOBAL_PHONE, (match) => {
    const digitCount = match.replace(/\D/g, "").length;
    return digitCount >= 7 ? "[REDACTED_PHONE]" : match;
  });

  return cleanText;
}
