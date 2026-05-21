import { describe, expect, test } from 'bun:test'

// The conversation engine has internal pure functions that aren't exported.
// We test the EMERGENCY_PATTERN and LOW_CONFIDENCE_PATTERNS by importing
// the module and testing detectAutoEscalation through the exported pipeline.
// Since the functions are module-scoped, we test the regex patterns directly.

// --- Emergency keyword pattern (replicated from engine.ts) ---
const EMERGENCY_KEYWORDS = [
  'emergency', 'urgente', 'ayuda', 'socorro', '911', 'ambulancia',
  'incendio', 'fire', 'drowning', 'ahogo', 'bleeding', 'sangrando',
  'heart attack', 'ataque cardiaco', 'stroke', 'derrame cerebral',
  'overdose', 'sobredosis', 'suicide', 'suicidio', 'accidente',
  'accident', 'choque', 'desmayo', 'fainting', 'no respira',
  'not breathing', 'choking', 'atragantado',
]

const EMERGENCY_PATTERN = new RegExp(
  '\\b(' + EMERGENCY_KEYWORDS.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')\\b',
  'i',
)

// --- Low confidence patterns (replicated from engine.ts) ---
const LOW_CONFIDENCE_PATTERNS = [
  /i'?m\s+not\s+sure/i,
  /i\s+don'?t\s+(?:really\s+)?know/i,
  /no\s+estoy\s+segur[oa]/i,
  /no\s+(?:lo\s+)?s[ée]/i,
  /i\s+cannot\s+(?:help|assist|answer)/i,
  /fuera\s+de\s+(?:mi|nuestro)\s+(?:alcance|scope)/i,
  /beyond\s+(?:my|the)\s+(?:scope|knowledge)/i,
  /i'?m\s+unable\s+to/i,
  /no\s+puedo\s+(?:ayudar|asistir)/i,
]

const TOOL_FAILURE_PATTERN = /(?:tool_call_failed|function_call_error|unable_to_complete_action)/i

// Replicate detectAutoEscalation logic
function detectAutoEscalation(
  aiResponseText: string,
  toolCalls?: unknown[],
): string | null {
  for (const pattern of LOW_CONFIDENCE_PATTERNS) {
    if (pattern.test(aiResponseText)) {
      return 'low_confidence'
    }
  }

  if (toolCalls && Array.isArray(toolCalls)) {
    for (const tc of toolCalls) {
      const tcStr = JSON.stringify(tc)
      if (TOOL_FAILURE_PATTERN.test(tcStr)) {
        return 'technology_question'
      }
    }
  }

  return null
}

// ===========================================================================
// EMERGENCY_PATTERN
// ===========================================================================

describe('EMERGENCY_PATTERN - English keywords', () => {
  test('detects "emergency"', () => {
    expect(EMERGENCY_PATTERN.test('this is an emergency')).toBe(true)
  })

  test('detects "911"', () => {
    expect(EMERGENCY_PATTERN.test('call 911')).toBe(true)
  })

  test('detects "fire"', () => {
    expect(EMERGENCY_PATTERN.test('there is a fire')).toBe(true)
  })

  test('detects "suicide"', () => {
    expect(EMERGENCY_PATTERN.test('suicide')).toBe(true)
  })

  test('detects "overdose"', () => {
    expect(EMERGENCY_PATTERN.test('overdose')).toBe(true)
  })

  test('detects "not breathing"', () => {
    expect(EMERGENCY_PATTERN.test('not breathing')).toBe(true)
  })

  test('detects "choking"', () => {
    expect(EMERGENCY_PATTERN.test('choking')).toBe(true)
  })

  test('detects "bleeding"', () => {
    expect(EMERGENCY_PATTERN.test('bleeding')).toBe(true)
  })

  test('detects "heart attack"', () => {
    expect(EMERGENCY_PATTERN.test('heart attack')).toBe(true)
  })

  test('is case insensitive', () => {
    expect(EMERGENCY_PATTERN.test('EMERGENCY')).toBe(true)
    expect(EMERGENCY_PATTERN.test('Emergency')).toBe(true)
  })
})

