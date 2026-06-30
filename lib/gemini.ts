import { AUDIT_SYSTEM_PROMPT, compactAuditInput } from './auditPrompt'
import { parseJsonObject, type AiAudit, type CombinedAuditInput } from './utils'

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string
      }>
    }
  }>
}

export async function getGeminiAudit(input: CombinedAuditInput): Promise<AiAudit | null> {
  const apiKey = process.env.GEMINI_API_KEY

  if (!apiKey) {
    return null
  }

  const model = process.env.GEMINI_MODEL ?? 'gemini-2.0-flash'
  const encodedModel = encodeURIComponent(model)
  const encodedApiKey = encodeURIComponent(apiKey)
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodedModel}:generateContent?key=${encodedApiKey}`,
    {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: AUDIT_SYSTEM_PROMPT }]
        },
        contents: [
          {
            role: 'user',
            parts: [{ text: JSON.stringify(compactAuditInput(input), null, 2) }]
          }
        ],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.2
        }
      })
    }
  )

  if (!response.ok) {
    return null
  }

  const data = (await response.json()) as GeminiResponse
  const content = data.candidates?.[0]?.content?.parts?.map((part) => part.text ?? '').join('')

  return parseJsonObject<AiAudit>(content)
}
