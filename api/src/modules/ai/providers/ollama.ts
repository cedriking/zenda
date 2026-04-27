import type { AIProvider } from '@zenda/shared'

interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'tool'
  content: string
  tool_call_id?: string
}

interface ToolCall {
  id: string
  function: { name: string; arguments: string }
}

interface CompletionResult {
  text: string
  toolCalls?: ToolCall[]
  provider: AIProvider
  model: string
}

interface ToolDefinition {
  type: 'function'
  function: {
    name: string
    description: string
    parameters: Record<string, unknown>
  }
}

const OLLAMA_BASE = process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434'

export const ollamaProvider = {
  name: 'ollama' as const,

  async chat(
    model: string,
    messages: ChatMessage[],
    tools?: ToolDefinition[],
    maxTokens = 800,
  ): Promise<CompletionResult> {
    const response = await fetch(`${OLLAMA_BASE}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages,
        stream: false,
        options: { num_predict: maxTokens },
        tools: tools?.map(t => t.function),
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      throw new Error(`Ollama error ${response.status}: ${err}`)
    }

    const data = await response.json()

    return {
      text: data.message?.content ?? '',
      toolCalls: data.message?.tool_calls?.map((tc: any) => ({
        id: tc.id ?? `tc_${Date.now()}`,
        function: {
          name: tc.function.name,
          arguments: typeof tc.function.arguments === 'string'
            ? tc.function.arguments
            : JSON.stringify(tc.function.arguments),
        },
      })),
      provider: 'ollama',
      model,
    }
  },
}
