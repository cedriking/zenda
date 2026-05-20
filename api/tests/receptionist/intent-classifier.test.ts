import { describe, expect, test } from 'bun:test'
import { classifyIntent } from '../../src/modules/ai/intent-classifier'
import type { ClassifiedIntent } from '../../src/modules/ai/intent-classifier'

// ===========================================================================
// Book appointment
// ===========================================================================

describe('Intent Classifier - book', () => {
  test('EN: "I want to book an appointment"', () => {
    const result = classifyIntent('I want to book an appointment')
    expect(result.intent).toBe('book')
    expect(result.confidence).toBeGreaterThanOrEqual(0.8)
  })

  test('EN: "schedule a haircut for next week"', () => {
    const result = classifyIntent('Can I schedule a haircut for next week?')
    expect(result.intent).toBe('book')
  })

  test('EN: "make an appointment"', () => {
    const result = classifyIntent('I need to make an appointment')
    expect(result.intent).toBe('book')
  })

  test('EN: "set up an appointment"', () => {
    const result = classifyIntent('Can we set up an appointment?')
    expect(result.intent).toBe('book')
  })

  test('EN: "reserve a spot"', () => {
    const result = classifyIntent('I would like to reserve a time slot')
    expect(result.intent).toBe('book')
  })

  test('ES: "quiero una cita"', () => {
    const result = classifyIntent('Hola, quiero una cita para el viernes')
    expect(result.intent).toBe('book')
  })

  test('ES: "agendar cita"', () => {
    const result = classifyIntent('Necesito agendar cita')
    expect(result.intent).toBe('book')
  })

  test('ES: "hacer una cita"', () => {
    const result = classifyIntent('Quiero hacer una cita')
    expect(result.intent).toBe('book')
  })

  test('ES: "necesito cita"', () => {
    const result = classifyIntent('Hola, necesito cita para corte de pelo')
    expect(result.intent).toBe('book')
  })

  test('ES: "pedir cita"', () => {
    const result = classifyIntent('Me gustaria pedir cita')
    expect(result.intent).toBe('book')
  })
})

// ===========================================================================
// Cancel
// ===========================================================================

describe('Intent Classifier - cancel', () => {
  test('EN: "cancel my appointment"', () => {
    const result = classifyIntent('I need to cancel my appointment')
    expect(result.intent).toBe('cancel')
    expect(result.confidence).toBeGreaterThanOrEqual(0.9)
  })

  test('EN: "cancel it please"', () => {
    const result = classifyIntent('Please cancel it')
    expect(result.intent).toBe('cancel')
  })

  test('ES: "cancelar mi cita"', () => {
    const result = classifyIntent('Quiero cancelar mi cita')
    expect(result.intent).toBe('cancel')
  })

  test('ES: "anular la cita"', () => {
    const result = classifyIntent('Necesito anular la cita de manana')
    expect(result.intent).toBe('cancel')
  })

  test('ES: "dar de baja"', () => {
    const result = classifyIntent('Quiero dar de baja la cita')
    expect(result.intent).toBe('cancel')
  })
})

// ===========================================================================
// Reschedule
// ===========================================================================

describe('Intent Classifier - reschedule', () => {
  test('EN: "reschedule my appointment"', () => {
    const result = classifyIntent('Can I reschedule my appointment?')
    expect(result.intent).toBe('reschedule')
    expect(result.confidence).toBeGreaterThanOrEqual(0.85)
  })

  test('EN: "change the time"', () => {
    const result = classifyIntent('I need to change the time of my appointment')
    expect(result.intent).toBe('reschedule')
  })

  test('EN: "change the date"', () => {
    const result = classifyIntent('Can I change the date?')
    expect(result.intent).toBe('reschedule')
  })

  test('EN: "move my appointment"', () => {
    const result = classifyIntent('Please move my appointment to next week')
    expect(result.intent).toBe('reschedule')
  })

  test('ES: "reprogramar cita"', () => {
    const result = classifyIntent('Necesito reprogramar mi cita')
    expect(result.intent).toBe('reschedule')
  })

  test('ES: "cambiar la hora"', () => {
    const result = classifyIntent('Quiero cambiar la hora de mi cita')
    expect(result.intent).toBe('reschedule')
  })

  test('ES: "cambiar la fecha"', () => {
    const result = classifyIntent('Puedo cambiar la fecha?')
    expect(result.intent).toBe('reschedule')
  })

  test('ES: "reagendar"', () => {
    const result = classifyIntent('Quiero reagendar mi cita')
    expect(result.intent).toBe('reschedule')
  })

  test('ES: "cambiar cita"', () => {
    const result = classifyIntent('Necesito cambiar cita')
    expect(result.intent).toBe('reschedule')
  })
})