describe('EMERGENCY_PATTERN - Spanish keywords', () => {
  test('detects "urgente"', () => {
    expect(EMERGENCY_PATTERN.test('es urgente')).toBe(true)
  })

  test('detects "ayuda"', () => {
    expect(EMERGENCY_PATTERN.test('necesito ayuda')).toBe(true)
  })

  test('detects "ambulancia"', () => {
    expect(EMERGENCY_PATTERN.test('ambulancia')).toBe(true)
  })

  test('detects "incendio"', () => {
    expect(EMERGENCY_PATTERN.test('incendio')).toBe(true)
  })

  test('detects "socorro"', () => {
    expect(EMERGENCY_PATTERN.test('socorro')).toBe(true)
  })

  test('detects "no respira"', () => {
    expect(EMERGENCY_PATTERN.test('no respira')).toBe(true)
  })

  test('detects "suicidio"', () => {
    expect(EMERGENCY_PATTERN.test('suicidio')).toBe(true)
  })
})

describe('EMERGENCY_PATTERN - negative cases', () => {
  test('does not match normal message', () => {
    expect(EMERGENCY_PATTERN.test('I would like to book an appointment')).toBe(false)
  })

  test('does not match empty string', () => {
    expect(EMERGENCY_PATTERN.test('')).toBe(false)
  })

  test('does not match "fire" in "firefox"', () => {
    // Word boundary should prevent this
    expect(EMERGENCY_PATTERN.test('firefox')).toBe(false)
  })
})

// ===========================================================================
// detectAutoEscalation
// ===========================================================================

describe('detectAutoEscalation - low confidence English', () => {
  test('detects "I\'m not sure"', () => {
    expect(detectAutoEscalation("I'm not sure about that")).toBe('low_confidence')
  })

  test('detects "I don\'t know"', () => {
    expect(detectAutoEscalation("I don't know the answer")).toBe('low_confidence')
  })

  test('detects "I cannot help"', () => {
    expect(detectAutoEscalation('I cannot help with that')).toBe('low_confidence')
  })

  test('detects "beyond my scope"', () => {
    expect(detectAutoEscalation('This is beyond my scope')).toBe('low_confidence')
  })

  test('detects "I\'m unable to"', () => {
    expect(detectAutoEscalation("I'm unable to assist")).toBe('low_confidence')
  })
})

describe('detectAutoEscalation - low confidence Spanish', () => {
  test('detects "no estoy seguro"', () => {
    expect(detectAutoEscalation('no estoy seguro')).toBe('low_confidence')
  })

  test('detects "no lo sé"', () => {
    expect(detectAutoEscalation('no lo sé')).toBe('low_confidence')
  })

  test('detects "no puedo ayudar"', () => {
    expect(detectAutoEscalation('no puedo ayudar')).toBe('low_confidence')
  })

  test('detects "fuera de mi alcance"', () => {
    expect(detectAutoEscalation('fuera de mi alcance')).toBe('low_confidence')
  })
})

describe('detectAutoEscalation - tool failure', () => {
  test('detects tool_call_failed in tool calls', () => {
    const toolCalls = [{ name: 'book_appointment', result: 'tool_call_failed' }]
    expect(detectAutoEscalation('Here is the result', toolCalls)).toBe('technology_question')
  })

  test('detects function_call_error in tool calls', () => {
    const toolCalls = [{ error: 'function_call_error: timeout' }]
    expect(detectAutoEscalation('Normal response', toolCalls)).toBe('technology_question')
  })

  test('detects unable_to_complete_action in tool calls', () => {
    const toolCalls = [{ status: 'unable_to_complete_action' }]
    expect(detectAutoEscalation('Normal response', toolCalls)).toBe('technology_question')
  })
})

describe('detectAutoEscalation - no escalation needed', () => {
  test('returns null for confident response', () => {
    expect(detectAutoEscalation('Your appointment is confirmed for tomorrow at 3pm')).toBeNull()
  })

  test('returns null for empty tool calls array', () => {
    expect(detectAutoEscalation('Normal response', [])).toBeNull()
  })

  test('returns null when no tool calls', () => {
    expect(detectAutoEscalation('Normal response')).toBeNull()
  })
})
