/**
 * Natural Language Intent Classifier
 *
 * Uses pattern matching (regex) for common phrases in EN/ES.
 * Returns `ambiguous` when no pattern matches confidently.
 */

export type ClassifiedIntent =
  | 'book'
  | 'confirm'
  | 'reschedule'
  | 'cancel'
  | 'check_availability'
  | 'ask_price'
  | 'ask_location'
  | 'ask_hours'
  | 'ask_human'
  | 'ask_reminder'
  | 'opt_out'
  | 'ambiguous'

export interface IntentResult {
  intent: ClassifiedIntent
  confidence: number
  extractedEntities?: Record<string, string>
}

interface IntentPattern {
  intent: ClassifiedIntent
  pattern: RegExp
  confidence: number
}

const INTENT_PATTERNS: IntentPattern[] = [
  // Opt-out must be checked early — "stop" is short and could overlap
  {
    intent: 'opt_out',
    pattern: /\b(?:stop|unsubscribe|no\s+more|don't\s+(?:text|message|send)|detener|no\s+m[aá]s|basta|ya\s+no)\b/i,
    confidence: 0.95,
  },
  // Human escalation
  {
    intent: 'ask_human',
    pattern: /\b(?:human|person|agent|speak\s+to\s+someone|talk\s+to\s+someone|someone\s+else|real\s+person|humano|persona|agente|hablar\s+con\s+alguien|hablar\s+alguien|alguien\s+m[aá]s|atenci[oó]n\s+humana)\b/i,
    confidence: 0.9,
  },
  // Cancel
  {
    intent: 'cancel',
    pattern: /\b(?:cancel|cancelar|cancelaci[oó]n|anular|dar\s+de\s+baja)\b/i,
    confidence: 0.92,
  },
  // Reschedule
  {
    intent: 'reschedule',
    pattern: /\b(?:reschedule|change\s+(?:the\s+)?time|change\s+(?:the\s+)?date|move\s+(?:my\s+)?appointment|reprogramar|cambiar\s+(?:la\s+)?hora|cambiar\s+(?:la\s+)?fecha|reagendar|cambiar\s+cita)\b/i,
    confidence: 0.9,
  },
  // Confirm
  {
    intent: 'confirm',
    pattern: /\b(?:confirm|yes\s+confirm|confirmo|confirmar|s[ií].*confirmar|confirmar.*cita|s[ií]|claro|por\s+supuesto|dale|ok|okay|perfecto)\b/i,
    confidence: 0.75,
  },
  // Book / schedule
  {
    intent: 'book',
    pattern: /\b(?:book|appointment|schedule|reserv(?:e|ar)|cita|agendar|quiero.*cita|necesito.*cita|pedir.*cita|solicitar.*cita|hacer\s+una\s+cita|make\s+(?:an?\s+)?appointment|set\s+up|quiero\s+agendar|me\s+gustar[ií]a.*cita)\b/i,
    confidence: 0.88,
  },
  // Check availability
  {
    intent: 'check_availability',
    pattern: /\b(?:available|free\s+slot|openings?|when\s+(?:can|is)|disponible|libre|horario(?:s)?\s+disponible|qu[eé]\s+(?:horas|d[ií]as)|hay\s+lugar|hay\s+espacio)\b/i,
    confidence: 0.85,
  },
  // Ask price
  {
    intent: 'ask_price',
    pattern: /\b(?:price|cost|how\s+much|pricing|tariff|rate|cu[aá]nto(?:\s+(?:cuesta|sale|es|val[eé]))?|precio|costo|tarifa)\b/i,
    confidence: 0.9,
  },
  // Ask location
  {
    intent: 'ask_location',
    pattern: /\b(?:where\s+(?:are|is|do)|location|address|directions|direcci[oó]n|d[oó]nde\s+(?:est[aá]n|est[aá]|quedan|queda|son)|c[oó]mo\s+llego)\b/i,
    confidence: 0.9,
  },
  // Ask hours
  {
    intent: 'ask_hours',
    pattern: /\b(?:hours|open(?:ing)?|close|schedule|business\s+hours|horario(?:s)?|abierto|cerrado|a\s+qu[eé]\s+hora|cuando\s+abren)\b/i,
    confidence: 0.85,
  },
  // Reminder request
  {
    intent: 'ask_reminder',
    pattern: /\b(?:remind(?:er)?|alert|notify|record(?:ar|atorio)|avisar|notificar|aviso|recordarme)\b/i,
    confidence: 0.85,
  },
]

/**
 * Simple entity extraction for common slot fills.
 * Returns date-like or time-like substrings when found.
 */
function extractEntities(message: string): Record<string, string> {
  const entities: Record<string, string> = {}

  // Date: YYYY-MM-DD or DD/MM/YYYY or "tomorrow", "next Monday", etc.
  const isoDate = message.match(/\b(\d{4}-\d{2}-\d{2})\b/)
  if (isoDate) entities.date = isoDate[1]

  const slashDate = message.match(/\b(\d{1,2})\/(\d{1,2})\/(\d{2,4})\b/)
  if (slashDate) entities.date = `${slashDate[3].length === 2 ? '20' + slashDate[3] : slashDate[3]}-${slashDate[2].padStart(2, '0')}-${slashDate[1].padStart(2, '0')}`

  // Time: HH:mm or HH:mm AM/PM or "a las 3", "at 3pm"
  const hmTime = message.match(/\b(\d{1,2}):(\d{2})\s*(?:am|pm)?\b/i)
  if (hmTime) {
    const h = Number(hmTime[1])
    const m = hmTime[2]
    entities.time = `${String(h).padStart(2, '0')}:${m}`
  }

  const informalTime = message.match(/\b(?:a\s+las?\s+|at\s+)(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\b/i)
  if (informalTime && !hmTime) {
    let h = Number(informalTime[1])
    const ampm = informalTime[3]?.toLowerCase()
    if (ampm === 'pm' && h < 12) h += 12
    if (ampm === 'am' && h === 12) h = 0
    const m = informalTime[2] ?? '00'
    entities.time = `${String(h).padStart(2, '0')}:${m}`
  }

  // "tomorrow" / "mañana" relative keyword
  if (/\b(?:tomorrow|ma[u]?n?a\b)/i.test(message)) {
    entities.relativeDate = 'tomorrow'
  }

  return entities
}

/**
 * Classify the user's intent from a natural-language message.
 *
 * Strategy: iterate ordered patterns, return the first match.
 * If multiple patterns match, pick the one with highest confidence.
 * If nothing matches above a 0.5 threshold, return `ambiguous`.
 */
export function classifyIntent(message: string): IntentResult {
  if (!message || !message.trim()) {
    return { intent: 'ambiguous', confidence: 0 }
  }

  const normalized = message.trim()

  // Collect all matches and pick the best
  let bestMatch: IntentResult = { intent: 'ambiguous', confidence: 0 }

  for (const { intent, pattern, confidence } of INTENT_PATTERNS) {
    if (pattern.test(normalized) && confidence > bestMatch.confidence) {
      bestMatch = { intent, confidence }
    }
  }

  // If confidence is too low, treat as ambiguous
  if (bestMatch.confidence < 0.5) {
    return { intent: 'ambiguous', confidence: 0.3 }
  }

  // Attach extracted entities
  const entities = extractEntities(normalized)
  if (Object.keys(entities).length > 0) {
    bestMatch.extractedEntities = entities
  }

  return bestMatch
}