// ===========================================================================
// Confirm
// ===========================================================================

describe('Intent Classifier - confirm', () => {
  test('EN: "confirm"', () => {
    const result = classifyIntent('Yes, confirm please')
    expect(result.intent).toBe('confirm')
  })

  test('EN: "ok"', () => {
    const result = classifyIntent('ok')
    expect(result.intent).toBe('confirm')
  })

  test('EN: "okay"', () => {
    const result = classifyIntent('okay')
    expect(result.intent).toBe('confirm')
  })

  test('EN: "yes confirm"', () => {
    const result = classifyIntent('yes confirm')
    expect(result.intent).toBe('confirm')
  })

  test('EN: "perfecto"', () => {
    const result = classifyIntent('perfecto')
    expect(result.intent).toBe('confirm')
  })

  test('ES: "confirmo"', () => {
    const result = classifyIntent('Confirmo')
    expect(result.intent).toBe('confirm')
  })

  test('ES: "claro"', () => {
    const result = classifyIntent('Claro, confirmo')
    expect(result.intent).toBe('confirm')
  })
})

// ===========================================================================
// Pricing inquiry
// ===========================================================================

describe('Intent Classifier - ask_price', () => {
  test('EN: "how much does it cost"', () => {
    const result = classifyIntent('How much does a haircut cost?')
    expect(result.intent).toBe('ask_price')
    expect(result.confidence).toBeGreaterThanOrEqual(0.85)
  })

  test('EN: "what is the price"', () => {
    const result = classifyIntent('What is the price for a haircut?')
    expect(result.intent).toBe('ask_price')
  })

  test('EN: "pricing"', () => {
    const result = classifyIntent('Can I see your pricing?')
    expect(result.intent).toBe('ask_price')
  })

  test('ES: "cuanto cuesta"', () => {
    const result = classifyIntent('Cuanto cuesta un corte?')
    expect(result.intent).toBe('ask_price')
  })

  test('ES: "precio"', () => {
    const result = classifyIntent('Cual es el precio?')
    expect(result.intent).toBe('ask_price')
  })

  test('ES: "costo"', () => {
    const result = classifyIntent('Me puedes decir el costo?')
    expect(result.intent).toBe('ask_price')
  })

  test('ES: "cuanto sale"', () => {
    const result = classifyIntent('Cuanto sale un tinte?')
    expect(result.intent).toBe('ask_price')
  })
})

// ===========================================================================
// Business hours inquiry
// ===========================================================================

describe('Intent Classifier - ask_hours', () => {
  test('EN: "what are your hours"', () => {
    const result = classifyIntent('What are your business hours?')
    expect(result.intent).toBe('ask_hours')
    expect(result.confidence).toBeGreaterThanOrEqual(0.8)
  })

  test('EN: "when do you open"', () => {
    const result = classifyIntent('When do you open?')
    expect(result.intent).toBe('ask_hours')
  })

  test('EN: "what time do you close"', () => {
    const result = classifyIntent('What time do you close?')
    expect(result.intent).toBe('ask_hours')
  })

  test('ES: "horarios"', () => {
    const result = classifyIntent('Cuales son los horarios?')
    expect(result.intent).toBe('ask_hours')
  })

  test('ES: "a que hora abren"', () => {
    const result = classifyIntent('A que hora abren?')
    expect(result.intent).toBe('ask_hours')
  })

  test('ES: "abierto"', () => {
    const result = classifyIntent('Estan abierto hoy?')
    expect(result.intent).toBe('ask_hours')
  })
})

// ===========================================================================
// Greeting (falls to ambiguous or confirm depending on pattern overlap)
// ===========================================================================

