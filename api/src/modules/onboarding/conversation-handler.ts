import { db } from "@zenda/db/client";
import type { OnboardingStep } from "@zenda/shared";
import { PERSONALITY_PRESETS } from "@zenda/shared/personality/presets";

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
const RE_ACCENTED = String.raw`[\wáéíóúñÁÉÍÓÚÑüÜ]`;
const RE_NAME_CALL = new RegExp(
  `(?:call\\s+(?:her|him|it|the\\s+receptionist)\\s+|ll[aá]m(?:alo|ala|ar\\s+(?:la\\s+)?)\\s+|n[oó]mbr(?:alo|ala)\\s+|name\\s+(?:her|him|it|the\\s+receptionist)\\s+)['"]?(${RE_ACCENTED}+)['"]?`,
  "i"
);
const RE_NAME_IS = new RegExp(
  `(?:name(?:'s| is)?\\s+|nombre\\s+(?:es\\s+)?|llama\\s+(?:se\\s+)?|called\\s+|sea\\s+)['"]?(${RE_ACCENTED}+)['"]?`,
  "i"
);
const RE_NAME_SU = new RegExp(
  `(?:her|his|its|su)\\s+nombre\\s+(?:es\\s+)?['"]?(${RE_ACCENTED}+)['"]?`,
  "i"
);
const RE_NAME_QUOTED = new RegExp(`['"](${RE_ACCENTED}+)['"]`, "i");
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
      "What type of business do you have? (e.g., beauty salon, dental clinic, fitness studio, law firm, photography studio)",
    questionEs:
      "¿Qué tipo de negocio tienes? (ej., salón de belleza, clínica dental, estudio de fitness, bufete de abogados, estudio fotográfico)",
    field: "category",
  },
  services: {
    step: "services",
    questionEn:
      "What services do you offer? List them with duration and price, one per line.\nExample: Haircut - 30min - $25",
    questionEs:
      "¿Qué servicios ofreces? Lista con duración y precio, uno por línea.\nEjemplo: Corte de cabello - 30min - $25",
    field: "services",
  },
  availability: {
    step: "availability",
    questionEn:
      "What are your business hours?\nExample: Monday-Friday 9am-6pm, Saturday 10am-2pm, Sunday closed",
    questionEs:
      "¿Cuáles son tus horarios?\nEjemplo: Lunes-Viernes 9am-6pm, Sábado 10am-2pm, Domingo cerrado",
    field: "availability",
  },
  policies: {
    step: "policies",
    questionEn:
      'What\'s your cancellation policy? (e.g., "Please cancel at least 24 hours before the appointment")',
    questionEs:
      '¿Cuál es tu política de cancelación? (ej., "Por favor cancela al menos 24 horas antes de la cita")',
    field: "cancellationPolicy",
  },
  safety: {
    step: "safety",
    questionEn:
      "Are there topics your receptionist should NOT handle and instead escalate to you?\nExamples: medical advice, pricing disputes, legal questions.\nType 'none' to skip, or list topics separated by commas.",
    questionEs:
      "¿Hay temas que tu recepcionista NO deba manejar y deba escalar contigo?\nEjemplos: consejos médicos, disputas de precios, consultas legales.\nEscribe 'ninguno' para saltar, o lista los temas separados por comas.",
    field: "sensitiveTopics",
  },
  receptionist_config: {
    step: "receptionist_config",
    questionEn:
      "What should your AI receptionist's name be? And what tone do you prefer? (professional, warm, friendly, elegant, casual)\nExample: Sofia, warm and friendly",
    questionEs:
      "¿Cómo debería llamarse tu recepcionista IA? ¿Y qué tono prefieres? (profesional, cálido, amigable, elegante, casual)\nEjemplo: Sofía, cálida y amigable",
    field: "receptionistConfig",
  },
  review: {
    step: "review",
    questionEn:
      "Take a moment to review your setup. If everything looks good, type 'looks good' or 'yes' to continue. You can also go back to change anything.",
    questionEs:
      "Tómate un momento para revisar tu configuración. Si todo está bien, escribe 'está bien' o 'sí' para continuar. También puedes regresar para cambiar algo.",
    field: "_review",
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
      en: (r) => {
        const category = mapCategory(r);
        const hints = getCategoryHints(category, "en");
        const hint = hints ? `\n\n💡 _Tip: ${hints}_` : "";
        return `Got it, a **${r.toLowerCase()}**! That helps me tailor the experience for your customers.${hint}`;
      },
      es: (r) => {
        const category = mapCategory(r);
        const hints = getCategoryHints(category, "es");
        const hint = hints ? `\n\n💡 _Consejo: ${hints}_` : "";
        return `¡Perfecto, un **${r.toLowerCase()}**! Esto me ayuda a personalizar la experiencia para tus clientes.${hint}`;
      },
    },
    services: {
      en: (r) => {
        const parsed = parseServices(r);
        if (parsed.length > 0) {
          const svcList = parsed
            .map(
              (s) =>
                `• ${s.name} (${s.durationMinutes}min, $${(s.priceCents / 100).toFixed(0)})`
            )
            .join("\n");
          return `I've saved these services:\n${svcList}\n\nCustomers will be able to book any of these!`;
        }
        return "Those services are now saved. Customers will be able to book them!";
      },
      es: (r) => {
        const parsed = parseServices(r);
        if (parsed.length > 0) {
          const svcList = parsed
            .map(
              (s) =>
                `• ${s.name} (${s.durationMinutes}min, $${(s.priceCents / 100).toFixed(0)})`
            )
            .join("\n");
          return `He guardado estos servicios:\n${svcList}\n\n¡Tus clientes podrán reservar cualquiera de ellos!`;
        }
        return "Tus servicios quedaron guardados. Tus clientes podrán reservarlos.";
      },
    },
    availability: {
      en: () => "Your schedule is all set! I'll use these hours for booking.",
      es: () =>
        "¡Tu horario quedó configurado! Usaré estos horarios para las reservas.",
    },
    policies: {
      en: () =>
        "Good policy. I'll make sure customers know about it when booking.",
      es: () =>
        "Buena política. Me aseguraré que los clientes lo sepan al agendar.",
    },
    safety: {
      en: (r) => {
        const lower = r.toLowerCase().trim();
        if (lower === "none" || lower === "n/a" || lower === "no") {
          return "No problem! Your receptionist will handle all topics. You can always add restrictions later in Settings.";
        }
        return "Got it! Your receptionist will escalate those topics to you and won't try to answer them directly.";
      },
      es: (r) => {
        const lower = r.toLowerCase().trim();
        if (
          lower === "ninguno" ||
          lower === "ninguna" ||
          lower === "no" ||
          lower === "n/a"
        ) {
          return "¡No hay problema! Tu recepcionista manejará todos los temas. Siempre puedes agregar restricciones después en Configuración.";
        }
        return "¡Entendido! Tu recepcionista escalará esos temas contigo y no intentará responderlos directamente.";
      },
    },
    receptionist_config: {
      en: (r) => {
        const parsed = parseReceptionistConfig(r);
        const presetLabel: Record<string, string> = {
          professional: "professional",
          warm: "warm",
          friendly: "friendly",
          elegant: "elegant",
          casual: "casual",
        };
        return `**${parsed.name}** is ready! With a ${presetLabel[parsed.tone] ?? parsed.tone} tone, your receptionist will greet customers like this:\n\n> _"${getGreetingPreview(parsed.name, parsed.tone, "en")}"_\n\nYour customers are going to love this!`;
      },
      es: (r) => {
        const parsed = parseReceptionistConfig(r);
        const presetLabel: Record<string, string> = {
          professional: "profesional",
          warm: "cálido",
          friendly: "amigable",
          elegant: "elegante",
          casual: "casual",
        };
        return `¡**${parsed.name}** está lista! Con un tono ${presetLabel[parsed.tone] ?? parsed.tone}, tu recepcionista saludará así:\n\n> _"${getGreetingPreview(parsed.name, parsed.tone, "es")}"_\n\n¡A tus clientes les va a encantar!`;
      },
    },
    review: {
      en: () => "Looks great! Let's test your receptionist.",
      es: () => "¡Se ve bien! Vamos a probar tu recepcionista.",
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

function getGreetingPreview(
  name: string,
  tone: string,
  language: "en" | "es"
): string {
  const greetings: Record<string, Record<"en" | "es", string>> = {
    professional: {
      en: `Hello, I am ${name}. How may I assist you today?`,
      es: `Hola, soy ${name}. ¿En qué puedo asistirle hoy?`,
    },
    warm: {
      en: `Hi there! I'm ${name}. I'd love to help you!`,
      es: `¡Hola! Soy ${name}. ¡Me encantaría ayudarte!`,
    },
    friendly: {
      en: `Hey! I'm ${name}. How can I help you out?`,
      es: `¡Hola! Soy ${name}. ¿Cómo te puedo ayudar?`,
    },
    elegant: {
      en: `Good day. I am ${name}. It's a pleasure to assist you.`,
      es: `Buen día. Soy ${name}. Es un placer asistirle.`,
    },
    casual: {
      en: `Hi, I'm ${name}. What do you need?`,
      es: `Hola, soy ${name}. ¿Qué necesitas?`,
    },
  };
  return greetings[tone]?.[language] ?? greetings.professional[language];
}

function getCategoryHints(
  category: string,
  language: "en" | "es"
): string | null {
  const hints: Record<string, Record<"en" | "es", string>> = {
    beauty: {
      en: "Popular services include: Haircut, Blowout, Manicure, Pedicure, Color Treatment",
      es: "Servicios populares: Corte de cabello, Secado, Manicure, Pedicura, Tinte",
    },
    health: {
      en: "Consider setting stricter cancellation policies and adding emergency instructions",
      es: "Considera políticas de cancelación más estrictas e instrucciones de emergencia",
    },
    fitness: {
      en: "Common services: Personal Training, Group Class, Yoga, CrossFit Session",
      es: "Servicios comunes: Entrenamiento personal, Clase grupal, Yoga, CrossFit",
    },
    wellness: {
      en: "Popular services: Massage, Facial, Spa Package, Aromatherapy",
      es: "Servicios populares: Masaje, Facial, Paquete spa, Aromaterapia",
    },
    coaching: {
      en: "Consider offering: Initial Consultation, Follow-up Session, Package Deals",
      es: "Considera ofrecer: Consulta inicial, Sesión de seguimiento, Paquetes",
    },
  };
  return hints[category]?.[language] ?? null;
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

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: large step-dispatch function
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
    "safety",
    "receptionist_config",
    "review",
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

  // review step — seed knowledge base, suggest staff, and advance
  if (step === "review") {
    // Seed knowledge base with category-specific FAQs in background
    seedKnowledgeBase(workspaceId).catch(() => {
      // Non-blocking — don't fail onboarding if KB seeding fails
    });

    let staffHint = "";
    try {
      const serviceCount = await db.service.count({ where: { workspaceId } });
      if (serviceCount > 3) {
        staffHint =
          language === "es"
            ? "\n\n💡 Con varios servicios, puedes agregar miembros del equipo en Configuración para que los clientes elijan con quién quieren su cita."
            : "\n\n💡 With multiple services, you can add staff members in Settings so customers can choose who they see.";
      }
    } catch {
      // Non-critical
    }

    const { advanceOnboarding } = await import("./flow.js");
    const nextStep = await advanceOnboarding(
      workspaceId,
      step as OnboardingStep
    );
    return {
      acknowledged: getAcknowledgment(step, response, language) + staffHint,
      nextStep,
    };
  }

  // test_receptionist step — route through real AI pipeline
  if (step === "test_receptionist") {
    let aiResponse: string;
    try {
      const { processIncomingMessage } = await import(
        "../conversation/engine.js"
      );

      // Capture the AI reply by intercepting the sender
      let capturedReply = "";
      const testSender = {
        send(_workspaceId: string, data: unknown): boolean {
          if (typeof data === "object" && data !== null) {
            capturedReply = String(
              (data as Record<string, unknown>).body ?? capturedReply
            );
          }
          return true;
        },
        isConnected: () => true,
      };

      await processIncomingMessage(
        workspaceId,
        {
          phoneNumber: "test_customer",
          body: response,
          contentType: "text",
          externalMessageId: `test_${Date.now()}`,
          timestamp: new Date().toISOString(),
        },
        testSender
      );

      aiResponse =
        capturedReply ||
        (language === "es"
          ? "¡Gracias por la prueba! Tu recepcionista IA está lista para atender a tus clientes."
          : "Thanks for testing! Your AI receptionist is ready to help your customers.");
    } catch {
      aiResponse =
        language === "es"
          ? "¡Gracias por la prueba! Tu recepcionista IA está lista para atender a tus clientes."
          : "Thanks for testing! Your AI receptionist is ready to help your customers.";
    }

    const { advanceOnboarding } = await import("./flow.js");
    const nextStep = await advanceOnboarding(
      workspaceId,
      step as OnboardingStep
    );
    return {
      acknowledged: aiResponse,
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

  // Try exact match first, then keyword search in sentence context
  let tier = tierMap[normalized];
  if (!tier) {
    const keywordMap: [RegExp, string][] = [
      [/\b(business|empresa|negocio|plan\s*4)\b/i, "local_business"],
      [/\b(pro|professional|profesional|plan\s*3)\b/i, "local_pro"],
      [/\b(starter|inicial|b[aá]sico|plan\s*2)\b/i, "local_starter"],
      [
        /\b(solo|free|gratis|trial|skip|saltar|omitir|plan\s*1)\b/i,
        "local_solo",
      ],
    ];
    for (const [re, t] of keywordMap) {
      if (re.test(normalized)) {
        tier = t;
        break;
      }
    }
  }
  if (!tier) {
    // Can't determine intent — ask again instead of defaulting
    return {
      acknowledged:
        language === "es"
          ? "No entendí tu elección. ¿Qué plan preferís? (Solo, Starter, Pro o Business)"
          : "I didn't catch that. Which plan would you like? (Solo, Starter, Pro, or Business)",
      nextStep: step, // stay on same step
    };
  }

  // Save the selected plan tier to the subscription
  const existingSub = await db.subscription.findFirst({
    where: { workspaceId },
  });
  if (existingSub) {
    await db.subscription.update({
      where: { id: existingSub.id },
      data: {
        planTier: tier as
          | "free"
          | "local_solo"
          | "local_starter"
          | "local_pro"
          | "local_business",
        updatedAt: new Date(),
      },
    });
  } else {
    await db.subscription.create({
      data: {
        workspaceId,
        planTier: tier as
          | "free"
          | "local_solo"
          | "local_starter"
          | "local_pro"
          | "local_business",
        status: "trialing",
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      },
    });
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
  await db.service.deleteMany({ where: { workspaceId } });
  for (const svc of parsed) {
    await db.service.create({
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

  // Detect timezone from the response text
  const tz = detectTimezone(response);
  if (tz) {
    await db.workspace.update({
      where: { id: workspaceId },
      data: { timezone: tz, updatedAt: new Date() },
    });
  }
}

const TIMEZONE_MAP: Record<string, string> = {
  "mexico city": "America/Mexico_City",
  "ciudad de mexico": "America/Mexico_City",
  cdmx: "America/Mexico_City",
  monterrey: "America/Monterrey",
  guadalajara: "America/Mexico_City",
  cancun: "America/Cancun",
  "buenos aires": "America/Argentina/Buenos_Aires",
  argentina: "America/Argentina/Buenos_Aires",
  bogota: "America/Bogota",
  colombia: "America/Bogota",
  santiago: "America/Santiago",
  chile: "America/Santiago",
  lima: "America/Lima",
  peru: "America/Lima",
  "sao paulo": "America/Sao_Paulo",
  "new york": "America/New_York",
  chicago: "America/Chicago",
  denver: "America/Denver",
  "los angeles": "America/Los_Angeles",
  london: "Europe/London",
  madrid: "Europe/Madrid",
  españa: "Europe/Madrid",
  barcelona: "Europe/Madrid",
  utc: "UTC",
  gmt: "UTC",
  est: "America/New_York",
  cst: "America/Chicago",
  mst: "America/Denver",
  pst: "America/Los_Angeles",
  et: "America/New_York",
  ct: "America/Chicago",
  mt: "America/Denver",
  pt: "America/Los_Angeles",
};

function detectTimezone(text: string): string | null {
  const lower = text.toLowerCase();

  // Check for IANA timezone directly (e.g., "America/Mexico_City")
  const ianaMatch = lower.match(
    /(america\/\w+|europe\/\w+|asia\/\w+|utc|gmt)/i
  );
  if (ianaMatch) {
    return ianaMatch[1];
  }

  // Check city/country names
  for (const [key, tz] of Object.entries(TIMEZONE_MAP)) {
    if (lower.includes(key)) {
      return tz;
    }
  }

  return null;
}

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: multi-field policy save function
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

    // Auto-detect cancellation window hours from the policy text
    const hoursMatch =
      policy.match(
        /(\d+)\s*(?:hours?|horas?|hrs?|h)\s+(?:before|antes|notice|anticipaci[oó]n)/i
      ) ??
      policy.match(
        /(?:at least|m[ií]nimo|al menos)\s+(\d+)\s*(?:hours?|horas?|hrs?|h)/i
      );
    const cancellationWindowHours = hoursMatch
      ? Number.parseInt(hoursMatch[1], 10)
      : 24;

    // Auto-detect strictness from the window
    let strictness: "lenient" | "standard" | "strict" = "lenient";
    if (cancellationWindowHours >= 48) {
      strictness = "strict";
    } else if (cancellationWindowHours >= 24) {
      strictness = "standard";
    }

    // Generate a default refund policy based on cancellation policy
    const refundDefault = hasSpanish
      ? `Reembolsos según política de cancelación: ${cancellationWindowHours} horas de aviso requeridas.`
      : `Refunds per cancellation policy: ${cancellationWindowHours}-hour notice required.`;

    await db.businessProfile.update({
      where: { id: existing.id },
      data: {
        cancellationPolicy: hasSpanish
          ? (existing.cancellationPolicy ?? policy)
          : policy,
        cancellationPolicyEs: hasSpanish
          ? policy
          : (existing.cancellationPolicyEs ?? policy),
        cancellationWindowHours,
        cancellationPolicyStrictness: strictness,
        refundPolicy: existing.refundPolicy ?? refundDefault,
        // Pre-approved cancellation text based on policy
        approvedCancellationText:
          existing.approvedCancellationText ??
          (hasSpanish
            ? `Su cita ha sido cancelada. Recordamos que requerimos ${cancellationWindowHours} horas de aviso.`
            : `Your appointment has been cancelled as requested. We appreciate ${cancellationWindowHours}-hour notice.`),
        approvedRefundText:
          existing.approvedRefundText ??
          (hasSpanish
            ? "Su solicitud de reembolso ha sido procesada. Puede tardar 3-5 días hábiles."
            : "Your refund request has been processed. It may take 3-5 business days."),
        approvedDiscountText:
          existing.approvedDiscountText ??
          (hasSpanish
            ? "Se ha aplicado un descuento a su cita."
            : "A discount has been applied to your appointment."),
        updatedAt: new Date(),
      },
    });
  }
}

async function saveSafetyConfig(
  workspaceId: string,
  response: string
): Promise<void> {
  const lower = response.toLowerCase().trim();
  if (
    lower === "none" ||
    lower === "ninguno" ||
    lower === "ninguna" ||
    lower === "n/a" ||
    lower === "no" ||
    !response.trim()
  ) {
    return;
  }
  const topics = response
    .split(/[,\n]/)
    .map((t) => t.trim())
    .filter(Boolean);
  if (topics.length === 0) {
    return;
  }
  // sensitiveTopics is an Unsupported text[] column — use raw SQL
  const existing = await db.businessProfile.findFirst({
    where: { workspaceId },
  });
  if (existing) {
    await db.$executeRaw`
      UPDATE business_profiles
      SET sensitive_topics = ${topics}::text[], updated_at = NOW()
      WHERE id = ${existing.id}
    `;
  }
}

function toneToPersonalityPreset(
  tone: string
): "professional" | "warm" | "minimal" | "premium" | "friendly" {
  const map: Record<
    string,
    "professional" | "warm" | "minimal" | "premium" | "friendly"
  > = {
    professional: "professional",
    warm: "warm",
    friendly: "friendly",
    elegant: "premium",
    casual: "minimal",
  };
  return map[tone] ?? "professional";
}

async function saveReceptionistConfig(
  workspaceId: string,
  response: string
): Promise<void> {
  const config = parseReceptionistConfig(response);
  const personalityPreset = toneToPersonalityPreset(config.tone);

  // Get preset defaults for sliders and behavior
  const preset = PERSONALITY_PRESETS[personalityPreset];

  // Detect speaks-as-business from response
  const speaksAsBusiness =
    /\b(we|our|nosotros|nuestro|business|empresa)\b/i.test(response);

  // Detect emoji preference from response
  const useEmoji =
    /\b(emoji|casual|friendly|informal)\b/i.test(response) ||
    personalityPreset === "friendly";

  const existing = await db.receptionistProfile.findFirst({
    where: { workspaceId },
  });
  const data = {
    name: config.name,
    tone: config.tone,
    personalityPreset,
    formalityLevel: preset?.defaultFormality ?? 3,
    concisenessLevel: preset?.defaultConciseness ?? 3,
    warmthLevel: preset?.defaultWarmth ?? 3,
    speaksAsBusiness,
    useEmoji,
    proactivelySuggestTimes: true,
    confirmsBeforeBooking: true,
    greetingTemplate:
      preset?.greetingTemplate?.en?.replace("{name}", config.name) ?? null,
    updatedAt: new Date(),
  };
  if (existing) {
    await db.receptionistProfile.update({
      where: { id: existing.id },
      data,
    });
  } else {
    await db.receptionistProfile.create({
      data: { workspaceId, ...data },
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
      // Also set default language on workspace based on response language
      const hasSpanish = RE_SPANISH_CHARS.test(response);
      await db.workspace.update({
        where: { id: workspaceId },
        data: {
          defaultLanguage: hasSpanish ? "es" : "en",
          country: hasSpanish ? "MX" : "US",
          updatedAt: new Date(),
        },
      });
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

    case "safety": {
      await saveSafetyConfig(workspaceId, response);
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

// ── Knowledge Base Seeding ──────────────────────────────────────

const CATEGORY_FAQS: Record<
  string,
  Array<{ question: string; answer: string }>
> = {
  beauty: [
    {
      question: "Do you accept walk-ins?",
      answer:
        "We recommend booking in advance, but walk-ins are welcome when availability allows.",
    },
    {
      question: "Is there parking available?",
      answer: "Yes, we have free parking available for customers.",
    },
    {
      question: "How should I prepare for my appointment?",
      answer:
        "Please arrive 5-10 minutes early. If you're getting a color treatment, avoid washing your hair 24 hours before.",
    },
    {
      question: "Do you offer gift cards?",
      answer:
        "Yes! Gift cards are available in any amount. Ask us for details.",
    },
  ],
  health: [
    {
      question: "Do you accept walk-ins?",
      answer:
        "We prefer appointments to ensure the doctor has adequate time for each patient.",
    },
    {
      question: "What insurance do you accept?",
      answer:
        "Please contact us directly for our accepted insurance providers.",
    },
    {
      question: "How early should I arrive?",
      answer:
        "Please arrive 15 minutes before your first appointment to complete intake forms.",
    },
    {
      question: "Is there a cancellation fee?",
      answer: "Please refer to our cancellation policy for details on fees.",
    },
  ],
  fitness: [
    {
      question: "Do you offer a free trial?",
      answer:
        "Yes! Your first class/session is complimentary. Book here to try it out.",
    },
    {
      question: "What should I bring?",
      answer:
        "Comfortable workout clothes, a water bottle, and a towel. We provide the rest.",
    },
    {
      question: "Is there parking?",
      answer: "Yes, free parking is available.",
    },
    {
      question: "Do you offer group classes?",
      answer: "Yes, we offer a variety of group classes throughout the week.",
    },
  ],
  wellness: [
    {
      question: "What should I wear to my appointment?",
      answer:
        "Comfortable, loose-fitting clothing is recommended. We provide robes and slippers.",
    },
    {
      question: "How early should I arrive?",
      answer:
        "Please arrive 10-15 minutes early to check in and relax before your treatment.",
    },
    {
      question: "Do you offer couples treatments?",
      answer:
        "Yes! We have couples packages available. Book together for a shared experience.",
    },
  ],
  coaching: [
    {
      question: "How do sessions work?",
      answer:
        "Sessions are 1-on-1, typically 45-60 minutes. We meet virtually or in person.",
    },
    {
      question: "Do you offer package deals?",
      answer: "Yes, we offer discounted packages for 4, 8, or 12 sessions.",
    },
    {
      question: "Can I reschedule?",
      answer: "Yes, please reschedule at least 24 hours in advance.",
    },
  ],
  legal: [
    {
      question: "Do you offer free consultations?",
      answer:
        "Yes, we offer a complimentary initial consultation. Book here to schedule yours.",
    },
    {
      question: "What should I bring to my appointment?",
      answer:
        "Bring any relevant documents, identification, and a list of questions.",
    },
    {
      question: "Do you offer virtual consultations?",
      answer: "Yes, we can meet via video call if preferred.",
    },
  ],
};

async function seedKnowledgeBase(workspaceId: string): Promise<void> {
  // Get the business category
  const profile = await db.businessProfile.findFirst({
    where: { workspaceId },
    select: { category: true },
  });
  if (!profile?.category) {
    return;
  }

  // Find matching FAQ category
  const categoryLower = profile.category.toLowerCase();
  let faqs: Array<{ question: string; answer: string }> | undefined;
  for (const [key, items] of Object.entries(CATEGORY_FAQS)) {
    if (categoryLower.includes(key) || key.includes(categoryLower)) {
      faqs = items;
      break;
    }
  }
  if (!faqs || faqs.length === 0) {
    return;
  }

  // Check if KB items already exist
  const existing = await db.knowledgeBaseItem.count({
    where: { workspaceId },
  });
  if (existing > 0) {
    return; // Don't seed if user already has items
  }

  // Seed the FAQs
  for (const faq of faqs) {
    await db.knowledgeBaseItem.create({
      data: {
        workspaceId,
        category: "general",
        question: faq.question,
        answer: faq.answer,
      },
    });
  }
}
