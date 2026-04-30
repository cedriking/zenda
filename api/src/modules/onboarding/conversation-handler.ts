import { db } from '@zenda/db/client'
import { workspaces } from '@zenda/db/schema'
import { eq } from 'drizzle-orm'
import { runAgent } from '../ai/agent.js'
import type { OnboardingStep } from '@zenda/shared'

interface OnboardingQuestion {
  step: OnboardingStep
  questionEn: string
  questionEs: string
  field: string
}

const ONBOARDING_QUESTIONS: Record<string, OnboardingQuestion> = {
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
  // Handle plan_selection step without AI agent
  if (step === 'plan_selection') {
    const normalized = response.toLowerCase().trim()
    const validTiers = ['starter', 'pro', 'business']

    // Map common responses to tier names
    const tierMap: Record<string, string> = {
      starter: 'starter',
      pro: 'pro',
      business: 'business',
      skip: 'starter',
      free: 'starter',
      trial: 'starter',
      'skip for now': 'starter',
      '1': 'starter',
      '2': 'pro',
      '3': 'business',
    }

    const tier = tierMap[normalized] ?? (validTiers.includes(normalized) ? normalized : 'starter')

    // Advance the onboarding step
    const { advanceOnboarding } = await import('./flow.js')
    const nextStep = await advanceOnboarding(workspaceId, step as OnboardingStep)

    const ackMessages: Record<string, Record<string, string>> = {
      starter: {
        en: "You're all set with the Starter plan! You can upgrade anytime from your dashboard.",
        es: '¡Todo listo con el plan Starter! Puedes mejorar tu plan en cualquier momento desde tu panel.',
      },
      pro: {
        en: "Great choice! You've selected the Pro plan. Redirecting you to complete setup...",
        es: '¡Excelente elección! Has seleccionado el plan Pro. Redirigiendo para completar la configuración...',
      },
      business: {
        en: "Excellent! You've selected the Business plan. Redirecting you to complete setup...",
        es: '¡Excelente! Has seleccionado el plan Business. Redirigiendo para completar la configuración...',
      },
    }

    const ack = ackMessages[tier]?.[language] ?? ackMessages.starter[language]

    return {
      acknowledged: ack,
      nextStep,
      selectedTier: tier,
    } as any
  }

  // Use the AI agent with a special onboarding context to parse the response
  const prompt = `The business owner is setting up their account. Current step: "${step}". They said: "${response}". Acknowledge their response briefly (1-2 sentences) and confirm the information. Language: ${language}.`

  const result = await runAgent(workspaceId, 'onboarding', 'system', prompt, language)

  // Advance the onboarding step
  const { advanceOnboarding } = await import('./flow.js')
  const nextStep = await advanceOnboarding(workspaceId, step as OnboardingStep)

  return {
    acknowledged: result?.text ?? (language === 'en' ? 'Got it!' : '¡Entendido!'),
    nextStep,
  }
}