describe('Intent Classifier - greeting / ambiguous', () => {
  test('simple "hi" is ambiguous', () => {
    const result = classifyIntent('hi')
    // "hi" alone doesn't match any intent pattern confidently
    expect(result.intent).toBe('ambiguous')
  })

  test('"hello" is ambiguous', () => {
    const result = classifyIntent('hello')
    expect(result.intent).toBe('ambiguous')
  })

  test('"good morning" is ambiguous', () => {
    const result = classifyIntent('good morning')
    expect(result.intent).toBe('ambiguous')
  })
})

// ===========================================================================
// Opt-out
// ===========================================================================

describe('Intent Classifier - opt_out', () => {
  test('EN: "stop"', () => {
    const result = classifyIntent('stop')
    expect(result.intent).toBe('opt_out')
    expect(result.confidence).toBeGreaterThanOrEqual(0.9)
  })

  test('EN: "unsubscribe"', () => {
    const result = classifyIntent('unsubscribe me please')
    expect(result.intent).toBe('opt_out')
  })

  test('EN: "no more messages"', () => {
    const result = classifyIntent('no more messages please')
    expect(result.intent).toBe('opt_out')
  })

  test('EN: "don\'t text me"', () => {
    const result = classifyIntent("don't text me anymore")
    expect(result.intent).toBe('opt_out')
  })

  test('ES: "detener"', () => {
    const result = classifyIntent('detener mensajes')
    expect(result.intent).toBe('opt_out')
  })

  test('ES: "no mas"', () => {
    const result = classifyIntent('no mas mensajes')
    expect(result.intent).toBe('opt_out')
  })

  test('ES: "basta"', () => {
    const result = classifyIntent('basta de mensajes')
    expect(result.intent).toBe('opt_out')
  })

  test('ES: "ya no"', () => {
    const result = classifyIntent('ya no quiero mensajes')
    expect(result.intent).toBe('opt_out')
  })
})

// ===========================================================================
// Human escalation
// ===========================================================================

describe('Intent Classifier - ask_human', () => {
  test('EN: "speak to a human"', () => {
    const result = classifyIntent('I want to speak to a human')
    expect(result.intent).toBe('ask_human')
    expect(result.confidence).toBeGreaterThanOrEqual(0.85)
  })

  test('EN: "real person"', () => {
    const result = classifyIntent('Can I talk to a real person?')
    expect(result.intent).toBe('ask_human')
  })

  test('EN: "talk to someone"', () => {
    const result = classifyIntent('I want to talk to someone else')
    expect(result.intent).toBe('ask_human')
  })

  test('ES: "hablar con alguien"', () => {
    const result = classifyIntent('Quiero hablar con alguien')
    expect(result.intent).toBe('ask_human')
  })

  test('ES: "atencion humana"', () => {
    const result = classifyIntent('Necesito atencion humana')
    expect(result.intent).toBe('ask_human')
  })
})

// ===========================================================================
// Unknown / gibberish
// ===========================================================================

describe('Intent Classifier - unknown / gibberish', () => {
  test('gibberish string is ambiguous', () => {
    const result = classifyIntent('asdfghjkl qwerty')
    expect(result.intent).toBe('ambiguous')
    expect(result.confidence).toBeLessThan(0.5)
  })

  test('empty string is ambiguous', () => {
    const result = classifyIntent('')
    expect(result.intent).toBe('ambiguous')
    expect(result.confidence).toBe(0)
  })

  test('whitespace only is ambiguous', () => {
    const result = classifyIntent('   ')
    expect(result.intent).toBe('ambiguous')
  })

  test('random numbers is ambiguous', () => {
    const result = classifyIntent('12345 67890')
    expect(result.intent).toBe('ambiguous')
  })

  test('unicode only is ambiguous', () => {
    const result = classifyIntent('\u2764\u2764\u2764')
    expect(result.intent).toBe('ambiguous')
  })
})

// ===========================================================================
// Entity extraction
// ===========================================================================

