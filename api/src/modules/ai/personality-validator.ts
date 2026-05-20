import { VALID_PRESET_KEYS, type PersonalityPresetKey } from '@zenda/shared'
import type { PersonalityPreset } from '@zenda/shared'

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
]

interface PersonalityValidationResult {
  valid: boolean
  sanitizedConfig?: {
    personalityPreset: PersonalityPreset
    customInstructions?: string
  }
  reason?: string
}

interface CustomInstructionsValidationResult {
  valid: boolean
  reason?: string
}

export function validatePersonalityConfig(config: {
  personalityPreset: string
  customInstructions?: string
}): PersonalityValidationResult {
  const presetKey = config.personalityPreset as PersonalityPresetKey

  if (!VALID_PRESET_KEYS.includes(presetKey)) {
    return {
      valid: false,
      reason: `Invalid personality preset "${config.personalityPreset}". Allowed values: ${VALID_PRESET_KEYS.join(', ')}`,
    }
  }

  if (config.customInstructions) {
    const instructionsResult = validateCustomInstructions(config.customInstructions)
    if (!instructionsResult.valid) {
      return {
        valid: false,
        reason: instructionsResult.reason,
      }
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
  }
}

export function validateCustomInstructions(text: string): CustomInstructionsValidationResult {
  const trimmed = text.trim()

  if (trimmed.length === 0) {
    return { valid: true }
  }

  if (trimmed.length > 2000) {
    return {
      valid: false,
      reason: 'Custom instructions must be 2000 characters or fewer.',
    }
  }

  for (const pattern of BLOCKED_PATTERNS) {
    const match = trimmed.match(pattern)
    if (match) {
      return {
        valid: false,
        reason: `Custom instructions contain disallowed content near "${match[0]}". Instructions must not include aggressive, hateful, discriminatory, or inappropriate language.`,
      }
    }
  }

  return { valid: true }
}
