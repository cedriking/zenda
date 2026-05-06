import type { Language } from '@zenda/shared'

// Simple heuristic: detect Spanish by common characters and words
const SPANISH_INDICATORS = [
  'ñ', 'á', 'é', 'í', 'ó', 'ú', 'ü', '¿', '¡',
  /\bhola\b/i, /\bgracias\b/i, /\bbuenos\b/i, /\bpor favor\b/i,
  /\bcita\b/i, /\bagendar\b/i, /\bcuando\b/i, /\bhorario\b/i,
  /\bdisponible\b/i, /\bcancelar\b/i, /\bconfirmar\b/i,
  /\bdía\b/i, /\bhora\b/i, /\bservicio\b/i, /\bprecio\b/i,
]

export function detectLanguage(text: string): Language | undefined {
  if (!text || text.trim().length === 0) return undefined

  const lowerText = text.toLowerCase()

  for (const indicator of SPANISH_INDICATORS) {
    if (typeof indicator === 'string') {
      if (lowerText.includes(indicator)) return 'es'
    } else {
      if (indicator.test(lowerText)) return 'es'
    }
  }

  return 'en'
}
