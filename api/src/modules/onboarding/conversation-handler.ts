import { db } from "@zenda/db/client";
import type { OnboardingStep } from "@zenda/shared";

const RE_SPANISH_CHARS = /[áéíóúñ¿¡]/;
const RE_DENTAL = /dental|dentist|teeth/i;
const RE_BEAUTY = /beauty|salon|hair|nail|esthet|peluquer/i;
const RE_FITNESS = /fitness|gym|gimnasio|deporte|sport/i;
const RE_WELLNESS = /wellness|spa|massage|masaje|relaj/i;
const RE_COACHING = /coach|consult|mentor/i;
const RE_CLINIC = /clinic|clínica|medic|doctor|health|salud/i;
const RE_SERVICE_SPLIT = /\n|(?:(?:^|\s)\d+[.)]\s+)/;
const RE_BULLET_STRIP = /^\s*[-•*]\s*/;
const RE_PART_SPLIT = /\s*[-–—,;\t]+\s*|\s+for\s+/i;
const RE_DURATION = /(\d+)\s*(?:min(?:utos?)?|hours?|hrs?|h(?:oras?)?)/i;
const RE_HOUR_CHECK = /h(?:ours?|rs?|oras?)?/i;
const RE_PRICE =
  /\$?\s*(\d+(?:\.\d{1,2})?)\s*(?:dollars?|dólares?|usd|cad|mxn|euros?)?/i;
const RE_AVAIL_SPLIT = /[,;]\s*/;
const RE_CLOSED = /off|cerrado|no\s+trabaj/i;
const RE_TIME_RANGE =
  /(\d{1,2}(?::\d{2})?\s*(?:a\.?m\.?|p\.?m\.?|am|pm)?)\s*(?:[-–a]\s*(\d{1,2}(?::\d{2})?\s*(?:a\.?m\.?|p\.?m\.?|am|pm)?))/i;
const RE_DAY_RANGE =
  /(lunes|monday|martes|tuesday|miércoles|miercoles|wednesday|jueves|thursday|viernes|friday|sábado|sabado|saturday|domingo|sunday)\s*(?:[-–a]\s*|to\s*)(viernes|friday|sábado|sabado|saturday|domingo|sunday)/i;
const RE_SINGLE_DAY =
  /(lunes|monday|martes|tuesday|miércoles|miercoles|wednesday|jueves|thursday|viernes|friday|sábado|sabado|saturday|domingo|sunday)s?/i;
const RE_NORMALIZE_TIME =
  /(\d{1,2})(?::(\d{2}))?\s*(a\.?m\.?|p\.?m\.?|am|pm)?/i;