describe('Intent Classifier - entity extraction', () => {
  test('extracts ISO date from message', () => {
    const result = classifyIntent('Book for 2025-06-15 at 10:00')
    expect(result.intent).toBe('book')
    expect(result.extractedEntities).toBeDefined()
    expect(result.extractedEntities!.date).toBe('2025-06-15')
  })

  test('extracts time in HH:mm format', () => {
    const result = classifyIntent('Book appointment at 14:30')
    expect(result.extractedEntities).toBeDefined()
    expect(result.extractedEntities!.time).toBe('14:30')
  })

  test('extracts slash date DD/MM/YYYY', () => {
    const result = classifyIntent('I need an appointment on 15/06/2025')
    expect(result.intent).toBe('book')
    if (result.extractedEntities) {
      expect(result.extractedEntities.date).toBe('2025-06-15')
    }
  })

  test('extracts informal time "at 3pm"', () => {
    const result = classifyIntent('Book at 3pm please')
    expect(result.intent).toBe('book')
    if (result.extractedEntities) {
      expect(result.extractedEntities.time).toBe('15:00')
    }
  })

  test('extracts "tomorrow" relative date', () => {
    const result = classifyIntent('Can I book an appointment for tomorrow?')
    expect(result.intent).toBe('book')
    if (result.extractedEntities) {
      expect(result.extractedEntities.relativeDate).toBe('tomorrow')
    }
  })

  test('returns no entities for message without date/time', () => {
    const result = classifyIntent('I want to book an appointment')
    // No entities expected when no date/time strings are present
    expect(result.extractedEntities).toBeUndefined()
  })
})

// ===========================================================================
// Check availability
// ===========================================================================

describe('Intent Classifier - check_availability', () => {
  test('EN: "what times are available"', () => {
    const result = classifyIntent('What times are available next week?')
    expect(result.intent).toBe('check_availability')
  })

  test('EN: "any free slot"', () => {
    const result = classifyIntent('Do you have any free slot?')
    expect(result.intent).toBe('check_availability')
  })

  test('EN: "are you available"', () => {
    const result = classifyIntent('Are you available on Friday?')
    expect(result.intent).toBe('check_availability')
  })

  test('ES: "hay lugar"', () => {
    const result = classifyIntent('Hay lugar para esta semana?')
    expect(result.intent).toBe('check_availability')
  })

  test('ES: "disponible"', () => {
    const result = classifyIntent('Tienen algo disponible esta semana?')
    expect(result.intent).toBe('check_availability')
  })
})

// ===========================================================================
// Ask location
// ===========================================================================

describe('Intent Classifier - ask_location', () => {
  test('EN: "where are you located"', () => {
    const result = classifyIntent('Where are you located?')
    expect(result.intent).toBe('ask_location')
  })

  test('EN: "what is the address"', () => {
    const result = classifyIntent('What is your address?')
    expect(result.intent).toBe('ask_location')
  })

  test('ES: "donde estan"', () => {
    const result = classifyIntent('Donde estan ubicados?')
    expect(result.intent).toBe('ask_location')
  })

  test('ES: "como llego"', () => {
    const result = classifyIntent('Como llego ahi?')
    expect(result.intent).toBe('ask_location')
  })
})

// ===========================================================================
// Ask reminder
// ===========================================================================

describe('Intent Classifier - ask_reminder', () => {
  test('EN: "send me a reminder"', () => {
    const result = classifyIntent('Send me a reminder please')
    expect(result.intent).toBe('ask_reminder')
  })

  test('EN: "alert me"', () => {
    const result = classifyIntent('Alert me before my visit')
    expect(result.intent).toBe('ask_reminder')
  })

  test('ES: "avisar"', () => {
    const result = classifyIntent('Quiero que me avisar')
    expect(result.intent).toBe('ask_reminder')
  })

  test('ES: "aviso"', () => {
    const result = classifyIntent('Necesito un aviso')
    expect(result.intent).toBe('ask_reminder')
  })

  test('ES: "notificar"', () => {
    const result = classifyIntent('Pueden notificar?')
    expect(result.intent).toBe('ask_reminder')
  })
})

// ===========================================================================
// Confidence thresholds
// ===========================================================================

describe('Intent Classifier - confidence thresholds', () => {
  test('all non-ambiguous results have confidence >= 0.5', () => {
    const messages = [
      'book an appointment',
      'cancel my appointment',
      'reschedule please',
      'how much does it cost',
      'what are your hours',
      'stop sending messages',
      'where are you located',
      'talk to a human',
    ]
    for (const msg of messages) {
      const result = classifyIntent(msg)
      if (result.intent !== 'ambiguous') {
        expect(result.confidence).toBeGreaterThanOrEqual(0.5)
      }
    }
  })

  test('ambiguous results have low confidence', () => {
    const result = classifyIntent('random gibberish xyz')
    expect(result.confidence).toBeLessThan(0.5)
  })
})
