import { db } from '@zenda/db/client'
import { workspaces, businessProfiles, receptionistProfiles, services, availabilityRules } from '@zenda/db/schema'
import { eq } from 'drizzle-orm'
import type { OnboardingStep } from '@zenda/shared'

interface OnboardingQuestion {
  step: OnboardingStep
  questionEn: string
  questionEs: string
  field: string
}

const ONBOARDING_QUESTIONS: Record<string, OnboardingQuestion> = {
  not_started: {
    step: 'not_started',
    questionEn: "Great, your WhatsApp is connected! What's the name of your business?",
    questionEs: '¡Genial, tu WhatsApp está conectado! ¿Cuál es el nombre de tu negocio?',
    field: 'businessName',
  },
  whatsapp_connected: {
    step: 'whatsapp_connected',
    questionEn: "Great, your WhatsApp is connected! What's the name of your business?",
    questionEs: '¡Genial, tu WhatsApp está conectado! ¿Cuál es el nombre de tu negocio?',
    field: 'businessName',
  },
  business_info: {
    step: 'business_info',
    questionEn: 'What type of business do you have? (e.g., beauty salon, dental clinic, fitness studio)',
    questionEs: '¿Qué tipo de negocio tienes? (ej., salón de belleza, clínica dental, estudio de fitness)',
    field: 'category',
  },
  services: {
    step: 'services',
    questionEn: 'What services do you offer? Please list them with approximate duration and price, one per line. Example: Haircut - 30min - $25',
    questionEs: '¿Qué servicios ofreces? Lista con duración y precio aproximado, uno por línea. Ejemplo: Corte de cabello - 30min - $25',
    field: 'services',
  },
  availability: {
    step: 'availability',
    questionEn: 'What are your business hours? Example: Monday-Friday 9am-6pm, Saturday 10am-2pm',
    questionEs: '¿Cuáles son tus horarios? Ejemplo: Lunes-Viernes 9am-6pm, Sábado 10am-2pm',
    field: 'availability',
  },
  policies: {
    step: 'policies',
    questionEn: 'Do you have a cancellation policy? (e.g., "Please cancel at least 2 hours before")',
    questionEs: '¿Tienes alguna política de cancelación? (ej., "Por favor cancela al menos 2 horas antes")',
    field: 'cancellationPolicy',
  },
  receptionist_config: {
    step: 'receptionist_config',
    questionEn: "What should your AI receptionist's name be? And what tone do you prefer? (professional, warm, friendly)",
    questionEs: '¿Cómo debería llamarse tu recepcionista IA? ¿Y qué tono prefieres? (profesional, cálido, amigable)',
    field: 'receptionistConfig',
  },
  plan_selection: {
    step: 'plan_selection',
    questionEn: "You're almost done! Choose a plan to activate your AI receptionist. You can start with a free trial or pick a plan now.",
    questionEs: '¡Ya casi terminas! Elige un plan para activar tu recepcionista IA. Puedes comenzar con una prueba gratis o elegir un plan ahora.',
    field: 'planTier',
  },
}

