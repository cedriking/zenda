import type { AIProvider } from '@zenda/shared'

interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'tool'
  content: string
  tool_call_id?: string
}

interface ToolCall {
  id: string
  function: {
    name: string
    arguments: string
  }
}

interface CompletionResult {
  text: string
  toolCalls?: ToolCall[]
  provider: AIProvider
  model: string
  usage?: { promptTokens: number; completionTokens: number }
}

interface ToolDefinition {
  type: 'function'
  function: {
    name: string
    description: string
    parameters: Record<string, unknown>
  }
}

export const openaiProvider = {
  name: 'openai' as const,

  async chat(
    model: string,
    messages: ChatMessage[],
    tools?: ToolDefinition[],
    maxTokens = 800,
  ): Promise<CompletionResult> {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 30_000)

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model,
          messages,
          max_tokens: maxTokens,
          tools: tools?.length ? tools : undefined,
          tool_choice: tools?.length ? 'auto' : undefined,
        }),
        signal: controller.signal,
      })

      if (!response.ok) {
        const err = await response.text()
        throw new Error(`OpenAI error ${response.status}: ${err}`)
      }

      const data = await response.json()
      const choice = data.choices[0]

      return {
        text: choice.message.content ?? '',
        toolCalls: choice.message.tool_calls?.map((tc: any) => ({
          id: tc.id,
          function: {
            name: tc.function.name,
            arguments: tc.function.arguments,
          },
        })),
        provider: 'openai',
        model,
        usage: data.usage
          ? { promptTokens: data.usage.prompt_tokens, completionTokens: data.usage.completion_tokens }
          : undefined,
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        throw new Error(`OpenAI chat request timed out after 30s (model: ${model})`)
      }
      throw err
    } finally {
      clearTimeout(timeout)
    }
  },

  async transcribe(audioUrl: string): Promise<{ text: string; confidence: number }> {
    // Download audio first
    const audioResp = await fetch(audioUrl)
    const audioBlob = await audioResp.blob()
    const formData = new FormData()
    formData.append('file', audioBlob, 'audio.ogg')
    formData.append('model', 'whisper-1')
    formData.append('response_format', 'verbose_json')

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 60_000)

    try {
      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
        body: formData,
        signal: controller.signal,
      })

      if (!response.ok) {
        throw new Error(`Whisper error: ${response.status}`)
      }

      const data = await response.json()
      return {
        text: data.text,
        confidence: data.segments?.length
          ? data.segments.reduce((sum: number, s: any) => sum + (s.avg_logprob ?? 0), 0) / data.segments.length
          : 0.8,
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        throw new Error('OpenAI transcription request timed out after 60s')
      }
      throw err
    } finally {
      clearTimeout(timeout)
    }
  },
}
