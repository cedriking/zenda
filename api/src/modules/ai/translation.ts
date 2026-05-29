import { Elysia, t } from "elysia";
import { logger } from "../../infra/logger.js";
import { typedContext } from "../../middleware/typed-context.js";

export const translationModule = new Elysia({ prefix: "/translation" })
  .use(typedContext)

  .post(
    "/generate",
    async ({ body, workspaceId }) => {
      if (!workspaceId) {
        return { error: "Authentication required" };
      }
      const { text, sourceLang, targetLang } = body as {
        text: string;
        sourceLang: string;
        targetLang: string;
      };

      const translated = await generateTranslation(
        text,
        sourceLang as "en" | "es",
        targetLang as "en" | "es"
      );

      return { original: text, translated, sourceLang, targetLang };
    },
    {
      body: t.Object({
        text: t.String({ maxLength: 5000 }),
        sourceLang: t.String(),
        targetLang: t.String(),
      }),
    }
  )

  .post(
    "/generate-batch",
    async ({ body, workspaceId }) => {
      if (!workspaceId) {
        return { error: "Authentication required" };
      }
      const { items, sourceLang, targetLang } = body as {
        items: Array<{ field: string; text: string }>;
        sourceLang: string;
        targetLang: string;
      };

      const results = await Promise.all(
        items.map(async (item) => ({
          field: item.field,
          original: item.text,
          translated: await generateTranslation(
            item.text,
            sourceLang as "en" | "es",
            targetLang as "en" | "es"
          ),
        }))
      );

      return { translations: results, sourceLang, targetLang };
    },
    {
      body: t.Object({
        items: t.Array(
          t.Object({
            field: t.String(),
            text: t.String(),
          })
        ),
        sourceLang: t.String(),
        targetLang: t.String(),
      }),
    }
  );

async function generateTranslation(
  text: string,
  _source: "en" | "es",
  target: "en" | "es"
): Promise<string> {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      logger.warn("Translation skipped — OPENAI_API_KEY not set");
      return text;
    }

    const prompt =
      target === "es"
        ? `Translate the following business text from English to natural, professional Spanish (Latin America). Only return the translation, nothing else:\n\n${text}`
        : `Translate the following business text from Spanish to natural, professional English. Only return the translation, nothing else:\n\n${text}`;

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 1000,
        temperature: 0.3,
      }),
    });

    if (!res.ok) {
      logger.warn("Translation API returned non-OK status", {
        status: res.status,
      });
      return text;
    }

    const data = (await res.json()) as {
      choices: Array<{ message: { content: string } }>;
    };
    return data.choices[0]?.message?.content?.trim() ?? text;
  } catch (err) {
    logger.error("Translation failed", { error: (err as Error).message });
    return text;
  }
}