// Step-specific acknowledgment messages
function getAcknowledgment(step: string, response: string, language: 'en' | 'es'): string {
  const acks: Record<string, Record<string, (response: string) => string>> = {
    whatsapp_connected: {
      en: (r) => `Nice! **${r}** sounds great.`,
      es: (r) => `¡Excelente! **${r}** suena muy bien.`,
    },
    not_started: {
      en: (r) => `Nice! **${r}** sounds great.`,
      es: (r) => `¡Excelente! **${r}** suena muy bien.`,
    },
    business_info: {
      en: (r) => `Got it, a ${r.toLowerCase()}. That helps me tailor the experience.`,
      es: (r) => `Perfecto, un ${r.toLowerCase()}. Esto me ayuda a personalizar la experiencia.`,
    },
    services: {
      en: () => 'Those services are now saved. Customers will be able to book them!',
      es: () => 'Tus servicios quedaron guardados. Tus clientes podrán reservarlos.',
    },
    availability: {
      en: () => 'Your schedule is all set!',
      es: () => '¡Tu horario quedó configurado!',
    },
    policies: {
      en: () => 'Good policy. I\'ll make sure to mention that when booking.',
      es: () => 'Buena política. Me aseguraré de mencionarlo al agendar citas.',
    },
    receptionist_config: {
      en: (r) => {
        const nameMatch = r.match(/(?:name(?:d|s)?\s+(?:it\s+)?|llama[rs]?e?\s+(?:')?)(\w+)/i)
          ?? r.match(/^(\w+)/)
        const name = nameMatch?.[1] ?? 'your receptionist'
        return `${name} is ready to greet your customers!`
      },
      es: (r) => {
        const nameMatch = r.match(/(?:llamar?\s+(?:se\s+)?(?:')?|nombre\s+(?:es\s+)?(?:')?|sea\s+(?:')?)(\w+)/i)
          ?? r.match(/^(\w+)/)
        const name = nameMatch?.[1] ?? 'tu recepcionista'
        return `¡${name} está lista para recibir a tus clientes!`
      },
    },
    plan_selection: {
      en: () => "You're all set!",
      es: () => '¡Todo listo!',
    },
  }

  const fn = acks[step]?.[language]
  return fn ? fn(response) : (language === 'en' ? 'Got it!' : '¡Perfecto!')
}

export async function getNextOnboardingQuestion(
  workspaceId: string,
  language: 'en' | 'es' = 'es',
): Promise<{ question: string; step: string } | null> {
  const [ws] = await db
    .select()
    .from(workspaces)
    .where(eq(workspaces.id, workspaceId))
    .limit(1)

  if (!ws) return null

  const currentStep = (ws.onboardingStep as OnboardingStep) ?? 'not_started'
  if (currentStep === 'ready') return { question: language === 'en' ? 'You\'re all set! Your AI receptionist is ready to go.' : '¡Todo listo! Tu recepcionista IA está lista.', step: 'ready' }

  const questionData = ONBOARDING_QUESTIONS[currentStep]
  if (!questionData) return null

  return {
    question: language === 'en' ? questionData.questionEn : questionData.questionEs,
    step: currentStep,
  }
}

export async function processOnboardingResponse(
  workspaceId: string,
  step: string,
  response: string,
  language: 'en' | 'es' = 'es',
): Promise<{ acknowledged: string; nextStep: string }> {
  // Handle plan_selection step
  if (step === 'plan_selection') {
    const normalized = response.toLowerCase().trim()
    const tierMap: Record<string, string> = {
      starter: 'starter', pro: 'pro', business: 'business',
      skip: 'starter', free: 'starter', trial: 'starter',
      '1': 'starter', '2': 'pro', '3': 'business',
    }
    const tier = tierMap[normalized] ?? 'starter'
    const { advanceOnboarding } = await import('./flow.js')
    const nextStep = await advanceOnboarding(workspaceId, step as OnboardingStep)
    const ackMessages: Record<string, Record<string, string>> = {
      starter: { en: "You're all set with the Starter plan!", es: '¡Todo listo con el plan Starter!' },
      pro: { en: "Great choice! Pro plan selected.", es: '¡Excelente elección! Plan Pro seleccionado.' },
      business: { en: "Excellent! Business plan selected.", es: '¡Excelente! Plan Business seleccionado.' },
    }
    return { acknowledged: ackMessages[tier]?.[language] ?? ackMessages.starter[language], nextStep }
  }

  // Save onboarding data for each step
  try {
    await saveStepData(workspaceId, step, response, language)
  } catch {
    // Don't block onboarding if data save fails — still advance the step
  }

  // Advance the onboarding step
  const { advanceOnboarding } = await import('./flow.js')
  const nextStep = await advanceOnboarding(workspaceId, step as OnboardingStep)

  return {
    acknowledged: getAcknowledgment(step, response, language),
    nextStep,
  }
}

// Parse and save onboarding data to the appropriate tables
async function saveStepData(
  workspaceId: string,
  step: string,
  response: string,
  _language: 'en' | 'es',
): Promise<void> {
  switch (step) {
    case 'not_started':
    case 'whatsapp_connected': {
      const businessName = response.trim()
      // Update workspace name
      await db.update(workspaces).set({ name: businessName, updatedAt: new Date() }).where(eq(workspaces.id, workspaceId))
      // Upsert business profile
      const [existing] = await db.select().from(businessProfiles).where(eq(businessProfiles.workspaceId, workspaceId)).limit(1)
      if (existing) {
        await db.update(businessProfiles).set({ name: businessName, updatedAt: new Date() }).where(eq(businessProfiles.id, existing.id))
      } else {
        await db.insert(businessProfiles).values({ workspaceId, name: businessName })
      }
      break
    }

    case 'business_info': {
      const category = mapCategory(response)
      const [existing] = await db.select().from(businessProfiles).where(eq(businessProfiles.workspaceId, workspaceId)).limit(1)
      if (existing) {
        await db.update(businessProfiles).set({ category, updatedAt: new Date() }).where(eq(businessProfiles.id, existing.id))
      }
      break
    }

    case 'services': {
      const parsed = parseServices(response)
      for (const svc of parsed) {
        await db.insert(services).values({
          workspaceId,
          name: svc.name,
          durationMinutes: svc.durationMinutes,
          priceCents: svc.priceCents,
        })
      }
      break
    }

    case 'availability': {
      const rules = parseAvailability(response)
      for (const rule of rules) {
        await db.insert(availabilityRules).values({
          workspaceId,
          dayOfWeek: rule.dayOfWeek,
          startTime: rule.startTime,
          endTime: rule.endTime,
          available: true,
        })
      }
      break
    }

    case 'policies': {
      const policy = response.trim()
      const [existing] = await db.select().from(businessProfiles).where(eq(businessProfiles.workspaceId, workspaceId)).limit(1)
      if (existing) {
        await db.update(businessProfiles).set({
          cancellationPolicy: policy,
          cancellationPolicyEs: policy,
          updatedAt: new Date(),
        }).where(eq(businessProfiles.id, existing.id))
      }
      break
    }

    case 'receptionist_config': {
      const config = parseReceptionistConfig(response)
      const [existing] = await db.select().from(receptionistProfiles).where(eq(receptionistProfiles.workspaceId, workspaceId)).limit(1)
      if (existing) {
        await db.update(receptionistProfiles).set({
          name: config.name,
          tone: config.tone,
          updatedAt: new Date(),
        }).where(eq(receptionistProfiles.id, existing.id))
      } else {
        await db.insert(receptionistProfiles).values({
          workspaceId,
          name: config.name,
          tone: config.tone,
        })
      }
      break
    }
  }
}

function mapCategory(response: string): 'beauty' | 'wellness' | 'health' | 'coaching' | 'fitness' | 'other' {
  const lower = response.toLowerCase()
  if (/dental|dentist|teeth/i.test(lower)) return 'health'
  if (/beauty|salon|hair|nail|esthet|peluquer/i.test(lower)) return 'beauty'
  if (/fitness|gym|gymnasio|deporte|sport/i.test(lower)) return 'fitness'
  if (/wellness|spa|massage|masaje|relaj/i.test(lower)) return 'wellness'
  if (/coach|consult|mentor/i.test(lower)) return 'coaching'
  if (/clinic|clínica|medic|doctor|health|salud|doctor/i.test(lower)) return 'health'
  return 'other'
}

function parseServices(input: string): Array<{ name: string; durationMinutes: number; priceCents: number }> {
  const lines = input.split('\n').map(l => l.trim()).filter(Boolean)
  return lines.map(line => {
    const parts = line.split(/[-–—,;]+/).map(s => s.trim())
    const name = parts[0] ?? 'Service'
    let durationMinutes = 30
    let priceCents = 0

    for (const part of parts.slice(1)) {
      const durMatch = part.match(/(\d+)\s*(?:min|minutos?|hours?|hrs?|h)/i)
      if (durMatch) {
        durationMinutes = parseInt(durMatch[1])
        if (/h(?:ours?|rs?)?/i.test(part) && durationMinutes < 10) durationMinutes *= 60
      }
      const priceMatch = part.match(/\$?\s*(\d+(?:\.\d{2})?)/)
      if (priceMatch && !durMatch) {
        priceCents = Math.round(parseFloat(priceMatch[1]) * 100)
      }
    }

    return { name, durationMinutes, priceCents }
  })
}

function parseAvailability(input: string): Array<{ dayOfWeek: number; startTime: string; endTime: string }> {
  const rules: Array<{ dayOfWeek: number; startTime: string; endTime: string }> = []
  const lower = input.toLowerCase()

  // Map day names to numbers (0=Sunday)
  const dayMap: Record<string, number> = {
    domingo: 0, sunday: 0, sun: 0,
    lunes: 1, monday: 1, mon: 1,
    martes: 2, tuesday: 2, tue: 2,
    miércoles: 3, miercoles: 3, wednesday: 3, wed: 3,
    jueves: 4, thursday: 4, thu: 4,
    viernes: 5, friday: 5, fri: 5,
    sábado: 6, sabado: 6, saturday: 6, sat: 6,
  }

  const segments = lower.split(/[,;]\s*/)

  for (const segment of segments) {
    const trimmed = segment.trim()
    if (!trimmed || /off|cerrado|no\s+trabaj/i.test(trimmed)) continue

    // Find time range
    const timeMatch = trimmed.match(/(\d{1,2}(?::\d{2})?\s*(?:a\.?m\.?|p\.?m\.?|am|pm)?)\s*(?:[-–a]\s*(\d{1,2}(?::\d{2})?\s*(?:a\.?m\.?|p\.?m\.?|am|pm)?))/i)
    if (!timeMatch) continue

    const startTime = normalizeTime(timeMatch[1])
    const endTime = normalizeTime(timeMatch[2])
    if (!startTime || !endTime) continue

    // Find days
    const days: number[] = []

    // Check for day ranges like "lunes a viernes" or "monday-friday"
    const rangeMatch = trimmed.match(/(lunes|monday|martes|tuesday|miércoles|miercoles|wednesday|jueves|thursday|viernes|friday|sábado|sabado|saturday|domingo|sunday)\s*(?:[-–a]\s*|to\s*)(viernes|friday|sábado|sabado|saturday|domingo|sunday)/i)
    if (rangeMatch) {
      const startDay = dayMap[rangeMatch[1].toLowerCase()] ?? 1
      const endDay = dayMap[rangeMatch[2].toLowerCase()] ?? 5
      for (let d = startDay; d <= endDay; d++) days.push(d)
    }

    // Check for specific days like "sábados"
    const singleDayMatch = trimmed.match(/(lunes|monday|martes|tuesday|miércoles|miercoles|wednesday|jueves|thursday|viernes|friday|sábado|sabado|saturday|domingo|sunday)s?/i)
    if (days.length === 0 && singleDayMatch) {
      const d = dayMap[singleDayMatch[1].toLowerCase()]
      if (d !== undefined) days.push(d)
    }

    // Default to weekdays if no days found
    if (days.length === 0) days.push(1, 2, 3, 4, 5)

    for (const d of days) {
      rules.push({ dayOfWeek: d, startTime, endTime })
    }
  }

  return rules.length > 0 ? rules : [
    { dayOfWeek: 1, startTime: '09:00', endTime: '18:00' },
  ]
}

function normalizeTime(input: string): string | null {
  const match = input.trim().match(/(\d{1,2})(?::(\d{2}))?\s*(a\.?m\.?|p\.?m\.?|am|pm)?/i)
  if (!match) return null

  let hour = parseInt(match[1])
  const min = parseInt(match[2] ?? '0')
  const period = match[3]?.toLowerCase()

  if (period?.startsWith('p') && hour !== 12) hour += 12
  else if (period?.startsWith('a') && hour === 12) hour = 0
  else if (!period && hour < 8) hour += 12 // Assume PM for single-digit hours without period

  return `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`
}

function parseReceptionistConfig(input: string): { name: string; tone: 'professional' | 'warm' | 'friendly' | 'elegant' | 'casual' } {
  let name = 'Noa'
  let tone: 'professional' | 'warm' | 'friendly' | 'elegant' | 'casual' = 'professional'

  // Extract name
  const namePatterns = [
    /(?:llamar?\s*(?:se\s+)?|nombre\s+(?:es\s+)?|name(?:d|s)?\s+(?:it\s+)?(?:')?|sea\s+(?:')?)(\w+)/i,
    /(?:called|nombre|name)\s+(?:is\s+)?['"]?(\w+)/i,
  ]
  for (const pattern of namePatterns) {
    const match = input.match(pattern)
    if (match) { name = match[1]; break }
  }

  // Extract tone
  if (/profesional|professional/i.test(input)) tone = 'professional'
  else if (/c[aá]lid[oa]|warm/i.test(input)) tone = 'warm'
  else if (/amigable|friendly|casual/i.test(input)) tone = 'friendly'
  else if (/elegante|elegant/i.test(input)) tone = 'elegant'
  else if (/casual|informal/i.test(input)) tone = 'casual'

  // Capitalize first letter of name
  name = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()

  return { name, tone }
}
