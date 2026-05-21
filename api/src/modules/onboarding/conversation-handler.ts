import { db } from "@zenda/db/client";
import {
  availabilityRules,
  businessProfiles,
  receptionistProfiles,
  services,
  workspaces,
} from "@zenda/db/schema";
import type { OnboardingStep } from "@zenda/shared";
import { eq } from "drizzle-orm";

interface OnboardingQuestion {
  field: string;
  questionEn: string;
  questionEs: string;
  step: OnboardingStep;
}

const ONBOARDING_QUESTIONS: Record<string, OnboardingQuestion> = {
  // 'not_started' and 'whatsapp_connected' are handled as auto-advance steps
  // — business name is already collected during signup, so we skip straight
  // to business_info. See getNextOnboardingQuestion() below.
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
  plan_selection: {
    step: "plan_selection",
    questionEn:
      "You're almost done! Choose a plan to activate your AI receptionist. You can start with a free trial or pick a plan now.",
    questionEs:
      "¡Ya casi terminas! Elige un plan para activar tu recepcionista IA. Puedes comenzar con una prueba gratis o elegir un plan ahora.",
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
    plan_selection: {
      en: () => "You're all set!",
      es: () => "¡Todo listo!",
    },
  };

  const fn = acks[step]?.[language];
  return fn ? fn(response) : language === "en" ? "Got it!" : "¡Perfecto!";
}

export async function getNextOnboardingQuestion(
  workspaceId: string,
  language: "en" | "es" = "en"
): Promise<{ question: string; step: string } | null> {
  const [ws] = await db
    .select()
    .from(workspaces)
    .where(eq(workspaces.id, workspaceId))
    .limit(1);

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
  // Handle plan_selection step
  if (step === "plan_selection") {
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
    const { advanceOnboarding } = await import("./flow.js");
    const nextStep = await advanceOnboarding(
      workspaceId,
      step as OnboardingStep
    );
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

  // Save onboarding data for each step
  try {
    await saveStepData(workspaceId, step, response, language);
  } catch (err) {
    console.error(`[onboarding] Failed to save data for step "${step}":`, err);
    // Still advance the step so the user isn't stuck, but the error is now logged
  }

  // Advance the onboarding step
  const { advanceOnboarding } = await import("./flow.js");
  const nextStep = await advanceOnboarding(workspaceId, step as OnboardingStep);

  return {
    acknowledged: getAcknowledgment(step, response, language),
    nextStep,
  };
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
      const businessName = response.trim();
      // Update workspace name
      await db
        .update(workspaces)
        .set({ name: businessName, updatedAt: new Date() })
        .where(eq(workspaces.id, workspaceId));
      // Upsert business profile
      const [existing] = await db
        .select()
        .from(businessProfiles)
        .where(eq(businessProfiles.workspaceId, workspaceId))
        .limit(1);
      if (existing) {
        await db
          .update(businessProfiles)
          .set({ name: businessName, updatedAt: new Date() })
          .where(eq(businessProfiles.id, existing.id));
      } else {
        await db
          .insert(businessProfiles)
          .values({ workspaceId, name: businessName });
      }
      break;
    }

    case "business_info": {
      const category = mapCategory(response);
      const [existing] = await db
        .select()
        .from(businessProfiles)
        .where(eq(businessProfiles.workspaceId, workspaceId))
        .limit(1);
      if (existing) {
        await db
          .update(businessProfiles)
          .set({ category, updatedAt: new Date() })
          .where(eq(businessProfiles.id, existing.id));
      }
      break;
    }

    case "services": {
      const parsed = parseServices(response);
      for (const svc of parsed) {
        await db.insert(services).values({
          workspaceId,
          name: svc.name,
          durationMinutes: svc.durationMinutes,
          priceCents: svc.priceCents,
        });
      }
      break;
    }

    case "availability": {
      const rules = parseAvailability(response);
      // Delete existing rules before inserting to prevent duplicates
      await db
        .delete(availabilityRules)
        .where(eq(availabilityRules.workspaceId, workspaceId));
      for (const rule of rules) {
        await db.insert(availabilityRules).values({
          workspaceId,
          dayOfWeek: rule.dayOfWeek,
          startTime: rule.startTime,
          endTime: rule.endTime,
          available: true,
        });
      }
      break;
    }

    case "policies": {
      const policy = response.trim();
      const [existing] = await db
        .select()
        .from(businessProfiles)
        .where(eq(businessProfiles.workspaceId, workspaceId))
        .limit(1);
      if (existing) {
        await db
          .update(businessProfiles)
          .set({
            cancellationPolicy: policy,
            cancellationPolicyEs: policy,
            updatedAt: new Date(),
          })
          .where(eq(businessProfiles.id, existing.id));
      }
      break;
    }

    case "receptionist_config": {
      const config = parseReceptionistConfig(response);
      const [existing] = await db
        .select()
        .from(receptionistProfiles)
        .where(eq(receptionistProfiles.workspaceId, workspaceId))
        .limit(1);
      if (existing) {
        await db
          .update(receptionistProfiles)
          .set({
            name: config.name,
            tone: config.tone,
            updatedAt: new Date(),
          })
          .where(eq(receptionistProfiles.id, existing.id));
      } else {
        await db.insert(receptionistProfiles).values({
          workspaceId,
          name: config.name,
          tone: config.tone,
        });
      }
      break;
    }
  }
}

