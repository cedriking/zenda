import type { PersonalityPreset } from "@zenda/shared";
import { type PersonalityPresetKey, VALID_PRESET_KEYS } from "@zenda/shared";

// Patterns that should never appear in custom instructions
const BLOCKED_PATTERNS: RegExp[] = [
  /\b(angry|enojad[oa]|furios[oa])\b/i,
  /\b(rude|groser[oa]|mal educad[oa])\b/i,
  /\b(aggressive|agresiv[oa]|hostil)\b/i,
  /\b(flirt[yi]?|coquet[oa]|seduct[oa]|seducci[oó]n)\b/i,
  /\b(manipulat[ei]|manipulad[oa]|engañ[oa]r|engaño)\b/i,
  /\b(hat(e|red|eful)|odio|odi[oa])\b/i,
  /\b(discriminat[ei]|discriminaci[oó]n|discriminad[oa])\b/i,
  /\b(racist|racist[oa]|racismo)\b/i,
  /\b(sexist|sexist[oa]|sexismo|machista)\b/i,
  /\b(xenophob|xenofob[oa]|xenofobia)\b/i,
  /\b(homophob|homofob[oa]|homofobia)\b/i,
  /\b(ableist|capacitism[oa])\b/i,
  /\b(insult|insult[oa]|insultar)\b/i,
  /\b(threat|amenaz[oa]|amenazar)\b/i,
  /\b(harass|acos[oa]|acoso|acosar)\b/i,
  /\b(bully|bully[iy]|intimid[ae])\b/i,
  /\b(swearing|grosería|groserías|malas palabras|insultos)\b/i,
  /\b(offensive|ofensiv[oa]|ofensa)\b/i,
  /\b(nazi|fascist|fascista)\b/i,
  /\b(white supremac|supremac[ía])\b/i,
  // S6.3 additional disallowed patterns
  /\b(savage|salvaje)\b/i,
  /\b(dark\s+humor|humor\s+negro|humor\s+oscuro)\b/i,
  /\b(pressure[-\s]?sales|venta\s+(?:agresiva|a\s+presi[oó]n)|vender\s+a\s+fuerza)\b/i,
  /\b(fear[-\s]?based|basad[oa]\s+en\s+(?:el\s+)?miedo)\b/i,
  /\b(emotionally\s+intense|intens[oa]\s+emocionalmente)\b/i,
  /\b(political|pol[ií]tic[oa]|partido)\b/i,
  /\b(religious\s+preaching|predicaci[oó]n\s+religiosa|proselyt)\b/i,
];

// Suggested safe alternatives for common blocked patterns
const SAFE_ALTERNATIVES: Record<string, string> = {
  savage: "Try 'bold' or 'edgy' instead",
  "dark humor": "Try 'witty' or 'clever' instead",
  "pressure-sales": "Try 'persuasive' or 'confident' instead",
  "fear-based": "Try 'motivating' or 'encouraging' instead",
  "emotionally intense": "Try 'passionate' or 'enthusiastic' instead",
  political: "Personality instructions should not reference politics",
  "religious preaching":
    "Personality instructions should not reference religion",
  angry: "Try 'assertive' or 'direct' instead",
  aggressive: "Try 'confident' or 'decisive' instead",
  flirty: "Try 'warm' or 'friendly' instead",
  manipulative: "Try 'persuasive' or 'helpful' instead",
  rude: "Try 'straightforward' or 'candid' instead",
};

interface PersonalityValidationResult {
  reason?: string;
  sanitizedConfig?: {
    personalityPreset: PersonalityPreset;
    customInstructions?: string;
  };
  valid: boolean;
}

interface CustomInstructionsValidationResult {
  reason?: string;
  valid: boolean;
}

export function validatePersonalityConfig(config: {
  personalityPreset: string;
  customInstructions?: string;
}): PersonalityValidationResult {
  const presetKey = config.personalityPreset as PersonalityPresetKey;

  if (!VALID_PRESET_KEYS.includes(presetKey)) {
    return {
      valid: false,
      reason: `Invalid personality preset "${config.personalityPreset}". Allowed values: ${VALID_PRESET_KEYS.join(", ")}`,
    };
  }

  if (config.customInstructions) {
    const instructionsResult = validateCustomInstructions(
      config.customInstructions
    );
    if (!instructionsResult.valid) {
      return {
        valid: false,
        reason: instructionsResult.reason,
      };
    }
  }

  return {
    valid: true,
    sanitizedConfig: {
      personalityPreset: presetKey,
      ...(config.customInstructions && {
        customInstructions: config.customInstructions.trim(),
      }),
    },
  };
}

export function validateCustomInstructions(
  text: string
): CustomInstructionsValidationResult {
  const trimmed = text.trim();

  if (trimmed.length === 0) {
    return { valid: true };
  }

  if (trimmed.length > 2000) {
    return {
      valid: false,
      reason: "Custom instructions must be 2000 characters or fewer.",
    };
  }

  for (const pattern of BLOCKED_PATTERNS) {
    const match = trimmed.match(pattern);
    if (match) {
      const alternative = SAFE_ALTERNATIVES[match[0].toLowerCase()];
      const suffix = alternative ? ` ${alternative}.` : "";
      return {
        valid: false,
        reason: `Custom instructions contain disallowed content near "${match[0]}". Instructions must not include aggressive, hateful, discriminatory, or inappropriate language.${suffix}`,
      };
    }
  }

  return { valid: true };
}
