/**
 * Input Guard — sanitizes customer messages before they reach the AI agent.
 *
 * Goals:
 * - Strip common prompt-injection patterns without blocking legitimate messages
 * - Flag suspicious content for audit logging
 * - Detect emergency keywords for priority routing (not for blocking)
 */

const MAX_MESSAGE_LENGTH = 4000

// Case-insensitive patterns that indicate prompt injection attempts
const INJECTION_PATTERNS: Array<{ regex: RegExp; flag: string }> = [
  { regex: /ignore\s+(all\s+)?previous\s+instructions/i, flag: 'ignore_previous' },
  { regex: /ignore\s+(all\s+)?above/i, flag: 'ignore_above' },
  { regex: /disregard\s+(your\s+)?instructions/i, flag: 'disregard_instructions' },
  { regex: /you\s+are\s+now\s+/i, flag: 'role_switch' },
  { regex: /act\s+as\s+if\s+/i, flag: 'act_as_if' },
  { regex: /pretend\s+you\s+are\s+/i, flag: 'pretend' },
  { regex: /^(system|assistant)\s*:/im, flag: 'role_prefix' },
  { regex: /\[SYSTEM\]/i, flag: 'system_tag' },
  { regex: /<system>/i, flag: 'system_tag' },
  { regex: /forget\s+(your|the)\s+(instructions|rules|prompt)/i, flag: 'forget_instructions' },
  { regex: /new\s+instructions?:/i, flag: 'new_instructions' },
  { regex: /override\s+(previous|all)\s+/i, flag: 'override' },
]

// EMERGENCY_KEYWORDS is the authoritative source for emergency keyword detection.
// engine.ts should import from here instead of maintaining its own list.
export const EMERGENCY_KEYWORDS = [
  // English
  'emergency',
  '911',
  'help me',
  'ambulance',
  'fire',
  'danger',
  'save me',
  'hurt',
  'bleeding',
  // Spanish
  'urgente',
  'urgencia',
  'ambulancia',
  'bomberos',
  'socorro',
  'peligro',
  'auxilio',
  'ayúdenme',
  'sangrando',
  'herido',
]

export interface SanitizeResult {
  sanitized: string
  wasModified: boolean
  flags: string[]
}

/**
 * Sanitize a customer message before passing it to the AI agent.
 *
 * - Strips prompt-injection phrases
 * - Truncates excessively long messages
 * - Flags suspicious patterns for audit logging
 * - Detects command-injection attempts (messages starting with "/")
 *
 * The message is never blocked — only sanitized. Flags are returned for logging.
 */
export function sanitizeCustomerMessage(message: string): SanitizeResult {
  const flags: string[] = []
  let sanitized = message

  // 1. Truncate extremely long messages
  if (sanitized.length > MAX_MESSAGE_LENGTH) {
    sanitized = sanitized.slice(0, MAX_MESSAGE_LENGTH) + ' [message truncated]'
    flags.push('truncated')
  }

  // 2. Flag messages that start with "/" (command injection attempt)
  if (/^\s*\//.test(sanitized)) {
    flags.push('command_prefix')
    sanitized = sanitized.replace(/^\s*\/\s*/, '')
  }

  // 3. Strip prompt-injection patterns (multi-pass until fixed point, max 5 iterations)
  let changed = true
  let passes = 0
  const MAX_SANITIZER_PASSES = 5
  while (changed && passes < MAX_SANITIZER_PASSES) {
    changed = false
    passes++
    for (const { regex, flag } of INJECTION_PATTERNS) {
      if (regex.test(sanitized)) {
        if (!flags.includes(flag)) flags.push(flag)
        sanitized = sanitized.replace(regex, '[removed]')
        changed = true
      }
    }
  }

  const wasModified = flags.length > 0
  return { sanitized, wasModified, flags }
}

/**
 * Check whether a message contains emergency keywords.
 *
 * This is NOT for blocking — it is for routing high-priority messages
 * so they can be escalated faster or flagged for immediate attention.
 */
export function isEmergencyMessage(message: string): boolean {
  const lower = message.toLowerCase()
  return EMERGENCY_KEYWORDS.some((kw) => lower.includes(kw))
}