function mapCategory(
  response: string
): "beauty" | "wellness" | "health" | "coaching" | "fitness" | "other" {
  const lower = response.toLowerCase();
  if (/dental|dentist|teeth/i.test(lower)) {
    return "health";
  }
  if (/beauty|salon|hair|nail|esthet|peluquer/i.test(lower)) {
    return "beauty";
  }
  if (/fitness|gym|gimnasio|deporte|sport/i.test(lower)) {
    return "fitness";
  }
  if (/wellness|spa|massage|masaje|relaj/i.test(lower)) {
    return "wellness";
  }
  if (/coach|consult|mentor/i.test(lower)) {
    return "coaching";
  }
  if (/clinic|clínica|medic|doctor|health|salud|doctor/i.test(lower)) {
    return "health";
  }
  return "other";
}

function parseServices(
  input: string
): Array<{ name: string; durationMinutes: number; priceCents: number }> {
  // Split by newline, numbered list markers, or bullet points
  const lines = input
    .split(/\n|(?:(?:^|\s)\d+[.)]\s+)/)
    .map((l) =>
      l
        .trim()
        .replace(/^\s*[-•*]\s*/, "")
        .trim()
    )
    .filter(Boolean);

  return lines.map((line) => {
    // Split by common delimiters: -, –, —, comma, semicolon, tab, or "for"
    const parts = line
      .split(/\s*[-–—,;\t]+\s*|\s+for\s+/i)
      .map((s) => s.trim());
    const name = parts[0] ?? "Service";
    let durationMinutes = 30;
    let priceCents = 0;

    for (const part of parts.slice(1)) {
      // Match duration: "30min", "30 min", "30 minutos", "1 hour", "1h", "1 hr", "1 hora"
      const durMatch = part.match(
        /(\d+)\s*(?:min(?:utos?)?|hours?|hrs?|h(?:oras?)?)/i
      );
      if (durMatch) {
        durationMinutes = Number.parseInt(durMatch[1], 10);
        if (/h(?:ours?|rs?|oras?)?/i.test(part) && durationMinutes < 10) {
          durationMinutes *= 60;
        }
      }

      // Match price: "$25", "25 dollars", "25 dólares", "$25.00", "25 usd", "$25 CAD"
      const priceMatch = part.match(
        /\$?\s*(\d+(?:\.\d{1,2})?)\s*(?:dollars?|dólares?|usd|cad|mxn|euros?)?/i
      );
      if (priceMatch && !durMatch) {
        priceCents = Math.round(Number.parseFloat(priceMatch[1]) * 100);
      }
    }

    return { name, durationMinutes, priceCents };
  });
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

  // Map day names to numbers (0=Sunday)
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

  const segments = lower.split(/[,;]\s*/);

  for (const segment of segments) {
    const trimmed = segment.trim();
    if (!trimmed || /off|cerrado|no\s+trabaj/i.test(trimmed)) {
      continue;
    }

    // Find time range
    const timeMatch = trimmed.match(
      /(\d{1,2}(?::\d{2})?\s*(?:a\.?m\.?|p\.?m\.?|am|pm)?)\s*(?:[-–a]\s*(\d{1,2}(?::\d{2})?\s*(?:a\.?m\.?|p\.?m\.?|am|pm)?))/i
    );
    if (!timeMatch) {
      continue;
    }

    const startTime = normalizeTime(timeMatch[1]);
    const endTime = normalizeTime(timeMatch[2]);
    if (!(startTime && endTime)) {
      continue;
    }

    // Find days
    const days: number[] = [];

    // Check for day ranges like "lunes a viernes" or "monday-friday"
    const rangeMatch = trimmed.match(
      /(lunes|monday|martes|tuesday|miércoles|miercoles|wednesday|jueves|thursday|viernes|friday|sábado|sabado|saturday|domingo|sunday)\s*(?:[-–a]\s*|to\s*)(viernes|friday|sábado|sabado|saturday|domingo|sunday)/i
    );
    if (rangeMatch) {
      const startDay = dayMap[rangeMatch[1].toLowerCase()] ?? 1;
      const endDay = dayMap[rangeMatch[2].toLowerCase()] ?? 5;
      for (let d = startDay; d <= endDay; d++) {
        days.push(d);
      }
    }

    // Check for specific days like "sábados"
    const singleDayMatch = trimmed.match(
      /(lunes|monday|martes|tuesday|miércoles|miercoles|wednesday|jueves|thursday|viernes|friday|sábado|sabado|saturday|domingo|sunday)s?/i
    );
    if (days.length === 0 && singleDayMatch) {
      const d = dayMap[singleDayMatch[1].toLowerCase()];
      if (d !== undefined) {
        days.push(d);
      }
    }

    // Default to weekdays if no days found
    if (days.length === 0) {
      days.push(1, 2, 3, 4, 5);
    }

    for (const d of days) {
      rules.push({ dayOfWeek: d, startTime, endTime });
    }
  }

  return rules.length > 0
    ? rules
    : [{ dayOfWeek: 1, startTime: "09:00", endTime: "18:00" }];
}

