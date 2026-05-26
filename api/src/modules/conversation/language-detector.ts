import type { Language } from "@zenda/shared";

/**
 * Minimal heuristic fallback for language detection.
 *
 * The AI agent is the primary language detector — it receives every message
 * and calls update_customer_info with the detected language. This function
 * is only used as a hint during initial customer creation before the AI
 * has had a chance to process the first message.
 *
 * Returns undefined when uncertain so the workspace default is used.
 */
export function detectLanguage(text: string): Language | undefined {
  if (!text || text.trim().length === 0) {
    return;
  }

  // Quick check for strong Spanish signals (accented chars, inverted punctuation)
  if (/[¿¡ñáéíóúü]/i.test(text)) {
    return "es";
  }

  return;
}
