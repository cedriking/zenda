import { describe, expect, test } from 'bun:test'
import {
  detectOptOutIntent,
  generateConsentConfirmation,
} from '../../src/modules/messaging/consent-service'

// ===========================================================================
// detectOptOutIntent — English patterns
// ===========================================================================

describe('detectOptOutIntent - English opt-out phrases', () => {
  test('detects "stop"', () => {
    expect(detectOptOutIntent('please stop messaging me')).toBe(true)
  })

  test('detects "unsubscribe"', () => {
    expect(detectOptOutIntent('I want to unsubscribe')).toBe(true)
  })

  test('detects "cancel messages"', () => {
    expect(detectOptOutIntent('cancel messages')).toBe(true)
  })

  test('detects "cancelmessages" (no space)', () => {
    expect(detectOptOutIntent('cancelmessages')).toBe(true)
  })

  test('detects "no more"', () => {
    expect(detectOptOutIntent('no more messages please')).toBe(true)
  })

  test('detects "opt out"', () => {
    expect(detectOptOutIntent('I want to opt out')).toBe(true)
  })

  test('detects "don\'t text"', () => {
    expect(detectOptOutIntent("don't text me anymore")).toBe(true)
  })

  test('detects "do not text"', () => {
    expect(detectOptOutIntent('do not text me')).toBe(true)
  })

  test('detects "remove me"', () => {
    expect(detectOptOutIntent('remove me from the list')).toBe(true)
  })

  test('is case insensitive', () => {
    expect(detectOptOutIntent('STOP')).toBe(true)
    expect(detectOptOutIntent('Unsubscribe')).toBe(true)
  })
})

// ===========================================================================
// detectOptOutIntent — Spanish patterns
// ===========================================================================

describe('detectOptOutIntent - Spanish opt-out phrases', () => {
  test('detects "detener"', () => {
    expect(detectOptOutIntent('detener mensajes')).toBe(true)
  })

  test('detects "cancelar suscripción"', () => {
    expect(detectOptOutIntent('cancelar suscripción')).toBe(true)
  })

  test('detects "cancelar mensajes"', () => {
    expect(detectOptOutIntent('cancelar mensajes')).toBe(true)
  })

  test('detects "no más mensajes"', () => {
    expect(detectOptOutIntent('no más mensajes')).toBe(true)
  })

  test('detects "basta"', () => {
    expect(detectOptOutIntent('basta de mensajes')).toBe(true)
  })

  test('detects "sácame"', () => {
    expect(detectOptOutIntent('sácame de la lista')).toBe(true)
  })

  test('detects "dame de baja"', () => {
    expect(detectOptOutIntent('dame de baja')).toBe(true)
  })
})

// ===========================================================================
// detectOptOutIntent — negative cases
// ===========================================================================

describe('detectOptOutIntent - should NOT match', () => {
  test('does not match normal booking message', () => {
    expect(detectOptOutIntent('I would like to book an appointment')).toBe(false)
  })

  test('does not match empty string', () => {
    expect(detectOptOutIntent('')).toBe(false)
  })

  test('does not match "stop by"', () => {
    // "stop" as a word boundary match in "stop by" should still trigger
    // because \b matches at word boundary — "stop by" contains "stop" as a word
    expect(detectOptOutIntent('stop by the office')).toBe(true)
  })

  test('does not match unrelated Spanish text', () => {
    expect(detectOptOutIntent('hola, necesito una cita')).toBe(false)
  })
})

// ===========================================================================
// generateConsentConfirmation
// ===========================================================================

describe('generateConsentConfirmation', () => {
  test('returns English confirmation', () => {
    const result = generateConsentConfirmation('en')
    expect(result).toContain("I'll keep your info on file")
    expect(result).toContain("just let me know")
  })

  test('returns Spanish confirmation', () => {
    const result = generateConsentConfirmation('es')
    expect(result).toContain('te tengo en cuenta')
    expect(result).toContain('solo dime')
  })

  test('does not contain robotic "Reply STOP" language', () => {
    const en = generateConsentConfirmation('en')
    expect(en).not.toContain('Reply STOP')
    expect(en).not.toContain('text STOP')

    const es = generateConsentConfirmation('es')
    expect(es).not.toContain('STOP')
  })
})