function normalizeTime(input: string): string | null {
  const match = input
    .trim()
    .match(/(\d{1,2})(?::(\d{2}))?\s*(a\.?m\.?|p\.?m\.?|am|pm)?/i);
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
    hour += 12; // Assume PM for single-digit hours without period
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

  // Extract name — try multiple patterns in order of specificity
  const namePatterns = [
    // "call her/him/it X", "llámalo/se X", "name it X", "nómbrala X"
    /(?:call\s+(?:her|him|it|the\s+receptionist)\s+|ll[aá]m(?:alo|ala|ar\s+(?:la\s+)?)\s+|n[oó]mbr(?:alo|ala)\s+|name\s+(?:her|him|it|the\s+receptionist)\s+)(['"]?\w+['"]?)/i,
    // "name is X", "nombre es X", "called X", "se llama X"
    /(?:name(?:'s| is)?\s+|nombre\s+(?:es\s+)?|llama\s+(?:se\s+)?|called\s+|sea\s+)(['"]?\w+['"]?)/i,
    // "her/his name is X"
    /(?:her|his|its|su)\s+nombre\s+(?:es\s+)?(['"]?\w+['"]?)/i,
    // Match quoted name
    /['"](\w+)['"]/,
  ];
  for (const pattern of namePatterns) {
    const match = input.match(pattern);
    if (match) {
      name = match[1].replace(/['"]/g, "");
      break;
    }
  }

  // If no pattern matched, try to extract a proper name (capitalized word not matching common tone words)
  if (name === "Noa") {
    const toneWords =
      /^(professional|profesional|warm|c[aá]lid|friendly|amigable|elegant|elegante|casual|informal|tone|tono|and|y|the|la|el|with|con|prefer|preferido|prefiero)$/i;
    const words = input.split(/\s+/);
    for (const word of words) {
      const clean = word.replace(/[.,!?;:'"]/g, "");
      if (
        clean.length >= 2 &&
        clean[0] === clean[0].toUpperCase() &&
        !toneWords.test(clean)
      ) {
        name = clean;
        break;
      }
    }
  }

  // Extract tone
  if (/profesional|professional/i.test(input)) {
    tone = "professional";
  } else if (/c[aá]lid[oa]|warm/i.test(input)) {
    tone = "warm";
  } else if (/amigable|friendly/i.test(input)) {
    tone = "friendly";
  } else if (/elegante|elegant/i.test(input)) {
    tone = "elegant";
  } else if (/casual|informal/i.test(input)) {
    tone = "casual";
  }

  // Capitalize first letter of name
  name = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();

  return { name, tone };
}
