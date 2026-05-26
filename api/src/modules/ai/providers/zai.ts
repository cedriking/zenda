import type { AIProvider } from "@zenda/shared";

interface ChatMessage {
  content: string;
  role: "system" | "user" | "assistant" | "tool";
  tool_call_id?: string;
}

interface ToolCall {
  function: { name: string; arguments: string };
  id: string;
}

interface CompletionResult {
  model: string;
  provider: AIProvider;
  text: string;
  toolCalls?: ToolCall[];
}

interface ToolDefinition {
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
  type: "function";
}

const ZAI_BASE =
  process.env.ZAI_BASE_URL ?? "https://api.z.ai/api/coding/paas/v4";

export const zaiProvider = {
  name: "zai" as const,

  async chat(
    model: string,
    messages: ChatMessage[],
    tools?: ToolDefinition[],
    maxTokens = 800
  ): Promise<CompletionResult> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30_000);

    try {
      const response = await fetch(`${ZAI_BASE}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.ZAI_API_KEY}`,
        },
        body: JSON.stringify({
          model,
          messages,
          max_tokens: maxTokens,
          tools: tools?.length ? tools : undefined,
          tool_choice: tools?.length ? "auto" : undefined,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const err = await response.text();
        throw new Error(`Z.ai error ${response.status}: ${err}`);
      }

      const data = await response.json();
      const choice = data.choices[0];

      return {
        text: choice.message.content ?? "",
        toolCalls: choice.message.tool_calls?.map((tc: any) => ({
          id: tc.id,
          function: {
            name: tc.function.name,
            arguments: tc.function.arguments,
          },
        })),
        provider: "zai",
        model,
      };
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        throw new Error(
          `Z.ai chat request timed out after 30s (model: ${model})`
        );
      }
      throw err;
    } finally {
      clearTimeout(timeout);
    }
  },
};