const RE_NAME_CALL =
  /(?:call\s+(?:her|him|it|the\s+receptionist)\s+|ll[aá]m(?:alo|ala|ar\s+(?:la\s+)?)\s+|n[oó]mbr(?:alo|ala)\s+|name\s+(?:her|him|it|the\s+receptionist)\s+)(['"]?\w+['"]?)/i;
const RE_NAME_IS =
  /(?:name(?:'s| is)?\s+|nombre\s+(?:es\s+)?|llama\s+(?:se\s+)?|called\s+|sea\s+)(['"]?\w+['"]?)/i;
const RE_NAME_SU = /(?:her|his|its|su)\s+nombre\s+(?:es\s+)?(['"]?\w+['"]?)/i;
const RE_NAME_QUOTED = /['"](\w+)['"]/;
const RE_TONE_WORDS =
  /^(professional|profesional|warm|c[aá]lid|friendly|amigable|elegant|elegante|casual|informal|tone|tono|and|y|the|la|el|with|con|prefer|preferido|prefiero)$/i;
const RE_SPLIT_WORDS = /\s+/;
const RE_STRIP_PUNCT = /[.,!?;:'"]/g;
const RE_QUOTE_STRIP = /['"]/g;
const RE_TONE_PROFESSIONAL = /profesional|professional/i;
const RE_TONE_WARM = /c[aá]lid[oa]|warm/i;
const RE_TONE_FRIENDLY = /amigable|friendly/i;
const RE_TONE_ELEGANT = /elegante|elegant/i;
const RE_TONE_CASUAL = /casual|informal/i;

interface OnboardingQuestion {
  field: string;
  questionEn: string;
  questionEs: string;
  step: OnboardingStep;
}

const ONBOARDING_QUESTIONS: Record<string, OnboardingQuestion> = {
  not_started: {
    step: "not_started",
    questionEn: "",
    questionEs: "",
    field: "_skip",
  },
  whatsapp_connected: {
    step: "whatsapp_connected",
    questionEn: "",
    questionEs: "",
    field: "_skip",
  },
  business_info: {
    step: "business_info",
    questionEn:
      "What type of business do you have? (e.g., beauty salon, dental clinic, fitness studio)",
    questionEs:
      "¿Qué tipo de negocio tienes? (ej., salón de belleza, clínica dental, estudio de fitness)",
    field: "category",
  },
  services: {
    step: "services",
    questionEn:
      "What services do you offer? Please list them with approximate duration and price, one per line. Example: Haircut - 30min - $25",
    questionEs:
      "¿Qué servicios ofreces? Lista con duración y precio aproximado, uno por línea. Ejemplo: Corte de cabello - 30min - $25",
    field: "services",
  },
  availability: {
    step: "availability",
    questionEn:
      "What are your business hours? Example: Monday-Friday 9am-6pm, Saturday 10am-2pm",
    questionEs:
      "¿Cuáles son tus horarios? Ejemplo: Lunes-Viernes 9am-6pm, Sábado 10am-2pm",
    field: "availability",
  },
  policies: {
    step: "policies",
    questionEn:
      'Do you have a cancellation policy? (e.g., "Please cancel at least 2 hours before")',
    questionEs:
      '¿Tienes alguna política de cancelación? (ej., "Por favor cancela al menos 2 horas antes")',
    field: "cancellationPolicy",
  },
  receptionist_config: {
    step: "receptionist_config",
    questionEn:
      "What should your AI receptionist's name be? And what tone do you prefer? (professional, warm, friendly)",
    questionEs:
      "¿Cómo debería llamarse tu recepcionista IA? ¿Y qué tono prefieres? (profesional, cálido, amigable)",
    field: "receptionistConfig",
  },
  test_receptionist: {
    step: "test_receptionist",
    questionEn:
      "Want to test your AI receptionist? Send a message as if you were a customer booking an appointment!",
    questionEs:
      "¿Quieres probar tu recepcionista IA? ¡Envía un mensaje como si fueras un cliente agendando una cita!",
    field: "_test",
  },
  plan_selection: {
    step: "plan_selection",
    questionEn:
      "You're almost done! Choose a plan to activate your AI receptionist. You can start with the Solo plan or pick a higher tier now.",
    questionEs:
      "¡Ya casi terminas! Elige un plan para activar tu recepcionista IA. Puedes comenzar con el plan Solo o elegir un plan superior ahora.",
    field: "planTier",
  },
};

// Step-specific acknowledgment messages
function getAcknowledgment(
  step: string,
  response: string,
  language: "en" | "es"
): string {
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
      en: (r) =>
        `Got it, a ${r.toLowerCase()}. That helps me tailor the experience.`,
      es: (r) =>
        `Perfecto, un ${r.toLowerCase()}. Esto me ayuda a personalizar la experiencia.`,
    },
    services: {
      en: () =>
        "Those services are now saved. Customers will be able to book them!",
      es: () =>
        "Tus servicios quedaron guardados. Tus clientes podrán reservarlos.",
    },
    availability: {
      en: () => "Your schedule is all set!",
      es: () => "¡Tu horario quedó configurado!",
    },
    policies: {
      en: () => "Good policy. I'll make sure to mention that when booking.",
      es: () => "Buena política. Me aseguraré de mencionarlo al agendar citas.",
    },
    receptionist_config: {
      en: (r) => {
        const parsed = parseReceptionistConfig(r);
        return `${parsed.name} is ready to greet your customers!`;
      },
      es: (r) => {
        const parsed = parseReceptionistConfig(r);
        return `¡${parsed.name} está lista para recibir a tus clientes!`;
      },
    },
    test_receptionist: {
      en: () => "Great test! Your AI receptionist handled that well.",
      es: () => "¡Buena prueba! Tu recepcionista IA manejó eso bien.",
    },
    plan_selection: {
      en: () => "You're all set!",
      es: () => "¡Todo listo!",
    },
  };

  const fn = acks[step]?.[language];
  if (fn) {
    return fn(response);
  }
  if (language === "es") {
    return "¡Perfecto!";
  }
  return "Got it!";
}

export async function getNextOnboardingQuestion(
  workspaceId: string,
  language: "en" | "es" = "en"
): Promise<{ question: string; step: string } | null> {
  const ws = await db.workspace.findFirst({
    where: { id: workspaceId },
  });

  if (!ws) {
    return null;
  }

  let currentStep = (ws.onboardingStep as OnboardingStep) ?? "not_started";

  // Auto-advance past steps where business name was already collected at signup
  const skipSteps: OnboardingStep[] = ["not_started", "whatsapp_connected"];
  while (skipSteps.includes(currentStep)) {
    const { advanceOnboarding } = await import("./flow.js");
    currentStep = await advanceOnboarding(workspaceId, currentStep);
  }

  if (currentStep === "ready") {
    return {
      question:
        language === "en"
          ? "You're all set! Your AI receptionist is ready to go."
          : "¡Todo listo! Tu recepcionista IA está lista.",
      step: "ready",
    };
  }

  const questionData = ONBOARDING_QUESTIONS[currentStep];
  if (!questionData) {
    return null;
  }

  return {
    question:
      language === "en" ? questionData.questionEn : questionData.questionEs,
    step: currentStep,
  };
}

export async function processOnboardingResponse(
  workspaceId: string,
  step: string,
  response: string,
  language: "en" | "es" = "en"
): Promise<{ acknowledged: string; nextStep: string }> {
  // Validate non-empty input for data-collecting steps
  const dataSteps = [
    "business_info",
    "services",
    "availability",
    "policies",
    "receptionist_config",
  ];
  if (dataSteps.includes(step) && !response.trim()) {
    const emptyMsg =
      language === "en"
        ? "Please provide an answer before continuing."
        : "Por favor proporciona una respuesta antes de continuar.";
    return { acknowledged: emptyMsg, nextStep: step };
  }

  // Handle plan_selection step
  if (step === "plan_selection") {
    return handlePlanSelection(workspaceId, step, response, language);
  }

  // test_receptionist step — no data to save, just advance
  if (step === "test_receptionist") {
    const { advanceOnboarding } = await import("./flow.js");
    const nextStep = await advanceOnboarding(
      workspaceId,
      step as OnboardingStep
    );
    return {
      acknowledged: getAcknowledgment(step, response, language),
      nextStep,
    };
  }

  // Save onboarding data — if save fails, do NOT advance the step
  await saveStepData(workspaceId, step, response, language);

  // Persist the response in the onboardingResponses JSON blob
  await persistResponse(workspaceId, step, response);

  // Advance the onboarding step
  const { advanceOnboarding } = await import("./flow.js");
  const nextStep = await advanceOnboarding(workspaceId, step as OnboardingStep);

  return {
    acknowledged: getAcknowledgment(step, response, language),
    nextStep,
  };
}

async function handlePlanSelection(
  workspaceId: string,
  step: string,
  response: string,
  language: "en" | "es"
): Promise<{ acknowledged: string; nextStep: string }> {
  const normalized = response.toLowerCase().trim();
  const tierMap: Record<string, string> = {
    "1": "local_solo",
    solo: "local_solo",
    "2": "local_starter",
    starter: "local_starter",
    "3": "local_pro",
    pro: "local_pro",
    "4": "local_business",
    business: "local_business",
    skip: "local_solo",
    free: "local_solo",
    trial: "local_solo",
  };
  const tier = tierMap[normalized] ?? "local_solo";

  // Save the selected plan tier to the workspace
  await db.workspace.update({
    where: { id: workspaceId },
    data: {
      planTier: tier,
      updatedAt: new Date(),
    },
  });

  // Ensure a subscription record exists
  const existingSub = await db.subscription.findFirst({
    where: { workspaceId },
  });
  if (!existingSub) {
    const plan = await db.plan.findFirst({ where: { tier } });
    if (plan) {
      await db.subscription.create({
        data: {
          workspaceId,
          planId: plan.id,
          status: "trialing",
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        },
      });
    }
  }

  const { advanceOnboarding } = await import("./flow.js");
  const nextStep = await advanceOnboarding(workspaceId, step as OnboardingStep);
  const ackMessages: Record<string, Record<string, string>> = {
    local_solo: {
      en: "You're all set with the Solo plan!",
      es: "¡Todo listo con el plan Solo!",
    },
    local_starter: {
      en: "You're all set with the Starter plan!",
      es: "¡Todo listo con el plan Starter!",
    },
    local_pro: {
      en: "Great choice! Pro plan selected.",
      es: "¡Excelente elección! Plan Pro seleccionado.",
    },
    local_business: {
      en: "Excellent! Business plan selected.",
      es: "¡Excelente! Plan Business seleccionado.",
    },
  };
  return {
    acknowledged:
      ackMessages[tier]?.[language] ?? ackMessages.local_solo[language],
    nextStep,
  };
}

async function persistResponse(
  workspaceId: string,
  step: string,
  response: string
): Promise<void> {
  try {
    const ws = await db.workspace.findFirst({
      where: { id: workspaceId },
      select: { onboardingResponses: true },
    });
    const existing = (ws?.onboardingResponses as Record<string, string>) ?? {};
    existing[step] = response;
    await db.workspace.update({
      where: { id: workspaceId },
      data: { onboardingResponses: existing, updatedAt: new Date() },
    });
  } catch {
    // Non-critical — responses are for UX recovery only
  }
}

// Save business name during the initial onboarding steps
async function saveBusinessName(
  workspaceId: string,
  businessName: string
): Promise<void> {
  if (!businessName) {
    return;
  }
  await db.workspace.update({
    where: { id: workspaceId },
    data: { name: businessName, updatedAt: new Date() },
  });
  const existing = await db.businessProfile.findFirst({
    where: { workspaceId },
  });
  if (existing) {
    await db.businessProfile.update({
      where: { id: existing.id },
      data: { name: businessName, updatedAt: new Date() },
    });
  } else {
    await db.businessProfile.create({
      data: { workspaceId, name: businessName },
    });
  }
}

async function saveServices(
  workspaceId: string,
  response: string
): Promise<void> {
  const parsed = parseServices(response);
  if (parsed.length === 0) {
    return;
  }
  await db.services.deleteMany({ where: { workspaceId } });
  for (const svc of parsed) {
    await db.services.create({
      data: {
        workspaceId,
        name: svc.name,
        durationMinutes: svc.durationMinutes,
        priceCents: svc.priceCents,
      },
    });
  }
}

async function saveAvailability(
  workspaceId: string,
  response: string
): Promise<void> {
  const rules = parseAvailability(response);
  if (rules.length === 0) {
    return;
  }
  await db.availabilityRule.deleteMany({ where: { workspaceId } });
  for (const rule of rules) {
    await db.availabilityRule.create({
      data: {
        workspaceId,
        dayOfWeek: rule.dayOfWeek,
        startTime: rule.startTime,
        endTime: rule.endTime,
        available: true,
      },
    });
  }
}

async function savePolicies(
  workspaceId: string,
  response: string
): Promise<void> {
  const policy = response.trim();
  if (!policy) {
    return;
  }
  const existing = await db.businessProfile.findFirst({
    where: { workspaceId },
  });
  if (existing) {
    const hasSpanish = RE_SPANISH_CHARS.test(policy);
    await db.businessProfile.update({
      where: { id: existing.id },
      data: {
        cancellationPolicy: hasSpanish
          ? (existing.cancellationPolicy ?? policy)
          : policy,
        cancellationPolicyEs: hasSpanish
          ? policy
          : (existing.cancellationPolicyEs ?? policy),
        updatedAt: new Date(),
      },
    });
  }
}

async function saveReceptionistConfig(
  workspaceId: string,
  response: string
): Promise<void> {
  const config = parseReceptionistConfig(response);
  const existing = await db.receptionistProfile.findFirst({
    where: { workspaceId },
  });
  if (existing) {
    await db.receptionistProfile.update({
      where: { id: existing.id },
      data: { name: config.name, tone: config.tone, updatedAt: new Date() },
    });
  } else {
    await db.receptionistProfile.create({
      data: { workspaceId, name: config.name, tone: config.tone },
    });
  }
}

// Parse and save onboarding data to the appropriate tables
async function saveStepData(
  workspaceId: string,
  step: string,
  response: string,
  _language: "en" | "es"
): Promise<void> {
  switch (step) {
    case "not_started":
    case "whatsapp_connected": {
      await saveBusinessName(workspaceId, response.trim());
      break;
    }

    case "business_info": {
      const category = mapCategory(response);
      const existing = await db.businessProfile.findFirst({
        where: { workspaceId },
      });
      if (existing) {
        await db.businessProfile.update({
          where: { id: existing.id },
          data: { category, updatedAt: new Date() },
        });
      }
      break;
    }

    case "services": {
      await saveServices(workspaceId, response);
      break;
    }

    case "availability": {
      await saveAvailability(workspaceId, response);
      break;
    }

    case "policies": {
      await savePolicies(workspaceId, response);
      break;
    }

    case "receptionist_config": {
      await saveReceptionistConfig(workspaceId, response);
      break;
    }

    default:
      break;
  }
}

function mapCategory(
  response: string
): "beauty" | "wellness" | "health" | "coaching" | "fitness" | "other" {
  const lower = response.toLowerCase();
  if (RE_DENTAL.test(lower)) {
    return "health";
  }
  if (RE_BEAUTY.test(lower)) {
    return "beauty";
  }
  if (RE_FITNESS.test(lower)) {
    return "fitness";
  }
  if (RE_WELLNESS.test(lower)) {
    return "wellness";
  }
  if (RE_COACHING.test(lower)) {
    return "coaching";
  }
  if (RE_CLINIC.test(lower)) {
    return "health";
  }
  return "other";
}

function parseServices(
  input: string
): Array<{ name: string; durationMinutes: number; priceCents: number }> {
  const lines = input
    .split(RE_SERVICE_SPLIT)
    .map((l) => l.trim().replace(RE_BULLET_STRIP, "").trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return [];
  }

  return lines.map((line) => {
    const parts = line.split(RE_PART_SPLIT).map((s) => s.trim());
    const name = parts[0] ?? "Service";
    let durationMinutes = 30;
    let priceCents = 0;

    for (const part of parts.slice(1)) {
      const durMatch = part.match(RE_DURATION);
      if (durMatch) {
        durationMinutes = Number.parseInt(durMatch[1], 10);
        if (RE_HOUR_CHECK.test(part) && durationMinutes < 10) {
          durationMinutes *= 60;
        }
      }

      const priceMatch = part.match(RE_PRICE);
      if (priceMatch && !durMatch) {
        priceCents = Math.round(Number.parseFloat(priceMatch[1]) * 100);
      }
    }

    return { name, durationMinutes, priceCents };
  });
}

function extractDaysFromSegment(
  trimmed: string,
  dayMap: Record<string, number>
): number[] {
  const days: number[] = [];

  const rangeMatch = trimmed.match(RE_DAY_RANGE);
  if (rangeMatch) {
    const startDay = dayMap[rangeMatch[1].toLowerCase()] ?? 1;
    const endDay = dayMap[rangeMatch[2].toLowerCase()] ?? 5;
    for (let d = startDay; d <= endDay; d++) {
      days.push(d);
    }
  }

  const singleDayMatch = trimmed.match(RE_SINGLE_DAY);
  if (days.length === 0 && singleDayMatch) {
    const d = dayMap[singleDayMatch[1].toLowerCase()];
    if (d !== undefined) {
      days.push(d);
    }
  }

  if (days.length === 0) {
    days.push(1, 2, 3, 4, 5);
  }
  return days;
}

function parseAvailability(
  input: string
): Array<{ dayOfWeek: number; startTime: string; endTime: string }> {
  const rules: Array<{
    dayOfWeek: number;
    startTime: string;
    endTime: string;
  }> = [];
  const lower = input.toLowerCase();

  const dayMap: Record<string, number> = {
    domingo: 0,
    sunday: 0,
    sun: 0,
    lunes: 1,
    monday: 1,
    mon: 1,
    martes: 2,
    tuesday: 2,
    tue: 2,
    miércoles: 3,
    miercoles: 3,
    wednesday: 3,
    wed: 3,
    jueves: 4,
    thursday: 4,
    thu: 4,
    viernes: 5,
    friday: 5,
    fri: 5,
    sábado: 6,
    sabado: 6,
    saturday: 6,
    sat: 6,
  };

  const segments = lower.split(RE_AVAIL_SPLIT);

  for (const segment of segments) {
    const trimmed = segment.trim();
    if (!trimmed || RE_CLOSED.test(trimmed)) {
      continue;
    }

    const timeMatch = trimmed.match(RE_TIME_RANGE);
    if (!timeMatch) {
      continue;
    }

    const startTime = normalizeTime(timeMatch[1]);
    const endTime = normalizeTime(timeMatch[2]);
    if (!(startTime && endTime)) {
      continue;
    }

    const days = extractDaysFromSegment(trimmed, dayMap);
    for (const d of days) {
      rules.push({ dayOfWeek: d, startTime, endTime });
    }
  }

  return rules.length > 0
    ? rules
    : [{ dayOfWeek: 1, startTime: "09:00", endTime: "18:00" }];
}

function normalizeTime(input: string): string | null {
  const match = input.trim().match(RE_NORMALIZE_TIME);
  if (!match) {
    return null;
  }

  let hour = Number.parseInt(match[1], 10);
  const min = Number.parseInt(match[2] ?? "0", 10);
  const period = match[3]?.toLowerCase();

  if (period?.startsWith("p") && hour !== 12) {
    hour += 12;
  } else if (period?.startsWith("a") && hour === 12) {
    hour = 0;
  } else if (!period && hour < 8) {
    hour += 12;
  }

  return `${String(hour).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
}

function parseReceptionistConfig(input: string): {
  name: string;
  tone: "professional" | "warm" | "friendly" | "elegant" | "casual";
} {
  let name = "Noa";
  let tone: "professional" | "warm" | "friendly" | "elegant" | "casual" =
    "professional";

  const namePatterns = [RE_NAME_CALL, RE_NAME_IS, RE_NAME_SU, RE_NAME_QUOTED];
  for (const pattern of namePatterns) {
    const match = input.match(pattern);
    if (match) {
      name = match[1].replace(RE_QUOTE_STRIP, "");
      break;
    }
  }

  if (name === "Noa") {
    const words = input.split(RE_SPLIT_WORDS);
    for (const word of words) {
      const clean = word.replace(RE_STRIP_PUNCT, "");
      if (
        clean.length >= 2 &&
        clean[0] === clean[0].toUpperCase() &&
        !RE_TONE_WORDS.test(clean)
      ) {
        name = clean;
        break;
      }
    }
  }

  if (RE_TONE_PROFESSIONAL.test(input)) {
    tone = "professional";
  } else if (RE_TONE_WARM.test(input)) {
    tone = "warm";
  } else if (RE_TONE_FRIENDLY.test(input)) {
    tone = "friendly";
  } else if (RE_TONE_ELEGANT.test(input)) {
    tone = "elegant";
  } else if (RE_TONE_CASUAL.test(input)) {
    tone = "casual";
  }

  name = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();

  return { name, tone };
}

export async function getOnboardingResponses(
  workspaceId: string
): Promise<Record<string, string>> {
  const ws = await db.workspace.findFirst({
    where: { id: workspaceId },
    select: { onboardingResponses: true },
  });
  return (ws?.onboardingResponses as Record<string, string>) ?? {};
}
