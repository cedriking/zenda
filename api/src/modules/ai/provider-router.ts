import type { AITaskType, AIProvider, Language } from '@zenda/shared'

interface ProviderConfig {
  provider: AIProvider
  model: string
  maxTokens: number
}

interface RoutingContext {
  task: AITaskType
  plan: 'starter' | 'pro' | 'business'
  language: Language
  risk?: 'low' | 'medium' | 'high'
}

// Model assignments per task type
const TASK_ROUTING: Record<AITaskType, ProviderConfig[]> = {
  intent_detection: [
    { provider: 'ollama', model: 'llama3.2:3b', maxTokens: 200 },
    { provider: 'zai', model: 'zai-fast', maxTokens: 200 },
    { provider: 'openai', model: 'gpt-4o-mini', maxTokens: 200 },
  ],
  language_detection: [
    { provider: 'ollama', model: 'llama3.2:3b', maxTokens: 50 },
    { provider: 'zai', model: 'zai-fast', maxTokens: 50 },
    { provider: 'openai', model: 'gpt-4o-mini', maxTokens: 50 },
  ],
  classification: [
    { provider: 'zai', model: 'zai-fast', maxTokens: 300 },
    { provider: 'openai', model: 'gpt-4o-mini', maxTokens: 300 },
  ],
  tool_planning: [
    { provider: 'openai', model: 'gpt-4o-mini', maxTokens: 500 },
    { provider: 'zai', model: 'zai-chat', maxTokens: 500 },
  ],
  response_generation: [
    { provider: 'zai', model: 'zai-chat', maxTokens: 800 },
    { provider: 'openai', model: 'gpt-4o-mini', maxTokens: 800 },
  ],
  summarization: [
    { provider: 'zai', model: 'zai-fast', maxTokens: 400 },
    { provider: 'openai', model: 'gpt-4o-mini', maxTokens: 400 },
  ],
  memory_extraction: [
    { provider: 'zai', model: 'zai-fast', maxTokens: 300 },
    { provider: 'openai', model: 'gpt-4o-mini', maxTokens: 300 },
  ],
  transcription: [
    { provider: 'openai', model: 'whisper-1', maxTokens: 0 },
  ],
}

export function selectModel(ctx: RoutingContext): ProviderConfig {
  const providers = TASK_ROUTING[ctx.task]

  // For high-risk or complex tasks, prefer stronger models
  if (ctx.risk === 'high' || ctx.task === 'tool_planning') {
    const strong = providers.find(p => p.provider === 'openai' && p.model === 'gpt-4o')
    if (strong) return strong
  }

  // Skip ollama if not in development
  const isDev = process.env.NODE_ENV !== 'production'

  for (const config of providers) {
    if (config.provider === 'ollama' && !isDev) continue
    if (!isProviderAvailable(config.provider)) continue
    return config
  }

  // Fallback to first available
  return providers[0]
}

function isProviderAvailable(provider: AIProvider): boolean {
  switch (provider) {
    case 'openai': return !!process.env.OPENAI_API_KEY
    case 'zai': return !!process.env.ZAI_API_KEY
    case 'ollama': return process.env.OLLAMA_BASE_URL !== undefined
    default: return false
  }
}

export function getProviderClient(provider: AIProvider) {
  switch (provider) {
    case 'openai': return import('./providers/openai.js').then(m => m.openaiProvider)
    case 'zai': return import('./providers/zai.js').then(m => m.zaiProvider)
    case 'ollama': return import('./providers/ollama.js').then(m => m.ollamaProvider)
    default: throw new Error(`Unknown provider: ${provider}`)
  }
}
