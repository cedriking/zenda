import { db } from "@zenda/db/client";
import {
  businessProfiles,
  conversations,
  messages,
  workspaces,
} from "@zenda/db/schema";
import type {
  EscalationReason,
  MessageSender,
  OnboardingStep,
} from "@zenda/shared";
import { and, desc, eq } from "drizzle-orm";
import { logger } from "../../infra/logger.js";
import { wsMessageSender } from "../../infra/message-sender.js";
import { escalateToHuman } from "../ai/tools/escalate-to-human.js";
import { handleAudioMessage } from "../ai/transcription/audio-handler.js";
import { logConsentEvent } from "../audit/logger.js";
import {
  detectOptOutIntent,
  generateConsentConfirmation,
  getConsent,
  optOut,
  recordConsent,
  touchInboundTimestamp,
} from "../messaging/consent-service.js";
import { resetOnInbound } from "../messaging/outbound-tracker.js";
import {
  getNextOnboardingQuestion,
  processOnboardingResponse,
} from "../onboarding/conversation-handler.js";
import { enforceLimit, trackAndEnforce } from "../usage/enforcement.js";
import { resolveOrCreateCustomer } from "./customer-resolver.js";
import { detectLanguage } from "./language-detector.js";

// Emergency keywords in multiple languages
const EMERGENCY_KEYWORDS = [
  "emergency",
  "urgente",
  "ayuda",
  "socorro",
  "911",
  "ambulancia",
  "incendio",
  "fire",
  "drowning",
  "ahogo",
  "bleeding",
  "sangrando",
  "heart attack",
  "ataque cardiaco",
  "stroke",
  "derrame cerebral",
  "overdose",
  "sobredosis",
  "suicide",
  "suicidio",
  "accidente",
  "accident",
  "choque",
  "desmayo",
  "fainting",
  "no respira",
  "not breathing",
  "choking",
  "atragantado",
];

const EMERGENCY_PATTERN = new RegExp(
  `\\b(${EMERGENCY_KEYWORDS.map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})\\b`,
  "i"
);

// Low-confidence signals in AI responses
const LOW_CONFIDENCE_PATTERNS = [
  /i'?m\s+not\s+sure/i,
  /i\s+don'?t\s+(?:really\s+)?know/i,
  /no\s+estoy\s+segur[oa]/i,
  /no\s+(?:lo\s+)?s[ée]/i,
  /i\s+cannot\s+(?:help|assist|answer)/i,
  /fuera\s+de\s+(?:mi|nuestro)\s+(?:alcance|scope)/i,
  /beyond\s+(?:my|the)\s+(?:scope|knowledge)/i,
  /i'?m\s+unable\s+to/i,
  /no\s+puedo\s+(?:ayudar|asistir)/i,
];

const TOOL_FAILURE_PATTERN =
  /(?:tool_call_failed|function_call_error|unable_to_complete_action)/i;

