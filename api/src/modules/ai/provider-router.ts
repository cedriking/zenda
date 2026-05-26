import type { AIProvider, AITaskType, Language, PlanTier } from "@zenda/shared";
import { isProviderHealthy } from "./circuit-breaker/index.js";

interface ProviderConfig {
  maxTokens: number;
  model: string;
  provider: AIProvider;
}

interface RoutingContext {
  language: Language;
  plan: PlanTier;
  risk?: "low" | "medium" | "high";
  task: AITaskType;
}

// ZAI (ZhipuAI) GLM models
// glm-5.1: most capable, glm-5-turbo: fast, glm-4.7: balanced, glm-4.5-air: lightweight
const TASK_ROUTING: Record<AITaskType, ProviderConfig[]> = {
  intent_detection: [{ provider: "zai", model: "glm-4.5-air", maxTokens: 200 }],
  language_detection: [
    { provider: "zai", model: "glm-4.5-air", maxTokens: 50 },
  ],
  classification: [{ provider: "zai", model: "glm-5-turbo", maxTokens: 300 }],
  tool_planning: [{ provider: "zai", model: "glm-5.1", maxTokens: 500 }],
  response_generation: [{ provider: "zai", model: "glm-5.1", maxTokens: 800 }],
  summarization: [{ provider: "zai", model: "glm-5-turbo", maxTokens: 400 }],
  memory_extraction: [
    { provider: "zai", model: "glm-5-turbo", maxTokens: 300 },
  ],
  transcription: [{ provider: "zai", model: "local-whisper", maxTokens: 0 }],
};

export function selectModel(ctx: RoutingContext): ProviderConfig {
  const providers = TASK_ROUTING[ctx.task];

  // For high-risk or complex tasks, prefer stronger models
  if (ctx.risk === "high" || ctx.task === "tool_planning") {
    const strong = providers.find(
      (p) => p.provider === "openai" && p.model === "gpt-4o"
    );
    if (strong) {
      return strong;
    }
  }

  // Skip ollama if not in development
  const isDev = process.env.NODE_ENV !== "production";

  for (const config of providers) {
    if (config.provider === "ollama" && !isDev) {
      continue;
    }
    if (!isProviderAvailable(config.provider)) {
      continue;
    }
    if (!isProviderHealthy(config.provider)) {
      continue;
    }
    return config;
  }

  throw new Error(
    "No AI provider available — check API keys for ZAI, OpenAI, or Ollama"
  );
}

function isProviderAvailable(provider: AIProvider): boolean {
  switch (provider) {
    case "openai":
      return !!process.env.OPENAI_API_KEY;
    case "zai":
      return !!process.env.ZAI_API_KEY;
    case "ollama":
      return process.env.OLLAMA_BASE_URL !== undefined;
    default:
      return false;
  }
}

export function getProviderClient(provider: AIProvider) {
  switch (provider) {
    case "openai":
      return import("./providers/openai.js").then((m) => m.openaiProvider);
    case "zai":
      return import("./providers/zai.js").then((m) => m.zaiProvider);
    case "ollama":
      return import("./providers/ollama.js").then((m) => m.ollamaProvider);
    default:
      throw new Error(`Unknown provider: ${provider}`);
  }
}
