import { Elysia, t } from 'elysia'
import { logger } from '../../infra/logger.js'

export const translationModule = new Elysia({ prefix: '/translation' })

  .post('/generate', async ({ body }) => {
    const { text, sourceLang, targetLang } = body as { text: string; sourceLang: string; targetLang: string }

    // In production, call an LLM or translation API
    // For now, return a placeholder indicating translation is needed
    const translated = await generateTranslation(text, sourceLang as 'en' | 'es', targetLang as 'en' | 'es')

    return { original: text, translated, sourceLang, targetLang }
  }, {
    body: t.Object({
      text: t.String(),
      sourceLang: t.String(),
      targetLang: t.String(),
    }),
  })

  .post('/generate-batch', async ({ body }) => {
    const { items, sourceLang, targetLang } = body as {
      items: Array<{ field: string; text: string }>
      sourceLang: string
      targetLang: string
    }

    const results = await Promise.all(
      items.map(async (item) => ({
        field: item.field,
        original: item.text,
        translated: await generateTranslation(item.text, sourceLang as 'en' | 'es', targetLang as 'en' | 'es'),
      })),
    )

    return { translations: results, sourceLang, targetLang }
  }, {
    body: t.Object({
      items: t.Array(t.Object({
        field: t.String(),
        text: t.String(),
      })),
      sourceLang: t.String(),
      targetLang: t.String(),
    }),
  })

async function generateTranslation(text: string, _source: 'en' | 'es', target: 'en' | 'es'): Promise<string> {
  // Simple translation stub — in production, use OpenAI or DeepL
  // This provides a clear marker that the translation needs review
  const prefix = target === 'es' ? '[ES-AUTO] ' : '[EN-AUTO] '

  try {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) return `${prefix}${text}`

    const prompt = target === 'es'
      ? `Translate the following business text from English to natural, professional Spanish (Latin America). Only return the translation, nothing else:\n\n${text}`
      : `Translate the following business text from Spanish to natural, professional English. Only return the translation, nothing else:\n\n${text}`

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1000,
        temperature: 0.3,
      }),
    })

    if (!res.ok) return `${prefix}${text}`

    const data = await res.json() as { choices: Array<{ message: { content: string } }> }
    return data.choices[0]?.message?.content?.trim() ?? `${prefix}${text}`
  } catch (err) {
    logger.error('Translation failed', { error: (err as Error).message })
    return `${prefix}${text}`
  }
}