interface IncomingMessage {
  body: string;
  contentType: "text" | "audio" | "image" | "file" | "system";
  externalMessageId?: string;
  mediaUrl?: string;
  phoneNumber: string;
  platform?: string; // 'whatsapp', 'instagram', 'telegram', etc.
  threadId?: string; // Optional thread ID for message routing
  timestamp: string;
}

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: core pipeline — refactoring tracked separately
export async function processIncomingMessage(
  workspaceId: string,
  msg: IncomingMessage,
  sender: MessageSender = wsMessageSender
) {
  try {
    // 0. Dedup: skip if we already processed this exact message
    if (msg.externalMessageId) {
      const [existing] = await db
        .select({ id: messages.id })
        .from(messages)
        .where(eq(messages.externalMessageId, msg.externalMessageId))
        .limit(1);
      if (existing) {
        logger.info("Skipping duplicate message", {
          workspaceId,
          externalMessageId: msg.externalMessageId,
        });
        return;
      }
    }

    // 1. Resolve language: prefer persisted customer language, then workspace default, then detect
    const detectedLanguage = (detectLanguage(msg.body) || "en") as "en" | "es";

    // 1a. Load workspace default language
    const [wsLang] = await db
      .select({ defaultLanguage: workspaces.defaultLanguage })
      .from(workspaces)
      .where(eq(workspaces.id, workspaceId))
      .limit(1);
    const workspaceLanguage = (wsLang?.defaultLanguage as "en" | "es") ?? "en";

    // 2. Find or create customer (using phone number or thread ID)
    const customer = await resolveOrCreateCustomer(
      workspaceId,
      msg.phoneNumber,
      detectedLanguage
    );

    // 2a. Determine language priority: customer persisted > workspace default > detected
    const language: "en" | "es" =
      (customer.language as "en" | "es") ??
      workspaceLanguage ??
      detectedLanguage;

    // 2a. Consent management — reset outbound counter, ensure consent record exists
    await resetOnInbound(workspaceId, customer.id);

    let consent = await getConsent(workspaceId, customer.id);
    if (!consent) {
      await recordConsent({
        workspaceId,
        customerId: customer.id,
        phoneNumber: customer.phoneNumber,
        status: "unknown",
        source: "customer_inbound_message",
      });
      consent = await getConsent(workspaceId, customer.id);
      logger.info("Consent record created for new customer", {
        workspaceId,
        customerId: customer.id,
      });
    }

    // 3. Find or create conversation
    let conversation = await findActiveConversation(workspaceId, customer.id);
    if (!conversation) {
      conversation = await createConversation(
        workspaceId,
        customer.id,
        language,
        msg.threadId
      );
    }

    // 4. Store incoming message (placeholder body for audio, actual body for text)
    const isAudio = msg.contentType === "audio" && !!msg.mediaUrl;
    const storedMessage = await storeMessage(conversation.id, workspaceId, {
      senderType: "customer",
      contentType: msg.contentType,
      body: isAudio ? "" : msg.body,
      language,
      externalMessageId: msg.externalMessageId,
    });

    // 5. For audio messages: transcribe and update the stored message
    let messageBody = msg.body;
    let agentLanguage: "en" | "es" = language;

    if (isAudio) {
      const transcription = await handleAudioMessage({
        messageId: storedMessage.id,
        workspaceId,
        mediaUrl: msg.mediaUrl as string,
        mimeType: "audio/ogg",
      });

      if (transcription) {
        messageBody = transcription.transcript;
        agentLanguage = transcription.language as "en" | "es";

        await db
          .update(messages)
          .set({ body: transcription.transcript, language: agentLanguage })
          .where(eq(messages.id, storedMessage.id));
      } else {
        messageBody = "[Audio message — transcription unavailable]";

        await db
          .update(messages)
          .set({ body: messageBody })
          .where(eq(messages.id, storedMessage.id));
      }
    }

    // 6. Check if onboarding is incomplete — route to onboarding flow instead of AI agent
    const [ws] = await db
      .select({ onboardingStep: workspaces.onboardingStep })
      .from(workspaces)
      .where(eq(workspaces.id, workspaceId))
      .limit(1);

    const onboardingStep = (ws?.onboardingStep ??
      "not_started") as OnboardingStep;
    if (onboardingStep !== "ready") {
      // Workspace hasn't completed onboarding — handle via onboarding flow
      await handleOnboardingMessage(
        workspaceId,
        conversation.id,
        customer.id,
        messageBody,
        agentLanguage,
        msg,
        sender
      );
      return;
    }

    // 7. Check conversation mode — only process in auto mode
    if (conversation.mode !== "auto") {
      // Notify owner if needs_attention or human_takeover
      if (conversation.mode === "needs_attention") {
        sender.send(workspaceId, {
          type: "notification",
          data: {
            id: crypto.randomUUID(),
            type: "needs_attention",
            title: "New message needs attention",
            body: `${customer.name ?? customer.phoneNumber}: ${messageBody.slice(0, 100)}`,
            createdAt: new Date().toISOString(),
          },
        });
      }
      return;
    }

    // 8. Update conversation lastMessageAt
    await db
      .update(conversations)
      .set({ lastMessageAt: new Date(), updatedAt: new Date() })
      .where(eq(conversations.id, conversation.id));

    // 8a. Emergency keyword detection — skip AI, immediately escalate
    if (EMERGENCY_PATTERN.test(messageBody)) {
      logger.warn("Emergency keyword detected — auto-escalating", {
        workspaceId,
        conversationId: conversation.id,
        customerId: customer.id,
      });

      const escalationResult = await escalateToHuman(
        workspaceId,
        conversation.id,
        {
          reason: "emergency",
          message: `Emergency detected in customer message: ${messageBody.slice(0, 200)}`,
        },
        agentLanguage
      );

      // Send emergency response to customer
      const emergencyResponse = await storeMessage(
        conversation.id,
        workspaceId,
        {
          senderType: "ai",
          contentType: "text",
          body: escalationResult.message,
          language: agentLanguage,
        }
      );

      sender.send(workspaceId, {
        type: "response.send",
        data: {
          conversationId: conversation.id,
          phoneNumber: msg.phoneNumber,
          threadId:
            msg.threadId ||
            ((conversation as Record<string, unknown>).threadId as
              | string
              | undefined),
          message: {
            id: emergencyResponse.id,
            body: escalationResult.message,
            senderType: "ai",
            contentType: "text",
            status: "sent",
            createdAt: emergencyResponse.createdAt,
          },
        },
      });

      sender.send(workspaceId, {
        type: "conversation.update",
        data: {
          id: conversation.id,
          mode: "needs_attention",
          lastMessageAt: new Date().toISOString(),
          needsAttentionReason: "emergency",
        },
      });

      return;
    }

    // 8b. Sensitive topic detection from business config
    const sensitiveReason = await detectSensitiveTopic(
      workspaceId,
      messageBody
    );
    if (sensitiveReason) {
      logger.info("Sensitive topic detected — auto-escalating", {
        workspaceId,
        conversationId: conversation.id,
        topic: sensitiveReason,
      });

      const escalationResult = await escalateToHuman(
        workspaceId,
        conversation.id,
        {
          reason: "sensitive_info",
          message: `Sensitive topic detected: ${sensitiveReason}`,
        },
        agentLanguage
      );

      const sensitiveResponse = await storeMessage(
        conversation.id,
        workspaceId,
        {
          senderType: "ai",
          contentType: "text",
          body: escalationResult.message,
          language: agentLanguage,
        }
      );

      sender.send(workspaceId, {
        type: "response.send",
        data: {
          conversationId: conversation.id,
          phoneNumber: msg.phoneNumber,
          threadId:
            msg.threadId ||
            ((conversation as Record<string, unknown>).threadId as
              | string
              | undefined),
          message: {
            id: sensitiveResponse.id,
            body: escalationResult.message,
            senderType: "ai",
            contentType: "text",
            status: "sent",
            createdAt: sensitiveResponse.createdAt,
          },
        },
      });

      sender.send(workspaceId, {
        type: "conversation.update",
        data: {
          id: conversation.id,
          mode: "needs_attention",
          lastMessageAt: new Date().toISOString(),
          needsAttentionReason: "sensitive_info",
        },
      });

      return;
    }

    // 8c. Consent opt-out detection — before routing to AI agent
    await touchInboundTimestamp(workspaceId, customer.id);

    if (detectOptOutIntent(messageBody)) {
      logger.info("Opt-out intent detected", {
        workspaceId,
        customerId: customer.id,
        conversationId: conversation.id,
      });

      await optOut(workspaceId, customer.id);
      await logConsentEvent(workspaceId, customer.id, "opt_out", {
        source: "customer_inbound_message",
        messageBody: messageBody.slice(0, 100),
      });

      const confirmationText = generateConsentConfirmation(agentLanguage);
      const optOutMessage = await storeMessage(conversation.id, workspaceId, {
        senderType: "system",
        contentType: "text",
        body: confirmationText,
        language: agentLanguage,
      });

      sender.send(workspaceId, {
        type: "response.send",
        data: {
          conversationId: conversation.id,
          phoneNumber: msg.phoneNumber,
          threadId:
            msg.threadId ||
            ((conversation as Record<string, unknown>).threadId as
              | string
              | undefined),
          message: {
            id: optOutMessage.id,
            body: confirmationText,
            senderType: "system",
            contentType: "text",
            status: "sent",
            createdAt: optOutMessage.createdAt,
          },
        },
      });

      logger.info("Opt-out processed — skipping AI response", {
        workspaceId,
        customerId: customer.id,
      });
      return;
    }

    // 8d. Plan enforcement — check conversation limit before routing to AI
    const conversationEnforcement = await enforceLimit(
      workspaceId,
      "conversations"
    );
    if (!conversationEnforcement.allowed) {
      logger.warn("Conversation limit reached — notifying owner", {
        workspaceId,
        usage: conversationEnforcement.currentUsage,
        limit: conversationEnforcement.limit,
      });

      // Send a polite message to the customer and notify the owner
      const limitMessage =
        agentLanguage === "es"
          ? "Gracias por tu mensaje. En este momento no podemos responder automáticamente. Un miembro del equipo se comunicará contigo pronto."
          : "Thank you for your message. We are currently unable to respond automatically. A team member will reach out to you soon.";

      const limitResponse = await storeMessage(conversation.id, workspaceId, {
        senderType: "system",
        contentType: "text",
        body: limitMessage,
        language: agentLanguage,
      });

      sender.send(workspaceId, {
        type: "response.send",
        data: {
          conversationId: conversation.id,
          phoneNumber: msg.phoneNumber,
          threadId:
            msg.threadId ||
            ((conversation as Record<string, unknown>).threadId as
              | string
              | undefined),
          message: {
            id: limitResponse.id,
            body: limitMessage,
            senderType: "system",
            contentType: "text",
            status: "sent",
            createdAt: limitResponse.createdAt,
          },
        },
      });

      // Ensure the owner was notified (enforcement service already sends
      // a notification on threshold crossing, but send an extra push if
      // the conversation just crossed the limit)
      if (conversationEnforcement.warningLevel === "limit") {
        sender.send(workspaceId, {
          type: "plan.limit_reached",
          data: {
            metric: "conversations",
            currentUsage: conversationEnforcement.currentUsage,
            limit: conversationEnforcement.limit,
            gracePeriodEnd: conversationEnforcement.gracePeriodEnd,
          },
        });
      }

      return;
    }

    // 9. Route to AI agent (using transcribed text for audio, raw body for text)
    const { runAgent } = await import("../ai/agent.js");
    const aiResponse = await runAgent(
      workspaceId,
      conversation.id,
      customer.id,
      messageBody,
      agentLanguage
    );

    if (!aiResponse) {
      logger.warn("AI agent returned no response — sending fallback", {
        workspaceId,
        conversationId: conversation.id,
      });
      // Send a fallback message so the customer isn't left hanging
      const fallbackText =
        agentLanguage === "es"
          ? "Gracias por tu mensaje. En este momento no puedo procesarlo automáticamente, pero lo he registrado y un miembro del equipo te responderá pronto."
          : "Thank you for your message. I'm unable to process it automatically right now, but I've logged it and a team member will respond soon.";
      const fallbackMessage = await storeMessage(conversation.id, workspaceId, {
        senderType: "ai",
        contentType: "text",
        body: fallbackText,
        language: agentLanguage,
      });
      sender.send(workspaceId, {
        type: "response.send",
        data: {
          conversationId: conversation.id,
          phoneNumber: msg.phoneNumber,
          threadId:
            msg.threadId ||
            ((conversation as Record<string, unknown>).threadId as
              | string
              | undefined),
          message: {
            id: fallbackMessage.id,
            body: fallbackText,
            senderType: "ai",
            contentType: "text",
            status: "sent",
            createdAt: fallbackMessage.createdAt,
          },
        },
      });
      // Escalate to owner so they know the AI failed
      sender.send(workspaceId, {
        type: "notification",
        data: {
          id: crypto.randomUUID(),
          type: "needs_attention",
          title: "AI response failed",
          body: `Message from ${msg.phoneNumber} could not be processed automatically: "${messageBody.slice(0, 100)}"`,
          createdAt: new Date().toISOString(),
        },
      });
      return;
    }

    // 9a. Track conversation usage (background — non-blocking)
    trackAndEnforce(workspaceId, "conversations").catch((err) => {
      logger.error("Failed to track conversation usage", {
        workspaceId,
        error: err instanceof Error ? err.message : String(err),
      });
    });

    // 9b. Track voice minutes usage for audio messages (background)
    if (isAudio) {
      trackAndEnforce(workspaceId, "voice_minutes").catch((err) => {
        logger.error("Failed to track voice minutes usage", {
          workspaceId,
          error: err instanceof Error ? err.message : String(err),
        });
      });
    }

    // 10. Store AI response
    const responseMessage = await storeMessage(conversation.id, workspaceId, {
      senderType: "ai",
      contentType: "text",
      body: aiResponse.text,
      language: aiResponse.language as "en" | "es",
      aiProvider: aiResponse.provider,
      aiModel: aiResponse.model,
      toolCalls: aiResponse.toolCalls,
    });

    // 10a. Post-AI auto-escalation: detect low confidence or tool failure
    const autoEscalationReason = detectAutoEscalation(
      aiResponse.text,
      aiResponse.toolCalls
    );
    if (autoEscalationReason) {
      logger.info("Auto-escalating due to low confidence or tool failure", {
        workspaceId,
        conversationId: conversation.id,
        reason: autoEscalationReason,
      });

      await escalateToHuman(
        workspaceId,
        conversation.id,
        {
          reason: autoEscalationReason,
          message:
            "Auto-escalated: AI response showed low confidence or tool failure",
        },
        aiResponse.language as "en" | "es"
      );
    }

    // 11. Send response back via WebSocket
    sender.send(workspaceId, {
      type: "response.send",
      data: {
        conversationId: conversation.id,
        phoneNumber: msg.phoneNumber,
        threadId:
          msg.threadId ||
          ((conversation as Record<string, unknown>).threadId as
            | string
            | undefined),
        message: {
          id: responseMessage.id,
          body: aiResponse.text,
          senderType: "ai",
          contentType: "text",
          status: "sent",
          createdAt: responseMessage.createdAt,
        },
      },
    });

    // 12. Send conversation update event
    sender.send(workspaceId, {
      type: "conversation.update",
      data: {
        id: conversation.id,
        mode: autoEscalationReason ? "needs_attention" : conversation.mode,
        lastMessageAt: new Date().toISOString(),
        needsAttentionReason: autoEscalationReason ?? null,
      },
    });

    // 13. Background: extract customer memory + conversation summarization
    extractMemoryAndSummarize(
      workspaceId,
      conversation.id,
      customer.id,
      messageBody,
      aiResponse.text,
      agentLanguage
    ).catch(() => {
      // Non-critical — errors already logged inside
    });

    logger.info("Message processed", {
      workspaceId,
      conversationId: conversation.id,
      threadId: msg.threadId,
      customerId: customer.id,
      language: agentLanguage,
      contentType: msg.contentType,
      platform: msg.platform,
      autoEscalated: !!autoEscalationReason,
    });
  } catch (error) {
    logger.error("Failed to process message", {
      workspaceId,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

async function findActiveConversation(workspaceId: string, customerId: string) {
  const [conv] = await db
    .select()
    .from(conversations)
    .where(
      and(
        eq(conversations.workspaceId, workspaceId),
        eq(conversations.customerId, customerId)
      )
    )
    .orderBy(desc(conversations.lastMessageAt))
    .limit(1);
  return conv ?? null;
}

async function createConversation(
  workspaceId: string,
  customerId: string,
  language: "en" | "es",
  _threadId?: string
) {
  const [conv] = await db
    .insert(conversations)
    .values({
      workspaceId,
      customerId,
      channel: "whatsapp",
      mode: "auto",
      language,
    })
    .returning();
  return conv;
}

async function storeMessage(
  conversationId: string,
  workspaceId: string,
  data: {
    senderType: "customer" | "ai" | "owner" | "system";
    contentType: "text" | "audio" | "image" | "file" | "system";
    body: string;
    language: "en" | "es";
    externalMessageId?: string;
    aiProvider?: string;
    aiModel?: string;
    toolCalls?: unknown[];
  }
) {
  const [msg] = await db
    .insert(messages)
    .values({
      conversationId,
      workspaceId,
      senderType: data.senderType as any,
      contentType: data.contentType,
      body: data.body,
      language: data.language,
      externalMessageId: data.externalMessageId,
      aiProvider: data.aiProvider,
      aiModel: data.aiModel,
      toolCalls: data.toolCalls,
      status: data.senderType === "customer" ? "received" : "queued",
    })
    .returning();
  return msg;
}

async function handleOnboardingMessage(
  workspaceId: string,
  conversationId: string,
  _customerId: string,
  messageBody: string,
  language: "en" | "es",
  msg: IncomingMessage,
  sender: MessageSender
) {
  // Get current onboarding step
  const questionData = await getNextOnboardingQuestion(workspaceId, language);

  if (!questionData) {
    // No question available (shouldn't happen if onboarding isn't complete)
    logger.warn("Onboarding question not found", { workspaceId });
    return;
  }

  const currentStep = questionData.step;

  // If this is the first message and step is whatsapp_connected,
  // send the greeting/question without processing the response
  if (currentStep === "not_started") {
    // Just send the first question
    const responseMessage = await storeMessage(conversationId, workspaceId, {
      senderType: "ai",
      contentType: "text",
      body: questionData.question,
      language,
    });

    sender.send(workspaceId, {
      type: "response.send",
      data: {
        conversationId,
        phoneNumber: msg.phoneNumber,
        threadId: msg.threadId,
        message: {
          id: responseMessage.id,
          body: questionData.question,
          senderType: "ai",
          contentType: "text",
          status: "sent",
          createdAt: responseMessage.createdAt,
        },
      },
    });
    return;
  }

  // Process the user's response for the current step
  const result = await processOnboardingResponse(
    workspaceId,
    currentStep,
    messageBody,
    language
  );

  // Build reply: acknowledgment + next question
  const nextQuestion = await getNextOnboardingQuestion(workspaceId, language);
  let reply = result.acknowledged;
  if (nextQuestion && nextQuestion.step !== "ready") {
    reply += `\n\n${nextQuestion.question}`;
  } else if (nextQuestion?.step === "ready") {
    reply += `\n\n${
      language === "es"
        ? "¡Todo listo! Tu recepcionista IA está lista para atender a tus clientes."
        : "All set! Your AI receptionist is ready to serve your customers."
    }`;
  }

  // Store and send the reply
  const responseMessage = await storeMessage(conversationId, workspaceId, {
    senderType: "ai",
    contentType: "text",
    body: reply,
    language,
  });

  sender.send(workspaceId, {
    type: "response.send",
    data: {
      conversationId,
      phoneNumber: msg.phoneNumber,
      threadId: msg.threadId,
      message: {
        id: responseMessage.id,
        body: reply,
        senderType: "ai",
        contentType: "text",
        status: "sent",
        createdAt: responseMessage.createdAt,
      },
    },
  });

  logger.info("Onboarding step processed", {
    workspaceId,
    step: currentStep,
    nextStep: result.nextStep,
    language,
  });
}

/**
 * Check if the customer message matches any sensitive topics from business config.
 * Returns the matched topic string, or null if no match.
 */
async function detectSensitiveTopic(
  workspaceId: string,
  messageBody: string
): Promise<string | null> {
  try {
    const [profile] = await db
      .select({ sensitiveTopics: businessProfiles.sensitiveTopics })
      .from(businessProfiles)
      .where(eq(businessProfiles.workspaceId, workspaceId))
      .limit(1);

    const topics = profile?.sensitiveTopics;
    if (!topics || topics.length === 0) {
      return null;
    }

    const lowerMessage = messageBody.toLowerCase();
    for (const topic of topics) {
      if (lowerMessage.includes(topic.toLowerCase())) {
        return topic;
      }
    }
  } catch (err) {
    logger.error("Failed to check sensitive topics", {
      workspaceId,
      error: err instanceof Error ? err.message : String(err),
    });
  }

  return null;
}

/**
 * Detect if an AI response should trigger auto-escalation.
 * Returns an escalation reason, or null if no escalation needed.
 */
function detectAutoEscalation(
  aiResponseText: string,
  toolCalls?: unknown[]
): EscalationReason | null {
  // Check for low-confidence signals in AI response
  for (const pattern of LOW_CONFIDENCE_PATTERNS) {
    if (pattern.test(aiResponseText)) {
      return "low_confidence";
    }
  }

  // Check for tool failure patterns in tool calls
  if (toolCalls && Array.isArray(toolCalls)) {
    for (const tc of toolCalls) {
      const tcStr = JSON.stringify(tc);
      if (TOOL_FAILURE_PATTERN.test(tcStr)) {
        return "technology_question";
      }
    }
  }

  return null;
}

/**
 * Background task: extract customer memory from the conversation turn
 * and generate a conversation summary if the thread is long enough.
 */
async function extractMemoryAndSummarize(
  workspaceId: string,
  conversationId: string,
  customerId: string,
  customerMessage: string,
  aiResponse: string,
  language: "en" | "es"
): Promise<void> {
  try {
    // Memory extraction
    const { extractMemoryFromConversation } = await import("../ai/memory.js");
    await extractMemoryFromConversation(workspaceId, customerId, [
      { role: "customer", content: customerMessage },
      { role: "ai", content: aiResponse },
    ]);
  } catch (err) {
    logger.error("Memory extraction failed", {
      workspaceId,
      conversationId,
      error: err instanceof Error ? err.message : String(err),
    });
  }

  try {
    // Conversation summarization
    const { shouldSummarize, generateAndStoreSummary } = await import(
      "./summarization.js"
    );
    if (await shouldSummarize(conversationId)) {
      await generateAndStoreSummary(conversationId, workspaceId, language);
    }
  } catch (err) {
    logger.error("Conversation summarization failed", {
      workspaceId,
      conversationId,
      error: err instanceof Error ? err.message : String(err),
    });
  }
}
